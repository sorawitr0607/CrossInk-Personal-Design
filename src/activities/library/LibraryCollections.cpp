#include <Arduino.h>
#include <FsHelpers.h>
#include <I18n.h>
#include <LibraryFileTypes.h>
#include <LibraryText.h>
#include <Memory.h>

#include <algorithm>
#include <cstdio>

#include "LibraryActivity.h"
#include "LibraryFonts.h"
#include "LibraryShelfArt.h"
#include "components/UITheme.h"
#include "fontIds.h"

namespace fui = freeink::ui;

namespace {
constexpr fui::ActionId ACTION_COLLECTION = 3;
constexpr int COLLECTIONS_PER_PAGE = 4;
constexpr int COLLECTION_COLUMNS = 2;
constexpr int COLLECTION_GAP = 12;
constexpr int ALL_COVER_WIDTH = 24;
constexpr int ALL_COVER_HEIGHT = 36;
constexpr int ALL_COVER_SLOTS = 3;
constexpr int COVERS_PER_COLLECTION = 3;
constexpr int TAB_SERIES = 100;
constexpr int TAB_AUTHORS = 101;
constexpr int TAB_FOLDERS = 102;
constexpr int PAGE_PREVIOUS = 200;
constexpr int PAGE_NEXT = 201;
constexpr int PAGE_FIRST = 202;
constexpr int PAGE_LAST = 203;
}  // namespace

bool LibraryActivity::readCollectionValue(const library::ClixRecord& record, const CollectionKind kind,
                                          std::string& value) {
  value.clear();
  if (kind == CollectionKind::Series) return index.readSeries(record, value);
  // An empty author is valid metadata, not an I/O failure. Keep its books in
  // Unknown Author instead of discarding every collection built so far.
  if (kind == CollectionKind::Authors) return index.readAuthor(record, value) || !index.ioFailed();
  if (kind == CollectionKind::Folders) {
    if (!index.readPath(record, value)) return false;
    const auto slash = value.find_last_of('/');
    if (slash == std::string::npos) return false;
    value.resize(slash == 0 ? 1 : slash);
    return true;
  }
  return true;
}

bool LibraryActivity::matchesCollection(const library::ClixRecord& record) {
  if (collectionScope == CollectionKind::All) return true;
  if (!readCollectionValue(record, collectionScope, collectionScratch)) {
    LOG_ERR("LIB", "Cannot read collection filter metadata");
    filterFailed = true;
    return false;
  }
  if (collectionScope == CollectionKind::Folders) return collectionScratch == collectionKey;
  library::foldInto(collectionScratch, groupKeyScratch);
  return groupKeyScratch == collectionKey;
}

bool LibraryActivity::readIndexedBook(const uint16_t ordinal, RecentBook& book) {
  library::ClixRecord record{};
  book.coverBmpPath.clear();
  book.coverState = RecentBook::CoverState::Unknown;
  return ordinal != UINT16_MAX && index.readRecord(ordinal, record) &&
         index.readDisplayText(record, book.title, book.author) && index.readPath(record, book.path);
}

bool LibraryActivity::collectionLabel(const CollectionSlot& slot, std::string& value) {
  library::ClixRecord record{};
  if (!index.readRecord(slot.leader, record) || !readCollectionValue(record, collectionTab, value)) return false;
  if (value.empty()) {
    value.assign(collectionTab == CollectionKind::Authors ? tr(STR_LIBRARY_UNKNOWN_AUTHOR)
                                                          : tr(STR_LIBRARY_STANDALONE));
  } else if (collectionTab == CollectionKind::Folders && value != "/") {
    if (value.front() == '/') value.erase(0, 1);
  }
  return true;
}

