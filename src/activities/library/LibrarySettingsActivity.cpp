#include "LibrarySettingsActivity.h"

#include <I18n.h>

#include <string_view>

#include "LibraryShelfLayout.h"
#include "components/TouchHeaderBackButton.h"
#include "components/UITheme.h"
#include "components/UiAppHelpers.h"

namespace fui = freeink::ui;

namespace {
constexpr fui::ActionId ACTION_ROW = 1;
constexpr int ROW_COUNT = 14;
constexpr uint8_t ROW_ORDER[] = {0, 3, 4, 5, 2, 10, 11, 12, 13, 14, 1, 6, 7, 8, 9};
// Exactly one control is irrelevant in each view. Keep the mapping shared by
// drawing and activation so hiding a row cannot change what its tap controls.
int logicalRow(int row) {
  const int hidden = SETTINGS.libraryBookView == library_shelf::List ? 10 : 1;
  for (const auto logical : ROW_ORDER) {
    if (logical == hidden) continue;
    if (row-- == 0) return logical;
  }
  return -1;
}
constexpr StrId GRID_LABELS[] = {StrId::STR_LIBRARY_GRID_2_2, StrId::STR_LIBRARY_GRID_3_2, StrId::STR_LIBRARY_GRID_2_3,
                                 StrId::STR_LIBRARY_GRID_3_3, StrId::STR_LIBRARY_GRID_4_2, StrId::STR_LIBRARY_GRID_2_4,
                                 StrId::STR_LIBRARY_GRID_4_3, StrId::STR_LIBRARY_GRID_3_4, StrId::STR_LIBRARY_GRID_4_4};
constexpr StrId SHELF_LABELS[] = {StrId::STR_LIBRARY_SHELF_COZY, StrId::STR_LIBRARY_SHELF_AUTUMN};
constexpr StrId VIEW_LABELS[] = {StrId::STR_LIBRARY_VIEW_SHELF, StrId::STR_LIBRARY_VIEW_COVERS, StrId::STR_LIST_VIEW};
constexpr StrId BACKGROUND_LABELS[] = {StrId::STR_OFF, StrId::STR_LIBRARY_BACKGROUND_QUIET,
                                       StrId::STR_LIBRARY_BACKGROUND_ILLUSTRATED};
}  // namespace

LibrarySettingsActivity::LibrarySettingsActivity(GfxRenderer& renderer, MappedInputManager& mappedInput)
    : Activity("Library Settings", renderer, mappedInput),
      uiTarget(makeUiTarget(renderer)),
      app(uiTarget, uiTarget.deviceContext()) {}

void LibrarySettingsActivity::onEnter() {
  Activity::onEnter();
  showSelection = !mappedInput.hasTouchHardware();
  applySharedUiTheme(app, uiTarget);
  app.on(ACTION_ROW, &LibrarySettingsActivity::onRow, this);
  app.setScreen(&LibrarySettingsActivity::screen, this);
  ignoreConfirmRelease = mappedInput.isPressed(MappedInputManager::Button::Confirm);
  requestUpdate();
}

void LibrarySettingsActivity::toggle(const int row) {
  if (row < 0 || row >= ROW_COUNT) return;
  switch (logicalRow(row)) {
    case 0:
      SETTINGS.libraryUseMetadata = !SETTINGS.libraryUseMetadata;
      break;
    case 1:
      SETTINGS.libraryListExpanded = !SETTINGS.libraryListExpanded;
      break;
    case 2:
      chooseBookView();
      return;
    case 3:
      SETTINGS.libraryHideFinishedBooks = !SETTINGS.libraryHideFinishedBooks;
      break;
    case 4:
      SETTINGS.libraryShowSeries = !SETTINGS.libraryShowSeries;
      break;
    case 5:
      SETTINGS.libraryShowGenre = !SETTINGS.libraryShowGenre;
      break;
    case 6:
      SETTINGS.libraryShowEpub = !SETTINGS.libraryShowEpub;
      break;
    case 7:
      SETTINGS.libraryShowXtc = !SETTINGS.libraryShowXtc;
      break;
    case 8:
      SETTINGS.libraryShowTxt = !SETTINGS.libraryShowTxt;
      break;
    case 9:
      SETTINGS.libraryShowMarkdown = !SETTINGS.libraryShowMarkdown;
      break;
    case 10:
      chooseGridSize();
      return;
    case 11:
      chooseShelfTheme();
      return;
    case 12:
      chooseBackground();
      return;
    case 13:
      SETTINGS.libraryOrnaments = !SETTINGS.libraryOrnaments;
      break;
    case 14:
      SETTINGS.libraryStatusBadges = !SETTINGS.libraryStatusBadges;
      break;
    default:
      return;
  }
  if (!SETTINGS.saveToFile()) LOG_ERR("LIB", "Cannot save Library settings");
  requestUpdate();
}

