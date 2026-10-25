#include <Epub.h>
#include <Epub/htmlEntities.h>
#include <FsHelpers.h>
#include <HalStorage.h>
#include <I18n.h>
#include <Memory.h>

#include <algorithm>
#include <cstdio>
#include <cstring>

#include "LibraryActivity.h"
#include "LibraryFonts.h"
#include "activities/home/RecentBookProgress.h"

namespace {
constexpr int COVER_W = 112, COVER_H = 168;

void plainBlurb(std::string& text) {
  for (size_t position = 0; position < text.size(); ++position) {
    if (text[position] != '&') continue;
    const auto end = text.find(';', position + 1);
    if (end == std::string::npos || end - position > 32) continue;
    if (const auto* decoded = lookupHtmlEntity(text.data() + position, end - position + 1)) {
      text.replace(position, end - position + 1, decoded);
    }
  }
  size_t output = 0;
  bool tag = false, space = false;
  for (const char character : text) {
    if (character == '<') {
      tag = true;
      continue;
    }
    if (character == '>' && tag) {
      tag = false;
      continue;
    }
    if (tag) continue;
    if (character == ' ' || character == '\n' || character == '\r' || character == '\t') {
      space = true;
      continue;
    }
    if (space && output > 0) text[output++] = ' ';
    space = false;
    text[output++] = character;
  }
  text.resize(output);
}

bool contains(const freeink::ui::Rect& rect, const int x, const int y) {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}
}  // namespace

bool LibraryActivity::allocateBookCard() {
  if (bookCard) return true;
  bookCard = makeUniqueNoThrow<BookCardData>();
  if (!bookCard) {
    LOG_ERR("LIB", "Cannot allocate book card");
    return false;
  }
  // One bounded metadata record, only while visiting Library. Description is
  // capped at 512 bytes by the OPF parser; fields/line storage are reused.
  bookCard->description.reserve(512);
  bookCard->series.reserve(512);
  bookCard->genre.reserve(512);
  bookCard->seriesPosition.reserve(32);
  bookCard->book.path.reserve(256);
  bookCard->book.title.reserve(512);
  bookCard->book.author.reserve(512);
  bookCard->titleLines.reserve(2);
  bookCard->descriptionLines.reserve(5);
  bookCard->authors.reserve(3);
  return true;
}

void LibraryActivity::prepareBookCard() {
  auto& card = *bookCard;
  const int width = std::min(440, renderer.getScreenWidth() - 24);
  const int height = std::min(440, renderer.getScreenHeight() - 80);
  const auto rect = [](const int x, const int y, const int w, const int h) {
    return freeink::ui::Rect{static_cast<int16_t>(x), static_cast<int16_t>(y), static_cast<int16_t>(w),
                             static_cast<int16_t>(h)};
  };
  card.dialog = rect((renderer.getScreenWidth() - width) / 2, (renderer.getScreenHeight() - height) / 2, width, height);
  card.cover = rect(card.dialog.x + 16, card.dialog.y + 56, COVER_W, COVER_H);
  card.openButton = rect(card.dialog.x + 16, card.dialog.y + height - 56, width - 152, 40);
  card.closeButton = rect(card.dialog.x + width - 120, card.dialog.y + height - 56, 104, 40);
  card.titleLines = renderer.wrappedText(library_shelf::FONT_BODY, card.book.title.c_str(), width - 160, 2);
  const char* description = card.description.empty() ? tr(STR_LIBRARY_CARD_NO_DESCRIPTION) : card.description.c_str();
  card.descriptionLines = renderer.wrappedText(library_shelf::FONT_SMALL, description, width - 32, 5);
  card.coverTask = 0;
  card.pressed = 0;
  bookCardActive = true;
  pendingInput.clear();
  touchTracking = false;
  app.clearTapFlash();
  requestUpdate();
}

void LibraryActivity::showBookCard(const int row) {
  if (!readBook(row, rowScratch) || !allocateBookCard()) return;
  bindBookCard(false);
}

void LibraryActivity::bindBookCard(const bool current) {
  auto& card = *bookCard;
  const bool cached =
      !card.summary && card.book.path == rowScratch.path && card.metadata == (SETTINGS.libraryUseMetadata != 0);
  if (!cached) {
    card.book = rowScratch;
    card.description.clear();
    card.series.clear();
    card.genre.clear();
    card.seriesPosition.clear();
    card.metadata = SETTINGS.libraryUseMetadata != 0;
    if (card.metadata && FsHelpers::hasEpubExtension(card.book.path)) {
      auto epub = makeUniqueNoThrow<Epub>(card.book.path, "/.crosspoint");
      if (epub && epub->loadMetadata(rowScratch.title, rowScratch.author, false, &card.series, &card.genre,
                                     &card.seriesPosition, &card.description)) {
        if (!rowScratch.title.empty()) card.book.title.assign(rowScratch.title);
        card.book.author.assign(rowScratch.author);
        plainBlurb(card.description);
        if (!card.series.empty() && !card.seriesPosition.empty() && card.seriesPosition.size() <= 16 &&
            card.series.size() < 480)
          card.series.append(" #").append(card.seriesPosition);
      } else {
        card.description.clear();
        LOG_ERR("LIB", "Cannot read optional book-card metadata");
      }
    }
  }
  card.summary = false;
  card.current = current;
  card.previewCount = 1;
  card.repaint = false;
  card.percent = bookFinished(card.book)                       ? 100.0f
                 : FsHelpers::hasEpubExtension(card.book.path) ? RecentBookProgress::loadCachedEpubPercent(card.book)
                                                               : RecentBookProgress::loadPercent(card.book);
  prepareBookCard();
}