void LibraryActivity::buildCollections() {
  collectionCount = 0;
  collectionsFailed = false;
  allBookCoverCount = 0;
  allCompleted = 0;
  loadedCollectionPage = -1;
  nextCollectionCover = 0;
  collectionCoversChanged = false;
  if (!index.isOpen() || index.bookCount() == 0) return;
  const uint16_t capacity = std::max(index.bookCount(), index.header().folderCount);
  if (capacity != collectionCapacity || !collections) {
    // Bound: 12 bytes per indexed book/folder, preferentially in PSRAM.
    // The card's library format bounds book and folder IDs. Strings and image
    // data are streamed, not stored here. Reuse this allocation until exit.
    if (!collections.allocate(capacity)) {
      collectionCapacity = 0;
      collectionsFailed = true;
      LOG_ERR("LIB", "Cannot allocate %u collection references; All Books remains available", capacity);
      return;
    }
    collectionCapacity = capacity;
  }
  std::fill_n(collections.get(), collectionCapacity, CollectionSlot{});
  const int books = rowCount();
  previousGroupKeyScratch.clear();
  bool haveGroup = false;
  for (int row = 0; row < books; ++row) {
    if ((row & 31) == 31) delay(1);
    const auto ordinal = ordinalForRow(row);
    library::ClixRecord record{};
    if (ordinal == UINT16_MAX || !index.readRecord(ordinal, record)) {
      collectionsFailed = true;
      break;
    }
    const bool completed = completedOrdinal(ordinal);
    if (completed) ++allCompleted;
    if (allBookCoverCount < ALL_COVER_SLOTS) allBookCovers[allBookCoverCount++] = ordinal;
    uint16_t group = 0;
    if (collectionTab == CollectionKind::Folders) {
      if (record.folderId >= collectionCapacity) {
        collectionsFailed = true;
        break;
      }
      group = record.folderId;
    } else {
      if (!readCollectionValue(record, collectionTab, collectionScratch)) {
        collectionsFailed = true;
        break;
      }
      library::foldInto(collectionScratch, groupKeyScratch);
      if (!haveGroup || groupKeyScratch != previousGroupKeyScratch) {
        if (collectionCount >= collectionCapacity) {
          collectionsFailed = true;
          break;
        }
        previousGroupKeyScratch.assign(groupKeyScratch);
        haveGroup = true;
        ++collectionCount;
      }
      group = collectionCount - 1;
    }
    auto& slot = collections[group];
    if (slot.count == 0) slot.leader = ordinal;
    if (slot.count < COVERS_PER_COLLECTION) slot.covers[slot.count] = ordinal;
    ++slot.count;
    if (completed) ++slot.completed;
  }
  if (collectionTab == CollectionKind::Folders) {
    for (uint32_t i = 0; i < collectionCapacity; ++i) {
      if (collections[i].count != 0) collections[collectionCount++] = collections[i];
    }
  }
  if (collectionsFailed) {
    LOG_ERR("LIB", "Could not read collection index; retaining All Books");
    collectionCount = 0;
  }
  const int last = collectionCount > 0 ? ((collectionCount - 1) / COLLECTIONS_PER_PAGE) * COLLECTIONS_PER_PAGE : 0;
  collectionPageStart = std::clamp(collectionPageStart, 0, last);
  collectionSelection = std::clamp(collectionSelection, 0, static_cast<int>(collectionCount));
}

void LibraryActivity::enterCollections(const CollectionKind tab) {
  collectionsVisible = true;
  collectionTab = tab;
  collectionScope = CollectionKind::All;
  collectionKey.clear();
  collectionTitle.clear();
  query.clear();
  sort = tab == CollectionKind::Series ? Sort::Series : tab == CollectionKind::Authors ? Sort::AuthorLast : Sort::Title;
  descending = false;
  collectionPageStart = 0;
  collectionSelection = 0;
  refreshIndexIfNeeded(true);
  buildCollections();
  resetViewport();
  requestUpdate();
}

void LibraryActivity::enterCollection(const int slot) {
  if (slot >= 0 && (slot >= collectionCount || !collections)) return;
  collectionScope = CollectionKind::All;
  collectionKey.clear();
  collectionTitle.clear();
  if (slot >= 0) {
    library::ClixRecord record{};
    if (!index.readRecord(collections[slot].leader, record) ||
        !readCollectionValue(record, collectionTab, collectionKey) ||
        !collectionLabel(collections[slot], collectionTitle)) {
      LOG_ERR("LIB", "Cannot open collection");
      return;
    }
    collectionScope = collectionTab;
    if (collectionScope != CollectionKind::Folders) {
      library::foldInto(collectionKey, groupKeyScratch);
      collectionKey.assign(groupKeyScratch);
    }
  }
  collectionsVisible = false;
  query.clear();
  sort = Sort::Series;
  descending = false;
  refreshIndexIfNeeded(true);
  resetViewport();
  requestUpdate();
}

