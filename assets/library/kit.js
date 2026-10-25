// Original v6 SVG art kit, evaluated only by the host asset baker.
// Draw in screen pixels (1 unit = 1 px on the 480 x 800 reader). Full colour; the page can preview it as e-ink gray.
const K = {
  ink: "#1b1a17",   // UI ink: text, outlines, active tabs
  paper: "#fbf9f4", // UI paper: cards, bars, chips
  g1: "#e6e1d6",    // light rule
  g2: "#a8a194",    // mid gray
  g3: "#5b564d"     // secondary text
};

const THEMES = [];
// The plank is shared: each theme only gives its wood colours.
function registerTheme(theme) { theme.plank = paintedPlank(theme.wood); THEMES.push(theme); }

// Seeded random so grain, leaves and petals stay identical on every redraw.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = v => Math.round(v * 10) / 10;

// Scattered marks (leaves, petals, dust) for wall tiles. fn(x, y, rand, i) returns svg.
function scatter(w, h, count, seed, fn) {
  const rand = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) out += fn(r1(rand() * w), r1(rand() * h), rand, i);
  return out;
}

// Shared filters and gradients, defined once per page. Use them by id inside any theme art.
function kitDefs() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<filter id="pp-shadow" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2.5" dy="3" stdDeviation="2.2" flood-color="#1d140a" flood-opacity=".38"/></filter>
<filter id="pp-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="pp-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="pp-wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
<filter id="pp-paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 -1.1 .62"/></filter>
<linearGradient id="pp-shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
<linearGradient id="pp-shade-x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
<radialGradient id="pp-round" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
<linearGradient id="pp-plank-face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
<linearGradient id="pp-cast" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20160c" stop-opacity=".42"/><stop offset="1" stop-color="#20160c" stop-opacity="0"/></linearGradient>
<linearGradient id="pp-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c7" stop-opacity=".16"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
</defs></svg>`;
}

// Floating wooden shelf. wood: { h, top, face, grain, dark } colours; books stand on y = 0.
function paintedPlank(wood) {
  const h = wood.h || 20;
  return {
    height: h,
    // Top surface, seen slightly from above, behind the books.
    back: w => `<rect x="2" y="-7" width="${w - 4}" height="8" fill="${wood.top}"/><rect x="2" y="-7" width="${w - 4}" height="2.2" fill="${wood.dark}" opacity=".45"/>`,
    front(w, seed) {
      const rand = rng(seed * 7919 + w);
      let grain = "";
      for (let i = 0; i < 6; i++) {
        const y0 = 3 + (i + rand() * 0.6) * (h - 6) / 6, amp = 0.6 + rand() * 1.4, ph = rand() * 6.3, k = 0.012 + rand() * 0.02;
        let d = "";
        for (let x = rand() * 30; x <= w - rand() * 30; x += 8) d += `${d ? "L" : "M"}${r1(x)} ${r1(y0 + Math.sin(x * k + ph) * amp)}`;
        grain += `<path d="${d}" fill="none" stroke="${wood.grain}" stroke-width="${r1(0.6 + rand() * 0.8)}" opacity="${r1(0.35 + rand() * 0.35)}"/>`;
      }
      const kx = 40 + rand() * (w - 80);
      return `<rect x="6" y="${h - 1}" width="${w - 12}" height="13" fill="url(#pp-cast)"/>
<rect width="${w}" height="${h}" rx="2" fill="${wood.face}"/>${grain}
<ellipse cx="${r1(kx)}" cy="${r1(h * 0.55)}" rx="7" ry="2.2" fill="none" stroke="${wood.grain}" stroke-width="1" opacity=".55"/>
<rect width="${w}" height="${h}" rx="2" fill="url(#pp-plank-face)"/>
<path d="M2 .7H${w - 2}" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/><path d="M1 ${h - .6}H${w - 1}" stroke="${wood.dark}" stroke-width="1.2"/>
<rect width="3" height="${h}" fill="${wood.dark}" opacity=".5"/><rect x="${w - 3}" width="3" height="${h}" fill="${wood.dark}" opacity=".5"/>`;
    }
  };
}

/* THEME CONTRACT (every field below is used by app.js and art-sheet.cjs)
registerTheme({
  id: "autumn",                     // short unique id, used in ?theme=
  name: "Autumn Harvest",
  blurb: "One line for the theme chooser.",
  dark: false,                      // true when the wall is dark (Oak Study); app then adds light edges to labels
  wall: {
    base: "#hex",                   // wall colour under the tile
    tile: { w, h, svg }             // seamless repeating wallpaper tile (svg = inner markup in 0..w, 0..h)
  },
  wood: { h: 20, top, face, grain, dark },  // shelf colours; kit draws the plank
  plate(w, h) -> svg,               // nameplate behind collection names (brass plate, paper tag, washi label)
  plateInk: "#hex",                 // text colour on the plate
  ornaments: [
    { id, label, w, h, at: "shelf" | "wall" | "perch", svg }
    // shelf: keepsake standing on the plank, bottom at y = h.  wall: framed piece on the wall.
    // perch: a small creature sitting on the TOP EDGE of a book cover, bottom at y = h.
  ],
  defs: ""                          // extra <linearGradient>/<pattern> markup; prefix every id with "<theme id>-"
});
Sizes: shelf keepsakes 90-190 w, 120-190 h (book covers on a shelf are 120-200 px tall; the app scales
keepsakes down to fit short shelves). Wall pieces 90-140 w, 80-130 h. Perches 34-60 w, 24-44 h.
Style: painted storybook still life. Flat colour shapes, then volume with url(#pp-shade) / url(#pp-round)
overlays clipped to the shape, warm highlights, soft dark outlines (#2a1d12-ish, 0.8-1.4 px, not pure black).
Shared ids: pp-shadow pp-soft pp-glow pp-wc pp-paper pp-shade pp-shade-x pp-round pp-sheen.
Original drawings only; never trace third-party art.
*/
