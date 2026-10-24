#pragma once

#include <cstdint>

namespace library_shelf {

struct GridPreset {
  uint8_t columns;
  uint8_t rows;
};

inline constexpr GridPreset GRID_PRESETS[] = {{2, 2}, {3, 2}, {2, 3}, {3, 3}, {4, 2}, {2, 4}, {4, 3}, {3, 4}, {4, 4}};
inline constexpr uint8_t GRID_PRESET_COUNT = sizeof(GRID_PRESETS) / sizeof(GRID_PRESETS[0]);

enum View : uint8_t { Shelf, Covers, List, ViewCount };
enum Theme : uint8_t { Cozy, Botanical, Oak, Autumn, Ukiyoe, ThemeCount };
enum Background : uint8_t { Off, Quiet, Illustrated, BackgroundCount };
inline constexpr int MAX_VISIBLE_BOOKS = 32;

constexpr int columns(const uint8_t value) { return value >= 2 && value <= 4 ? value : 3; }
constexpr int rows(const uint8_t value) { return value >= 2 && value <= 4 ? value : 2; }
constexpr int pageSize(const uint8_t cols, const uint8_t lines) { return columns(cols) * rows(lines); }
constexpr int pageStart(const int row, const int size) { return row > 0 ? (row / size) * size : 0; }
constexpr int pageCount(const int count, const int size) { return count > 0 ? 1 + (count - 1) / size : 1; }
constexpr int presetIndex(const uint8_t cols, const uint8_t lines) {
  for (int i = 0; i < GRID_PRESET_COUNT; ++i)
    if (GRID_PRESETS[i].columns == columns(cols) && GRID_PRESETS[i].rows == rows(lines)) return i;
  return 1;
}

struct Geometry {
  int columns;
  int rows;
  int cellWidth;
  int cellHeight;
  int coverWidth;
  int coverHeight;
};

constexpr int atLeastOne(const int value) { return value > 0 ? value : 1; }
constexpr int smaller(const int left, const int right) { return left < right ? left : right; }
constexpr Geometry geometry(const int width, const int height, const uint8_t cols, const uint8_t lines, const int gap,
                            const int inset, const int labelHeight) {
  const int c = columns(cols), r = rows(lines);
  const int cellWidth = atLeastOne((width - (c - 1) * gap) / c);
  const int cellHeight = atLeastOne((height - (r - 1) * gap) / r);
  const int availableWidth = atLeastOne(cellWidth - 2 * inset);
  const int availableHeight = atLeastOne(cellHeight - labelHeight - 2 * inset);
  const int coverHeight = atLeastOne(smaller(availableHeight, availableWidth * 3 / 2));
  const int coverWidth = atLeastOne(smaller(availableWidth, coverHeight * 2 / 3));
  return {c, r, cellWidth, cellHeight, coverWidth, coverHeight};
}

// Greedy shelf packing. Finished books take a narrow spine; every other book
// keeps one full cover slot. The same cursor is used for pagination and drawing.
struct ShelfCursor {
  int x = 0;
  int line = 0;
  int count = 0;
};
struct Placement {
  int x, line, width;
};
constexpr int spineWidth(const Geometry& geometry) {
  return smaller(30, geometry.coverWidth / 4 > 16 ? geometry.coverWidth / 4 : 16);
}
inline bool place(ShelfCursor& cursor, const Geometry& geometry, const int width, const int gap, const bool spine,
                  Placement& out) {
  if (cursor.count >= MAX_VISIBLE_BOOKS) return false;
  const int itemWidth = spine ? spineWidth(geometry) : geometry.cellWidth;
  if (cursor.x > 0 && cursor.x + itemWidth > width) {
    cursor.x = 0;
    ++cursor.line;
  }
  if (cursor.line >= geometry.rows) return false;
  out = {cursor.x, cursor.line, itemWidth};
  cursor.x += itemWidth + gap;
  ++cursor.count;
  return true;
}

}  // namespace library_shelf