void LibraryActivity::returnToCollections() {
  pendingInput.clear();
  if (collectionsVisible) {
    onGoHome();
    return;
  }
  if (!query.empty()) {
    query.clear();
    applyFilter();
    resetViewport();
    requestUpdate();
    return;
  }
  const int page = collectionPageStart, selected = collectionSelection;
  enterCollections(collectionTab);
  collectionPageStart =
      std::min(page, collectionCount > 0 ? ((collectionCount - 1) / COLLECTIONS_PER_PAGE) * COLLECTIONS_PER_PAGE : 0);
  collectionSelection = std::min(selected, static_cast<int>(collectionCount));
}

void LibraryActivity::changeCollectionPage(const int direction) {
  const int last = collectionCount > 0 ? ((collectionCount - 1) / COLLECTIONS_PER_PAGE) * COLLECTIONS_PER_PAGE : 0;
  const int next = std::clamp(collectionPageStart + direction * COLLECTIONS_PER_PAGE, 0, last);
  if (next == collectionPageStart) return;
  collectionPageStart = next;
  collectionSelection = next + 1;
  loadedCollectionPage = -1;
  nextCollectionCover = 0;
  collectionCoversChanged = false;
  requestUpdate();
}

void LibraryActivity::onCollectionEvent(const fui::ActionEvent& event, void* user) {
  auto* self = static_cast<LibraryActivity*>(user);
  self->app.clearTapFlash();
  self->pendingInput.clear();
  if (!self->collectionsVisible && event.value >= PAGE_PREVIOUS && event.value <= PAGE_LAST) {
    const int direction = event.value == PAGE_FIRST  ? -2
                          : event.value == PAGE_LAST ? 2
                          : event.value == PAGE_NEXT ? 1
                                                     : -1;
    self->moveBookPage(direction);
    return;
  }
  if (event.value >= TAB_SERIES && event.value <= TAB_FOLDERS) {
    self->enterCollections(static_cast<CollectionKind>(event.value - TAB_SERIES + 1));
  } else if (event.value >= PAGE_PREVIOUS && event.value <= PAGE_LAST) {
    const int last =
        (std::max(0, static_cast<int>(self->collectionCount) - 1) / COLLECTIONS_PER_PAGE) * COLLECTIONS_PER_PAGE;
    if (event.value == PAGE_FIRST)
      self->changeCollectionPage(-static_cast<int>(self->collectionCount));
    else if (event.value == PAGE_LAST)
      self->changeCollectionPage(last / COLLECTIONS_PER_PAGE + 1);
    else
      self->changeCollectionPage(event.value == PAGE_NEXT ? 1 : -1);
  } else if (event.value == 0) {
    self->collectionSelection = 0;
    self->enterCollection(-1);
  } else if (event.value >= 1 && event.value <= COLLECTIONS_PER_PAGE) {
    const int slot = self->collectionPageStart + event.value - 1;
    self->collectionSelection = slot + 1;
    self->enterCollection(slot);
  }
}

void LibraryActivity::handleCollectionInput(const LibraryInputBuffer::Event& input) {
  using Type = LibraryInputBuffer::Type;
  if (input.type == Type::BackRelease) {
    onGoHome();
    return;
  }
  if (input.type == Type::ConfirmRelease) {
    enterCollection(collectionSelection - 1);
    return;
  }
  if (input.type == Type::LeftRelease || input.type == Type::RightRelease) {
    const int current = static_cast<int>(collectionTab) - 1;
    const int next = (current + (input.type == Type::RightRelease ? 1 : 2)) % 3;
    enterCollections(static_cast<CollectionKind>(next + 1));
    return;
  }
  if (input.type == Type::NextPage || input.type == Type::SwipeLeft || input.type == Type::SwipeUp) {
    changeCollectionPage(1);
    return;
  }
  if (input.type == Type::PreviousPage || input.type == Type::SwipeRight || input.type == Type::SwipeDown) {
    changeCollectionPage(-1);
    return;
  }
  if (input.type != Type::Next && input.type != Type::Previous) return;
  const int count = collectionCount + 1;
  collectionSelection = input.type == Type::Next ? ButtonNavigator::nextIndex(collectionSelection, count)
                                                 : ButtonNavigator::previousIndex(collectionSelection, count);
  showSelection = true;
  if (collectionSelection > 0) {
    const int page = ((collectionSelection - 1) / COLLECTIONS_PER_PAGE) * COLLECTIONS_PER_PAGE;
    if (page != collectionPageStart) {
      collectionPageStart = page;
      loadedCollectionPage = -1;
      nextCollectionCover = 0;
      collectionCoversChanged = false;
    }
  }
  requestUpdate();
}

