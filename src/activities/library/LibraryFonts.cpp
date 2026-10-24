#include "LibraryFonts.h"

#include <EpdFont.h>
#include <EpdFontFamily.h>
#include <GfxRenderer.h>
#include <Logging.h>

#if CROSSINK_SCALABLE_FONTS
#include "LibraryFonts.generated.h"
#endif
#include "fontIds.h"

namespace library_shelf {
#if CROSSINK_SCALABLE_FONTS
namespace {
// Uncompressed one-bit glyphs and metrics remain in flash on every device.
// Only three entries in the existing renderer map are needed during Library.
const EpdFont small(&library_small), body(&library_body), heading(&library_heading);
EpdFont fallback(nullptr);
}  // namespace
#endif

void registerFonts(GfxRenderer& renderer) {
#if CROSSINK_SCALABLE_FONTS
  const auto found = renderer.getFontMap().find(SMALL_FONT_ID);
  fallback.data = found == renderer.getFontMap().end() ? nullptr : found->second.getData();
  const auto* recovery = fallback.data ? &fallback : nullptr;
  renderer.insertFont(FONT_SMALL, EpdFontFamily(&small, nullptr, nullptr, nullptr, recovery));
  renderer.insertFont(FONT_BODY, EpdFontFamily(&body, nullptr, nullptr, nullptr, recovery));
  renderer.insertFont(FONT_HEADING, EpdFontFamily(&heading, nullptr, nullptr, nullptr, recovery));
#else
  // C3 already includes bitmap reader fonts and has a tight app partition.
  // Alias those resident families instead of linking another copy of glyphs.
  const auto insertAlias = [&renderer](const int alias, const int original) {
    const auto& fonts = renderer.getFontMap();
    const auto found = fonts.find(original);
    if (found == fonts.end()) {
      LOG_ERR("LIB", "Library font %d is unavailable", original);
      return;
    }
    renderer.insertFont(alias, found->second);
  };
  insertAlias(FONT_SMALL, SMALL_FONT_ID);
  insertAlias(FONT_BODY, BITTER_10_FONT_ID);
  insertAlias(FONT_HEADING, BITTER_12_FONT_ID);
#endif
}

void unregisterFonts(GfxRenderer& renderer) {
  renderer.removeFont(FONT_SMALL);
  renderer.removeFont(FONT_BODY);
  renderer.removeFont(FONT_HEADING);
}
}  // namespace library_shelf
