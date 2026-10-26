#include <Arduino.h>
#include <I18n.h>
#include <LibraryGenreOverride.h>
#include <LibraryText.h>
#include <Logging.h>
#include <Memory.h>

#include <array>
#include <iterator>

#include "LibraryActivity.h"
#include "activities/home/BookActions.h"
#include "activities/util/KeyboardEntryActivity.h"
#include "activities/util/OptionSelectionActivity.h"

namespace {
struct Preset {
  const char* value;
  StrId label;
};
// Canonical values stay stable when the interface language changes.
constexpr Preset PRESETS[] = {{"Fiction", StrId::STR_LIBRARY_GENRE_FICTION},
                              {"Fantasy", StrId::STR_LIBRARY_GENRE_FANTASY},
                              {"Science Fiction", StrId::STR_LIBRARY_GENRE_SCI_FI},
                              {"Mystery & Thriller", StrId::STR_LIBRARY_GENRE_MYSTERY},
                              {"Romance", StrId::STR_LIBRARY_GENRE_ROMANCE},
                              {"History", StrId::STR_LIBRARY_GENRE_HISTORY},
                              {"Biography", StrId::STR_LIBRARY_GENRE_BIOGRAPHY},
                              {"Business & Management", StrId::STR_LIBRARY_GENRE_BUSINESS},
                              {"Self Improvement", StrId::STR_LIBRARY_GENRE_SELF_IMPROVEMENT},
                              {"Psychology", StrId::STR_LIBRARY_GENRE_PSYCHOLOGY},
                              {"Science", StrId::STR_LIBRARY_GENRE_SCIENCE},
                              {"Philosophy", StrId::STR_LIBRARY_GENRE_PHILOSOPHY}};
constexpr size_t FIRST_PRESET = 2;
constexpr size_t FIRST_EXTRA = FIRST_PRESET + std::size(PRESETS);
constexpr size_t MAX_EXTRA = 32;
}  // namespace

LibraryActivity::GenreChoices LibraryActivity::genrePickerChoices() {
  GenreChoices choices;
  // Only this dialog owns labels. Its callback holds 64 bytes of index
  // references, rather than a second vector of all the strings.
  auto& options = choices.labels;
  options.reserve(FIRST_EXTRA + MAX_EXTRA);
  options.emplace_back(tr(STR_LIBRARY_GENRE_USE_METADATA));
  options.emplace_back(tr(STR_LIBRARY_GENRE_CUSTOM));
  const auto current = library::fold(bookCard->genre);
  auto& selected = choices.selected;
  for (size_t i = 0; i < std::size(PRESETS); ++i) {
    options.emplace_back(I18N.get(PRESETS[i].label));
    if (library::fold(PRESETS[i].value) == current) selected = static_cast<uint8_t>(FIRST_PRESET + i);
  }
  // Most-used/default genres need no scan. Other embedded/custom genres are
  // streamed from the sorted index, with a fixed bound on picker-only storage.
  // Add a genre remains available if the vocabulary exceeds this list.
  if (index.isOpen() || index.open(library::libraryIndexPath())) {
    previousGroupKeyScratch.clear();
    for (uint16_t row = 0; row < index.bookCount() && choices.extraCount < MAX_EXTRA; ++row) {
      if ((row & 31) == 31) delay(1);
      const auto ordinal = index.ordinalForRow(library::SortOrder::GenreAsc, row);
      library::ClixRecord record{};
      if (ordinal == UINT16_MAX || !index.readRecord(ordinal, record) || !index.readGenre(record, genreScratch)) break;
      if (genreScratch.size() > library::genre_override::MAX_BYTES) continue;
      library::foldInto(genreScratch, groupKeyScratch);
      if (groupKeyScratch.empty() || groupKeyScratch == previousGroupKeyScratch) continue;
      previousGroupKeyScratch.assign(groupKeyScratch);
      bool preset = false;
      for (const auto& choice : PRESETS) preset = preset || library::fold(choice.value) == groupKeyScratch;
      if (preset) continue;
      if (groupKeyScratch == current) selected = static_cast<uint8_t>(FIRST_EXTRA + choices.extraCount);
      choices.extras[choices.extraCount++] = ordinal;
      options.push_back(genreScratch);
    }
  }
  return choices;
}

