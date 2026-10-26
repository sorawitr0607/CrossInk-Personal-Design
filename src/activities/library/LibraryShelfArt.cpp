#include "LibraryShelfArt.h"

#include <GfxRenderer.h>

#include <algorithm>

#include "LibraryShelfAssets.generated.h"
#include "LibraryShelfLayout.h"

namespace library_shelf {
const ThemeArt& art(const uint8_t theme) { return assets::THEMES[themeIndex(theme)]; }

void drawSprite(const GfxRenderer& renderer, const Sprite& sprite, const int x, const int y, const int sourceX,
                const int width) {
  const int cropped = width > 0 ? std::min(width, sprite.width - sourceX) : sprite.width;
  if (sourceX < 0 || cropped <= 0) return;
  const int offset = (sprite.width - sourceX - cropped) * ((sprite.height + 7) / 8);
  if (sprite.white) renderer.drawIconInverted(sprite.white + offset, x, y, cropped, sprite.height);
  if (sprite.black) renderer.drawIcon(sprite.black + offset, x, y, cropped, sprite.height);
}

void drawWall(const GfxRenderer& renderer, const uint8_t theme, const uint8_t mode, const int x, const int y,
              const int width, const int height) {
  if (mode == 0) return;
  const auto& tile = *(mode == 1 ? art(theme).quiet : art(theme).wall);
  // The renderer clips to screen; the pager and footer clear their own bands
  // after the wall so the final tile needs no cropped buffer or allocation.
  for (int py = y; py < y + height; py += tile.height)
    for (int px = x; px < x + width; px += tile.width)
      drawSprite(renderer, tile, px, py, 0, std::min<int>(tile.width, x + width - px));
}

void drawPlank(const GfxRenderer& renderer, const uint8_t theme, const int x, const int y, const int width,
               const bool front) {
  const auto& themeArt = art(theme);
  const auto& left = *(front ? themeArt.frontLeft : themeArt.backLeft);
  const auto& mid = *(front ? themeArt.frontMid : themeArt.backMid);
  const auto& right = *(front ? themeArt.frontRight : themeArt.backRight);
  drawSprite(renderer, left, x - 8, y - 25);
  for (int px = x + 12; px < x + width - 12; px += mid.width)
    drawSprite(renderer, mid, px, y - 25, 0, std::min<int>(mid.width, x + width - 12 - px));
  drawSprite(renderer, right, x + width - 12, y - 25);
}

void drawOrnament(const GfxRenderer& renderer, const uint8_t theme, const uint8_t placement, const unsigned seed,
                  const int x, const int floorY, const int maxWidth, const int maxHeight) {
  const auto& themeArt = art(theme);
  const auto fits = [&](const Sprite& piece) {
    return piece.placement == placement && piece.width <= maxWidth && piece.height <= maxHeight;
  };
  // The generator stores normal/small pairs. Prefer the largest fitting size
  // of each object, so cycling does not repeat the same object at two sizes.
  const auto pieceAt = [&](const unsigned i) -> const Sprite& {
    const auto& normal = *themeArt.pieces[i];
    return fits(normal) || i + 1 >= themeArt.pieceCount ? normal : *themeArt.pieces[i + 1];
  };
  unsigned fitting = 0;
  for (unsigned i = 0; i < themeArt.pieceCount; i += 2)
    if (fits(pieceAt(i))) ++fitting;
  if (fitting == 0) return;
  unsigned chosen = seed % fitting;
  for (unsigned i = 0; i < themeArt.pieceCount; i += 2) {
    const auto& piece = pieceAt(i);
    if (!fits(piece)) continue;
    if (chosen-- != 0) continue;
    drawSprite(renderer, piece, x + (maxWidth - piece.width) / 2, floorY - piece.height);
    return;
  }
}
}  // namespace library_shelf
