#include <cstdio>
#include <initializer_list>

#include "../../src/activities/library/LibraryShelfLayout.h"

namespace {
int failures = 0;
void check(const bool condition, const char* message) {
  if (!condition) {
    std::fprintf(stderr, "FAIL: %s\n", message);
    ++failures;
  }
}
}  // namespace

int main() {
  using namespace library_shelf;
  check(pageSize(2, 2) == 4, "2 x 2 shows four books per page");
  check(pageSize(3, 2) == 6, "3 x 2 means columns then rows");
  check(pageSize(2, 3) == 6, "2 x 3 retains six books with a different arrangement");
  check(pageSize(4, 3) == 12, "largest selectable cover grid shows twelve books");
  check(GRID_PRESET_COUNT == 7 && presetIndex(3, 4) == 1 && presetIndex(4, 4) == 1,
        "Removed 3x4 and 4x4 choices fall back to the default preset");
  check(pageSize(255, 0) == 6, "corrupt saved dimensions fall back safely");
  check(pageCount(5, 4) == 2 && pageStart(4, 4) == 4, "fifth book moves to second 2 x 2 page");
  check(pageCount(0, 4) == 1 && pageStart(-1, 4) == 0, "empty libraries do not produce negative pages");
  check(pageCount(32767, 4) == 8192, "maximum library paginates without overflowing");
  check(ThemeCount == 2 && THEME_IDS[0] == Cozy && THEME_IDS[1] == Autumn,
        "Only Cozy Nook and Autumn Harvest remain available");
  check(themeIndex(3) == 1 && themeIndex(1) == 0, "Autumn keeps its saved ID and removed themes use Cozy");
  check(shelfGeometry(432, 550, 3, 2, true).coverWidth > 100, "3x2 Shelf books grow from the library.2 baseline");
  check(shelfGeometry(432, 550, 2, 2, true).coverWidth < 148, "2x2 Shelf books shrink from the library.2 baseline");
  check(geometry(446, 550, 2, 2, 8, 6, 30).coverHeight < 229,
        "2x2 Covers books also shrink from the library.2 baseline");
  for (int i = 0; i < GRID_PRESET_COUNT; ++i) {
    const auto preset = GRID_PRESETS[i];
    check(presetIndex(preset.columns, preset.rows) == i, "grid chooser preserves saved preset");
    const auto layout = geometry(446, 550, preset.columns, preset.rows, 8, 6, 30);
    check(layout.columns == preset.columns && layout.rows == preset.rows, "geometry uses separate row/column counts");
    check(layout.coverWidth > 0 && layout.coverHeight > 0, "every supported grid has a drawable cover");
    check(layout.coverWidth + 12 <= layout.cellWidth, "covers retain horizontal selection clearance");
    check(layout.coverHeight + 42 <= layout.cellHeight, "covers leave space for labels and selection");
    check(layout.columns * layout.cellWidth + (layout.columns - 1) * 8 <= 446, "columns fit the viewable width");
    check(layout.rows * layout.cellHeight + (layout.rows - 1) * 8 <= 550, "rows fit the viewable height");
  }
  const auto wide = geometry(446, 550, 3, 2, 8, 6, 30);
  const auto tall = geometry(446, 550, 2, 3, 8, 6, 30);
  check(wide.cellWidth < tall.cellWidth && wide.cellHeight > tall.cellHeight,
        "3 x 2 and 2 x 3 are visibly different layouts");
  // Reproduce full-library paging with mixed statuses; every source row must
  // appear exactly once, within bounds, with no page exceeding the hit budget.
  for (const auto preset : GRID_PRESETS) {
    for (const int height : {360, 440, 550, 640}) {
      const auto layout = geometry(432, height, preset.columns, preset.rows, 8, 7, 74);
      for (int pattern = 0; pattern < 5; ++pattern) {
        ShelfCursor cursor{};
        int pages = 1, seen = 0, previousRight = 0, previousLine = -1;
        for (int book = 0; book < 32767; ++book) {
          const bool done = pattern == 0 ? false : pattern == 1 ? true : book % (pattern + 1) != 0;
          Placement placement{};
          if (!place(cursor, layout, 432, 8, done, placement)) {
            check(cursor.count > 0, "a page always makes forward progress");
            ++pages;
            cursor = {};
            previousRight = 0;
            previousLine = -1;
            check(place(cursor, layout, 432, 8, done, placement), "a fresh page accepts the pending book");
          }
          check(placement.x >= 0 && placement.x + placement.width <= 432, "packed books fit horizontally");
          check(placement.line >= 0 && placement.line < layout.rows, "packed books fit the chosen shelf rows");
          check(cursor.count <= MAX_VISIBLE_BOOKS, "dense spines respect the touch-region bound");
          if (placement.line == previousLine) check(placement.x >= previousRight + 8, "neighbours do not overlap");
          previousLine = placement.line;
          previousRight = placement.x + placement.width;
          ++seen;
        }
        check(seen == 32767, "pagination keeps every book");
        check(pages <= pageCount(32767, preset.columns * preset.rows), "page-start allocation bound holds");
        if (pattern == 0)
          check(pages == pageCount(32767, preset.columns * preset.rows), "Covers preserves the exact grid page count");
      }
    }
  }
  for (const auto preset : GRID_PRESETS) {
    for (const bool ornaments : {false, true}) {
      const auto layout = shelfGeometry(432, 550, preset.columns, preset.rows, ornaments);
      for (int pattern = 0; pattern < 4; ++pattern) {
        ShelfCursor cursor{};
        int pages = 1, previousRight = 0, previousLine = -1, faces = 0;
        bool previousSpine = false;
        for (int book = 0; book < 32767; ++book) {
          const bool spine = pattern == 0 ? false : pattern == 1 ? true : book % pattern == 0;
          Placement placement{};
          if (!place(cursor, layout, 432, 8, spine, placement, book)) {
            check(cursor.count > 0, "natural shelf page makes progress");
            cursor = {};
            previousLine = -1;
            ++pages;
            check(place(cursor, layout, 432, 8, spine, placement, book), "fresh natural page accepts a book");
          }
          if (placement.line != previousLine) {
            faces = 0;
          } else {
            check(placement.x >= previousRight + (spine && previousSpine ? 1 : 8),
                  "spines group closely and covers have breathing room");
          }
          if (!spine) ++faces;
          check(faces <= preset.columns, "chosen columns cap face-out covers on each shelf");
          check(placement.x >= layout.endInset && placement.x + placement.width <= 432 - layout.endInset,
                "natural books leave clearance at both plank ends");
          check(placement.x + placement.width <= 432 - layout.ornamentWidth - layout.endInset,
                "keepsakes retain their own shelf space");
          check(placement.height > 0 && placement.height <= layout.coverHeight, "varied spines fit shelf height");
          check(cursor.count <= MAX_VISIBLE_BOOKS && placement.line < preset.rows, "natural shelf hit budget");
          if (!spine) check(placement.width == layout.coverWidth, "Shelf packs cover widths rather than grid cells");
          previousRight = placement.x + placement.width;
          previousLine = placement.line;
          previousSpine = spine;
        }
        check(pages <= pageCount(32767, preset.columns * preset.rows), "natural page cache stays within its bound");
        if (pattern == 0)
          check(pages == pageCount(32767, preset.columns * preset.rows), "all-cover Shelf honors the chosen grid");
      }
    }
  }
  if (failures == 0) std::puts("Library shelf layout checks passed");
  return failures ? 1 : 0;
}
