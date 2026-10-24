#include <Arduino.h>
#include <Epub.h>
#include <FsHelpers.h>
#include <HalStorage.h>
#include <I18n.h>
#include <Utf8.h>

#include <algorithm>
#include <cstdio>
#include <cstring>
#include <functional>

#include "LibraryActivity.h"
#include "LibraryShelfArt.h"
#include "activities/home/BookActions.h"
#include "activities/home/RecentBookProgress.h"
#include "activities/reader/BookReadingStats.h"
#include "fontIds.h"

namespace fui = freeink::ui;
namespace {
constexpr fui::ActionId ACTION_ROW = 1;
constexpr fui::ActionId ACTION_COLLECTION = 3;
constexpr int PAGE_PREVIOUS = 200, PAGE_NEXT = 201, PAGE_FIRST = 202, PAGE_LAST = 203;
constexpr int GAP = 8;
}  // namespace

void LibraryActivity::invalidateCompletion() {
  completionBits.reset();
  completionBookCount = 0;
  completionUnavailable = false;
  invalidateBookPages();
}

bool LibraryActivity::completedOrdinal(const uint16_t ordinal) {
  if (!index.isOpen() || ordinal >= index.bookCount()) return false;
  if (completionBookCount != index.bookCount()) {
    completionUnavailable = !completionBits.allocate((index.bookCount() + 3) / 4);
    completionBookCount = index.bookCount();
    if (completionUnavailable) LOG_ERR("LIB", "Cannot allocate completion bits; status badges unavailable");
  }
  if (completionUnavailable) return false;
  const unsigned shift = (ordinal % 4) * 2;
  const uint8_t state = (completionBits[ordinal / 4] >> shift) & 3;
  if (state & 1) return (state & 2) != 0;
  library::ClixRecord record{};
  bool completed = false;
  if (index.readRecord(ordinal, record) && index.readPath(record, collectionScratch)) {
    if (FsHelpers::hasEpubExtension(collectionScratch)) {
      thumbnailScratch = Epub::resolveCachePathForFilePath(collectionScratch, "/.crosspoint");
    } else if (FsHelpers::hasXtcExtension(collectionScratch)) {
      char path[64];
      snprintf(path, sizeof(path), "/.crosspoint/xtc_%llu",
               static_cast<unsigned long long>(std::hash<std::string>{}(collectionScratch)));
      thumbnailScratch.assign(path);
    } else {
      thumbnailScratch.clear();
    }
    if (!thumbnailScratch.empty() && Storage.exists(thumbnailScratch.c_str()))
      completed = BookReadingStats::load(thumbnailScratch).isCompleted;
  }
  completionBits[ordinal / 4] |= static_cast<uint8_t>((completed ? 3 : 1) << shift);
  return completed;
}

bool LibraryActivity::completedRow(const int row) {
  if (row < 0 || row >= rowCount()) return false;
  if (sort != Sort::RecentlyRead) return completedOrdinal(ordinalForRow(row));
  if (!readBook(row, rowScratch)) return false;
  return BookActions::isBookCompleted(rowScratch.path);
}

void LibraryActivity::invalidateBookPages() {
  pageCacheValid = false;
  visibleBookCount = 0;
  nextProgressSlot = 0;
  loadedGridPageStart = -1;
  nextGridCoverRow = -1;
  gridCoversChanged = false;
}

