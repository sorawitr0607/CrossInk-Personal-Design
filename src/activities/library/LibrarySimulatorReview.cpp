// Native simulator verification only. No code or fixture writes in firmware.
#ifdef SIMULATOR
#include <ArduinoJson.h>
#include <Epub.h>
#include <FsHelpers.h>
#include <HalStorage.h>
#include <LibraryGenreOverride.h>
#include <LibraryText.h>
#include <Memory.h>

#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iterator>

#include "LibraryActivity.h"
#include "LibraryFonts.h"
#include "LibrarySettingsActivity.h"
#include "activities/home/RecentBookProgress.h"
#include "activities/reader/BookReadingStats.h"
#include "activities/util/OptionSelectionActivity.h"

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
  check(renderer.getTextAdvanceX(library_shelf::FONT_CARD, " ", EpdFontFamily::REGULAR) >= 4 &&
            renderer.getLineHeight(library_shelf::FONT_CARD) > renderer.getLineHeight(library_shelf::FONT_SMALL),
        "Card descriptions use a larger font with readable word spaces");
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
  check(readIndexedBook(progressOnlyOrdinal, rowScratch), "Read percentage boundary fixture");
  const auto percentCache = Epub::resolveCachePathForFilePath(rowScratch.path, "/.crosspoint");
  RecentBookProgress::saveCachedEpubPercent(percentCache, 99.49f);
  invalidateCompletion();
  regression(!completedOrdinal(progressOnlyOrdinal), "A displayed 99 percent remains unfinished");
  RecentBookProgress::saveCachedEpubPercent(percentCache, 99.5f);
  invalidateCompletion();
  regression(completedOrdinal(progressOnlyOrdinal), "Rounded 100 percent agrees with badges");
  RecentBookProgress::saveCachedEpubPercent(percentCache, 100.0f);
  invalidateCompletion();
  enterCollections(CollectionKind::Authors);
  regression(!collectionsFailed && collectionCount >= 3, "One missing author must not erase the Authors tab");
  int unknownAuthor = -1;
  for (int group = 0; group < collectionCount; ++group) {
    library::ClixRecord record{};
    if (index.readRecord(collections[group].leaderOrdinal(), record) &&
        readCollectionValue(record, CollectionKind::Authors, collectionScratch) && collectionScratch.empty())
      unknownAuthor = group;
  }
  regression(unknownAuthor >= 0, "Missing metadata has an Unknown Author collection");
  if (unknownAuthor >= 0) {
    enterCollection(unknownAuthor);
    regression(!filterFailed && rowCount() == 2, "Unknown Author opens both books without author metadata");
  }
  enterCollection(-1);
  bool clippingVisible = false, txtBookVisible = false;
  for (int row = 0; row < rowCount(); ++row) {
    check(readBook(row, rowScratch, true), "Cannot read regression book");
    clippingVisible = clippingVisible || rowScratch.path == "/My Clippings.txt";
    txtBookVisible = txtBookVisible || rowScratch.path == "/LibraryReview/Fables/Notes.txt";
  }
  regression(!clippingVisible && txtBookVisible, "Hide the clipping export while retaining legitimate TXT books");
  SETTINGS.libraryHideFinishedBooks = true;
  applyFilter();
  bool finishedVisible = false;
  for (int row = 0; row < rowCount(); ++row) finishedVisible = finishedVisible || completedRow(row);
  regression(!finishedVisible && rowCount() > 0, "Hide Finished agrees with Shelf completion");
  SETTINGS.libraryHideFinishedBooks = false;
  applyFilter();
  check(regressionFailures == 0, "Library device regression scenarios");
  const auto paint = [&] { render(std::move(reviewLock)); };
  const auto settle = [&] {
    paint();
    for (int i = 0; i < 72; ++i) {
      if (bookCardActive)
        loadBookCardCovers();
      else if (collectionsVisible)
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
  enterCollections(CollectionKind::Series);
  int scienceTopic = -1, unclassified = -1, gardenSeries = -1, gardenTopic = -1;
  int collectionBooks = 0;
  for (int group = 0; group < collectionCount; ++group) {
    collectionBooks += collections[group].count;
    check(collectionLabel(collections[group], collectionScratch), "Read series/topic tile label");
    library::foldInto(collectionScratch, groupKeyScratch);
    if (collections[group].isTopic()) {
      if (groupKeyScratch == "science fiction") scienceTopic = group;
      if (collectionScratch == tr(STR_LIBRARY_UNCLASSIFIED)) unclassified = group;
      if (groupKeyScratch == "garden tales") gardenTopic = group;
    } else if (groupKeyScratch == "garden tales") {
      gardenSeries = group;
    }
  }
  check(collectionBooks == rowCount(), "Every visible book belongs to exactly one series or topic tile");
  check(scienceTopic >= 0 && collections[scienceTopic].count == 2,
        "Case-folded topics group non-series books directly and exclude same-genre series books");
  check(gardenSeries >= 0 && gardenTopic >= 0, "A same-named topic and series remain distinct collections");
  check(unclassified >= 0 && collections[unclassified].count == 2,
        "Missing topics use Unclassified directly, including the ordinary TXT book");
  enterCollection(scienceTopic);
  for (const auto method :
       {Sort::DateAdded, Sort::Title, Sort::AuthorLast, Sort::AuthorFirst, Sort::Series, Sort::Genre}) {
    sort = method;
    descending = false;
    applyFilter();
    check(collectionScope == CollectionKind::Topics && rowCount() == 2, "Sorting retains topic membership");
    for (int row = 0; row < rowCount(); ++row) {
      library::ClixRecord record{};
      check(index.readRecord(ordinalForRow(row), record) && index.readSeries(record, seriesScratch) &&
                seriesScratch.empty(),
            "Topic collections never contain a series book");
    }
  }
  capture("inside-topic");
  enterCollections(CollectionKind::Series);
  SETTINGS.libraryHideFinishedBooks = true;
  applyFilter();
  buildCollections();
  collectionBooks = 0;
  for (int group = 0; group < collectionCount; ++group) collectionBooks += collections[group].count;
  check(collectionBooks == rowCount(), "Hide Finished agrees with both series and topic counts");
  SETTINGS.libraryHideFinishedBooks = false;
  SETTINGS.libraryShowTxt = false;
  applyFilter();
  buildCollections();
  for (int group = 0; group < collectionCount; ++group)
    if (collectionLabel(collections[group], collectionScratch) && collectionScratch == tr(STR_LIBRARY_UNCLASSIFIED))
      check(collections[group].count == 1, "Topic grouping respects file-type visibility");
  SETTINGS.libraryShowTxt = true;
  for (const auto theme : library_shelf::THEME_IDS) {
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
    int bottomInk = 0;
    for (int y = renderer.getScreenHeight() - 16; y < renderer.getScreenHeight(); ++y)
      for (int x = 0; x < renderer.getScreenWidth(); ++x)
        if ((x < 100 || x >= renderer.getScreenWidth() - 100) && renderer.isPixelBlack(x, y)) ++bottomInk;
    check(bottomInk > 0, "Wallpaper reaches the bottom edge outside the footer text card");
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
        bool progressOnlySpine = false;
        for (int slot = 0; slot < visibleBookCount; ++slot)
          cachedPercentSeen = cachedPercentSeen || pageProgress[slot] == 43;
        for (int slot = 0; slot < visibleBookCount; ++slot)
          if (ordinalForRow(bookCells[slot].row) == progressOnlyOrdinal) progressOnlySpine = bookCells[slot].spine;
        check(cachedPercentSeen, "Saved reading percentage rounds consistently with Home");
        check(progressOnlySpine, "100-percent book is rendered as an actual spine");
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
        check(bookCardActive && bookCard && !bookCard->summary, "First book tap opens its detail popup");
        check(bookCard->description.find("garden adventure") != std::string::npos &&
                  bookCard->description.find("& family") != std::string::npos &&
                  bookCard->description.find('<') == std::string::npos,
              "Book popup uses the real plain-text EPUB blurb");
        check(bookCard->description.find(
                  "family. First paragraph. Second paragraph. Quiet friendship. A cozy ending.") != std::string::npos,
              "Description keeps paragraph/break spacing while preserving inline word fragments");
        check(!bookCard->book.author.empty() && bookCard->series.find('#') != std::string::npos &&
                  bookCard->genre == "Fiction" && bookCard->percent == 100,
              "Book popup binds author, series position, genre and saved progress");
        check(bookCells[0].x == cell.x && bookCells[0].y == cell.y && bookCells[0].height == cell.height,
              "Popup does not squeeze or reposition the shelf");
        const auto close = bookCard->closeButton;
        handleInput({LibraryInputBuffer::Type::TouchPress, static_cast<int16_t>(close.x + close.width / 2),
                     static_cast<int16_t>(close.y + close.height / 2)});
        handleInput({LibraryInputBuffer::Type::TouchRelease, static_cast<int16_t>(close.x + close.width / 2),
                     static_cast<int16_t>(close.y + close.height / 2)});
        check(!bookCardActive && index.isOpen(), "Closing a card retains the Library and selection");
        paint();
        handleInput({LibraryInputBuffer::Type::TouchPress, x, y});
        handleInput({LibraryInputBuffer::Type::TouchRelease, x, y});
        check(bookCardActive && index.isOpen(), "Tapping the selected book consistently opens its card again");
        closeBookCard();
        bookCard->description = "Stale cached description";
        refreshLibrary();
        check(bookCard->book.path.empty(), "Refresh invalidates the cached card without reallocating it");
        paint();
        showBookCard(0);
        check(bookCardActive && bookCard->description.find("garden adventure") != std::string::npos &&
                  bookCard->description.find("Stale") == std::string::npos,
              "Reopening after Refresh reloads the EPUB description at the same path");
        closeBookCard();
        paint();
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
      if (view == library_shelf::Shelf) {
        SETTINGS.libraryGridColumns = 2;
        SETTINGS.libraryGridRows = 2;
        resetViewport();
        snprintf(name, sizeof(name), "theme-%u-shelf-2x2", theme);
        capture(name);
        moveBookPage(1);
        snprintf(name, sizeof(name), "theme-%u-shelf-2x2-page-2", theme);
        capture(name);
        moveBookPage(-2);
        std::printf("LIBRARY SIZE REVIEW: theme %u 2x2 %dx%d\n", theme, gridCoverWidth, gridCoverHeight);
        SETTINGS.libraryGridColumns = 3;
        resetViewport();
        std::printf("LIBRARY SIZE REVIEW: theme %u 3x2 follows in default capture\n", theme);
      }
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
        if (view == library_shelf::Shelf && preset.columns == 2 && preset.rows >= 3) {
          snprintf(name, sizeof(name), "theme-%u-shelf-2x%u", theme, preset.rows);
          capture(name);
          int left = renderer.getScreenWidth(), right = 0;
          for (int i = 0; i < visibleBookCount; ++i) {
            if (bookCells[i].line != 0) continue;
            left = std::min<int>(left, bookCells[i].x);
            right = std::max<int>(right, bookCells[i].x + bookCells[i].width);
          }
          const auto layout =
              library_shelf::shelfGeometry(pageCacheWidth, pageCacheHeight, 2, preset.rows, SETTINGS.libraryOrnaments);
          const int areaLeft = (renderer.getScreenWidth() - pageCacheWidth) / 2;
          check(left >= areaLeft + layout.endInset && right <= areaLeft + pageCacheWidth - layout.endInset,
                "Varied tall two-column books stay clear of both shelf ends");
        }
      }
    }
  }
  SETTINGS.libraryBookView = library_shelf::Shelf;
  SETTINGS.libraryBookshelfTheme = library_shelf::Cozy;
  SETTINGS.libraryGridColumns = 3;
  SETTINGS.libraryGridRows = 2;
  check(readIndexedBook(4, rowScratch), "Read current-book fixture");
  const auto currentPath = rowScratch.path;
  RECENT_BOOKS.addOrUpdateBook(rowScratch.path, rowScratch.title, rowScratch.author, "");
  enterCollections(CollectionKind::Series);
  paint();
  handleInput({LibraryInputBuffer::Type::TouchPress, 32, 136});
  handleInput({LibraryInputBuffer::Type::TouchRelease, 32, 136});
  check(bookCardActive && bookCard->current && bookCard->book.path == currentPath,
        "Library Continue Reading opens the actual most recent book card");
  capture("card-current-reading");
  handleInput({LibraryInputBuffer::Type::BackRelease});
  check(!bookCardActive && collectionsVisible, "Back closes the current-book popup without leaving Library");
  RECENT_BOOKS.removeByPath(currentPath);
  showCurrentBookCard();
  check(bookCardActive && bookCard->summary && bookCard->total == rowCount() && bookCard->finished == allCompleted,
        "Without recent reading, the header reuses the landing Library totals");
  closeBookCard();
  enterCollection(0);
  paint();
  check(pageCacheValid && !pageCacheFallback && rowCompletion, "Summary reuses the shelf completion cache");
  handleInput({LibraryInputBuffer::Type::TouchPress, 100, 56});
  handleInput({LibraryInputBuffer::Type::TouchRelease, 100, 56});
  check(bookCardActive && bookCard->summary && bookCard->total == rowCount() && bookCard->finished > 0 &&
            bookCard->finished < bookCard->total,
        "Collection card summarizes its own filtered books and completion");
  capture("card-collection-summary");
  closeBookCard();
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
  check(settings->simulatorHasSetting(StrId::STR_LIBRARY_GRID_SIZE) &&
            !settings->simulatorHasSetting(StrId::STR_LIBRARY_LIST_DENSITY),
        "Shelf settings show grid size and hide List density");
  check(settings->simulatorHasSetting(StrId::STR_LIBRARY_SHOW_SERIES_TAGS) &&
            settings->simulatorHasSetting(StrId::STR_LIBRARY_SHOW_GENRE_TAGS),
        "Metadata display controls have explicit tag labels");
  SETTINGS.libraryBookView = library_shelf::List;
  settings->render(std::move(reviewLock));
  saveImage("settings-list-density");
  check(!settings->simulatorHasSetting(StrId::STR_LIBRARY_GRID_SIZE) &&
            settings->simulatorHasSetting(StrId::STR_LIBRARY_LIST_DENSITY),
        "List settings show List density and hide grid size");
  SETTINGS.libraryBookView = library_shelf::Covers;
  check(settings->simulatorHasSetting(StrId::STR_LIBRARY_GRID_SIZE) &&
            !settings->simulatorHasSetting(StrId::STR_LIBRARY_LIST_DENSITY),
        "Covers settings show grid size and hide List density");
  SETTINGS.libraryBookView = library_shelf::Shelf;
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
  saved["libraryGridColumns"] = 3;
  saved["libraryGridRows"] = 4;
  SETTINGS.fromJson(saved.as<JsonVariantConst>());
  check(SETTINGS.libraryGridColumns == 3 && SETTINGS.libraryGridRows == 2, "Saved 3x4 migrates to 3x2");
  saved["libraryGridColumns"] = 4;
  SETTINGS.fromJson(saved.as<JsonVariantConst>());
  check(SETTINGS.libraryGridColumns == 3 && SETTINGS.libraryGridRows == 2, "Saved 4x4 migrates to 3x2");
  saved["libraryBookshelfTheme"] = 3;
  SETTINGS.fromJson(saved.as<JsonVariantConst>());
  check(SETTINGS.libraryBookshelfTheme == library_shelf::Autumn, "Existing Autumn theme ID is preserved");
  saved["libraryBookshelfTheme"] = 1;
  SETTINGS.fromJson(saved.as<JsonVariantConst>());
  check(SETTINGS.libraryBookshelfTheme == library_shelf::Cozy, "Removed themes fall back to Cozy Nook");
  check(RECENT_BOOKS.getCount() == recentCountBefore, "Unopened covers never enter recent history");
  enterCollections(CollectionKind::Series);
  scienceTopic = -1;
  for (int group = 0; group < collectionCount; ++group)
    if (collections[group].isTopic() && collectionLabel(collections[group], collectionScratch) &&
        library::fold(collectionScratch) == "science fiction")
      scienceTopic = group;
  check(scienceTopic >= 0, "Find non-series book for the genre editor");
  enterCollection(scienceTopic);
  check(readBook(0, rowScratch), "Read genre-edit book");
  const auto genreBook = rowScratch;
  const auto originalFile = [&] {
    std::ifstream file(std::filesystem::path("fs_") / genreBook.path.substr(1), std::ios::binary);
    check(file.good(), "Genre test uses a real isolated EPUB");
    return std::string(std::istreambuf_iterator<char>(file), std::istreambuf_iterator<char>());
  }();
  showBookCard(0);
  const auto originalGenre = bookCard->genre;
  const auto originalPercent = bookCard->percent;
  auto choices = genrePickerChoices();
  check(choices.labels.size() >= 14 && choices.labels.size() <= 46 &&
            choices.labels[0] == tr(STR_LIBRARY_GENRE_USE_METADATA) &&
            choices.labels[1] == tr(STR_LIBRARY_GENRE_CUSTOM),
        "Bounded picker includes restore, custom and preset genres");
  auto picker = makeUniqueNoThrow<OptionSelectionActivity>(renderer, mappedInput, "LibraryGenrePickerReview",
                                                           StrId::STR_LIBRARY_CHANGE_GENRE, std::move(choices.labels),
                                                           choices.selected, false, true);
  check(picker != nullptr, "Genre picker allocation");
  picker->onEnter();
  picker->render(RenderLock(nullptr));
  saveImage("genre-picker");
  picker->onExit();
  picker.reset();
  saveBookGenre(genreBook, "Business & Management");
  check(bookCardActive && bookCard->genre == "Business & Management" && bookCard->percent == originalPercent,
        "Saving a genre updates the card while retaining progress");
  check(collectionsVisible && collectionTab == CollectionKind::Series,
        "A book moved from its old topic returns to the collection tiles");
  capture("genre-card-assigned");
  closeBookCard();
  int businessTopic = -1;
  for (int group = 0; group < collectionCount; ++group)
    if (collections[group].isTopic() && collectionLabel(collections[group], collectionScratch) &&
        collectionScratch == "Business & Management")
      businessTopic = group;
  check(businessTopic >= 0 && collections[businessTopic].count == 1,
        "Assigned genre reorganizes topic tiles immediately");
  enterCollection(businessTopic);
  check(rowCount() == 1 && readBook(0, rowScratch) && rowScratch.path == genreBook.path,
        "The assigned topic opens exactly the edited book");
  refreshLibrary();
  check(rowCount() == 1, "Manual genre survives a full Library refresh");
  saveBookGenre(genreBook, "", true);
  check(bookCard->genre == originalGenre && bookCard->percent == originalPercent,
        "Use book metadata restores the original embedded genre and preserves progress");
  std::ifstream unchanged(std::filesystem::path("fs_") / genreBook.path.substr(1), std::ios::binary);
  check(std::string(std::istreambuf_iterator<char>(unchanged), std::istreambuf_iterator<char>()) == originalFile,
        "On-device genre editing never changes the EPUB or its hash");
  closeBookCard();
  enterCollections(CollectionKind::Series);
  enterCollection(0);
  showBookCard(0);
  check(bookCardActive, "Open the final Read this book action fixture");
  const auto read = bookCard->openButton;
  handleInput({LibraryInputBuffer::Type::TouchPress, static_cast<int16_t>(read.x + read.width / 2),
               static_cast<int16_t>(read.y + read.height / 2)});
  handleInput({LibraryInputBuffer::Type::TouchRelease, static_cast<int16_t>(read.x + read.width / 2),
               static_cast<int16_t>(read.y + read.height / 2)});
  check(!bookCardActive && !index.isOpen(), "Read this book dismisses the card and hands off to the reader");
  std::printf("LIBRARY REVIEW PASS: %u checks, %u native captures\n", checks, captures);
  std::fflush(stdout);
  std::_Exit(0);
}
#endif