void LibraryActivity::showCurrentBookCard() {
  const auto& recents = RECENT_BOOKS.getBooks();
  for (size_t row = 0; row < recents.size(); ++row) {
    if (recents[row].path == "/My Clippings.txt" || !Storage.exists(recents[row].path.c_str())) continue;
    if (!allocateBookCard()) return;
    readRecentBook(row, rowScratch);
    bindBookCard(true);
    return;
  }
  showSummaryCard();
}

void LibraryActivity::showSummaryCard() {
  if (!allocateBookCard()) return;
  auto& card = *bookCard;
  card.summary = true;
  card.current = false;
  card.metadata = SETTINGS.libraryUseMetadata != 0;
  card.book.path.clear();
  card.book.author.clear();
  card.series.clear();
  card.genre.clear();
  card.seriesPosition.clear();
  card.book.title =
      collectionsVisible || collectionScope == CollectionKind::All ? tr(STR_LIBRARY_ALL_BOOKS) : collectionTitle;
  card.total = rowCount();
  card.finished = 0;
  card.authors.clear();
  for (int row = 0; row < card.total; ++row) {
    if ((row & 31) == 31) delay(1);
    if (completedRow(row)) ++card.finished;
    if (card.metadata && card.authors.size() < 3 && readBook(row, rowScratch) && !rowScratch.author.empty() &&
        std::find(card.authors.begin(), card.authors.end(), rowScratch.author) == card.authors.end())
      card.authors.push_back(rowScratch.author);
  }
  for (const auto& author : card.authors) {
    if (!card.book.author.empty()) card.book.author.append(" · ");
    card.book.author.append(author);
  }
  char counts[128];
  snprintf(counts, sizeof(counts), tr(STR_LIBRARY_CARD_SUMMARY_TEXT), card.total, card.finished);
  card.description.assign(counts);
  card.series = tr(collectionScope == CollectionKind::All       ? STR_LIBRARY_ALL_BOOKS
                   : collectionScope == CollectionKind::Authors ? STR_LIBRARY_AUTHORS
                   : collectionScope == CollectionKind::Folders ? STR_LIBRARY_SD_FOLDERS
                                                                : STR_LIBRARY_SERIES);
  card.percent = card.total > 0 ? 100.0f * card.finished / card.total : 0;
  card.previewCount = std::min(3, card.total);
  card.repaint = false;
  prepareBookCard();
}

void LibraryActivity::onCardEvent(const freeink::ui::ActionEvent& event, void* user) {
  auto* self = static_cast<LibraryActivity*>(user);
  if (event.value >= 0)
    self->showBookCard(event.value);
  else if (event.value == -1 && self->collectionsVisible)
    self->showCurrentBookCard();
  else
    self->showSummaryCard();
}

void LibraryActivity::loadBookCardCovers() {
  if (!bookCardActive || !bookCard || !uiReady) return;
  auto& card = *bookCard;
  if (card.coverTask >= card.previewCount) return;
  if (card.summary) {
    if (readBook(card.coverTask, rowScratch)) card.repaint = prepareCover(rowScratch, COVER_W, COVER_H) || card.repaint;
  } else {
    card.repaint = prepareCover(card.book, COVER_W, COVER_H) || card.repaint;
  }
  ++card.coverTask;
  if (card.coverTask == card.previewCount && card.repaint) {
    card.repaint = false;
    requestUpdate();
  }
}

