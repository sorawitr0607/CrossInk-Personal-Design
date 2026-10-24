#pragma once

#include <FreeInkApp.h>
#include <FreeInkUIGfxRenderer.h>

#include "activities/Activity.h"
#include "components/OptionPopup.h"
#include "util/ButtonNavigator.h"

class LibrarySettingsActivity final : public Activity {
 public:
  LibrarySettingsActivity(GfxRenderer& renderer, MappedInputManager& mappedInput);
  void onEnter() override;
  void loop() override;
  void render(RenderLock&&) override;
  bool blocksGlobalInput() const override { return choicePopup.isActive(); }
#ifdef SIMULATOR
  void simulatorOpenGrid() { chooseGridSize(); }
  void simulatorShowFiles() { topIndex = 11; }
  void simulatorApplyGrid(int preset) { applyGridPreset(preset); }
#endif

 private:
  using UiApp = freeink::ui::FreeInkApp<16, 2>;
  freeink::ui::GfxRendererTarget uiTarget;
  UiApp app;
  ButtonNavigator buttonNavigator;
  OptionPopup choicePopup;
  freeink::ui::ListNav listNav;
  int selection = 0;
  int topIndex = 0;
  bool showSelection = true;
  bool uiReady = false;
  bool ignoreConfirmRelease = false;
  bool gridChooser = false;
  int gridSelection = 1;

  static void screen(UiApp::ScreenType& screen, void* user);
  static void onRow(const freeink::ui::ActionEvent& event, void* user);
  static void provideRow(void* user, uint16_t row, freeink::ui::ListItem& item);
  void buildScreen(UiApp::ScreenType& screen);
  void toggle(int row);
  void chooseGridSize();
  void chooseShelfTheme();
  void chooseBookView();
  void chooseBackground();
  void applyGridPreset(int selected);
  void drawGridChooser(UiApp::ScreenType& screen);
};