void LibraryActivity::buildCollectionScreen(UiApp::ScreenType& screen) {
  const auto heroBand = screen.take(fui::LayoutAnchor::Top, 80, 0);
  screen.frame().hit(heroBand, 4, -1, fui::InputTouch);
  static constexpr StrId themeLabels[] = {StrId::STR_LIBRARY_SHELF_COZY, StrId::STR_LIBRARY_SHELF_AUTUMN};
  static constexpr StrId headlines[] = {StrId::STR_LIBRARY_WELCOME, StrId::STR_LIBRARY_WELCOME_AUTUMN};
  static constexpr StrId taglines[] = {StrId::STR_LIBRARY_TAGLINE_COZY, StrId::STR_LIBRARY_TAGLINE_AUTUMN};
  const uint8_t theme = SETTINGS.libraryBookshelfTheme;
  const auto themeChoice = library_shelf::themeIndex(theme);
  const auto& art = library_shelf::art(theme);
  renderer.fillRect(heroBand.x + 8, heroBand.y + 2, heroBand.width - 16, heroBand.height - 4, false);
  const int heroWidth = SETTINGS.libraryOrnaments ? art.hero->width + 16 : 0;
  drawBookLabel(I18N.get(themeLabels[themeChoice]), library_shelf::FONT_SMALL, heroBand.x + 16, heroBand.y + 3,
                heroBand.width - heroWidth - 28);
  drawBookLabel(I18N.get(headlines[themeChoice]), library_shelf::FONT_HEADING, heroBand.x + 16, heroBand.y + 24,
                heroBand.width - heroWidth - 28);
  drawBookLabel(RECENT_BOOKS.getCount() > 0 ? tr(STR_CONTINUE_READING) : I18N.get(taglines[themeChoice]),
                library_shelf::FONT_SMALL, heroBand.x + 16, heroBand.y + 56, heroBand.width - heroWidth - 28);
  if (SETTINGS.libraryOrnaments)
    library_shelf::drawSprite(renderer, *art.hero, heroBand.right() - art.hero->width - 12,
                              heroBand.bottom() - art.hero->height - 2);
  const auto tabs = screen.take(fui::LayoutAnchor::Top, 42, 0);
  static constexpr StrId tabLabels[] = {StrId::STR_LIBRARY_SERIES, StrId::STR_LIBRARY_AUTHORS,
                                        StrId::STR_LIBRARY_SD_FOLDERS};
  for (int i = 0; i < 3; ++i) {
    const fui::Rect tab{static_cast<int16_t>(tabs.x + i * tabs.width / 3), tabs.y, static_cast<int16_t>(tabs.width / 3),
                        tabs.height};
    const bool active = static_cast<int>(collectionTab) == i + 1;
    renderer.fillRect(tab.x, tab.y, tab.width, tab.height, active);
    renderer.drawRect(tab.x, tab.y, tab.width, tab.height);
    const char* label = I18N.get(tabLabels[i]);
    const int textWidth = renderer.getTextWidth(library_shelf::FONT_SMALL, label);
    renderer.drawText(library_shelf::FONT_SMALL, tab.x + (tab.width - textWidth) / 2, tab.y + 10, label, !active);
    screen.frame().hit(tab, ACTION_COLLECTION, static_cast<int16_t>(TAB_SERIES + i), fui::InputTouch);
  }
  const auto allBand = screen.take(fui::LayoutAnchor::Top, 74, 4);
  const int allWidth = std::min<int>(art.all->width, allBand.width - 24);
  const fui::Rect all{static_cast<int16_t>(allBand.x + (allBand.width - allWidth) / 2),
                      static_cast<int16_t>(allBand.y + 8), static_cast<int16_t>(allWidth), 60};
  library_shelf::drawSprite(renderer, *art.all, all.x, all.y, 0, all.width);
  for (int i = allBookCoverCount - 1; i >= 0; --i) {
    if (!readIndexedBook(allBookCovers[i], rowScratch)) continue;
    const int x = all.x + 16 + i * 9, y = all.y + 11 - i * 2;
    renderer.fillRect(x, y, ALL_COVER_WIDTH, ALL_COVER_HEIGHT, false);
    if (!drawCachedCover(rowScratch, x, y, ALL_COVER_WIDTH, ALL_COVER_HEIGHT))
      renderer.drawRect(x, y, ALL_COVER_WIDTH, ALL_COVER_HEIGHT);
  }
  drawBookLabel(tr(STR_LIBRARY_ALL_BOOKS), library_shelf::FONT_BODY, all.x + 82, all.y + 5, all.width - 110);
  char counts[64], finished[28];
  snprintf(counts, sizeof(counts), tr(STR_LIBRARY_BOOKS_COUNT), static_cast<unsigned>(rowCount()));
  snprintf(finished, sizeof(finished), tr(STR_LIBRARY_FINISHED_COUNT), static_cast<unsigned>(allCompleted));
  collectionScratch.assign(counts);
  collectionScratch.append(" · ").append(finished);
  drawBookLabel(collectionScratch.c_str(), library_shelf::FONT_SMALL, all.x + 82, all.y + 31, all.width - 110);
  renderer.drawLine(all.right() - 21, all.y + 23, all.right() - 15, all.y + 29);
  renderer.drawLine(all.right() - 15, all.y + 29, all.right() - 21, all.y + 35);
  if (showSelection && collectionSelection == 0) renderer.drawRect(all.x + 4, all.y + 4, all.width - 8, all.height - 8);
  screen.frame().hit(all, ACTION_COLLECTION, 0, fui::InputTouch);
  const auto page = screen.take(fui::LayoutAnchor::Bottom, 44, 0);
  drawBookPager(screen, page, collectionPageStart / COLLECTIONS_PER_PAGE,
                library_shelf::pageCount(collectionCount, COLLECTIONS_PER_PAGE));
  auto area = screen.body();
  area.x += 12;
  area.width -= 24;
  const int cellWidth = area.width / 2;
  const int cellHeight = area.height / 2;
  const int coverHeight = std::max(1, std::min(cellHeight - 100, (cellWidth - 62) * 3 / 2));
  const int coverWidth = std::max(1, coverHeight * 2 / 3);
  if (collectionCoverWidth != coverWidth || collectionCoverHeight != coverHeight) {
    collectionCoverWidth = coverWidth;
    collectionCoverHeight = coverHeight;
    loadedCollectionPage = -1;
    nextCollectionCover = 0;
    collectionCoversChanged = false;
  }
  for (int line = 0; line < 2; ++line) {
    const int floor = area.y + (line + 1) * cellHeight - 80;
    library_shelf::drawPlank(renderer, theme, area.x + 4, floor, area.width - 8, false);
    library_shelf::drawPlank(renderer, theme, area.x + 4, floor, area.width - 8, true);
  }
  for (int visible = 0; visible < COLLECTIONS_PER_PAGE; ++visible) {
    const int groupIndex = collectionPageStart + visible;
    const int line = visible / 2, col = visible % 2;
    const int cx = area.x + col * cellWidth, floor = area.y + (line + 1) * cellHeight - 80;
    if (groupIndex >= collectionCount) {
      if (SETTINGS.libraryOrnaments)
        library_shelf::drawOrnament(renderer, theme, visible % 2 ? 0 : 1, visible, cx + 12, floor, cellWidth - 24,
                                    cellHeight - 95);
      continue;
    }
    const auto& group = collections[groupIndex];
    const int covers = std::min(COVERS_PER_COLLECTION, static_cast<int>(group.count));
    for (int i = covers - 1; i >= 0; --i) {
      if (!readIndexedBook(group.covers[i], rowScratch)) continue;
      const int x = cx + (cellWidth - coverWidth) / 2 + i * 9;
      const int y = floor - coverHeight - i * 4;
      renderer.fillRect(x, y, coverWidth, coverHeight, false);
      if (!drawCachedCover(rowScratch, x, y, coverWidth, coverHeight)) {
        renderer.drawRect(x, y, coverWidth, coverHeight);
        if (i == 0)
          drawBookLabel(rowScratch.title.c_str(), library_shelf::FONT_SMALL, x + 8, y + coverHeight / 3,
                        coverWidth - 16, true);
      }
      renderer.drawRect(x, y, coverWidth, coverHeight);
    }
    if (SETTINGS.libraryOrnaments && covers > 0)
      library_shelf::drawOrnament(renderer, theme, 3, groupIndex, cx + (cellWidth - coverWidth) / 2,
                                  floor - coverHeight - 9, coverWidth,
                                  std::min(30, floor - coverHeight - 12 - (area.y + line * cellHeight)));
    const int plateX = cx + (cellWidth - art.plate->width) / 2;
    library_shelf::drawSprite(renderer, *art.plate, plateX, floor + 29);
    if (collectionLabel(group, collectionScratch))
      drawBookLabel(collectionScratch.c_str(), library_shelf::FONT_BODY, plateX + 10, floor + 32, art.plate->width - 20,
                    true);
    snprintf(counts, sizeof(counts), tr(STR_LIBRARY_BOOKS_COUNT), static_cast<unsigned>(group.count));
    snprintf(finished, sizeof(finished), tr(STR_LIBRARY_FINISHED_COUNT), static_cast<unsigned>(group.completed));
    collectionScratch.assign(counts);
    if (group.completed) collectionScratch.append(" · ").append(finished);
    drawBookLabel(collectionScratch.c_str(), library_shelf::FONT_SMALL, plateX + 10, floor + 57, art.plate->width - 20,
                  true);
    if (showSelection && collectionSelection == groupIndex + 1)
      renderer.drawRect(cx + 3, floor - coverHeight - 12, cellWidth - 6, coverHeight + 92);
    screen.frame().hit(fui::Rect{static_cast<int16_t>(cx), static_cast<int16_t>(area.y + line * cellHeight),
                                 static_cast<int16_t>(cellWidth), static_cast<int16_t>(cellHeight)},
                       ACTION_COLLECTION, static_cast<int16_t>(visible + 1), fui::InputTouch);
  }
  if (collectionCount == 0)
    drawBookLabel(collectionsFailed ? tr(STR_LIBRARY_SEARCH_FAILED) : tr(STR_LIBRARY_EMPTY), library_shelf::FONT_SMALL,
                  area.x + 10, area.y + 4, area.width - 20, true);
}