void LibraryActivity::drawBookCard() {
  const auto& card = *bookCard;
  const auto& box = card.dialog;
  renderer.fillRect(box.x + 4, box.y + 4, box.width, box.height, true);
  renderer.fillRect(box.x, box.y, box.width, box.height, false);
  renderer.drawRect(box.x, box.y, box.width, box.height, 2, true);
  drawBookLabel(card.summary   ? tr(STR_LIBRARY_CARD_SUMMARY)
                : card.current ? tr(STR_CONTINUE_READING)
                               : tr(STR_LIBRARY_CARD_DETAILS),
                library_shelf::FONT_BODY, box.x + 16, box.y + 12, box.width - 32);
  renderer.drawLine(box.x + 16, box.y + 40, box.x + box.width - 16, box.y + 40);
  for (int preview = card.previewCount - 1; preview >= 0; --preview) {
    const int x = card.cover.x + (card.summary ? preview * 4 : 0);
    const int y = card.cover.y + (card.summary ? preview * 3 : 0);
    renderer.fillRect(x, y, COVER_W, COVER_H, false);
    if (card.summary) {
      if (readBook(preview, rowScratch)) drawCachedCover(rowScratch, x, y, COVER_W, COVER_H);
    } else
      drawCachedCover(card.book, x, y, COVER_W, COVER_H);
    renderer.drawRect(x, y, COVER_W, COVER_H);
  }
  const int infoX = box.x + 144, infoW = box.width - 160;
  int y = box.y + 56;
  for (const auto& line : card.titleLines) {
    renderer.drawText(library_shelf::FONT_BODY, infoX, y, line.c_str());
    y += renderer.getLineHeight(library_shelf::FONT_BODY);
  }
  drawBookLabel(card.book.author.c_str(), library_shelf::FONT_SMALL, infoX, box.y + 103, infoW);
  y = box.y + 130;
  const auto tag = [&](const std::string& label) {
    if (label.empty()) return;
    renderer.drawRect(infoX, y, infoW, 23);
    drawBookLabel(label.c_str(), library_shelf::FONT_SMALL, infoX + 6, y + 3, infoW - 12);
    y += 27;
  };
  if (SETTINGS.libraryShowSeries || card.summary) tag(card.series);
  if (SETTINGS.libraryShowGenre) tag(card.genre);
  char progress[40];
  if (card.summary)
    snprintf(progress, sizeof(progress), tr(STR_LIBRARY_CARD_FINISHED), card.finished, card.total);
  else if (card.percent >= 0)
    snprintf(progress, sizeof(progress), "%d%%", static_cast<int>(card.percent + 0.5f));
  else
    snprintf(progress, sizeof(progress), "%s", tr(STR_LIBRARY_STATUS_NEW));
  drawBookLabel(progress, library_shelf::FONT_SMALL, infoX, box.y + 191, infoW);
  renderer.drawRect(infoX, box.y + 213, infoW, 9);
  if (card.percent > 0)
    renderer.fillRect(infoX + 2, box.y + 215, (infoW - 4) * std::min(100, static_cast<int>(card.percent)) / 100, 5,
                      true);
  y = box.y + 245;
  for (const auto& line : card.descriptionLines) {
    renderer.drawText(library_shelf::FONT_SMALL, box.x + 16, y, line.c_str());
    y += renderer.getLineHeight(library_shelf::FONT_SMALL);
  }
  if (!card.summary) {
    renderer.fillRect(card.openButton.x, card.openButton.y, card.openButton.width, card.openButton.height, true);
    const int textWidth = renderer.getTextWidth(library_shelf::FONT_BODY, tr(STR_LIBRARY_CARD_OPEN));
    renderer.drawText(library_shelf::FONT_BODY, card.openButton.x + (card.openButton.width - textWidth) / 2,
                      card.openButton.y + 10, tr(STR_LIBRARY_CARD_OPEN), false);
  }
  renderer.drawRect(card.closeButton.x, card.closeButton.y, card.closeButton.width, card.closeButton.height);
  drawBookLabel(tr(STR_LIBRARY_CARD_CLOSE), library_shelf::FONT_BODY, card.closeButton.x + 4, card.closeButton.y + 10,
                card.closeButton.width - 8, true);
}

void LibraryActivity::closeBookCard() {
  bookCardActive = false;
  pendingInput.clear();
  touchTracking = false;
  requestUpdate();
}

void LibraryActivity::handleBookCardInput(const LibraryInputBuffer::Event& input) {
  using Type = LibraryInputBuffer::Type;
  auto& card = *bookCard;
  const auto target = [&] {
    return !card.summary && (contains(card.openButton, input.x, input.y) || contains(card.cover, input.x, input.y)) ? 1
           : contains(card.closeButton, input.x, input.y)                                                           ? 2
                                                                                                                    : 0;
  };
  if (input.type == Type::TouchPress) {
    card.pressed = target();
    return;
  }
  if (input.type == Type::BackRelease) {
    closeBookCard();
    return;
  }
  const bool open = input.type == Type::ConfirmRelease && !card.summary;
  if (open || (input.type == Type::TouchRelease && target() == 1 && card.pressed == 1)) {
    bookCardActive = false;
    index.close();
    onSelectBook(card.book.path);
  } else if (input.type == Type::TouchRelease &&
             ((target() == 2 && card.pressed == 2) || !contains(card.dialog, input.x, input.y))) {
    closeBookCard();
  }
}