void LibraryActivity::ensureBookPages(const int width, const int height) {
  if (pageCacheValid && pageCacheWidth == width && pageCacheHeight == height) return;
  pageCacheWidth = width;
  pageCacheHeight = height;
  const int count = rowCount();
  const bool list = SETTINGS.libraryBookView == library_shelf::List;
  const bool dense = library_shelf::rows(SETTINGS.libraryGridRows) >= 3;
  const int labelHeight = dense ? 22 : 44;
  const int plankSpace = dense ? 22 : 30;
  const int headroom = dense ? 0 : 18;
  const auto geometry = library_shelf::geometry(width, height, SETTINGS.libraryGridColumns, SETTINGS.libraryGridRows,
                                                GAP, 7, labelHeight + plankSpace + headroom);
  const int minimumPageSize = list ? gridPageSize() : geometry.columns * geometry.rows;
  const int capacity = library_shelf::pageCount(count, minimumPageSize) + 1;
  // At the index ceiling: <=16 KiB page starts (2x2), <=4 KiB row status.
  // Fall back to fixed cover pages if either bounded allocation fails.
  pageCacheFallback = !rowCompletion.allocate((count + 7) / 8) || !bookPages.allocate(capacity);
  bookPageCount = 1;
  if (pageCacheFallback) {
    LOG_ERR("LIB", "Cannot allocate shelf pagination; using fixed cover pages");
    bookPageCount = library_shelf::pageCount(count, minimumPageSize);
  } else {
    library_shelf::ShelfCursor cursor{};
    bookPages[0] = 0;
    for (int row = 0; row < count; ++row) {
      if ((row & 31) == 31) delay(1);
      const bool done = completedRow(row);
      if (done) rowCompletion[row / 8] |= static_cast<uint8_t>(1u << (row % 8));
      if (list) {
        if (row > 0 && row % minimumPageSize == 0) bookPages[bookPageCount++] = row;
      } else {
        library_shelf::Placement placement{};
        const bool spine = SETTINGS.libraryBookView == library_shelf::Shelf && done;
        if (!library_shelf::place(cursor, geometry, width, GAP, spine, placement)) {
          if (bookPageCount >= capacity) {
            // Defensive fallback even if a future layout violates the capacity proof.
            LOG_ERR("LIB", "Shelf page bound exceeded; using fixed cover pages");
            pageCacheFallback = true;
            bookPageCount = library_shelf::pageCount(count, minimumPageSize);
            break;
          }
          bookPages[bookPageCount++] = row;
          cursor = {};
          (void)library_shelf::place(cursor, geometry, width, GAP, spine, placement);
        }
      }
    }
  }
  pageCacheValid = true;
  gridPageStart = pageStartForRow(std::max(0, selection - CONTROL_COUNT));
}

int LibraryActivity::pageStartForRow(const int row) const {
  if (!pageCacheValid || pageCacheFallback || !bookPages)
    return library_shelf::pageStart(std::max(0, row), gridPageSize());
  const auto* starts = bookPages.get();
  const int page = std::max(0, static_cast<int>(std::upper_bound(starts, starts + bookPageCount, row) - starts) - 1);
  return starts[page];
}

void LibraryActivity::moveBookPage(const int direction) {
  if (!pageCacheValid) return;
  const int last = std::max(0, bookPageCount - 1);
  const int current =
      pageCacheFallback || !bookPages
          ? gridPageStart / gridPageSize()
          : std::max(
                0, static_cast<int>(std::upper_bound(bookPages.get(), bookPages.get() + bookPageCount, gridPageStart) -
                                    bookPages.get()) -
                       1);
  const int next = direction <= -2 ? 0 : direction >= 2 ? last : std::clamp(current + direction, 0, last);
  if (next == current) return;
  bookPageIndex = next;
  gridPageStart = pageCacheFallback || !bookPages ? next * gridPageSize() : bookPages[next];
  selection = CONTROL_COUNT + gridPageStart;
  showSelection = !mappedInput.hasTouchHardware();
  loadedGridPageStart = -1;
  nextGridCoverRow = -1;
  gridCoversChanged = false;
  requestUpdate();
}

void LibraryActivity::drawBookLabel(const char* text, const int font, const int x, const int y, const int width,
                                    const bool centered) {
  if (!text || width <= 0) return;
  // Reuse a reserved member string; UTF-8-safe truncation, no per-book label cache.
  subtitleScratch.assign(text);
  while (!subtitleScratch.empty() && renderer.getTextWidth(font, subtitleScratch.c_str()) > width) {
    size_t last = subtitleScratch.size() - 1;
    while (last > 0 && (static_cast<unsigned char>(subtitleScratch[last]) & 0xc0) == 0x80) --last;
    subtitleScratch.resize(last);
  }
  const int offset = centered ? (width - renderer.getTextWidth(font, subtitleScratch.c_str())) / 2 : 0;
  renderer.drawText(font, x + offset, y, subtitleScratch.c_str());
}

