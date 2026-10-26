#pragma once

#include <cstdint>

namespace library_shelf {

struct GridPreset {
  uint8_t columns;
  uint8_t rows;
};

inline constexpr GridPreset GRID_PRESETS[] = {{2, 2}, {3, 2}, {2, 3}, {3, 3}, {4, 2}, {2, 4}, {4, 3}};
inline constexpr uint8_t GRID_PRESET_COUNT = sizeof(GRID_PRESETS) / sizeof(GRID_PRESETS[0]);

enum View : uint8_t { Shelf, Covers, List, ViewCount };
// Preserve the original SD settings IDs; Autumn was 3 in library.1.
enum Theme : uint8_t { Cozy = 0, Autumn = 3 };
inline constexpr Theme THEME_IDS[] = {Cozy, Autumn};
inline constexpr uint8_t ThemeCount = sizeof(THEME_IDS) / sizeof(THEME_IDS[0]);
constexpr int themeIndex(const uint8_t theme) { return theme == Autumn ? 1 : 0; }
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
  bool natural = false;
  int ornamentWidth = 0;
  int endInset = 0;
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
  const int baseHeight = atLeastOne(smaller(availableHeight, availableWidth * 3 / 2));
  const int coverHeight = c == 2 && r == 2 ? atLeastOne(baseHeight * 92 / 100) : baseHeight;
  const int coverWidth = atLeastOne(smaller(availableWidth, coverHeight * 2 / 3));
  return {c, r, cellWidth, cellHeight, coverWidth, coverHeight};
}

constexpr Geometry shelfGeometry(const int width, const int height, const uint8_t cols, const uint8_t lines,
                                 const bool ornaments) {
  const int c = columns(cols), r = rows(lines);
  const int cellHeight = atLeastOne((height - (r - 1) * 8) / r);
  constexpr int endInset = 12;
  const int reserve = ornaments ? smaller(c == 3 && r == 2 ? 56 : r >= 3 ? 64 : 96, width / 4) : 0;
  const int availableWidth = atLeastOne((width - 2 * endInset - reserve - (c - 1) * 9 - 16) / c);
  const int baseWidth = atLeastOne(smaller(availableWidth, atLeastOne(cellHeight - (r >= 3 ? 32 : 48)) * 2 / 3));
  const int coverWidth = c == 2 && r == 2 ? atLeastOne(baseWidth * 92 / 100) : baseWidth;
  return {c, r, atLeastOne(width / c), cellHeight, coverWidth, coverWidth * 3 / 2, true, reserve, endInset};
}

// Greedy shelf packing. Finished books take a narrow spine; every other book
// keeps one full cover slot. The same cursor is used for pagination and drawing.
struct ShelfCursor {
  int x = 0;
  int line = 0;
  int count = 0;
  int lineCount = 0;
  int faces = 0;
  bool previousSpine = false;
};
struct Placement {
  int x, line, width, height;
};
constexpr int spineWidth(const Geometry& geometry) {
  return smaller(30, geometry.coverWidth / 4 > 16 ? geometry.coverWidth / 4 : 16);
}
inline bool place(ShelfCursor& cursor, const Geometry& geometry, const int width, const int gap, const bool spine,
                  Placement& out, const uint32_t seed = 0) {
  if (cursor.count >= MAX_VISIBLE_BOOKS) return false;
  // Decorative binding variation, not an estimate of the book's page count.
  const int binding = smaller(34, (geometry.coverHeight / 8 + 4) + static_cast<int>(seed % 7));
  const int itemWidth =
      spine ? (geometry.natural ? smaller(geometry.coverWidth, binding < 22 ? 22 : binding) : spineWidth(geometry))
      : geometry.natural ? geometry.coverWidth
                         : geometry.cellWidth;
  int spacing = cursor.x == 0 ? 0 : geometry.natural && spine && cursor.previousSpine ? 1 : gap;
  if (cursor.x > 0 && (cursor.x + spacing + itemWidth > width - geometry.ornamentWidth - 2 * geometry.endInset ||
                       cursor.lineCount >= MAX_VISIBLE_BOOKS / geometry.rows ||
                       (geometry.natural && !spine && cursor.faces >= geometry.columns))) {
    cursor.x = 0;
    cursor.lineCount = 0;
    cursor.faces = 0;
    spacing = 0;
    ++cursor.line;
  }
  if (cursor.line >= geometry.rows) return false;
  const int itemHeight = geometry.natural && spine ? geometry.coverHeight * (84 + static_cast<int>(seed % 15)) / 100
                                                   : geometry.coverHeight;
  out = {cursor.x + spacing + geometry.endInset, cursor.line, itemWidth, itemHeight};
  cursor.x += spacing + itemWidth;
  ++cursor.count;
  ++cursor.lineCount;
  if (!spine) ++cursor.faces;
  cursor.previousSpine = spine;
  return true;
}

// Decorative offsets are applied after packing, so page boundaries and book
// order never depend on the ornaments. Four plans use 112 bytes on the stack.
struct ShelfArrangement {
  int usedWidth = 0, count = 0;
  int offset = 0, spacing = 0, split = 0, ornamentX = 0, ornamentWidth = 0;
};
constexpr uint32_t shelfSeed(const uint32_t collection, const unsigned page, const int rowCount, const int line) {
  return collection + page * static_cast<unsigned>(rowCount) + static_cast<unsigned>(line);
}
inline void arrangeShelf(ShelfArrangement& plan, const Geometry& geometry, const int width, uint32_t seed) {
  const int position = static_cast<int>(seed % 3);
  // Mix only the arrangement; the unmixed shelf sequence cycles through all
  // fitting ornaments instead of repeating at the next page's first row.
  seed ^= seed >> 16;
  seed *= 0x7feb352du;
  seed ^= seed >> 15;
  const int reserve = geometry.ornamentWidth;
  int slack = width - 2 * geometry.endInset - plan.usedWidth - reserve;
  if (slack < 0) slack = 0;
  plan.spacing = plan.count > 1 ? smaller(static_cast<int>((seed >> 12) % 3), slack / (plan.count - 1)) : 0;
  slack -= plan.spacing * (plan.count > 0 ? plan.count - 1 : 0);
  plan.offset = slack * (1 + static_cast<int>((seed >> 8) % 3)) / 4;
  plan.split = reserve == 0 || position == 1     ? plan.count
               : position == 0 || plan.count < 2 ? 0
                                                 : 1 + static_cast<int>((seed >> 4) % (plan.count - 1));
  plan.ornamentWidth = reserve;
  plan.ornamentX =
      geometry.endInset + plan.offset + plan.usedWidth + plan.spacing * (plan.count > 0 ? plan.count - 1 : 0);
}
inline int arrangedBookX(ShelfArrangement& plan, const Placement& placement, const int position) {
  const int x = placement.x + plan.offset + plan.spacing * position;
  if (position == plan.split) plan.ornamentX = x;
  return x + (position >= plan.split ? plan.ornamentWidth : 0);
}

}  // namespace library_shelf
