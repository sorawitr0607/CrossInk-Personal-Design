#pragma once

#include <cstdint>

class GfxRenderer;

namespace library_shelf {
struct Sprite {
  uint16_t width, height;
  uint8_t placement;
  const uint8_t* white;
  const uint8_t* black;
};
struct ThemeArt {
  const Sprite *wall, *quiet, *hero, *plate, *all;
  const Sprite *backLeft, *backMid, *backRight, *frontLeft, *frontMid, *frontRight;
  const Sprite* const* pieces;
  uint8_t pieceCount;
};
const ThemeArt& art(uint8_t theme);
void drawSprite(GfxRenderer& renderer, const Sprite& sprite, int x, int y, int sourceX = 0, int width = 0);
void drawWall(GfxRenderer& renderer, uint8_t theme, uint8_t mode, int x, int y, int width, int height);
void drawPlank(GfxRenderer& renderer, uint8_t theme, int x, int y, int width, bool front);
void drawOrnament(GfxRenderer& renderer, uint8_t theme, uint8_t placement, unsigned seed, int x, int floorY,
                  int maxWidth, int maxHeight);
}  // namespace library_shelf