void LibraryActivity::formatBookMetadata(const int row, const bool includeAuthor) {
  collectionScratch.clear();
  const auto append = [this](const std::string& value) {
    if (value.empty() || collectionScratch.size() >= 380) return;
    if (!collectionScratch.empty()) collectionScratch.append(" · ");
    const int bytes = utf8SafeTruncateBuffer(value.data(), std::min<int>(value.size(), 384 - collectionScratch.size()));
    collectionScratch.append(value.data(), bytes);
  };
  if (includeAuthor) append(rowScratch.author);
  if (!SETTINGS.libraryUseMetadata || sort == Sort::RecentlyRead || !index.isOpen()) return;
  library::ClixRecord record{};
  const auto ordinal = ordinalForRow(row);
  if (ordinal == UINT16_MAX || !index.readRecord(ordinal, record)) return;
  if (SETTINGS.libraryShowSeries && index.readSeries(record, seriesScratch) && !seriesScratch.empty()) {
    append(seriesScratch);
    uint32_t position = 0;
    if (collectionScratch.size() < 352 && index.readSeriesPosition(record, position) &&
        position != library::CLIX_UNKNOWN_SERIES_POSITION) {
      const uint32_t bits = position & 0x80000000u ? position ^ 0x80000000u : ~position;
      float number = 0;
      memcpy(&number, &bits, sizeof(number));
      char label[24];
      snprintf(label, sizeof(label), " #%g", static_cast<double>(number));
      collectionScratch.append(label);
    }
  }
  if (SETTINGS.libraryShowGenre && index.readGenre(record, genreScratch)) append(genreScratch);
}

void LibraryActivity::drawBookPager(UiApp::ScreenType& screen, const fui::Rect& area, const int current,
                                    const int total) {
  renderer.fillRect(area.x, area.y, area.width, area.height, false);
  char label[32];
  snprintf(label, sizeof(label), tr(STR_LIBRARY_PAGE_COUNT), static_cast<unsigned>(current + 1),
           static_cast<unsigned>(total));
  drawBookLabel(label, SMALL_FONT_ID, area.x + 88, area.y + 12, area.width - 176, true);
  const int xs[] = {area.x, area.x + 44, area.right() - 88, area.right() - 44};
  const int values[] = {PAGE_FIRST, PAGE_PREVIOUS, PAGE_NEXT, PAGE_LAST};
  for (int i = 0; i < 4; ++i) {
    if ((i < 2 && current == 0) || (i >= 2 && current + 1 >= total)) continue;
    const int cx = xs[i] + 22, cy = area.y + area.height / 2, direction = i < 2 ? -1 : 1;
    renderer.drawLine(cx - direction * 3, cy - 5, cx + direction * 3, cy);
    renderer.drawLine(cx + direction * 3, cy, cx - direction * 3, cy + 5);
    if (i == 0 || i == 3) renderer.drawLine(cx + direction * 8, cy - 6, cx + direction * 8, cy + 6);
    screen.frame().hit(fui::Rect{static_cast<int16_t>(xs[i]), area.y, 44, area.height}, ACTION_COLLECTION,
                       static_cast<int16_t>(values[i]), fui::InputTouch);
  }
}

