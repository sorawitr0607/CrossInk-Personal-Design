// Cozy Nook (v6): a warm cottage reading corner. Faded ivy-and-rose wallpaper, walnut shelves,
// a ginger cat asleep on tartan, lamplight, tea and trailing ivy. Original painted-storybook drawings.
(() => {
  const OL = "#2a1d12", BR = "#cf9c46", BRD = "#8a6224", BRL = "#fbe6a8";

  // Flat base colour, optional inner details, then a volume overlay on the same path (so it stays clipped) with the soft outline.
  const S = (d, fill, ov = "pp-round", sw = 1.1, inner = "") =>
    `<path d="${d}" fill="${fill}"/>${inner}<path d="${d}" fill="url(#${ov})" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const E = (cx, cy, rx, ry = rx) => `M${r1(cx - rx)} ${cy}a${rx} ${ry} 0 1 0 ${r1(2 * rx)} 0a${rx} ${ry} 0 1 0 ${r1(-2 * rx)} 0Z`;
  const R = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;
  const RR = (x, y, w, h, r) => `M${x + r} ${y}h${r1(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${r1(h - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${r}h${r1(2 * r - w)}a${r} ${r} 0 0 1 ${-r} ${-r}v${r1(2 * r - h)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
  const ln = (d, c, w = 1, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ""}/>`;
  const dot = (cx, cy, r, c, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ""}/>`;
  const ring5 = (x, y, rad, r, c) => [0, 72, 144, 216, 288].map(a => dot(r1(x + rad * Math.sin(a * Math.PI / 180)), r1(y - rad * Math.cos(a * Math.PI / 180)), r, c)).join("");

  // Books lying flat. Spine to the viewer: gilt bands and a dark title panel.
  const spineBook = (x, y, w, h, c) => S(RR(x, y, w, h, 2.5), c, "cozy-cyl", 1.1,
    ln(`M${x + 7} ${y + 2}v${h - 4}M${x + 10} ${y + 2}v${h - 4}M${x + w - 7} ${y + 2}v${h - 4}M${x + w - 10} ${y + 2}v${h - 4}`, "#e2b85e", 1, .9) +
    `<rect x="${r1(x + w / 2 - 18)}" y="${r1(y + h * .26)}" width="36" height="${r1(h * .48)}" rx="1" fill="#1a120b" fill-opacity=".3" stroke="#e2b85e" stroke-width=".7"/>` +
    ln(`M${x + w / 2 - 11} ${r1(y + h / 2)}h22`, "#e2b85e", .8, .7));
  // Fore-edge to the viewer: coloured boards around a cream page block.
  const pageBook = (x, y, w, h, c) => {
    let lines = "";
    for (let yy = y + 5; yy < y + h - 3; yy += 2.2) lines += `M${x + 5} ${r1(yy)}H${x + w - 5}`;
    return S(RR(x, y, w, h, 2), c, "cozy-cyl", 1.1, `<path d="${RR(x + 3, y + 3, w - 6, h - 6, 1)}" fill="#efe2c2"/>` + ln(lines, "#bfa77c", .5, .8));
  };

  // ---------- wallpaper: faded ivy sprigs and dusty-rose florets, half-drop, seamless ----------
  const TW = 72, TH = 72;
  // Draw a motif plus its copies across the tile edges so the repeat has no seams.
  const wrap = (x, y, r, fn) => {
    let out = "";
    for (const dx of [-TW, 0, TW]) for (const dy of [-TH, 0, TH]) {
      const cx = x + dx, cy = y + dy;
      if (cx + r > 0 && cx - r < TW && cy + r > 0 && cy - r < TH) out += fn(cx, cy);
    }
    return out;
  };
  const LEAF = "M0-1Q-4 1.5-8.5-1.5Q-8-4-5.5-5Q-9-6-8-9.5Q-5.5-10-3.5-9Q-3-13.5 0-16Q3-13.5 3.5-9Q5.5-10 8-9.5Q9-6 5.5-5Q8-4 8.5-1.5Q4 1.5 0-1Z";
  const sprig = (x, y, a, f = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${f} 1)">` + ln("M0 11C-2 4 1-4 0-11", "#9aa680", .9) +
    [[0, -10.5, .44, 0], [-.4, -3, .4, -60], [.6, 4, .38, 62], [-1, 9.5, .32, -72]]
      .map(([lx, ly, s, la]) => `<path d="${LEAF}" transform="translate(${lx} ${ly}) rotate(${la}) scale(${s})" fill="#a3ae88"/>`).join("") + "</g>";
  const floret = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-3 3.5C-6 5-8 4-9 2.5C-7 1.6-5 2-3 3.5ZM3 3.8C5 6 7.5 6 9 4.8C7 3.5 5 3.4 3 3.8Z" fill="#a9b28d"/>` +
    ring5(0, 0, 2.3, 1.9, "#d9a89d") + dot(0, 0, 1.1, "#b77a66") + "</g>";
  const seeds = (x, y) => dot(r1(x - 1.6), y, .8, "#c7ae86") + dot(r1(x + 1.6), y, .8, "#c7ae86") + dot(x, r1(y - 2.4), .8, "#c7ae86");
  const tileSvg = `<g opacity=".6">` +
    wrap(18, 20, 15, (x, y) => sprig(x, y, 28)) + wrap(54, 56, 15, (x, y) => sprig(x, y, -24, -1)) +
    wrap(55, 19, 10, (x, y) => floret(x, y, 1)) + wrap(18, 55, 10, (x, y) => floret(x, y, .9)) +
    wrap(0, 0, 4, seeds) + wrap(36, 37, 4, seeds) + "</g>";

  // ---------- shelf: ginger cat asleep on a tartan blanket over three books ----------
  const GIN = "#d98a42", GIND = "#a85a26", FUR = "#f7efe2";
  let fringe = "";
  for (let x = 149; x <= 176; x += 3) fringe += `M${x} ${r1(119 - (x - 148) * 2 / 29)}l.6 4`;
  const cat = `<g transform="translate(92 61) scale(1.15) translate(-92 -81)">` +
    S("M44 80C36 62 50 40 80 33C106 27 134 34 147 52C155 63 154 75 147 81Z", GIN, "pp-round", 1.2,
      `<path d="M58 81C63 75 76 72 90 73C104 74 116 77 122 81Z" fill="${FUR}"/>` +
      ln("M84 37C88 44 88 51 84 58M98 34C103 42 104 50 100 58M112 34C118 42 119 50 116 58M125 38C131 45 132 53 129 60M137 45C142 51 143 58 140 64", GIND, 3.2, .55) +
      ln("M70 38C90 30 120 30 140 44", "#ffd9a0", 2, .6)) +
    ln("M125 79C121 71 124 63 133 60.5", OL, .9, .4) +
    S(E(141, 80, 8, 3.4), FUR, "pp-round", .9) +
    S("M144 62C158 70 152 88 120 89C100 89 86 88 78 85C72 83 72 77 77 76C80 78 84 80 90 81C104 82.5 124 82.5 136 79C142 77 145 70 144 62Z", GIN, "pp-round", 1.1,
      ln("M134 80.5l2 7.5M120 82l1.2 7M106 82.4l.8 6.6M93 81.6l.4 6.4", GIND, 2.4, .6) + `<path d="M78 85C72 83 72 77 77 76C79 77.5 81 78.6 83 79.4C82 81.5 81.5 83.5 81.5 85.7Z" fill="${FUR}"/>`) +
    S("M33 58L31 40L46 49Z", GIN, "pp-shade", 1.1, `<path d="M35 55L34 45L43 50Z" fill="#e8a59b"/>`) +
    S("M60 47L72 37L74 57Z", GIN, "pp-shade", 1.1, `<path d="M62 48L70 42L71 54Z" fill="#e8a59b"/>`) +
    S("M30 70C28 56 38 46 53 46C68 46 77 56 75 68C73 79 62 84 51 84C40 84 31 79 30 70Z", GIN, "pp-round", 1.2,
      `<path d="M50 52C52 52 54 56 55 60C60 61 66 65 66 71C66 78 59 82 52 82C44 82 38 78 38 72C38 66 43 61 48 60C49 56 49 52 50 52Z" fill="${FUR}"/>` +
      ln("M43 49.5C44 52 44 54 43 56M53 48V53.5M62 50C61 52 61 54 62 56M31.5 66L37 67M31 71L36.5 71", GIND, 1.8, .7) +
      `<ellipse cx="41" cy="70.5" rx="3" ry="1.6" fill="#e99c96" opacity=".45"/><ellipse cx="64" cy="70.5" rx="3" ry="1.6" fill="#e99c96" opacity=".45"/>`) +
    ln("M41 64q4 3.2 8 0M56 64q4 3.2 8 0", OL, 1.3) + ln("M41.5 64.6l-1.4 1M63.5 64.6l1.4 1", OL, .8) +
    `<path d="M50.5 68.6h4l-2 2.4Z" fill="#d97f78" stroke="${OL}" stroke-width=".6" stroke-linejoin="round"/>` +
    ln("M52.5 71q-1.6 2.2-3.6 1M52.5 71q1.6 2.2 3.6 1", OL, .8) +
    ln("M44 72L28 70M44 74.5L29 77M61 72L77 69.5M61 74.5L76 76", "#7a6250", .5, .8) +
    S(E(44, 84, 7, 3.4), FUR, "pp-round", .9) + S(E(59, 84.5, 7, 3.4), FUR, "pp-round", .9) +
    ln("M42 82.5v2.6M46 82.5v2.6M57 83v2.6M61 83v2.6", "#b8a58c", .6) + "</g>";
  const catNap =
    spineBook(10, 102, 160, 22, "#2f5a3e") + pageBook(18, 84, 142, 18, "#7c2b24") + spineBook(26, 68, 126, 16, "#2c3e5c") +
    S("M24 70C22 66 25 62 32 61C68 56 126 56 150 59C163 61 170 67 172 77C175 90 178 104 177 117L148 119C149 107 147 95 142 84C124 76 96 79 74 75C58 73 42 76 30 74C27 73 24 72 24 70Z",
      "url(#cozy-tartan)", "pp-shade", 1.1,
      `<path d="M150 59C161 64 164 90 159 118L148 119C149 107 147 95 142 84C146 76 149 68 150 59Z" fill="#1c0805" opacity=".25"/>` +
      ln("M152 60C164 64 169 72 171 82", "#fff", 2.5, .2) + ln("M164 82C167 94 167 106 165 117", "#1c0805", 1.6, .3) +
      `<path d="M32 71.5C44 73 58 70.5 74 72.5C96 76 122 73.5 140 81" fill="none" stroke="#f0d9a0" stroke-width=".8" stroke-dasharray="2 2" opacity=".7"/>`) +
    ln(fringe, "#7a211b", 1.2) +
    `<path d="${E(94, 62, 60, 3.5)}" fill="#2a0d08" opacity=".3"/>` + cat +
    ln("M13 106L4 90M19 105L25 89", "#8a5a36", 1.6) + dot(4, 90, 1.8, BR) + dot(25, 89, 1.8, BR) +
    S(E(15, 112, 11), "#c97a6e", "pp-round", 1.1,
      ln("M7 105C13 109 19 115 21 121M5 111C11 113 18 118 20 122.5M10 102C17 105 23 110 26 115M20 102C14 107 9 114 9 121M25 106C19 109 14 115 13 122", "#8f4a44", .9, .7)) +
    ln("M25.5 117C31 122 40 123 52 123", "#c97a6e", 1.3);

  // ---------- shelf: brass carriage lantern with a candle ----------
  const lantern =
    `<circle cx="45" cy="86" r="34" fill="#ffc45e" opacity=".6" filter="url(#pp-glow)"/>` +
    ln("M33 27C30 7 60 7 57 27", OL, 5) + ln("M33 27C30 7 60 7 57 27", BR, 2.8) + ln("M36 17C38 12 43 10.5 47 11", BRL, 1, .8) +
    S("M24 46C25 34 34 27 45 27C56 27 65 34 66 46Z", BR, "pp-round", 1.1, dot(35.5, 40, 1.6, "#4a3210") + dot(45, 37.5, 1.6, "#4a3210") + dot(54.5, 40, 1.6, "#4a3210")) +
    S(E(45, 25.5, 4.2, 4), BR) +
    S(RR(20, 44, 50, 7, 2), BR, "cozy-cyl") +
    `<path d="M27 51H63V123H27Z" fill="url(#cozy-lglass)"/><path d="${E(45, 85, 14, 18)}" fill="#fff4c8" opacity=".55"/>` +
    S("M38 98C38 96 40 95 45 95C50 95 52 96 52 98V122H38Z", "#f3e6c6", "pp-shade-x", .9, `<path d="M41 96V102a1.3 1.3 0 0 0 2.6 0V96.5Z" fill="#fbf3de"/>`) +
    ln("M45 95.4V91.6", OL, 1) +
    `<path d="M45 75C49.5 81 51.5 86.5 49.5 90.5C48.4 92.6 41.6 92.6 40.5 90.5C38.5 86.5 40.5 81 45 75Z" fill="url(#cozy-flame)"/><path d="${E(45, 88.6, 2, 3)}" fill="#fffbe8"/>` +
    ln("M31 55V118", "#fff", 2.2, .35) + ln("M58.5 56V96", "#fff", 1, .25) +
    ln("M27 67H63M27 107H63", BRD, 1.6) + ln("M27 66.3H63M27 106.3H63", BRL, .5, .7) +
    `<path d="M27 51H63V123H27Z" fill="none" stroke="${OL}"/>` +
    S(R(23, 50, 5, 74), BR, "pp-shade-x", 1) + S(R(62, 50, 5, 74), BR, "pp-shade-x", 1) +
    dot(25.5, 55, .9, BRL) + dot(25.5, 119, .9, BRL) + dot(64.5, 55, .9, BRL) + dot(64.5, 119, .9, BRL) +
    S(RR(20, 122, 50, 8, 2), BR, "cozy-cyl") + S("M25 130H65L70 146H20Z", BR, "pp-shade") + S(RR(15, 146, 60, 14, 3), "#a8742e", "cozy-cyl");

  // ---------- shelf: terracotta pot of trailing ivy ----------
  const IVY = ["#4f7a3a", "#5f8b43", "#3f6b33", "#6e9a4c"];
  const leaves = (list, k = 0) => list.map(([x, y, s, a], i) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">` +
    S(LEAF, IVY[(i + k) % 4], "pp-round", r1(.85 / s)) + ln("M0-1V-13M0-3.5L-6.5-8.5M0-3.5L6.5-8.5M0-1.5L-6.5-2M0-1.5L6.5-2", "#d6e6a8", r1(.7 / s), .55) + "</g>").join("");
  const ivyPot =
    ln("M54 84C48 62 34 48 22 31M66 84C72 60 86 46 98 27M60 84C59 66 61 52 63 40", "#4a5a2a", 1.4) +
    leaves([[22, 31, 1, -35], [29, 45, 1.05, -95], [38, 52, 1.1, 35], [45, 67, 1.2, -80], [98, 27, 1, 35], [90, 41, 1.05, 95], [82, 48, 1.1, -30], [76, 63, 1.2, 85], [63, 40, 1.1, 5], [60, 56, 1.15, -60], [62, 67, 1.1, 60]]) +
    `<path d="${E(60, 85, 27, 3.6)}" fill="#3a2414"/>` +
    S("M35 97L85 97C84 112 82 128 79 143L41 143C38 128 36 112 35 97Z", "#c2683e", "pp-shade-x", 1.1,
      ln("M41 101C42 115 43 128 45 139", "#f2a77e", 2.2, .55)) +
    S(RR(29, 84, 62, 14, 2.5), "#cf7445", "cozy-cyl", 1.1, [36, 44, 52, 60, 68, 76, 84].map(x => dot(x, 91, 1.1, "#8e4426", .6)).join("")) +
    S("M31 143H89L86 150H34Z", "#a95533", "cozy-cyl") +
    ln("M40 86C22 88 14 102 16 120C17 128 13 133 11 136M82 87C100 89 106 104 104 120C103 127 106 132 108 136", "#4a5a2a", 1.4) +
    leaves([[30, 87.5, 1.1, -110], [18, 98, 1.15, -130], [15, 112, 1.1, -60], [16, 124, 1, -140], [11, 134, .8, 180],
      [91, 88.5, 1.1, 110], [103, 99, 1.15, 130], [105, 112, 1.1, 60], [104, 124, 1, 140], [108, 134, .8, 180]], 2);

  // ---------- shelf: teacup with steam and a biscuit on three books ----------
  const bud = (x, y) => `<path d="M${x - 5.5} ${y + 1.5}q2.5-3.5 4.5-1zM${x + 5.5} ${y + 1.5}q-2.5-3.5-4.5-1z" fill="#6f8f4c"/>` +
    dot(x, y, 3, "#cf7d74") + ln(`M${x - 1.4} ${y}a1.5 1.5 0 1 1 1.5 1.5`, "#9a4a46", .8);
  const steam = "M52 44C46 36 58 30 52 22C47 16 53 11 51 5M65 44C71 37 60 31 66 24C70 19 65 14 67 9";
  const teacup =
    spineBook(6, 112, 108, 20, "#2c3e5c") + pageBook(14, 97, 94, 15, "#3b5e43") + spineBook(10, 84, 98, 13, "#8a3226") +
    ln(steam, "#8c7a60", 5, .22) + ln(steam, "#fffaf0", 2.4, .95) +
    `<path d="${E(60, 84.5, 36, 2.6)}" fill="#1c0e06" opacity=".3"/>` +
    S("M24 80C28 86.5 92 86.5 96 80Z", "#ece2cf", "cozy-cyl", 1) +
    S(E(60, 79.6, 36, 4.6), "#f7f0e3", "pp-round", 1, `<path d="${E(60, 79.6, 30, 3.4)}" fill="none" stroke="#c9776f" stroke-width=".9" opacity=".7"/>`) +
    S(E(33, 78.4, 8, 3), "#d6a258", "pp-round", .8, dot(30, 78, .5, "#8a5a2a") + dot(34, 77.4, .5, "#8a5a2a") + dot(36.5, 78.8, .5, "#8a5a2a")) +
    ln("M83 55C97 51 98 71 79 70", OL, 6.4) + ln("M83 55C97 51 98 71 79 70", "#f7f0e3", 4) +
    S("M36 50C36 66 44 77 60 77C76 77 84 66 84 50Z", "#f7f0e3", "pp-round", 1.1,
      ln("M37.5 53.6C42 56 78 56 82.5 53.6", "#c9a24a", 1, .9) + bud(47, 63) + bud(60, 66) + bud(73, 63)) +
    S(E(60, 50, 24, 4.6), "#efe5d2", "pp-round", 1, `<path d="${E(60, 51.3, 20.5, 3.1)}" fill="#7a4220"/>` + ln("M49 50.6q6-1 12 0", "#d99a62", .8, .7));

  // ---------- shelf: table lamp with a fringed shade on a glazed vase base ----------
  let lfringe = "", beads = "", pleats = "";
  for (let x = 13; x <= 91.5; x += 2.6) {
    const y = r1(79.6 + 3.4 * (1 - ((x - 52) / 40.5) ** 2));
    lfringe += `M${r1(x)} ${y}v6.5`; beads += dot(r1(x), r1(y + 7.2), 1, "#e2b25a");
  }
  for (let i = 1; i < 9; i++) pleats += `M${r1(33 + i * 38 / 9)} 26L${r1(12 + i * 80 / 9)} 77`;
  const lamp =
    `<path d="${E(52, 66, 44, 46)}" fill="#ffd27a" opacity=".7" filter="url(#pp-glow)"/>` +
    S(E(52, 14.5, 3.6), BR) + ln("M52 18V24", BRD, 1.6) +
    S("M33 24H71L92 76C78 80 26 80 12 76Z", "url(#cozy-lshade)", "pp-shade-x", 1.1,
      `<path d="${E(52, 62, 24, 17)}" fill="#fff7dc" opacity=".55"/>` + ln(pleats, "#b8875a", .8, .35)) +
    S("M33 22.5H71L72.5 27H31.5Z", "#b5543c", "cozy-cyl", .9) +
    ln(lfringe, "#9e3f2e", 1.1) + beads +
    S("M12 76C26 80 78 80 92 76L92.6 79.6C78 83.6 26 83.6 11.4 79.6Z", "#b5543c", "cozy-cyl", .9) +
    S(R(49.5, 82, 5, 21), BR, "pp-shade-x", .8) + ln("M64 81V96", BRD, .8) + dot(64, 97.6, 1.7, BR) +
    S(RR(42.5, 100, 19, 6, 1.5), BR, "cozy-cyl", .9) +
    S("M44 106C30 112 25 130 32 145C36 152 43 155 45 159H59C61 155 68 152 72 145C79 130 74 112 60 106Z", "#3f6a5a", "pp-round", 1.1,
      ln("M31 128C40 135 64 135 73 128", "#e8d6a6", .8, .8) + ring5(40, 132, 2, 1.4, "#efe0bf") + ring5(52, 134, 2, 1.4, "#efe0bf") + ring5(64, 132, 2, 1.4, "#efe0bf") +
      dot(40, 132, .9, "#c9776f") + dot(52, 134, .9, "#c9776f") + dot(64, 132, .9, "#c9776f") + ln("M38 116C34 124 34 136 38 143", "#fff", 2.5, .4)) +
    S("M40 159H64L70 168H34Z", BR, "pp-shade") + S(RR(26, 168, 52, 12, 3), "#6b4128", "cozy-cyl");

  // ---------- wall: gilt-framed mountain painting with a little cottage ----------
  const paintingView =
    `<rect x="9" y="21" width="102" height="66" fill="url(#cozy-sky)"/>` + dot(80, 50, 8, "#fde7b0", .9) +
    `<path d="M9 60L24 42L32 49L46 33L60 50L70 44L84 57L97 43L111 55V87H9Z" fill="#8f8aa6"/>` +
    `<path d="M42.5 37.5L46 33L49.6 37.4L47.6 36.6L45.6 38.8L44 37ZM94.4 46L97 43L99.8 45.6L98 45.2L96.6 46.6Z" fill="#f6f0e6"/>` +
    `<path d="M9 66C30 56 46 63 60 58C76 53 92 62 111 58V87H9Z" fill="#7f8c56"/><path d="M9 75C34 68 60 77 111 70V87H9Z" fill="#5b6a37"/>` +
    dot(20, 70, 5, "#b8562e") + dot(27, 69, 4, "#d29a3c") + dot(98, 66, 5, "#b8562e") + dot(104, 68, 3.5, "#c7783a") +
    `<path d="M34 76L37 66L40 76ZM39 77L42 68L45 77Z" fill="#344a2c"/>` +
    `<path d="M62 66H76V75H62Z" fill="#efe0c4"/><path d="M60 67L69 60L78 67Z" fill="#9c3a2a"/><path d="M73 61H75.5V65H73Z" fill="#6a3a2a"/>` +
    `<path d="M65 69H68V72H65Z" fill="#ffd36a"/><path d="M71 70H74V75H71Z" fill="#5a3a22"/>` +
    ln("M74 60C72 56 76 54 74 50", "#efe6da", 1, .7) + ln("M72 85C69 81 73 78 72 75.5", "#e3c995", 2, .9);
  const painting =
    ln("M36 19L60 5L84 19", "#6b5a40", .9) + S(E(60, 5, 2.4), BR, "pp-round", .7) +
    S(RR(2, 14, 116, 80, 2), "url(#cozy-brass)", "pp-shade", 1.1,
      `<rect x="5.5" y="17.5" width="109" height="73" rx="1" fill="none" stroke="${BRL}" stroke-width="1.2" stroke-dasharray="1.2 2.2" opacity=".7"/>`) +
    `<path d="M9 21H111V87H9Z" fill="#5a3a14"/>` +
    `<g clip-path="url(#cozy-pclip)"><g filter="url(#pp-wc)">${paintingView}</g></g>` +
    `<path d="M11 23H109V85H11Z" fill="url(#pp-sheen)" stroke="${OL}" stroke-width=".8"/>`;

  // ---------- wall: cottage window, mountains at dusk, geranium on the sill ----------
  let scallops = "M14 11H116V24", pines = "", vdots = "";
  for (let i = 0; i < 8; i++) { const x = 116 - i * 12.75; scallops += `C${r1(x - 2)} 30 ${r1(x - 10.75)} 30 ${r1(x - 12.75)} 24`; }
  for (let x = 18, i = 0; x < 114; x += 5.5, i++) { const t = 7 + (i * 7) % 6; pines += `M${r1(x - 3)} 88L${r1(x)} ${88 - t}L${r1(x + 3)} 88Z`; }
  for (let x = 19; x < 114; x += 7) for (const y of [15, 20]) vdots += dot(y === 20 ? x + 3.5 : x, y, .9, "#f6e6d6", .85);
  const windowView =
    `<rect x="16" y="14" width="98" height="88" fill="url(#cozy-sky)"/>` + dot(88, 54, 9, "#fde7b0", .85) +
    `<path d="M16 62L34 38L44 49L60 28L77 50L89 40L114 64V102H16Z" fill="#9aa0b6"/>` +
    `<path d="M55.6 33.8L60 28L64.6 34L62 33L60 35.4L57.8 33ZM30.6 42.5L34 38L37.4 42.4L35.4 41.6L33.6 43.4ZM86 43.6L89 40L92 43.2L90 42.8L88.4 44.2Z" fill="#f6f0e6"/>` +
    `<path d="M16 74L30 62L44 70L62 57L80 70L96 60L114 70V102H16Z" fill="#6f8a78"/><path d="${pines}" fill="#3d5a42"/>` +
    `<path d="M16 92C40 84 80 89 114 84V102H16Z" fill="#8f9c5a"/>`;
  const windowArt =
    S(RR(8, 6, 114, 102, 3), "#7b5032", "pp-shade", 1.1) + `<path d="M16 14H114V102H16Z" fill="#3a2414"/>` +
    `<g clip-path="url(#cozy-wclip)"><g filter="url(#pp-wc)">${windowView}</g>` +
    ln("M22 50L46 18M28 52L50 22M74 98L100 64", "#fff", 2.6, .22) + `</g>` +
    `<path d="M17 15H113V19H17Z" fill="#000" opacity=".15"/>` +
    S(R(62, 15, 6, 87), "#8a5a38", "pp-shade-x", .9) + S(R(17, 55, 96, 6), "#8a5a38", "cozy-cyl", .9) +
    S(scallops + "Z", "#c98a80", "cozy-cyl", 1, vdots + ln("M27 12V25M40 12V26M53 12V26M65 12V26M78 12V26M91 12V26M104 12V25", "#8f5550", .7, .45)) +
    S(RR(0, 103, 130, 9, 2), "#8f5e3a", "cozy-cyl") +
    S("M14 112H25V114C25 120 21 124 14 125Z", "#7b5032", "pp-shade", .9) + S("M116 112H105V114C105 120 109 124 116 125Z", "#7b5032", "pp-shade", .9) +
    S(RR(20, 97, 32, 6, 1.5), "#7c2b24", "cozy-cyl", .8) + S(RR(23, 91, 27, 6, 1.5), "#2f5a3e", "cozy-cyl", .8) + ln("M26 92.5v3M47 92.5v3M24 98.5v3M48 98.5v3", "#e2b85e", .8) +
    ln("M95 86C94 80 92 76 93 70M99 86C100 78 102 74 104 70M97 86V74", "#4a6a2a", 1) +
    S(E(92, 80, 5.5, 4.5), "#5e8a42", "pp-round", .8) + S(E(104, 80, 5.5, 4.5), "#4f7a3a", "pp-round", .8) + S(E(98, 76, 5, 4), "#6e9a4c", "pp-round", .8) +
    ring5(93, 69, 2.4, 1.9, "#c8483a") + ring5(104, 69, 2.4, 1.9, "#d4584a") + ring5(98, 65, 2.2, 1.7, "#e07a6a") +
    S("M90 89H108L105.5 104H92.5Z", "#c2683e", "pp-shade-x", .9) + S(RR(88, 86, 22, 5, 1.5), "#cf7445", "cozy-cyl", .9);

  // ---------- perch: grey tabby kitten peeking over the cover, paws on the edge ----------
  const KIT = "#a39a90", KITD = "#645a52";
  const eye = (x, y) => S(E(x, y, 3.3, 3.5), "#c7b84e", "pp-round", .8, `<path d="${E(x, y + .3, 1.5, 2.6)}" fill="#1b120a"/>`) + dot(r1(x - .9), r1(y - 1.2), .8, "#fff");
  const kitten =
    S("M12 22L10 3L23 13Z", KIT, "pp-shade", 1, `<path d="M13.4 18L12.4 7.6L20 13.4Z" fill="#e3a9a0"/>`) +
    S("M29 13L42 3L40 22Z", KIT, "pp-shade", 1, `<path d="M31.6 13.4L39.6 7.6L38.6 18Z" fill="#e3a9a0"/>`) +
    S("M9 35C7 22 14 12 26 12C38 12 45 22 43 35Z", KIT, "pp-round", 1.1,
      ln("M21 14.5L22 19M26 13.5V19M31 14.5L30 19M10.6 27L15 27.6M10 31L14.5 31M41.4 27L37 27.6M42 31L37.5 31", KITD, 1.5, .75) +
      `<path d="M26 22C28 22 29 25 29.5 27C33 28 35.5 30.5 35.5 33.5V35H16.5V33.5C16.5 30.5 19 28 22.5 27C23 25 24 22 26 22Z" fill="#f6f0e6"/>`) +
    eye(19.5, 25) + eye(32.5, 25) +
    `<path d="M24.4 29.2h3.2l-1.6 1.9Z" fill="#d98a86" stroke="${OL}" stroke-width=".5"/>` +
    ln("M26 31.1q-1.2 1.8-2.8.9M26 31.1q1.2 1.8 2.8.9", OL, .7) +
    ln("M20 30L6 28.5M20 32L7 33.5M32 30L46 28.5M32 32L45 33.5", KITD, .45, .8) +
    S(E(15.5, 32.7, 6.2, 3.1), "#f6f0e6", "pp-round", .9) + S(E(36.5, 32.7, 6.2, 3.1), "#f6f0e6", "pp-round", .9) +
    ln("M13.5 31.4v2.8M17.5 31.4v2.8M34.5 31.4v2.8M38.5 31.4v2.8", "#a89a8c", .6);

  // ---------- perch: house sparrow ----------
  const sparrow =
    S("M30 24L43 15L44 19L33 28Z", "#6e4a2c", "pp-shade", .9) +
    S("M8 20C8 12 14 7 21 8C29 9 35 15 36 22C37 29 30 32 21 32C13 32 8 27 8 20Z", "#d2c0a2", "pp-round", 1) +
    S("M18 13C26 10 35 15 36 22C36 27 32 29 27 29C24 25 20 19 18 13Z", "#8c5e36", "pp-shade", .9,
      ln("M23 15C26 18 28 22 29 27M27 14C30 17 32 21 33 25", "#3e2614", 1.1) + ln("M21.5 19C24.5 20 26.5 22 27.5 24", "#f1e6cf", 1.2)) +
    S(E(14, 15, 8, 7.5), "#a89e92", "pp-round", 1,
      `<path d="M14 8C20 7.5 23.5 10.5 22.5 15.5C20 13.5 17 12.5 13.5 13Z" fill="#8a4e2a"/>` + `<path d="${E(12.5, 18, 4.2, 3)}" fill="#efe6d6"/>` +
      `<path d="M6.5 18C8.5 22 12 23 14 22C12 25 8.5 25 6.5 22.5Z" fill="${OL}"/>`) +
    dot(11.5, 13.8, 1.6, "#1b120a") + dot(11.9, 13.2, .5, "#fff") +
    S("M6.6 13.4L1.4 15.6L6.6 17.6Z", "#5a4a3a", "pp-shade", .7) +
    ln("M19 31.5V35.4M24 31.5V35.4", "#8a5a3a", 1.1) + ln("M16.5 35.4H21.5M21.5 35.4H26.5", "#8a5a3a", 1);

  const screw = (x, y) => `<circle cx="${x}" cy="${r1(y)}" r="2.4" fill="url(#cozy-brass)" stroke="#5a3c14" stroke-width=".7"/>` +
    ln(`M${r1(x - 1.4)} ${r1(y + .9)}L${r1(x + 1.4)} ${r1(y - .9)}`, "#5a3c14", .8);

  registerTheme({
    id: "cozy",
    name: "Cozy Nook",
    blurb: "A cottage reading corner: ivy wallpaper, walnut shelves, a sleeping cat, tea and lamplight.",
    dark: false,
    wall: { base: "#f2e6d0", tile: { w: TW, h: TH, svg: tileSvg } },
    wood: { h: 20, top: "#8a5a38", face: "#6a4128", grain: "#43271a", dark: "#2c1910" },
    // Cream library label in a brass holder with a screw at each end.
    plate: (w, h) =>
      `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="4" fill="url(#cozy-brass)" stroke="${OL}"/>` +
      `<rect x="2.2" y="2.2" width="${w - 4.4}" height="${h - 4.4}" rx="3" fill="none" stroke="${BRL}" stroke-opacity=".6"/>` +
      `<rect x="10" y="4.5" width="${w - 20}" height="${h - 9}" rx="1.5" fill="#f5ead1" stroke="#6e4a1a" stroke-width=".8"/>` +
      `<rect x="12.5" y="7" width="${w - 25}" height="${h - 14}" fill="none" stroke="#c9a96a" stroke-width=".6"/>` +
      `<rect x="10" y="4.5" width="${w - 20}" height="${h - 9}" rx="1.5" fill="url(#cozy-label)"/>` +
      screw(5.4, h / 2) + screw(w - 5.4, h / 2),
    plateInk: "#3a2414",
    ornaments: [
      { id: "cat-nap", label: "Cat asleep on tartan", w: 180, h: 124, at: "shelf", svg: catNap },
      { id: "lantern", label: "Brass lantern", w: 90, h: 160, at: "shelf", svg: lantern },
      { id: "ivy-pot", label: "Ivy in terracotta", w: 120, h: 150, at: "shelf", svg: ivyPot },
      { id: "teacup", label: "Tea on a book stack", w: 120, h: 132, at: "shelf", svg: teacup },
      { id: "lamp", label: "Fringed table lamp", w: 104, h: 180, at: "shelf", svg: lamp },
      { id: "painting", label: "Mountain cottage painting", w: 120, h: 96, at: "wall", svg: painting },
      { id: "window", label: "Cottage window", w: 130, h: 128, at: "wall", svg: windowArt },
      { id: "kitten", label: "Peeking kitten", w: 52, h: 36, at: "perch", svg: kitten },
      { id: "sparrow", label: "Sparrow", w: 44, h: 36, at: "perch", svg: sparrow }
    ],
    defs: `<pattern id="cozy-tartan" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)"><rect width="16" height="16" fill="#a8302a"/><path d="M5 0h6v16H5zM0 5h16v6H0z" fill="#5e1712" opacity=".45"/><path d="M7.3 0h1.4v16H7.3zM0 7.3h16v1.4H0z" fill="#1f3a2a" opacity=".85"/><path d="M1.6 0h.7v16h-.7zM0 1.6h16v.7H0z" fill="#ecc66a" opacity=".75"/></pattern>
<linearGradient id="cozy-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc96"/><stop offset=".4" stop-color="#d3a24a"/><stop offset=".78" stop-color="#a3742c"/><stop offset="1" stop-color="#6e4a1a"/></linearGradient>
<linearGradient id="cozy-cyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
<radialGradient id="cozy-lglass" cx=".5" cy=".46" r=".7"><stop offset="0" stop-color="#fff2c4"/><stop offset=".35" stop-color="#ffd27e"/><stop offset="1" stop-color="#c47a2c"/></radialGradient>
<radialGradient id="cozy-flame" cx=".5" cy=".72" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffcf55"/><stop offset="1" stop-color="#e2672a"/></radialGradient>
<linearGradient id="cozy-lshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecd09e"/><stop offset=".55" stop-color="#f8e2b0"/><stop offset="1" stop-color="#ffecbe"/></linearGradient>
<linearGradient id="cozy-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb2bb"/><stop offset=".55" stop-color="#e9d2aa"/><stop offset="1" stop-color="#f4c68f"/></linearGradient>
<linearGradient id="cozy-label" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#a0844e" stop-opacity=".22"/></linearGradient>
<clipPath id="cozy-pclip"><rect x="11" y="23" width="98" height="62"/></clipPath>
<clipPath id="cozy-wclip"><rect x="17" y="15" width="96" height="87"/></clipPath>`
  });
})();
