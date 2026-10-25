#pragma once

class GfxRenderer;
namespace library_shelf {
inline constexpr int FONT_SMALL = 0x4c494231;
inline constexpr int FONT_BODY = 0x4c494232;
inline constexpr int FONT_HEADING = 0x4c494233;
inline constexpr int FONT_CARD = 0x4c494234;
void registerFonts(GfxRenderer& renderer);
void unregisterFonts(GfxRenderer& renderer);
}  // namespace library_shelf
