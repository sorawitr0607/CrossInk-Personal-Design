#include "LibraryFonts.h"

#include <EpdFont.h>
#include <EpdFontFamily.h>
#include <GfxRenderer.h>

#include "LibraryFonts.generated.h"
#include "fontIds.h"

namespace library_shelf {
namespace {
// Uncompressed one-bit glyphs and metrics remain in flash on every device.
// Only three entries in the existing renderer map are needed during Library.
const EpdFont small(&library_small), body(&library_body), heading(&library_heading);
EpdFont fallback(nullptr);
}  // namespace

void registerFonts(GfxRenderer& renderer) {
  const auto found = renderer.getFontMap().find(SMALL_FONT_ID);
  fallback.data = found == renderer.getFontMap().end() ? nullptr : found->second.getData();
  const auto* recovery = fallback.data ? &fallback : nullptr;
  renderer.insertFont(FONT_SMALL, EpdFontFamily(&small, nullptr, nullptr, nullptr, recovery));
  renderer.insertFont(FONT_BODY, EpdFontFamily(&body, nullptr, nullptr, nullptr, recovery));
  renderer.insertFont(FONT_HEADING, EpdFontFamily(&heading, nullptr, nullptr, nullptr, recovery));
}

void unregisterFonts(GfxRenderer& renderer) {
  renderer.removeFont(FONT_SMALL);
  renderer.removeFont(FONT_BODY);
  renderer.removeFont(FONT_HEADING);
}
}  // namespace library_shelf
