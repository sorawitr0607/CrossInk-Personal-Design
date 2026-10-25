#include <I18n.h>

#include <algorithm>

#include "LibrarySettingsActivity.h"
#include "LibraryShelfLayout.h"
#include "fontIds.h"

namespace fui = freeink::ui;

void LibrarySettingsActivity::applyGridPreset(const int selected) {
  if (selected < 0 || selected >= library_shelf::GRID_PRESET_COUNT) return;
  const auto preset = library_shelf::GRID_PRESETS[selected];
  if (SETTINGS.libraryGridColumns != preset.columns || SETTINGS.libraryGridRows != preset.rows) {
    SETTINGS.libraryGridColumns = preset.columns;
    SETTINGS.libraryGridRows = preset.rows;
    if (!SETTINGS.saveToFile()) LOG_ERR("LIB", "Cannot save Library grid size");
  }
  gridSelection = selected;
  gridChooser = false;
  uiReady = false;
  app.clearTapFlash();
  requestUpdate();
}

void LibrarySettingsActivity::drawGridChooser(UiApp::ScreenType& screen) {
  static constexpr StrId labels[] = {StrId::STR_LIBRARY_GRID_2_2, StrId::STR_LIBRARY_GRID_3_2,
                                     StrId::STR_LIBRARY_GRID_2_3, StrId::STR_LIBRARY_GRID_3_3,
                                     StrId::STR_LIBRARY_GRID_4_2, StrId::STR_LIBRARY_GRID_2_4,
                                     StrId::STR_LIBRARY_GRID_4_3};
  const auto note = screen.take(fui::LayoutAnchor::Top, 70, 12);
  auto style = screen.theme().smallText;
  style.maxLines = 3;
  uiTarget.text(note.inset(fui::Insets{8, 16, 0, 16}), tr(STR_LIBRARY_GRID_NOTE), style);
  auto area = screen.body();
  area.x += 16;
  area.width -= 32;
  const int gap = 10, width = (area.width - 2 * gap) / 3;
  const int height = std::min(156, (area.height - 2 * gap) / 3);
  for (int i = 0; i < library_shelf::GRID_PRESET_COUNT; ++i) {
    const auto preset = library_shelf::GRID_PRESETS[i];
    const int rowColumns = std::min(3, library_shelf::GRID_PRESET_COUNT - i / 3 * 3);
    const int rowOffset = (area.width - rowColumns * width - (rowColumns - 1) * gap) / 2;
    const fui::Rect tile{static_cast<int16_t>(area.x + rowOffset + i % 3 * (width + gap)),
                         static_cast<int16_t>(area.y + i / 3 * (height + gap)), static_cast<int16_t>(width),
                         static_cast<int16_t>(height)};
    const bool selected = i == gridSelection;
    renderer.fillRect(tile.x, tile.y, tile.width, tile.height, selected);
    renderer.drawRect(tile.x, tile.y, tile.width, tile.height);
    const int box = std::min(25, (height - 56) / 4), spacing = 3;
    const int totalWidth = preset.columns * box + (preset.columns - 1) * spacing;
    const int totalHeight = preset.rows * box + (preset.rows - 1) * spacing;
    const int x = tile.x + (tile.width - totalWidth) / 2, y = tile.y + (height - 34 - totalHeight) / 2;
    for (int row = 0; row < preset.rows; ++row)
      for (int col = 0; col < preset.columns; ++col) {
        const int bx = x + col * (box + spacing), by = y + row * (box + spacing);
        renderer.drawLine(bx, by, bx + box, by, 1, !selected);
        renderer.drawLine(bx, by, bx, by + box, 1, !selected);
        renderer.drawLine(bx + box, by, bx + box, by + box, 1, !selected);
        renderer.drawLine(bx, by + box, bx + box, by + box, 1, !selected);
      }
    const char* label = I18N.get(labels[i]);
    renderer.drawText(SMALL_FONT_ID, tile.x + (tile.width - renderer.getTextWidth(SMALL_FONT_ID, label)) / 2,
                      tile.bottom() - 29, label, !selected);
    screen.frame().hit(tile, 1, static_cast<int16_t>(100 + i), fui::InputTouch);
  }
}