void LibraryActivity::loadCollectionPageCovers() {
  if (!collectionsVisible || !index.isOpen() || loadedCollectionPage == collectionPageStart ||
      collectionCoverWidth <= 0 || collectionCoverHeight <= 0)
    return;
  constexpr int slots = ALL_COVER_SLOTS + COLLECTIONS_PER_PAGE * COVERS_PER_COLLECTION;
  if (nextCollectionCover < slots) {
    const int task = nextCollectionCover++;
    uint16_t ordinal = UINT16_MAX;
    int width = collectionCoverWidth, height = collectionCoverHeight;
    if (task < ALL_COVER_SLOTS) {
      if (task < allBookCoverCount) ordinal = allBookCovers[task];
      width = ALL_COVER_WIDTH;
      height = ALL_COVER_HEIGHT;
    } else {
      const int group = collectionPageStart + (task - ALL_COVER_SLOTS) / COVERS_PER_COLLECTION;
      const int cover = (task - ALL_COVER_SLOTS) % COVERS_PER_COLLECTION;
      if (group < collectionCount && cover < collections[group].count) ordinal = collections[group].covers[cover];
    }
    if (ordinal != UINT16_MAX && readIndexedBook(ordinal, rowScratch))
      collectionCoversChanged = prepareCover(rowScratch, width, height) || collectionCoversChanged;
  }
  if (nextCollectionCover >= slots) {
    loadedCollectionPage = collectionPageStart;
    if (collectionCoversChanged) requestUpdate();
    collectionCoversChanged = false;
  }
}
