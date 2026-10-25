# Custom Library for CrossInk 1.6.1 / X4 Pro

This is a personal modification of CrossInk, based on the official `v1.6.1`
commit `9914146eeae7b46b300f475a16c32426fc02ec1f`. The FreeInk SDK remains at
`699370183fa3a0e33c9cb83a36f701bbb6022095`.

Only the Library interface, its navigation, and Library preference storage are
changed. Home, reading, reading statistics, transfer, and the existing Files
activity have no intentional behavior changes.

## Library behavior

- Library opens with Series, Authors, and SD Folders tabs and an All Books tile.
- Collection tiles show up to three covers with the first volume in front,
  a theme nameplate, and counts from the existing reading statistics.
- Series and Authors use the existing Library metadata. The SD Folders tab lists
  directories containing indexed books. It does not move files or replace Files.
- Collection and All Books screens start with Series ascending sorting. Cover
  grids work with every existing sort method, subject to that method's meaning:
  Recently Opened contains books already in the existing recent history.
- Refresh, Search, Settings, Display, and Show Files remain available.
- Book view, grid dimensions, and shelf theme are Library-specific settings.
  Grid dimensions mean columns by rows, defaulting to 3 by 2.
- Shelf, Covers and List work with every sort. Shelf mixes tightly grouped
  finished-book spines, face-out covers and ornaments on shared wooden planks,
  following the v6 reference. Columns cap face-out covers per shelf; rows set
  the number of shelves. Covers keeps its regular grid and title labels.
  Binding heights and widths vary decoratively, without inventing page counts.
- Finished means either the explicit Finished flag or saved progress that
  rounds to 100%. Spines, finished counts and Hide Finished use the same rule.
- Missing authors appear in Unknown Author without clearing other collections.
  The generated root My Clippings.txt export is excluded from the Library index
  and Library recent view; it remains available through Files and Clippings.
- Themes are Cozy Nook (default) and Autumn Harvest, using original v6 artwork.
  Existing Autumn settings keep their original ID; removed themes use Cozy.
  Wallpaper reaches the screen edges behind the footer and page controls.
  Background can
  be Illustrated, Quiet or Off. Ornaments and status badges have separate toggles.
- First tap selects a book and opens its Book Card popup: cover, author, a short
  EPUB description, series/genre tags and saved progress, with Open Book and
  Close buttons. Missing descriptions have a plain fallback. Long press retains
  the original book actions; after dismissing the card, a second tap on the
  selected book opens it. The title strip can reopen its card.
- The landing header opens the current-reading card. The info button inside a
  collection or All Books opens a summary of that view. Cards overlay the shelf
  without changing its layout; Back or tapping outside closes them.
- The 3 x 2 Shelf and Covers books are slightly larger; 2 x 2 books are slightly
  smaller. Other presets keep their existing sizing. Collections open with one
  tap. First, previous, next and last page controls remain available.

The collection cache holds compact book references using the existing
PSRAM-aware allocator. Thumbnail work is limited to the visible page, processes
one thumbnail between input checks, reuses exact-size disk caches, and requests
one repaint after a cold cover batch. Cached percentages are read with the
visible rows, so warm cover caches do not queue an extra repaint. There is no
animation or periodic refresh. Book Card metadata is read on demand into one
bounded record, with a 512-byte description limit and no extra framebuffer or
reader-cache format change. Browsing an unopened cover does not add a recent
history entry. Battery life still needs measurement on a physical reader.
Two themes use 74,276 bytes
of packed flash masks with no SVG parser, runtime resize, animation or extra
framebuffer. Library text uses three small one-bit bitmap font sizes in flash,
registered only for the Library visit. It does not activate a scalable font
workspace. C3 devices alias their existing bitmap fonts to stay within the app
partition. Exact finished counts read cached statistics once per book per
Library visit, then reuse two completion bits per indexed book. Refresh and
book actions invalidate that cache. At the 32,767-book index limit, status and
page arrays need at most about 28 KiB in addition to collection references;
PSRAM is preferred and allocation failure falls back to fixed cover pages.

## Build and cloud download

The `Custom Library for X4 Pro` GitHub Actions workflow uses Ubuntu 24.04 and
Python 3.12. It runs on the
`feat/library-collections-x4-pro` branch or by manual dispatch. It checks the
base and SDK, applies clang-format 21 to changed C++ files, runs native tests and
cppcheck, checks the shared code with a C3 build, then builds `x4-pro` and the
native X4 Pro simulator. Simulator checks use generated books in a temporary
card and capture actual one-bit Library output; no personal books are included.

Successful runs provide the `crossink-1.6.1-library.3-x4-pro` artifact containing:

- `firmware-x4-pro-v1.6.1-library.3.bin`: the X4 Pro application image.
- `SHA256SUMS.txt` and `manifest.json`: integrity and build provenance.
- `source.patch`: the exact patch against the pinned base, including formatting
  applied during the build.
- `native-library-review/`: native screenshots and the verification log.

The workflow does not publish a release or flash a device. Actions artifacts
expire after 30 days and GitHub may require sign-in to download them. The logs
artifact does not contain installable firmware.

## Install after a successful build

This custom firmware has not been tested on a physical reader. A successful
compile and automated checks cannot establish e-ink appearance, touch behavior,
image decoding on hardware, or battery usage.

1. Back up the complete SD card, including hidden `.crosspoint` and CrossInk
   settings/statistics files. Keep an official X4 Pro firmware image for rollback.
2. Download and extract the successful firmware artifact. Verify the `.bin`
   against `SHA256SUMS.txt`. Use only the X4 Pro application image.
3. Copy the `.bin` to the SD card and safely eject it.
4. On the reader, open Settings, System, SD Card Firmware Update, then select the
   custom `.bin`. Keep the reader charged and allow the update to finish.
5. Open Library and tap Refresh once so any retained older index drops the
   clipping export. Verify Authors, including Unknown Author, and a book showing
   100% progress as a spine in Shelf view. Open one
   collection, try Title, Series, and Recently Opened sorting, and change the
   grid size, the two shelf themes, backgrounds and ornaments in Library Settings.
6. Tap a book to inspect its card, close it with Back, then reopen it from the
   title strip. Check Open Book, the landing current-reading header and a
   collection's info button. Verify that the shelf stays in place under the card.
7. Check Search, Refresh, file-type toggles, Back navigation, and saved settings
   after a restart. Confirm an unopened cover did not add a recent-history entry.
   Check an existing book's progress, bookmarks, and reading statistics.

This change does not intentionally reset reading data. Keep book paths and the
hidden SD state when installing. A backup remains the recovery source if a
custom build misbehaves.

## Future CrossInk updates

Installing official firmware replaces this custom interface. The source patch
can be reapplied or rebased onto a future release and then rebuilt. Compatibility
with a future release requires checking that release; it is not automatic.
