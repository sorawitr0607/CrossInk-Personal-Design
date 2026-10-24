// Engraving art kit shared by every v4 theme. Throwaway design-prototype code, not firmware.
// Draw in screen pixels (1 unit = 1 px on the 480 x 800 reader). Grayscale only.
const K = {
  ink: "#161513",   // black ink: outlines, carved lines, solid fills
  paper: "#f6f4ef", // e-ink white
  g1: "#e3dfd6",    // light gray: quiet wall tints
  g2: "#a7a196",    // mid gray: wallpaper lines that must stay behind books
  g3: "#55514a",    // dark gray
  night: "#1c1b19"  // dark-theme wall
};

const THEMES = [];
function registerTheme(theme) { THEMES.push(theme); }

// Seeded random so carved grain and stars stay identical on every redraw.
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

// Hatch patterns, defined once per page. Fill a shape with url(#h-diag) etc.
// "-l" variants draw paper-coloured lines for use on dark walls.
function kitDefs() {
  const line = (id, size, width, angle, color) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">` +
    `<line x1="0" y1="0" x2="0" y2="${size}" stroke="${color}" stroke-width="${width}"/></pattern>`;
  const cross = (id, size, width, color) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<path d="M0 0V${size}M0 0H${size}" stroke="${color}" stroke-width="${width}"/></pattern>`;
  const dots = (id, size, radius, color) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">` +
    `<circle cx="${size / 4}" cy="${size / 4}" r="${radius}" fill="${color}"/><circle cx="${size * 3 / 4}" cy="${size * 3 / 4}" r="${radius}" fill="${color}"/></pattern>`;
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
${line("h-diag", 3.2, 0.75, 45, K.ink)}
${line("h-diag-fine", 2.4, 0.5, 45, K.ink)}
${line("h-diag-wide", 5, 0.8, 45, K.ink)}
${line("h-back", 3.2, 0.75, -45, K.ink)}
${line("h-vert", 2.6, 0.6, 0, K.ink)}
${line("h-vert-wide", 4, 0.7, 0, K.ink)}
${line("h-horz", 2.6, 0.6, 90, K.ink)}
${line("h-horz-wide", 4, 0.7, 90, K.ink)}
${cross("h-cross", 3.4, 0.7, K.ink)}
${cross("h-cross-dense", 2.4, 0.7, K.ink)}
${dots("h-dots", 4, 0.55, K.ink)}
${dots("h-dots-dense", 2.6, 0.55, K.ink)}
${line("h-diag-gray", 4, 0.7, 45, K.g2)}
${line("h-vert-gray", 3, 0.6, 0, K.g2)}
${line("h-diag-l", 3.2, 0.75, 45, K.paper)}
${line("h-horz-l", 3, 0.6, 90, K.paper)}
${cross("h-cross-l", 3.4, 0.7, K.paper)}
${dots("h-dots-l", 4, 0.6, K.paper)}
</defs></svg>`;
}

// Carved wood grain: long wavy strokes with an occasional knot. Returns one <path>.
function grain(w, h, { seed = 1, lines = 4, color = K.ink, width = 0.7, amp = 1.2, knots = 1 } = {}) {
  const rand = rng(seed);
  const knotList = Array.from({ length: knots }, () => ({ x: 20 + rand() * Math.max(1, w - 40), y: h * (0.3 + rand() * 0.4) }));
  let d = "";
  for (let i = 0; i < lines; i++) {
    const baseY = (i + 0.5) * h / lines + (rand() - 0.5) * h / lines * 0.4;
    const phase = rand() * 6.28, wave = 0.02 + rand() * 0.03;
    let x = rand() * 18, first = true;
    const end = w - rand() * 18;
    while (x <= end) {
      let y = baseY + Math.sin(x * wave + phase) * amp;
      for (const k of knotList) {
        const dx = x - k.x;
        if (Math.abs(dx) < 16) y += Math.sign(baseY - k.y || 1) * Math.cos(dx / 16 * Math.PI / 2) * 3;
      }
      d += `${first ? "M" : "L"}${r1(x)} ${r1(Math.max(0.6, Math.min(h - 0.6, y)))}`;
      first = false;
      x += 6;
    }
  }
  let knotsSvg = "";
  for (const k of knotList) knotsSvg += `<ellipse cx="${r1(k.x)}" cy="${r1(k.y)}" rx="5" ry="1.7" fill="none" stroke="${color}" stroke-width="${width}"/><ellipse cx="${r1(k.x)}" cy="${r1(k.y)}" rx="2" ry="0.7" fill="${color}"/>`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>${knotsSvg}`;
}

// Scattered marks (stars, leaves, dust) for wall tiles. fn(x, y, rand) returns svg.
function scatter(w, h, count, seed, fn) {
  const rand = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) out += fn(r1(rand() * w), r1(rand() * h), rand, i);
  return out;
}

// Standalone svg element for an art piece drawn in 0..w, 0..h.
function svgBox(w, h, inner, extra = "") {
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${extra}>${inner}</svg>`;
}

/* THEME CONTRACT (every field below is used by app.js and art-sheet.html)
registerTheme({
  id: "oak",                        // short unique id, used in ?theme=
  name: "Oak Study",
  group: "new" | "v3" | "plain",    // "v3" = upgraded v3 theme; "new" = Bookshelf-pack-inspired
  blurb: "One line for the theme chooser.",
  headline: "Landing headline", tagline: "Landing tagline",
  dark: false,                      // true when the wall is dark; app then writes wall text in paper colour
  wall: {
    base: "#hex",                   // wall colour under the tile
    tile: { w, h, svg },            // repeating pattern tile (svg = inner markup in 0..w, 0..h)
    quiet: { w, h, svg } | null     // optional sparse tile for Background: Quiet outline (null = plain base)
  },
  plank: {
    height: 16,                     // front-face height; books stand on y = 0
    back(w)  -> svg,                // optional: drawn BEFORE books, may use y in [-8, 0] (shelf top surface)
    front(w, seed) -> svg           // drawn AFTER books, y in [0, height + ~10] (face, grain, shadow, brackets)
  },
  plate(w, h) -> svg,               // label plate behind collection names (brass plate, paper tag, stone tablet)
  plateInk: K.ink,                  // text colour on the plate
  ornaments: [                      // 4-5 pieces; drawn at true pixel size, scaled down only if a slot is short
    { id, label, w, h, at: "shelf" | "hang" | "wall" | "perch", svg }
    // shelf: stands on the plank, bottom at y = h.  hang: hangs below a plank, top at y = 0.  wall: floats on the wall.
    // perch: a small creature or object sitting on the TOP EDGE of a book cover, bottom at y = h (20-44 w, 16-36 h).
  ],
  hero: { w: 132, h: 92, svg },     // landing vignette beside the headline
  defs: ""                          // optional extra <pattern>/<clipPath> markup; prefix every id with "<theme id>-"
});
Sizes: shelf ornaments 30-95 px wide, 40-100 px tall (book slots are 100-150 px tall); wall pieces up to 110 x 90;
hang pieces up to 60 x 70.
Style rules: ink outlines 1.2-1.8 px for silhouettes, 0.5-0.8 px for interior detail.
Shade with the hatch patterns above (fill="url(#h-diag)"), not gray gradients. Light comes from the upper left,
so hatch the right and lower sides. Fill every closed silhouette with K.paper first so it reads on any wall.
Original drawings only; never trace third-party art.
*/