void LibrarySettingsActivity::chooseBookView() {
  choicePopup.show(StrId::STR_LIBRARY_BOOK_VIEW, VIEW_LABELS, library_shelf::ViewCount, SETTINGS.libraryBookView,
                   [this](const int selected) {
                     if (selected < 0 || selected >= library_shelf::ViewCount) return;
                     SETTINGS.libraryBookView = static_cast<uint8_t>(selected);
                     if (!SETTINGS.saveToFile()) LOG_ERR("LIB", "Cannot save Library view");
                     uiReady = false;
                     requestUpdate();
                   });
  requestUpdate();
}

void LibrarySettingsActivity::chooseBackground() {
  choicePopup.show(StrId::STR_LIBRARY_BACKGROUND, BACKGROUND_LABELS, library_shelf::BackgroundCount,
                   SETTINGS.libraryBackground, [this](const int selected) {
                     if (selected < 0 || selected >= library_shelf::BackgroundCount) return;
                     SETTINGS.libraryBackground = static_cast<uint8_t>(selected);
                     if (!SETTINGS.saveToFile()) LOG_ERR("LIB", "Cannot save Library background");
                     requestUpdate();
                   });
  requestUpdate();
}

void LibrarySettingsActivity::chooseGridSize() {
  gridSelection = library_shelf::presetIndex(SETTINGS.libraryGridColumns, SETTINGS.libraryGridRows);
  gridChooser = true;
  uiReady = false;
  requestUpdate();
}

void LibrarySettingsActivity::chooseShelfTheme() {
  choicePopup.show(StrId::STR_LIBRARY_SHELF_THEME, SHELF_LABELS, library_shelf::ThemeCount,
                   library_shelf::themeIndex(SETTINGS.libraryBookshelfTheme), [this](const int selected) {
                     if (selected < 0 || selected >= library_shelf::ThemeCount) return;
                     const uint8_t theme = library_shelf::THEME_IDS[selected];
                     if (SETTINGS.libraryBookshelfTheme != theme) {
                       SETTINGS.libraryBookshelfTheme = theme;
                       if (!SETTINGS.saveToFile()) LOG_ERR("LIB", "Cannot save Library shelf theme");
                     }
                     requestUpdate();
                   });
  requestUpdate();
}

void LibrarySettingsActivity::onRow(const fui::ActionEvent& event, void* user) {
  auto* self = static_cast<LibrarySettingsActivity*>(user);
  if (self->gridChooser && event.value >= 100 && event.value < 100 + library_shelf::GRID_PRESET_COUNT) {
    self->applyGridPreset(event.value - 100);
    return;
  }
  if (event.value < 0 || event.value >= ROW_COUNT) return;
  self->selection = event.value;
  self->showSelection = false;
  self->topIndex = self->listNav.top;
  self->app.clearTapFlash();
  self->toggle(event.value);
}