void LibraryActivity::buildGrid(UiApp::ScreenType& screen) {
  const auto caption = screen.take(fui::LayoutAnchor::Top, 28, 4);
  auto pageIndicator = screen.take(fui::LayoutAnchor::Bottom, 44, 4);
  auto area = screen.body();
  area.x += 12;
  area.width -= 24;
  const bool list = SETTINGS.libraryBookView == library_shelf::List;
  const bool shelf = SETTINGS.libraryBookView == library_shelf::Shelf;
  ensureBookPages(area.width, area.height);
  const int count = rowCount();
  gridPageStart = std::clamp(gridPageStart, 0, std::max(0, count - 1));
  bookPageIndex =
      pageCacheFallback || !bookPages
          ? gridPageStart / gridPageSize()
          : std::max(
                0, static_cast<int>(std::upper_bound(bookPages.get(), bookPages.get() + bookPageCount, gridPageStart) -
                                    bookPages.get()) -
                       1);
  const int pageEnd = pageCacheFallback || !bookPages     ? std::min(count, gridPageStart + gridPageSize())
                      : bookPageIndex + 1 < bookPageCount ? bookPages[bookPageIndex + 1]
                                                          : count;
  const bool newPage = loadedGridPageStart != gridPageStart && nextGridCoverRow < 0;
  if (newPage) {
    std::fill_n(pageProgress, library_shelf::MAX_VISIBLE_BOOKS, static_cast<int8_t>(-1));
    nextProgressSlot = 0;
    pageProgressChanged = false;
  }
  const char* captionText = mappedInput.hasTouchHardware()           ? tr(STR_LIBRARY_TAP_HINT)
                            : collectionScope == CollectionKind::All ? tr(STR_LIBRARY_ALL_BOOKS)
                                                                     : collectionTitle.c_str();
  drawBookLabel(captionText, SMALL_FONT_ID, caption.x + 12, caption.y + 2, caption.width - 24);
  library_shelf::drawWall(renderer, SETTINGS.libraryBookshelfTheme, SETTINGS.libraryBackground, area.x, area.y,
                          area.width, area.height);
  const bool dense = library_shelf::rows(SETTINGS.libraryGridRows) >= 3;
  const int labelHeight = dense ? 22 : 44;
  const int plankSpace = dense ? 22 : 30;
  const int headroom = dense ? 0 : 18;
  const auto geometry = library_shelf::geometry(area.width, area.height, SETTINGS.libraryGridColumns,
                                                SETTINGS.libraryGridRows, GAP, 7, labelHeight + plankSpace + headroom);
  const int coverWidth = list ? 30 : geometry.coverWidth;
  const int coverHeight = list ? 44 : geometry.coverHeight;
  if (coverWidth != gridCoverWidth || coverHeight != gridCoverHeight) {
    gridCoverWidth = coverWidth;
    gridCoverHeight = coverHeight;
    loadedGridPageStart = -1;
    nextGridCoverRow = -1;
    gridCoversChanged = false;
  }
  const int selectedRow = selection - CONTROL_COUNT;
  library_shelf::ShelfCursor cursor{};
  visibleBookCount = 0;
  const int rowHeight = SETTINGS.libraryListExpanded ? 84 : 62;
  if (!list) {
    for (int line = 0; line < geometry.rows; ++line) {
      const int floor = area.y + (line + 1) * geometry.cellHeight + line * GAP - labelHeight - plankSpace;
      library_shelf::drawPlank(renderer, SETTINGS.libraryBookshelfTheme, area.x + 4, floor, area.width - 8, false);
      library_shelf::drawPlank(renderer, SETTINGS.libraryBookshelfTheme, area.x + 4, floor, area.width - 8, true);
    }
  }
  for (int row = gridPageStart; row < pageEnd && visibleBookCount < library_shelf::MAX_VISIBLE_BOOKS; ++row) {
    const bool done = !pageCacheFallback && rowCompletion && (rowCompletion[row / 8] & (1u << (row % 8)));
    const bool spine = shelf && done && !pageCacheFallback;
    library_shelf::Placement placement{};
    if (!list && !library_shelf::place(cursor, geometry, area.width, GAP, spine, placement)) break;
    const int slot = visibleBookCount++;
    const int floor =
        list ? area.y + slot * rowHeight + 49
             : area.y + (placement.line + 1) * geometry.cellHeight + placement.line * GAP - labelHeight - plankSpace;
    const int x =
        list ? area.x + 8 : area.x + placement.x + (placement.width - (spine ? placement.width : coverWidth)) / 2;
    const int y = floor - coverHeight;
    const int width = spine ? placement.width : coverWidth;
    bookCells[slot] = {static_cast<int16_t>(row),
                       static_cast<int16_t>(x),
                       static_cast<int16_t>(y),
                       static_cast<int16_t>(width),
                       static_cast<int16_t>(coverHeight),
                       static_cast<int16_t>(placement.line),
                       spine,
                       done};
    if (!readBook(row, rowScratch)) continue;
    if (list) renderer.fillRect(area.x, area.y + slot * rowHeight, area.width, rowHeight - 1, false);
    if (spine) {
      renderer.fillRect(x, y, width, coverHeight, false);
      renderer.drawRect(x, y, width, coverHeight);
      renderer.drawLine(x + 3, y + 3, x + 3, floor - 3);
      renderer.drawLine(x + 2, y + 8, x + width - 2, y + 8);
      renderer.drawLine(x + 2, floor - 8, x + width - 2, floor - 8);
      // Rotate a bounded title into the actual spine height; never infer page counts.
      subtitleScratch.assign(rowScratch.title);
      while (!subtitleScratch.empty() &&
             renderer.getTextWidth(SMALL_FONT_ID, subtitleScratch.c_str()) > coverHeight - 24) {
        size_t last = subtitleScratch.size() - 1;
        while (last > 0 && (static_cast<unsigned char>(subtitleScratch[last]) & 0xc0) == 0x80) --last;
        subtitleScratch.resize(last);
      }
      const int textWidth = renderer.getTextWidth(SMALL_FONT_ID, subtitleScratch.c_str());
      renderer.drawTextRotated90CW(SMALL_FONT_ID, x + (width - renderer.getLineHeight(SMALL_FONT_ID)) / 2,
                                   y + (coverHeight + textWidth) / 2, subtitleScratch.c_str(), true);
    } else {
      renderer.fillRect(x, y, width, coverHeight, false);
      if (!drawCachedCover(rowScratch, x, y, width, coverHeight)) {
        renderer.drawRect(x, y, width, coverHeight);
        renderer.drawLine(x + 4, y + 4, x + 4, floor - 4);
        if (!list) drawBookLabel(rowScratch.title.c_str(), SMALL_FONT_ID, x + 8, y + coverHeight / 3, width - 16, true);
      }
      renderer.drawRect(x, y, width, coverHeight);
    }
    if (list) {
      drawBookLabel(rowScratch.title.c_str(), BITTER_10_FONT_ID, x + width + 12, y, area.width - width - 28);
      if (SETTINGS.libraryListExpanded)
        drawBookLabel(rowScratch.author.c_str(), SMALL_FONT_ID, x + width + 12, y + 23, area.width - width - 28);
      formatBookMetadata(row, !SETTINGS.libraryListExpanded);
      drawBookLabel(collectionScratch.c_str(), SMALL_FONT_ID, x + width + 12,
                    y + (SETTINGS.libraryListExpanded ? 45 : 23), area.width - width - 136);
      const int statusY = area.y + slot * rowHeight + rowHeight - 24;
      if (SETTINGS.libraryStatusBadges) {
        char percent[16];
        const auto progress = pageProgress[slot];
        snprintf(percent, sizeof(percent), "%d%%", std::max(0, static_cast<int>(progress)));
        drawBookLabel(done            ? tr(STR_LIBRARY_STATUS_FINISHED)
                      : progress >= 0 ? percent
                                      : tr(STR_LIBRARY_STATUS_NEW),
                      SMALL_FONT_ID, area.right() - 100, statusY, 92);
      }
      renderer.drawLine(area.x, area.y + (slot + 1) * rowHeight - 1, area.right(), area.y + (slot + 1) * rowHeight - 1);
    } else if (!spine) {
      const int labelX = area.x + placement.x;
      renderer.fillRect(labelX, floor + plankSpace, placement.width, labelHeight, false);
      drawBookLabel(rowScratch.title.c_str(), SMALL_FONT_ID, labelX + 2, floor + plankSpace + 1, placement.width - 4,
                    true);
      if (labelHeight > 24) {
        formatBookMetadata(row, false);
        drawBookLabel(collectionScratch.c_str(), SMALL_FONT_ID, labelX + 2, floor + plankSpace + 21,
                      placement.width - 4, true);
      }
      if (SETTINGS.libraryStatusBadges) {
        const int badgeWidth = std::min(width - 4, 62);
        const int8_t progress = pageProgress[slot];
        char percent[16];
        snprintf(percent, sizeof(percent), "%d%%", std::max(0, static_cast<int>(progress)));
        const char* status = done            ? tr(STR_LIBRARY_STATUS_FINISHED)
                             : progress >= 0 ? percent
                                             : tr(STR_LIBRARY_STATUS_NEW);
        renderer.fillRect(x + width - badgeWidth - 2, y + 3, badgeWidth, 21, false);
        renderer.drawRect(x + width - badgeWidth - 2, y + 3, badgeWidth, 21);
        drawBookLabel(status, SMALL_FONT_ID, x + width - badgeWidth, y + 2, badgeWidth - 4, true);
      }
    }
    if (showSelection && row == selectedRow) renderer.drawRect(x - 3, y - 3, width + 6, coverHeight + 6, 2, true);
    const fui::Rect hit =
        list ? fui::Rect{area.x, static_cast<int16_t>(area.y + slot * rowHeight), area.width,
                         static_cast<int16_t>(rowHeight)}
             : fui::Rect{static_cast<int16_t>(x - 3), static_cast<int16_t>(y - 3), static_cast<int16_t>(width + 6),
                         static_cast<int16_t>(coverHeight + labelHeight + plankSpace + 3)};
    screen.frame().hit(hit, ACTION_ROW, static_cast<int16_t>(row), fui::InputTouch | fui::InputLongPress);
  }
  if (!list) {
    for (int line = 0; line < geometry.rows; ++line) {
      const int floor = area.y + (line + 1) * geometry.cellHeight + line * GAP - labelHeight - plankSpace;
      int used = 0;
      for (int i = 0; i < visibleBookCount; ++i)
        if (bookCells[i].line == line) used = std::max<int>(used, bookCells[i].x + bookCells[i].width - area.x + GAP);
      if (SETTINGS.libraryOrnaments) {
        library_shelf::drawOrnament(renderer, SETTINGS.libraryBookshelfTheme, 0, line + bookPageIndex,
                                    area.x + used + 4, floor, area.width - used - 8, geometry.coverHeight);
        if (used == 0)
          library_shelf::drawOrnament(renderer, SETTINGS.libraryBookshelfTheme, 1, line, area.x + 10, floor - 24,
                                      std::min<int>(120, area.width / 3), geometry.coverHeight - 24);
        if (visibleBookCount > 0 && line == 0) {
          const auto& first = bookCells[0];
          library_shelf::drawOrnament(renderer, SETTINGS.libraryBookshelfTheme, 3, bookPageIndex, first.x, first.y - 1,
                                      first.width, std::min(32, first.y - area.y - 2));
        }
      }
    }
  }
  drawBookPager(screen, pageIndicator, bookPageIndex, bookPageCount);
}