void LibraryActivity::openGenrePicker() {
  if (!bookCard || bookCard->summary) return;
  const RecentBook book = bookCard->book;
  auto choices = genrePickerChoices();
  auto picker = makeUniqueNoThrow<OptionSelectionActivity>(renderer, mappedInput, "LibraryGenrePicker",
                                                           StrId::STR_LIBRARY_CHANGE_GENRE, std::move(choices.labels),
                                                           choices.selected, false, true);
  if (!picker) {
    LOG_ERR("LIB", "Cannot allocate genre picker");
    return;
  }
  bookCardActive = false;
  openDialog(std::move(picker), [this, book, extras = choices.extras,
                                 extraCount = choices.extraCount](const ActivityResult& result) {
    const auto reopen = [&] {
      rowScratch = book;
      bindBookCard(false);
    };
    const auto* choice = std::get_if<OptionSelectionResult>(&result.data);
    if (result.isCancelled || !choice) {
      reopen();
      return;
    }
    const size_t selected = choice->index;
    if (selected == 0) {
      saveBookGenre(book, "", true);
    } else if (selected == 1) {
      openDialog(
          makeUniqueNoThrow<KeyboardEntryActivity>(renderer, mappedInput, tr(STR_LIBRARY_GENRE_CUSTOM), bookCard->genre,
                                                   library::genre_override::MAX_BYTES, InputType::Text, 1),
          [this, book](const ActivityResult& entered) {
            const auto* text = std::get_if<KeyboardResult>(&entered.data);
            if (!entered.isCancelled && text) {
              const auto first = text->text.find_first_not_of(" \t\r\n");
              const auto last = text->text.find_last_not_of(" \t\r\n");
              if (first != std::string::npos) {
                saveBookGenre(book, text->text.substr(first, last - first + 1));
                return;
              }
            }
            rowScratch = book;
            bindBookCard(false);
          });
    } else if (selected < FIRST_EXTRA) {
      saveBookGenre(book, PRESETS[selected - FIRST_PRESET].value);
    } else if (selected - FIRST_EXTRA < extraCount) {
      library::ClixRecord record{};
      if (index.readRecord(extras[selected - FIRST_EXTRA], record) && index.readGenre(record, genreScratch)) {
        const auto genre = genreScratch;
        saveBookGenre(book, genre);
      } else {
        reopen();
      }
    } else {
      reopen();
    }
  });
}

void LibraryActivity::saveBookGenre(const RecentBook& source, const std::string& genre, const bool useMetadata) {
  const RecentBook book = source;  // Rebuilds reuse rowScratch; keep this book's identity stable.
  const auto hash = library::clixPathHash(book.path.data(), book.path.size());
  if (!library::genre_override::save(hash, genre, useMetadata)) {
    LOG_ERR("LIB", "Cannot save genre for %s", book.path.c_str());
    BookActions::drawToast(renderer, tr(STR_LIBRARY_GENRE_SAVE_FAILED));
    delay(1000);
    rowScratch = book;
    bindBookCard(false);
    return;
  }
  const auto previousSort = sort;
  if (sort == Sort::RecentlyRead) sort = Sort::Series;
  library::invalidateLibraryIndex();
  const bool rebuilt = rebuildIndex(true);
  sort = previousSort;
  if (rebuilt && collectionScope == CollectionKind::Topics) {
    // The book may have left this topic. Return to the collection tiles rather
    // than leave an empty, stale collection behind the updated Book Card.
    enterCollections(CollectionKind::Series);
  } else {
    applyFilter();
    if (collectionsVisible) buildCollections();
    resetViewport();
  }
  if (!rebuilt) {
    BookActions::drawToast(renderer, tr(STR_LIBRARY_GENRE_REFRESH_FAILED));
    delay(1000);
  }
  if (bookCard) bookCard->book.path.clear();
  rowScratch = book;
  bindBookCard(false);
}