void LibrarySettingsActivity::loop() {
  RenderLock lock;
  if (choicePopup.handleInput(mappedInput, [this] { requestUpdate(); })) return;
  if (TouchHeaderBackButton::wasTapped(mappedInput, renderer) ||
      mappedInput.wasPressed(MappedInputManager::Button::Back)) {
    if (gridChooser) {
      gridChooser = false;
      mappedInput.suppressNextBackRelease();
      requestUpdate();
    } else {
      finishAfterBackPress();
    }
    return;
  }
  if (ignoreConfirmRelease) {
    // Consume the menu selection's release even when this screen ignores it.
    // Otherwise its one-shot suppression can swallow the next quick Select.
    (void)mappedInput.wasReleased(MappedInputManager::Button::Confirm);
    if (!mappedInput.isPressed(MappedInputManager::Button::Confirm)) ignoreConfirmRelease = false;
    return;
  }
  if (uiReady) {
    const auto snap = touchSnapshotFrom(mappedInput);
    if (snap.touchPressed || snap.touchReleased) {
      const auto event = app.route(snap);
      if (app.invalidated()) requestUpdate();
      if (event) return;
    }
  }
  if (mappedInput.wasReleased(MappedInputManager::Button::Confirm)) {
    if (gridChooser)
      applyGridPreset(gridSelection);
    else
      toggle(selection);
    return;
  }
  if (gridChooser) {
    buttonNavigator.onNextRelease([&] {
      gridSelection = ButtonNavigator::nextIndex(gridSelection, library_shelf::GRID_PRESET_COUNT);
      requestUpdate();
    });
    buttonNavigator.onPreviousRelease([&] {
      gridSelection = ButtonNavigator::previousIndex(gridSelection, library_shelf::GRID_PRESET_COUNT);
      requestUpdate();
    });
    return;
  }
  const auto swipe = mappedInput.wasSwipe();
  if (swipe == MappedInputManager::SwipeDir::Up || swipe == MappedInputManager::SwipeDir::Down) {
    showSelection = false;
    listNav.top = topIndex;
    listNav.scrollBy(
        swipe == MappedInputManager::SwipeDir::Up ? listNav.pageRowsFor(ROW_COUNT) : -listNav.pageRowsFor(ROW_COUNT),
        ROW_COUNT);
    topIndex = listNav.top;
    requestUpdate();
    return;
  }
  const auto move = [this](int next) {
    if (!showSelection) {
      showSelection = true;
      listNav.selected = selection;
      listNav.top = topIndex;
      listNav.follow(ROW_COUNT);
      topIndex = listNav.top;
      requestUpdate();
      return;
    }
    selection = next;
    listNav.selected = selection;
    listNav.top = topIndex;
    listNav.follow(ROW_COUNT);
    topIndex = listNav.top;
    requestUpdate();
  };
  buttonNavigator.onNextRelease([&] { move(ButtonNavigator::nextIndex(selection, ROW_COUNT)); });
  buttonNavigator.onPreviousRelease([&] { move(ButtonNavigator::previousIndex(selection, ROW_COUNT)); });
}

void LibrarySettingsActivity::screen(UiApp::ScreenType& screen, void* user) {
  static_cast<LibrarySettingsActivity*>(user)->buildScreen(screen);
}

void LibrarySettingsActivity::provideRow(void*, const uint16_t row, fui::ListItem& item) {
  static constexpr StrId labels[] = {
      StrId::STR_LIBRARY_USE_METADATA,   StrId::STR_LIBRARY_LIST_DENSITY,     StrId::STR_LIBRARY_BOOK_VIEW,
      StrId::STR_LIBRARY_FINISHED_BOOKS, StrId::STR_LIBRARY_SHOW_SERIES_TAGS, StrId::STR_LIBRARY_SHOW_GENRE_TAGS,
      StrId::STR_LIBRARY_EPUBS,          StrId::STR_LIBRARY_XTC_XTCH,         StrId::STR_LIBRARY_TXT,
      StrId::STR_LIBRARY_MARKDOWN,       StrId::STR_LIBRARY_GRID_SIZE,        StrId::STR_LIBRARY_SHELF_THEME,
      StrId::STR_LIBRARY_BACKGROUND,     StrId::STR_LIBRARY_ORNAMENTS,        StrId::STR_LIBRARY_STATUS_BADGES};
  const int logical = logicalRow(row);
  if (logical < 0) return;
  item.label = I18N.get(labels[logical]);
  item.actionValue = static_cast<int16_t>(row);
  if (logical == 1) {
    item.value = SETTINGS.libraryListExpanded ? tr(STR_LIBRARY_EXPANDED) : tr(STR_COMPACT);
    return;
  }
  if (logical == 2) {
    item.sectionHeading = tr(STR_CAT_DISPLAY);
    item.value =
        I18N.get(VIEW_LABELS[SETTINGS.libraryBookView < library_shelf::ViewCount ? SETTINGS.libraryBookView : 0]);
    return;
  }
  if (logical == 10) {
    item.value =
        I18N.get(GRID_LABELS[library_shelf::presetIndex(SETTINGS.libraryGridColumns, SETTINGS.libraryGridRows)]);
    return;
  }
  if (logical == 11) {
    item.value = I18N.get(SHELF_LABELS[library_shelf::themeIndex(SETTINGS.libraryBookshelfTheme)]);
    return;
  }
  if (logical == 12) {
    item.value = I18N.get(
        BACKGROUND_LABELS[SETTINGS.libraryBackground < library_shelf::BackgroundCount ? SETTINGS.libraryBackground
                                                                                      : library_shelf::Illustrated]);
    return;
  }
  item.toggle = true;
  switch (logical) {
    case 0:
      item.sectionHeading = tr(STR_SETTINGS_SHORT);
      item.toggleChecked = SETTINGS.libraryUseMetadata;
      break;
    case 3:
      item.toggleChecked = !SETTINGS.libraryHideFinishedBooks;
      break;
    case 4:
      item.toggleChecked = SETTINGS.libraryShowSeries;
      break;
    case 5:
      item.toggleChecked = SETTINGS.libraryShowGenre;
      break;
    case 6:
      item.sectionHeading = tr(STR_LIBRARY_SHOW_FILES);
      item.toggleChecked = SETTINGS.libraryShowEpub;
      break;
    case 7:
      item.toggleChecked = SETTINGS.libraryShowXtc;
      break;
    case 8:
      item.toggleChecked = SETTINGS.libraryShowTxt;
      break;
    case 9:
      item.toggleChecked = SETTINGS.libraryShowMarkdown;
      break;
    case 13:
      item.toggleChecked = SETTINGS.libraryOrnaments;
      break;
    case 14:
      item.toggleChecked = SETTINGS.libraryStatusBadges;
      break;
  }
}

