// Native simulator verification only. No code or fixture writes in firmware.
#ifdef SIMULATOR
#include <ArduinoJson.h>
#include <Epub.h>
#include <FsHelpers.h>
#include <HalStorage.h>
#include <Memory.h>

#include <cstdio>
#include <cstdlib>
#include <filesystem>

#include "LibraryActivity.h"
#include "LibraryFonts.h"
#include "LibrarySettingsActivity.h"
#include "activities/home/RecentBookProgress.h"
#include "activities/reader/BookReadingStats.h"

void LibraryActivity::runSimulatorLibraryReview() {
  const char* output = std::getenv("CROSSINK_LIBRARY_REVIEW");
  if (!output) return;
  // Hold the mutex for this synchronous, simulator-only run. Background render
  // notifications may queue, but cannot race fixture changes or captures.
  RenderLock reviewLock;
  unsigned checks = 0, captures = 0;
  const auto check = [&](const bool passed, const char* reason) {
    ++checks;
    if (passed) return;
    std::fprintf(stderr, "LIBRARY REVIEW FAIL: %s\n", reason);
    std::fflush(stderr);
    std::_Exit(2);
  };
  std::filesystem::create_directories(output);
  const auto recentCountBefore = RECENT_BOOKS.getCount();
  check(renderer.getTextWidth(library_shelf::FONT_BODY, "All Books") > 0 &&
            renderer.getTextWidth(library_shelf::FONT_HEADING, "Your little library") > 0,
        "Library serif bitmap fonts registered");
  check(index.bookCount() >= 20, "Missing generated LibraryReview fixtures");
  // These are generated books in a temporary simulator card, never the user's
  // SD card. Refuse the review before writing a single fixture statistic.
  for (int i = 0; i < index.bookCount(); ++i)
    check(readIndexedBook(i, rowScratch) &&
              (rowScratch.path.rfind("/LibraryReview/", 0) == 0 || rowScratch.path == "/My Clippings.txt"),
          "Review must run with an isolated generated card");
  uint16_t progressOnlyOrdinal = UINT16_MAX;
  for (int i = 0; i < index.bookCount(); ++i) {
    check(readIndexedBook(i, rowScratch), "Cannot read fixture");
    if (!FsHelpers::hasEpubExtension(rowScratch.path)) continue;
    const auto cache = Epub::resolveCachePathForFilePath(rowScratch.path, "/.crosspoint");
    if (!Storage.exists(cache.c_str())) Storage.mkdir(cache.c_str());
    BookReadingStats stats;
    stats.isCompleted = i % 3 == 0;
    check(stats.save(cache), "Cannot save fixture finished state");
    if (!stats.isCompleted && progressOnlyOrdinal == UINT16_MAX) {
      progressOnlyOrdinal = static_cast<uint16_t>(i);
      RecentBookProgress::saveCachedEpubPercent(cache, 100.0f);
    } else if (i % 3 == 1) {
      RecentBookProgress::saveCachedEpubPercent(cache, 42.6f);
    }
  }
  invalidateCompletion();
  unsigned regressionFailures = 0;
  const auto regression = [&](const bool passed, const char* reason) {
    ++checks;
    if (passed) return;
    ++regressionFailures;
    std::fprintf(stderr, "LIBRARY REGRESSION FAIL: %s\n", reason);
  };
  regression(progressOnlyOrdinal != UINT16_MAX && completedOrdinal(progressOnlyOrdinal),
             "100-percent progress counts as finished without a manual Finished flag");
  enterCollections(CollectionKind::Authors);
  regression(!collectionsFailed && collectionCount >= 3, "One missing author must not erase the Authors tab");
  enterCollection(-1);
  bool clippingVisible = false, txtBookVisible = false;
  for (int row = 0; row < rowCount(); ++row) {
    check(readBook(row, rowScratch, true), "Cannot read regression book");
    clippingVisible = clippingVisible || rowScratch.path == "/My Clippings.txt";
    txtBookVisible = txtBookVisible || rowScratch.path == "/LibraryReview/Fables/Notes.txt";
  }
  regression(!clippingVisible && txtBookVisible, "Hide the clipping export while retaining legitimate TXT books");
  check(regressionFailures == 0, "Library device regression scenarios");
  const auto paint = [&] { render(std::move(reviewLock)); };
  const auto settle = [&] {
    paint();
    for (int i = 0; i < 72; ++i) {
      if (collectionsVisible)
        loadCollectionPageCovers();
      else
        loadGridPageCovers();
    }
    paint();
  };
  const auto saveImage = [&](const char* name) {
    const auto path = std::filesystem::path(output) / (std::string(name) + ".pgm");
    FILE* image = std::fopen(path.c_str(), "wb");
    check(image != nullptr, "Cannot create capture");
    std::fprintf(image, "P5\n%d %d\n255\n", renderer.getScreenWidth(), renderer.getScreenHeight());
    for (int y = 0; y < renderer.getScreenHeight(); ++y)
      for (int x = 0; x < renderer.getScreenWidth(); ++x) std::fputc(renderer.isPixelBlack(x, y) ? 0 : 255, image);
    std::fclose(image);
    ++captures;
  };
  const auto capture = [&](const char* name) {
    settle();
    saveImage(name);
  };
  char name[80];
  for (uint8_t theme = 0; theme < library_shelf::ThemeCount; ++theme) {
    SETTINGS.libraryBookshelfTheme = theme;
    SETTINGS.libraryBackground = library_shelf::Illustrated;
    SETTINGS.libraryOrnaments = true;
    SETTINGS.libraryStatusBadges = true;
    SETTINGS.libraryGridColumns = 3;
    SETTINGS.libraryGridRows = 2;
    enterCollections(CollectionKind::Series);
    check(collectionCount >= 3 && allCompleted > 0, "Metadata groups and real finished counts");
    snprintf(name, sizeof(name), "theme-%u-collections", theme);
    capture(name);
    for (uint8_t view = 0; view < library_shelf::ViewCount; ++view) {
      SETTINGS.libraryGridColumns = 3;
      SETTINGS.libraryGridRows = 2;
      SETTINGS.libraryBookView = view;
      enterCollection(-1);
      check(sort == Sort::Series && !descending, "Collections start with Series ascending");
      snprintf(name, sizeof(name), "theme-%u-view-%u", theme, view);
      capture(name);
      check(visibleBookCount > 0 && visibleBookCount <= library_shelf::MAX_VISIBLE_BOOKS, "Visible hit budget");
      if (theme == 0 && view == library_shelf::Shelf) {
        bool cachedPercentSeen = false;
        for (int slot = 0; slot < visibleBookCount; ++slot)
          cachedPercentSeen = cachedPercentSeen || pageProgress[slot] == 43;
        check(cachedPercentSeen, "Saved reading percentage rounds consistently with Home");
        selection = 0;
        showSelection = false;
        const auto cell = bookCells[0];
        const auto x = static_cast<int16_t>(cell.x + cell.width / 2);
        const auto y = static_cast<int16_t>(cell.y + cell.height / 2);
        handleInput({LibraryInputBuffer::Type::TouchPress, x, y});
        handleInput({LibraryInputBuffer::Type::TouchRelease, x, y});
        check(showSelection && selection == cell.row + CONTROL_COUNT && index.isOpen(),
              "First touch selects the book without opening it");
        capture("book-selected");
      }
      check(bookPageCount > 1, "Fixture exercises multiple book pages");
      moveBookPage(2);
      loadGridPageCovers();
      check(nextGridCoverRow == -1, "Page I/O waits for the new frame");
      paint();
      check(bookPageIndex == bookPageCount - 1, "Last page");
      moveBookPage(-2);
      paint();
      check(bookPageIndex == 0, "First page");
      for (const auto preset : library_shelf::GRID_PRESETS) {
        SETTINGS.libraryGridColumns = preset.columns;
        SETTINGS.libraryGridRows = preset.rows;
        resetViewport();
        paint();
        check(visibleBookCount > 0 && visibleBookCount <= library_shelf::MAX_VISIBLE_BOOKS, "Every grid/view draws");
        for (int i = 0; i < visibleBookCount; ++i) {
          const auto& cell = bookCells[i];
          check(cell.x >= 0 && cell.y >= 0 && cell.x + cell.width <= renderer.getScreenWidth() &&
                    cell.y + cell.height <= renderer.getScreenHeight(),
                "Cover stays within display");
        }
      }
    }
  }
  SETTINGS.libraryBookView = library_shelf::Shelf;
  SETTINGS.libraryBookshelfTheme = library_shelf::Cozy;
  SETTINGS.libraryGridColumns = 3;
  SETTINGS.libraryGridRows = 2;
  enterCollections(CollectionKind::Authors);
  capture("authors");
  check(collectionCount >= 2, "Authors tab");
  enterCollections(CollectionKind::Folders);
  capture("folders");
  check(collectionCount >= 2, "SD folders tab");
  enterCollections(CollectionKind::Series);
  enterCollection(0);
  const int scopedCount = rowCount();
  check(scopedCount > 0 && scopedCount < index.bookCount(), "Collection membership filter");
  capture("inside-collection");
  for (uint8_t method = 0; method < 7; ++method) {
    simulatorSetView(method, false);
    paint();
    check(SETTINGS.libraryBookView == library_shelf::Shelf, "Sort preserves selected view");
  }
  simulatorSetView(5, false);
  check(readBook(0, rowScratch), "Read metadata fixture");
  SETTINGS.libraryShowSeries = true;
  SETTINGS.libraryShowGenre = true;
  formatBookMetadata(0, false);
  check(collectionScratch.find(" #1") != std::string::npos && collectionScratch.find("Fiction") != std::string::npos,
        "Metadata shows numeric series position and genre");
  SETTINGS.libraryShowSeries = false;
  formatBookMetadata(0, false);
  check(collectionScratch.find('#') == std::string::npos && collectionScratch.find("Fiction") != std::string::npos,
        "Series display switch");
  SETTINGS.libraryShowGenre = false;
  formatBookMetadata(0, false);
  check(collectionScratch.empty(), "Genre display switch");
  SETTINGS.libraryShowSeries = true;
  SETTINGS.libraryShowGenre = true;
  simulatorSetView(1, false, "Volume 02");
  check(rowCount() > 0 && rowCount() < index.bookCount(), "Search returns matching fixtures");
  capture("search");
  for (uint8_t mode = 0; mode < library_shelf::BackgroundCount; ++mode) {
    SETTINGS.libraryBackground = mode;
    resetViewport();
    snprintf(name, sizeof(name), "background-%u", mode);
    capture(name);
  }
  auto settings = makeUniqueNoThrow<LibrarySettingsActivity>(renderer, mappedInput);
  check(static_cast<bool>(settings), "Cannot allocate Library settings review");
  settings->onEnter();
  settings->render(std::move(reviewLock));
  saveImage("settings-display");
  settings->simulatorShowFiles();
  settings->render(std::move(reviewLock));
  saveImage("settings-files");
  settings->simulatorOpenGrid();
  settings->render(std::move(reviewLock));
  saveImage("settings-grid-chooser");
  for (int i = 0; i < library_shelf::GRID_PRESET_COUNT; ++i) {
    settings->simulatorApplyGrid(i);
    const auto preset = library_shelf::GRID_PRESETS[i];
    check(SETTINGS.libraryGridColumns == preset.columns && SETTINGS.libraryGridRows == preset.rows,
          "Visual grid chooser persists columns and rows");
  }
  settings->onExit();
  settings.reset();
  JsonDocument saved;
  SETTINGS.toJson(saved);
  SETTINGS.libraryBookView = library_shelf::List;
  SETTINGS.libraryBookshelfTheme = library_shelf::Autumn;
  SETTINGS.fromJson(saved.as<JsonVariantConst>());
  check(SETTINGS.libraryBookView == library_shelf::Shelf && SETTINGS.libraryBookshelfTheme == library_shelf::Cozy,
        "Library settings round trip");
  check(RECENT_BOOKS.getCount() == recentCountBefore, "Unopened covers never enter recent history");
  std::printf("LIBRARY REVIEW PASS: %u checks, %u native captures\n", checks, captures);
  std::fflush(stdout);
  std::_Exit(0);
}
#endif