void LibraryActivity::loadGridPageCovers() {
  if (!gridEnabled() || gridCoverWidth <= 0 || gridCoverHeight <= 0 || visibleBookCount == 0) return;
  if (nextGridCoverRow < 0 && loadedGridPageStart != gridPageStart) nextGridCoverRow = 0;
  if (nextGridCoverRow >= 0 && nextGridCoverRow < visibleBookCount) {
    const auto& cell = bookCells[nextGridCoverRow++];
    if (!cell.spine && readBook(cell.row, rowScratch))
      gridCoversChanged = prepareCover(rowScratch, gridCoverWidth, gridCoverHeight) || gridCoversChanged;
    if (nextGridCoverRow == visibleBookCount) {
      loadedGridPageStart = gridPageStart;
      nextGridCoverRow = -1;
      if (gridCoversChanged) {
        if (SETTINGS.libraryStatusBadges)
          pageProgressChanged = true;
        else
          requestUpdate();
      }
      gridCoversChanged = false;
    }
    return;
  }
  if (SETTINGS.libraryStatusBadges && nextProgressSlot < visibleBookCount) {
    const int slot = nextProgressSlot++;
    if (!bookCells[slot].completed && readBook(bookCells[slot].row, rowScratch)) {
      // EPUB progress is cache-only: do not parse unopened books for a badge.
      const float percent = FsHelpers::hasEpubExtension(rowScratch.path)
                                ? RecentBookProgress::loadCachedEpubPercent(rowScratch)
                                : RecentBookProgress::loadPercent(rowScratch);
      pageProgress[slot] = percent < 0 ? -1 : static_cast<int8_t>(std::clamp(static_cast<int>(percent), 0, 100));
      pageProgressChanged = pageProgressChanged || percent >= 0;
    }
    if (nextProgressSlot == visibleBookCount && pageProgressChanged) {
      pageProgressChanged = false;
      requestUpdate();
    }
  }
}

int LibraryActivity::gridColumns() const {
  return SETTINGS.libraryBookView == library_shelf::List ? 1 : library_shelf::columns(SETTINGS.libraryGridColumns);
}
int LibraryActivity::gridRows() const {
  if (SETTINGS.libraryBookView == library_shelf::List)
    return std::clamp(pageCacheHeight / (SETTINGS.libraryListExpanded ? 84 : 62), 1, 20);
  return library_shelf::rows(SETTINGS.libraryGridRows);
}
int LibraryActivity::gridPageSize() const { return gridColumns() * gridRows(); }