#ifdef SIMULATOR
bool LibrarySettingsActivity::simulatorHasSetting(const StrId key) const {
  for (int row = 0; row < ROW_COUNT; ++row) {
    fui::ListItem item{};
    provideRow(nullptr, row, item);
    if (item.label && std::string_view(item.label) == I18N.get(key)) return true;
  }
  return false;
}
#endif

void LibrarySettingsActivity::buildScreen(UiApp::ScreenType& screen) {
  const auto& metrics = UITheme::getInstance().getMetrics();
  int bounds[4]{};
  renderer.getOrientedViewableTRBL(&bounds[0], &bounds[1], &bounds[2], &bounds[3]);
  const int16_t headerBottom =
      static_cast<int16_t>(metrics.topPadding + TouchHeaderBackButton::height(metrics, mappedInput));
  screen.setContentMarginFromScreen(
      fui::Insets{headerBottom, static_cast<int16_t>(bounds[1]),
                  static_cast<int16_t>((mappedInput.hasTouchHardware() ? 0 : metrics.buttonHintsHeight) + bounds[2]),
                  static_cast<int16_t>(bounds[3])});
  if (gridChooser) {
    drawGridChooser(screen);
    return;
  }
  fui::ListProps props;
  props.rowProvider = &LibrarySettingsActivity::provideRow;
  props.rowProviderCtx = this;
  props.count = ROW_COUNT;
  props.selectedIndex = showSelection ? selection : -1;
  props.action = ACTION_ROW;
  props.inputMask = fui::InputTouch;
  props.rowHeight = 44;
  props.rowGap = 0;
  props.labelText = props.valueText = props.headerText = screen.theme().bodyText;
  props.headerText.bold = true;
  props.rtl = (I18N.getLanguage() == Language::AR || I18N.getLanguage() == Language::HE);
  props.rowStyles = screen.theme().listRow;
  props.rowStyles.selected.background = fui::Paint::dither(fui::Color::LightGray);
  props.rowStyles.selected.foreground = fui::Paint::solid(fui::Color::Black);
  props.rowStyles.active = props.rowStyles.selected;
  listNav.selected = showSelection ? selection : -1;
  listNav.top = topIndex;
  listNav.syncToProps(screen.body(), props.rowHeight, props.rowGap, ROW_COUNT, props);
  topIndex = listNav.top;
  screen.list(props);
}

void LibrarySettingsActivity::render(RenderLock&&) {
  uiReady = false;
  for (int pass = 0; pass < 8; ++pass) {
    renderer.clearScreen();
    const auto header = TouchHeaderBackButton::headerRect(renderer, mappedInput);
    const char* heading = gridChooser ? tr(STR_LIBRARY_GRID_SIZE) : tr(STR_LIBRARY_SETTINGS);
    if (mappedInput.hasTouchHardware())
      TouchHeaderBackButton::draw(renderer, uiTarget, header, heading, false);
    else
      GUI.drawHeader(renderer, header, heading);
    app.render();
    topIndex = listNav.top;
    if (!listNav.consumeRebuildNeeded()) break;
  }
  uiReady = true;
  if (choicePopup.processRender(renderer, mappedInput)) return;
  const auto labels =
      mappedInput.mapLabels(mappedInput.withBackArrow(tr(STR_BACK)), tr(STR_SELECT), tr(STR_DIR_UP), tr(STR_DIR_DOWN));
  if (!mappedInput.hasTouchHardware())
    GUI.drawButtonHints(renderer, labels.btn1, labels.btn2, labels.btn3, labels.btn4);
  renderer.displayBuffer();
}
