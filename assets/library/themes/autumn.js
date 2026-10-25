// Autumn Harvest (v6): painted harvest still life on a cream maple-leaf wallpaper, honey oak shelves.
(() => {
  const OL = "#3a2212", TWIG = "#6e4524";
  const C = { orange: "#df7a2c", rust: "#b5441f", red: "#a3301d", ochre: "#d8a03a", gold: "#e7b94f", olive: "#8b8a3c", brown: "#94592a" };
  const s2 = v => Math.round(v * 100) / 100;

  // Leaves point up (-y) from their stem at (0, 0); about 22 tall at scale 1.
  const LEAF = {
    maple: ["M0-2L1.5-3.5L5-2.5L4.5-5L8.5-5.5L7-8L11-12L8-12L7.5-14.5L5-13L5.5-17.5L3-16.5L0-22L-3-16.5L-5.5-17.5L-5-13L-7.5-14.5L-8-12L-11-12L-7-8L-8.5-5.5L-4.5-5L-5-2.5L-1.5-3.5Z",
      "M0 1V-19M0-5L8.5-11.5M0-5L-8.5-11.5M0-3L7.5-5.3M0-3L-7.5-5.3"],
    oak: ["M0-1C-3-1-4-3-3.5-5C-6.5-5-7.5-8.5-4.5-9.5C-7.5-11-7-14.5-4-14.5C-6-17-4-20.5-1.5-19.5C-1-22.5 1-22.5 1.5-19.5C4-20.5 6-17 4-14.5C7-14.5 7.5-11 4.5-9.5C7.5-8.5 6.5-5 3.5-5C4-3 3-1 0-1Z",
      "M0 1V-19M0-7L4-9M0-7L-4-9M0-12L3.5-14M0-12L-3.5-14"],
    elm: ["M0-1C-5-4-6.5-12 0-21C6.5-12 5-4 0-1Z", "M0 1V-19M0-7L3.5-10M0-7L-3.5-10M0-12L3-15M0-12L-3-15"]
  };
  const leaf = (kind, x, y, rot, s, fill, line = true) => {
    const [d, v] = LEAF[kind], k = 1 / s;
    return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${Math.round(rot)}) scale(${s2(s)})"><path d="M0 0V4" stroke="${TWIG}" stroke-width="${r1(1.2 * k)}" stroke-linecap="round"/>` +
      `<path d="${d}" fill="${fill}"/><path d="${d}" fill="url(#pp-shade-x)"${line ? ` stroke="${OL}" stroke-width="${r1(0.9 * k)}" stroke-opacity=".8" stroke-linejoin="round"` : ""}/>` +
      `<path d="${v}" fill="none" stroke="#5e240a" stroke-width="${r1(0.6 * k)}" stroke-opacity=".45"/></g>`;
  };
  const berries = (x, y, count, seed, s = 1) => {
    const rand = rng(seed);
    let st = "", b = "", hl = "";
    for (let i = 0; i < count; i++) {
      const a = rand() * 6.28, d = (2.5 + rand() * 5) * s, bx = r1(x + Math.cos(a) * d), by = r1(y + Math.sin(a) * d);
      st += `M${r1(x)} ${r1(y)}L${bx} ${by}`;
      b += `<circle cx="${bx}" cy="${by}" r="${r1(2.2 * s)}"/>`;
      hl += `<circle cx="${r1(bx - 0.7 * s)}" cy="${r1(by - 0.7 * s)}" r="${r1(0.7 * s)}"/>`;
    }
    return `<path d="${st}" stroke="${TWIG}" stroke-width="${r1(0.7 * s)}" fill="none"/><g fill="#b3261c" stroke="${OL}" stroke-width=".6" stroke-opacity=".7">${b}</g><g fill="#ffc6a6" opacity=".85">${hl}</g>`;
  };
  // Acorn hanging from its cap centre at (x, y); about 11 x 16 at scale 1.
  const acorn = (x, y, rot, s = 1) => `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot}) scale(${s2(s)})">` +
    `<path d="M-4.2 0C-4.4 5-1.8 9 0 10.5C1.8 9 4.4 5 4.2 0Z" fill="#b07a34"/><path d="M-4.2 0C-4.4 5-1.8 9 0 10.5C1.8 9 4.4 5 4.2 0Z" fill="url(#pp-shade-x)" stroke="${OL}" stroke-width="${r1(0.9 / s)}"/>` +
    `<path d="M-2.4 2C-2.5 4.5-1.4 6.6-.4 7.8" fill="none" stroke="#f6dcaa" stroke-width=".9" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M-5 .8C-5.6-3.8 5.6-3.8 5 .8Q0 2.2-5 .8Z" fill="#6b4220" stroke="${OL}" stroke-width="${r1(0.9 / s)}"/>` +
    `<path d="M-3.8-.6h7.6M-3.4-2.2h6.8" stroke="#a87a44" stroke-width=".9" stroke-dasharray="1 .9"/>` +
    `<path d="M0-2.6Q.4-4.8 1.8-5.6" fill="none" stroke="#4a2c12" stroke-width="1.2" stroke-linecap="round"/></g>`;
  // Pinecone growing from its stem at (x, y) along -y, then rotated.
  const pinecone = (x, y, len, wid, rot) => {
    // Scales sit in rings around the cone: front scales hang lower and wider, side scales foreshortened and darker.
    const rows = Math.max(4, Math.round(len / 6.5));
    let sc = "", lip = "";
    for (let i = rows - 1; i >= 0; i--) {
      const t = (i + 0.5) / rows, hw = wid / 2 * Math.pow(Math.sin(Math.PI * Math.min(0.97, 0.06 + t * 0.9)), 0.7) * (1.12 - 0.45 * t);
      const m = i % 2 ? 3 : 4, sh = len / rows * 1.6;
      const js = [...Array(m).keys()].map(j => ((j + 0.5) / m - 0.5) * 2.6).sort((a, b) => Math.abs(b) - Math.abs(a));
      for (const th of js) {
        const c = Math.cos(th), cx = r1(hw * Math.sin(th) * 1.18), cw = 2 * hw / m * 1.45 * (0.45 + 0.55 * c), cy = r1(-t * len - sh * 0.25 + sh * 0.3 * c);
        const L = r1(cx - cw / 2), R = r1(cx + cw / 2), tip = r1(cx + Math.sin(th) * cw * 0.25);
        sc += `<path d="M${L} ${cy}C${L} ${r1(cy + sh * 0.4)} ${r1(tip - cw * 0.2)} ${r1(cy + sh * 0.75)} ${tip} ${r1(cy + sh * 0.95)}C${r1(tip + cw * 0.2)} ${r1(cy + sh * 0.75)} ${R} ${r1(cy + sh * 0.4)} ${R} ${cy}Q${cx} ${r1(cy - sh * 0.3)} ${L} ${cy}Z" fill="${c > 0.8 ? "#9c6230" : c > 0.5 ? "#83502a" : "#64391c"}"/>`;
        if (c > 0.4) lip += `M${r1(L + cw * 0.18)} ${r1(cy + sh * 0.12)}Q${r1(L + cw * 0.12)} ${r1(cy + sh * 0.55)} ${r1(tip - cw * 0.04)} ${r1(cy + sh * 0.82)}`;
      }
    }
    return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot})"><ellipse cx="0" cy="${r1(-len / 2)}" rx="${r1(wid * 0.42)}" ry="${r1(len / 2)}" fill="#3a200c"/>` +
      `<g stroke="${OL}" stroke-width=".6" stroke-opacity=".85">${sc}</g><path d="${lip}" fill="none" stroke="#e0ad70" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>` +
      `<ellipse cx="0" cy="${r1(-len / 2)}" rx="${r1(wid / 2)}" ry="${r1(len / 2)}" fill="url(#pp-shade-x)" opacity=".5"/>` +
      `<path d="M0 0V4" stroke="#4a2c12" stroke-width="2" stroke-linecap="round"/></g>`;
  };
  // Pumpkin of five overlapping lobes standing on y = by.
  const pumpkin = (id, cx, by, rx, ry, P) => {
    const lobes = [[-0.58, 0.42, 0.86, 0], [0.58, 0.42, 0.86, 0], [-0.3, 0.45, 0.95, 1], [0.3, 0.45, 0.95, 1], [0, 0.42, 1, 2]]
      .map(([o, a, b, k]) => ({ x: r1(cx + o * rx), rx: r1(a * rx), ry: r1(b * ry), cy: r1(by - b * ry), k }));
    const el = (l, extra) => `<ellipse cx="${l.x}" cy="${l.cy}" rx="${l.rx}" ry="${l.ry}"${extra}/>`;
    let s = `<ellipse cx="${cx}" cy="${by}" rx="${r1(rx * 0.95)}" ry="${r1(Math.max(2, ry * 0.08))}" fill="#2a1a0c" opacity=".28"/>`;
    s += `<clipPath id="${id}">${lobes.map(l => el(l, "")).join("")}</clipPath>`;
    s += lobes.map(l => el(l, ` fill="${P.c[l.k]}" stroke="${OL}" stroke-width="1.1" stroke-opacity=".75"`)).join("");
    if (P.stripe) s += `<g fill="${P.stripe}" opacity=".6">` + lobes.map(l => `<ellipse cx="${l.x}" cy="${r1(l.cy + l.ry * 0.05)}" rx="${r1(l.rx * 0.13)}" ry="${r1(l.ry * 0.9)}"/>`).join("") + `</g>`;
    s += `<g fill="none" stroke="${P.hl || "#fff3d6"}" stroke-width="${r1(Math.max(1, rx * 0.045))}" stroke-linecap="round" opacity=".26">` +
      lobes.map(l => `<path d="M${r1(l.x - l.rx * 0.45)} ${r1(l.cy - l.ry * 0.62)}Q${r1(l.x - l.rx * 0.78)} ${l.cy} ${r1(l.x - l.rx * 0.42)} ${r1(l.cy + l.ry * 0.6)}"/>`).join("") + `</g>`;
    s += `<g clip-path="url(#${id})"><rect x="${r1(cx - rx - 2)}" y="${r1(by - 2 * ry - 2)}" width="${r1(2 * rx + 4)}" height="${r1(2 * ry + 4)}" fill="url(#pp-round)"/></g>`;
    const sy = r1(by - 2 * ry + ry * 0.14), sw = Math.max(2.5, rx * 0.09);
    s += `<path d="M${r1(cx - sw)} ${r1(sy + 2)}C${r1(cx - sw * 1.1)} ${r1(sy - ry * 0.22)} ${r1(cx + sw * 0.2)} ${r1(sy - ry * 0.4)} ${r1(cx + sw * 1.9)} ${r1(sy - ry * 0.46)}L${r1(cx + sw * 2.3)} ${r1(sy - ry * 0.34)}C${r1(cx + sw * 1.1)} ${r1(sy - ry * 0.26)} ${r1(cx + sw * 0.9)} ${r1(sy - ry * 0.1)} ${r1(cx + sw)} ${r1(sy + 2)}Z" fill="${P.stem || "#6f6a2c"}" stroke="${OL}" stroke-width="1"/>` +
      `<path d="M${r1(cx - sw * 0.5)} ${r1(sy)}C${r1(cx - sw * 0.5)} ${r1(sy - ry * 0.16)} ${r1(cx)} ${r1(sy - ry * 0.3)} ${r1(cx + sw)} ${r1(sy - ry * 0.36)}" fill="none" stroke="#e6d9a0" stroke-width="${r1(sw * 0.3)}" opacity=".5"/>`;
    return s;
  };
  const apple = (x, y, r) => {
    const d = "M0-.72C-.5-1.02-1-.9-1.02-.3C-1.05.35-.6.98-.2.98C-.08.98-.04.92 0 .92C.04.92.08.98.2.98C.6.98 1.05.35 1.02-.3C1-.9.5-1.02 0-.72Z";
    return `<g transform="translate(${x} ${y}) scale(${r})"><path d="${d}" fill="#b8281e"/><ellipse cx="-.42" cy=".05" rx=".4" ry=".6" fill="#e0a040" opacity=".45"/>` +
      `<path d="${d}" fill="url(#pp-round)" stroke="${OL}" stroke-width="${s2(1.1 / r)}"/><ellipse cx="-.48" cy="-.38" rx=".14" ry=".26" transform="rotate(25 -.48 -.38)" fill="#fff" opacity=".6"/>` +
      `<path d="M0-.7Q.06-1.1.26-1.3" fill="none" stroke="#4a2c12" stroke-width=".1" stroke-linecap="round"/></g>`;
  };
  const daisy = (x, y, r, col, rot = 0) => {
    let p = "";
    for (let i = 0; i < 12; i++) p += `<ellipse cx="${r1(r * 0.52)}" cy="0" rx="${r1(r * 0.5)}" ry="${r1(r * 0.17)}" transform="rotate(${i * 30 + rot})"/>`;
    return `<g transform="translate(${r1(x)} ${r1(y)})"><g fill="${col}" stroke="${OL}" stroke-width=".6" stroke-opacity=".6">${p}</g>` +
      `<circle r="${r1(r)}" fill="url(#pp-round)" opacity=".7"/><circle r="${r1(r * 0.32)}" fill="#4a2a12" stroke="${OL}" stroke-width=".6"/>` +
      `<circle cx="${r1(-r * 0.1)}" cy="${r1(-r * 0.1)}" r="${r1(r * 0.14)}" fill="#d9a03a" opacity=".8"/></g>`;
  };
  const wheat = (x0, y0, x1, y1) => {
    const a = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + 90;
    let g = "";
    for (let i = 0; i < 7; i++) g += `<ellipse cx="${i % 2 ? 1.6 : -1.6}" cy="${-2 - i * 2.6}" rx="1.5" ry="3" transform="rotate(${i % 2 ? 22 : -22} ${i % 2 ? 1.6 : -1.6} ${-2 - i * 2.6})"/>`;
    return `<path d="M${x0} ${y0}Q${r1((x0 + x1) / 2 + 3)} ${r1((y0 + y1) / 2)} ${x1} ${y1}" fill="none" stroke="#b58a3a" stroke-width="1"/>` +
      `<g transform="translate(${x1} ${y1}) rotate(${Math.round(a)})" fill="#e2b558" stroke="#8a6024" stroke-width=".5"><path d="M0-20V-26" stroke="#b58a3a"/>${g}</g>`;
  };

  // ---------- Wallpaper: maple, oak and elm sprays with berries, drawn in a seamless 210 tile ----------
  const TW = 210, TH = 210, PAL = [C.orange, C.rust, C.ochre, C.red, C.gold, C.olive, C.orange, C.brown, C.rust];
  const spray = (seed, len) => {
    const rand = rng(seed), bend = (rand() - 0.5) * len * 0.5;
    let s = `<path d="M-4 0Q${r1(len / 2)} ${r1(bend)} ${len} 0" fill="none" stroke="#8a6040" stroke-width="1.3" stroke-linecap="round"/>`;
    const k = 4;
    for (let i = 0; i < k; i++) {
      const t = (i + 0.6) / (k + 0.1), px = len * t, py = 2 * (1 - t) * t * bend, side = i % 2 ? 1 : -1;
      const kind = ["maple", "oak", "maple", "elm", "maple"][Math.floor(rand() * 5)];
      s += leaf(kind, px, py, side * (50 + rand() * 30), 0.95 + rand() * 0.45, PAL[Math.floor(rand() * PAL.length)], false);
    }
    return `<g transform="translate(${-len / 2} 0)">${s}${berries(len + 2, 0, 6, seed + 3, 1.1)}</g>`;
  };
  // Jittered 3 x 3 grid of sprays plus big single leaves between them keeps the cover even.
  const motifs = [], wr = rng(2026);
  for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 3; gx++) {
    motifs.push([r1((gx + 0.25 + wr() * 0.5) * TW / 3), r1((gy + 0.25 + wr() * 0.5) * TH / 3), Math.round(wr() * 360), 72, spray(100 + gy * 3 + gx, Math.round(50 + wr() * 14))]);
    const kind = ["maple", "oak", "maple", "elm"][(gx + gy) % 4];
    motifs.push([r1((gx + 0.75 + wr() * 0.2) * TW / 3), r1((gy + 0.75 + wr() * 0.2) * TH / 3), Math.round(wr() * 360), 34, (gx + gy) % 3 === 2 ? berries(0, 0, 7, 50 + gx + gy, 1.15) : leaf(kind, 0, 0, 0, 1.25 + wr() * 0.35, PAL[(gx * 3 + gy * 2) % PAL.length], false)]);
  }
  let tile = "";
  for (const [x, y, rot, rad, svg] of motifs)
    for (const dx of [-TW, 0, TW]) for (const dy of [-TH, 0, TH]) {
      const X = x + dx, Y = y + dy;
      if (X + rad > 0 && X - rad < TW && Y + rad > 0 && Y - rad < TH) tile += `<g transform="translate(${X} ${Y}) rotate(${rot})">${svg}</g>`;
    }
  tile = `<g opacity=".62">${tile}</g>`;

  // ---------- Keepsakes ----------
  const ORANGE = { c: ["#c4561c", "#de7428", "#ef8d36"] };
  const CREAM = { c: ["#d7c49c", "#e8dcbc", "#f3ead2"], stem: "#7a6a3a" };
  const STRIPE = { c: ["#d98f2c", "#e6a83c", "#efbb52"], stripe: "#5f6e2e", stem: "#5d5a24" };

  const pumpkins = pumpkin("autumn-pk1", 150, 121, 31, 26, CREAM) +
    leaf("maple", 116, 92, -70, 1.15, C.rust) + leaf("oak", 128, 84, -20, 1, C.ochre) +
    pumpkin("autumn-pk2", 82, 125, 56, 46, ORANGE) +
    `<path d="M88 42C97 35 106 39 104 46C102 51 95 49 98 44" fill="none" stroke="#6f6a2c" stroke-width="1.4" stroke-linecap="round"/>` +
    leaf("elm", 90, 38, 58, 0.95, C.olive) +
    pumpkin("autumn-pk3", 30, 127, 23, 18, STRIPE) +
    leaf("oak", 126, 126, 100, 1, C.ochre) + leaf("maple", 160, 127, 72, 0.85, C.red) +
    berries(58, 125, 5, 8, 1.1) + acorn(146, 121, 70, 0.9);

  const jugBody = "M50 188C34 186 30 170 32 156C34 138 46 128 52 118C54 112 50 108 46 104L38 98C50 101 62 102 72 102C84 102 92 101 99 100C94 106 92 112 94 118C100 128 112 138 112 156C114 170 110 186 94 188Z";
  let jugFlowers = "";
  for (const [x, y] of [[50, 140], [80, 132], [104, 150], [66, 164], [92, 176], [42, 174], [62, 186]]) {
    jugFlowers += `<g transform="translate(${x} ${y})" fill="#c4562a">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-2.6" rx="1.6" ry="2.6" transform="rotate(${a})"/>`).join("")}<circle r="1.2" fill="#e9b94f"/></g>` +
      `<path d="M${x + 3} ${y + 2}q4 1 6-2M${x - 3} ${y + 2}q-4 2-6 0" fill="none" stroke="#7d7a3a" stroke-width="1.1"/>`;
  }
  const jug = `<ellipse cx="74" cy="188" rx="44" ry="3" fill="#2a1a0c" opacity=".25"/>` +
    wheat(64, 100, 34, 40) + wheat(70, 100, 66, 30) + wheat(76, 100, 108, 40) +
    `<path d="M64 100Q46 84 26 70M78 100Q98 80 122 64M70 100Q70 70 70 44" fill="none" stroke="#6e5a2a" stroke-width="1.6"/>` +
    leaf("maple", 69, 42, 0, 1.3, C.orange) + leaf("maple", 40, 54, -42, 1.2, C.rust) + leaf("maple", 100, 50, 40, 1.2, C.ochre) +
    leaf("maple", 26, 74, -72, 1.05, C.red) + leaf("maple", 124, 68, 74, 1.05, C.orange) +
    leaf("oak", 54, 44, -14, 1, C.gold) + leaf("oak", 88, 40, 18, 1, C.rust) +
    leaf("oak", 28, 92, -104, 1, C.ochre) + leaf("elm", 122, 88, 106, 1, C.olive) + leaf("maple", 112, 82, 60, 0.95, C.red) + leaf("maple", 38, 80, -60, 0.95, C.orange) +
    berries(20, 60, 6, 12, 1.1) + berries(126, 50, 6, 14, 1.1) + berries(104, 96, 5, 16, 1) + berries(30, 82, 4, 22, 1) +
    daisy(54, 64, 11, "#b8481f", 8) + daisy(86, 56, 12, "#dc7a2e") + daisy(106, 76, 10.5, "#a3301d", 15) + daisy(40, 88, 9.5, "#d8a03a", 5) + daisy(72, 80, 11.5, "#c4562a", 20) + daisy(46, 34, 8, "#d8a03a", 10) +
    leaf("maple", 60, 98, -22, 0.9, C.gold) + leaf("oak", 82, 97, 28, 0.85, C.rust) + berries(56, 94, 5, 18, 1) + berries(88, 92, 4, 24, 1) +
    leaf("maple", 46, 102, -125, 0.9, C.rust) + leaf("oak", 100, 100, 125, 0.85, C.orange) +
    `<path d="M100 120C122 116 128 134 120 152C116 162 108 166 104 168L104 161C111 156 116 146 116 138C116 128 110 124 100 127Z" fill="#ede2c8" stroke="${OL}" stroke-width="1.1"/>` +
    `<path d="${jugBody}" fill="#efe4cc"/><clipPath id="autumn-jugc"><path d="${jugBody}"/></clipPath>` +
    `<g clip-path="url(#autumn-jugc)">${jugFlowers}<path d="M30 121H114" stroke="#b8481f" stroke-width="2.4"/><path d="M30 125H114" stroke="#b8481f" stroke-width=".8"/></g>` +
    `<path d="${jugBody}" fill="url(#pp-round)" stroke="${OL}" stroke-width="1.2"/>` +
    `<ellipse cx="69" cy="101" rx="28" ry="3.6" fill="#5a3a1c" stroke="${OL}" stroke-width="1"/>` +
    `<path d="M40 150C40 138 46 130 52 124" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;

  const brass = "#c4943c";
  const lantern = `<ellipse cx="46" cy="90" rx="30" ry="40" fill="#ffc95a" opacity=".55" filter="url(#pp-glow)"/>` +
    `<path d="M34 24C34 4 58 4 58 24" fill="none" stroke="${OL}" stroke-width="4.6"/><path d="M34 24C34 4 58 4 58 24" fill="none" stroke="${brass}" stroke-width="2.6"/>` +
    `<path d="M37 16C39 9 46 8 50 9" fill="none" stroke="#f3d68a" stroke-width="1" opacity=".8"/>` +
    `<circle cx="46" cy="23" r="3.6" fill="${brass}" stroke="${OL}"/>` +
    `<path d="M21 45C23 33 35 26 46 25C57 26 69 33 71 45Z" fill="${brass}"/><path d="M21 45C23 33 35 26 46 25C57 26 69 33 71 45Z" fill="url(#pp-round)" stroke="${OL}" stroke-width="1.1"/>` +
    `<g fill="#4a2c12">${[30, 38, 46, 54, 62].map(x => `<circle cx="${x}" cy="${x === 46 ? 36 : x === 38 || x === 54 ? 37 : 40}" r="1.3"/>`).join("")}</g>` +
    `<rect x="24" y="49" width="44" height="77" fill="url(#autumn-glass)"/>` +
    `<circle cx="46" cy="88" r="17" fill="#fff0b0" opacity=".9" filter="url(#pp-glow)"/>` +
    `<rect x="39" y="99" width="14" height="27" fill="#f4e6c8"/><rect x="39" y="99" width="14" height="27" fill="url(#pp-shade-x)"/>` +
    `<path d="M39 99.5H53V102C51 102 51 106 49.6 106C48.4 106 48.6 101.8 46 101.8C43.4 101.8 43 104 41.6 104C40.4 104 40 102 39 102Z" fill="#fffaf0"/>` +
    `<path d="M46 99.5V95" stroke="#2a1a0c" stroke-width="1"/>` +
    `<path d="M46 79C50.5 85 51.5 91 46 95C40.5 91 41.5 85 46 79Z" fill="#ffae3a"/><path d="M46 85C48 88 48 91.5 46 93C44 91.5 44 88 46 85Z" fill="#fff6cc"/>` +
    `<path d="M29 54L36 54L30 118L27 118Z" fill="#fff" opacity=".28"/>` +
    `<rect x="24" y="49" width="44" height="77" fill="none" stroke="#7a5420" stroke-width="1"/>` +
    `<rect x="20" y="46" width="6" height="82" fill="${brass}"/><rect x="66" y="46" width="6" height="82" fill="${brass}"/>` +
    `<rect x="20" y="46" width="6" height="82" fill="url(#pp-shade-x)" stroke="${OL}"/><rect x="66" y="46" width="6" height="82" fill="url(#pp-shade-x)" stroke="${OL}"/>` +
    `<rect x="17" y="42" width="58" height="7" rx="2" fill="${brass}"/><rect x="17" y="42" width="58" height="7" rx="2" fill="url(#pp-shade-x)" stroke="${OL}"/>` +
    `<rect x="17" y="125" width="58" height="7" rx="2" fill="${brass}"/><rect x="17" y="125" width="58" height="7" rx="2" fill="url(#pp-shade-x)" stroke="${OL}"/>` +
    `<path d="M22 132H70L66 151H26Z" fill="${brass}"/><path d="M22 132H70L66 151H26Z" fill="url(#pp-shade-x)" stroke="${OL}"/>` +
    `<path d="M30 140H62" stroke="#7a5420" stroke-width="1.2"/>` +
    `<rect x="19" y="151" width="54" height="8" rx="2" fill="${brass}"/><rect x="19" y="151" width="54" height="8" rx="2" fill="url(#pp-shade-x)" stroke="${OL}"/>` +
    `<path d="M22 159h8v4h-8zM62 159h8v4h-8z" fill="#7a5420" stroke="${OL}" stroke-width=".8"/>` +
    `<g transform="translate(22 162) scale(1 .55)">${leaf("maple", 0, 0, -78, 0.85, C.rust)}</g>` + acorn(83, 154, -20, 0.9);

  const bowlFront = "M8 96C10 111 30 117 70 117C110 117 130 111 132 96C120 102 100 104 70 104C40 104 20 102 8 96Z";
  const cones = `<ellipse cx="70" cy="119" rx="50" ry="2.6" fill="#2a1a0c" opacity=".28"/>` +
    `<path d="M92 92C96 64 104 40 116 10" fill="none" stroke="${TWIG}" stroke-width="1.8" stroke-linecap="round"/>` +
    leaf("oak", 104, 48, 35, 1.1, C.ochre) + leaf("oak", 112, 26, -20, 1, C.rust) + leaf("oak", 98, 66, -40, 1, C.olive) +
    acorn(110, 36, -30, 1) + acorn(118, 40, 20, 0.9) +
    `<ellipse cx="70" cy="96" rx="62" ry="8" fill="#5a3416" stroke="${OL}"/>` +
    pinecone(38, 100, 62, 30, -10) + apple(76, 74, 23) + leaf("elm", 81, 44, 50, 0.8, "#7f8a3a") +
    pinecone(92, 100, 40, 22, 72) + acorn(54, 92, -25) + acorn(64, 96, 35) + acorn(118, 95, 15) +
    `<path d="${bowlFront}" fill="#9a5e2c"/><path d="${bowlFront}" fill="url(#pp-shade-x)" stroke="${OL}" stroke-width="1.1"/>` +
    `<path d="M20 106C40 112 100 112 120 106M30 111C50 115 90 115 110 111" fill="none" stroke="#6a3c18" stroke-width=".8" opacity=".7"/>` +
    `<path d="M12 98C24 103 44 105 70 105" fill="none" stroke="#e8b878" stroke-width="1.2" opacity=".7"/>` +
    leaf("maple", 22, 98, -55, 0.9, C.orange) + berries(124, 98, 5, 21, 1);

  const bookSpine = (x, y, w, h, col, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${col}"/>` +
    `<path d="M${x + 12} ${y}v${h}M${x + 16} ${y}v${h}M${x + w - 16} ${y}v${h}M${x + w - 12} ${y}v${h}" stroke="#d9b25a" stroke-width="1.4"/>` +
    `<rect x="${x + w / 2 - 16}" y="${y + h / 2 - 5}" width="32" height="10" rx="1" fill="${label}" stroke="#d9b25a" stroke-width=".8"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#pp-shade)" stroke="${OL}" stroke-width="1.1"/>` +
    `<path d="M${x + 4} ${y + 2.5}H${x + w - 4}" stroke="#fff" stroke-width="1" opacity=".35"/>`;
  const cloth = "M70 66C86 64 108 64 124 66C134 68 140 82 141 98C142 110 146 118 150 124L106 124C104 114 102 102 96 92C88 82 80 76 70 66Z";
  let fringe = "";
  for (let x = 108; x <= 148; x += 3) fringe += `M${x} 124l${(x % 2) - 0.5} 4`;
  const books = `<ellipse cx="80" cy="125" rx="70" ry="3" fill="#2a1a0c" opacity=".28"/>` +
    bookSpine(6, 95, 128, 30, "#35513a", "#7a2a1c") + bookSpine(16, 66, 108, 29, "#8e3a22", "#2f4a3a") +
    pumpkin("autumn-pk4", 44, 67, 19, 14, ORANGE) +
    `<path d="M82 67C72 66 70 56 76 50C79 47 80 42 79 36C78 32 80 28 84 29" fill="#e8c24a"/>` +
    `<path d="M82 67C93 66 96 56 90 50C87 47 86 42 87 36C88 32 86 28 84 29" fill="#e2b740"/>` +
    `<path d="M82 67C72 66 70 56 76 50C79 47 80 42 79 36C78 32 80 28 84 29C88 28 88 32 87 36C86 42 87 47 90 50C96 56 93 66 82 67Z" fill="url(#pp-round)" stroke="${OL}" stroke-width="1.1"/>` +
    `<path d="M76 60C78 64 84 66 89 63" fill="none" stroke="#6f7a30" stroke-width="3" opacity=".6"/>` +
    `<path d="M84 29C84 25 86 22 89 21" fill="none" stroke="#5d5a24" stroke-width="2.2" stroke-linecap="round"/>` +
    leaf("maple", 58, 66, 80, 0.8, C.red) +
    `<path d="${cloth}" fill="url(#autumn-tartan)"/><path d="${cloth}" fill="url(#pp-shade-x)" stroke="${OL}" stroke-width="1.1"/>` +
    `<path d="M120 70C128 84 130 100 134 120M112 92C116 104 118 112 120 123" fill="none" stroke="#2a0e08" stroke-width="2.2" opacity=".35"/>` +
    `<path d="M74 68C90 66 110 66 122 68" fill="none" stroke="#fff" stroke-width="1.2" opacity=".3"/>` +
    `<path d="${fringe}" stroke="#a8261d" stroke-width="1.2"/>` +
    leaf("oak", 20, 125, 78, 0.8, C.ochre);

  // ---------- Wall pieces ----------
  const frame = `<path d="M44 12L60 2L76 12" fill="none" stroke="#6a4a2a" stroke-width="1"/><circle cx="60" cy="2.4" r="1.6" fill="#5a4030"/>` +
    `<rect x="1" y="10" width="118" height="93" rx="2" fill="#7a4a22" stroke="${OL}" stroke-width="1.2"/><rect x="5" y="14" width="110" height="85" fill="#c8923f"/>` +
    `<path d="M5 14H115L107 22H13Z" fill="#f4cf78" opacity=".6"/><path d="M115 14V99L107 91V22Z" fill="#000" opacity=".18"/>` +
    `<path d="M5 99H115L107 91H13Z" fill="#000" opacity=".3"/><path d="M5 14V99L13 91V22Z" fill="#fff" opacity=".22"/>` +
    `<rect x="13" y="22" width="94" height="69" fill="url(#autumn-sky)"/><circle cx="86" cy="38" r="7" fill="#fff0c8" opacity=".9"/>` +
    `<path d="M13 60C28 50 42 55 56 49C70 44 88 51 107 46V91H13Z" fill="#c4a58e"/>` +
    `<path d="M13 69C32 61 52 66 70 60C84 56 96 60 107 57V91H13Z" fill="#c38c40"/>` +
    `<g stroke="${OL}" stroke-width=".6" stroke-opacity=".6">` +
    [[22, 64, 5, "#d9762a"], [28, 62, 4, "#b0401f"], [60, 61, 5, "#e2a83a"], [66, 60, 4, "#d9762a"], [76, 58, 4.5, "#b0401f"], [52, 64, 3.5, "#9a8a3a"]]
      .map(([x, y, r, c]) => `<path d="M${x} ${y}v${r + 3}" stroke="#4a2c12" stroke-width="1"/><circle cx="${x}" cy="${y - 1}" r="${r}" fill="${c}"/>`).join("") + `</g>` +
    `<path d="M33 66h12v7H33z" fill="#9b2f1e" stroke="${OL}" stroke-width=".6"/><path d="M32 66l7-6 7 6z" fill="#5a2a18"/><path d="M38 73v-4h2.5v4" fill="#3a1a10"/>` +
    `<path d="M13 78C40 71 70 76 107 69V91H13Z" fill="#8f8a3e"/>` +
    `<path d="M20 84C44 78 72 80 106 74M16 88C44 83 76 85 106 79" fill="none" stroke="#d6b45a" stroke-width="1" opacity=".7"/>` +
    `<path d="M56 80C56 74 66 74 66 80Z" fill="#dcae4a" stroke="${OL}" stroke-width=".6"/><path d="M68 79C68 74 76 74 76 79Z" fill="#d6a040" stroke="${OL}" stroke-width=".6"/>` +
    `<path d="M95 91V66M95 74L90 68M95 72L100 66" stroke="#4a2c12" stroke-width="1.6"/>` +
    `<g stroke="${OL}" stroke-width=".6" stroke-opacity=".6"><circle cx="90" cy="60" r="8" fill="#b5441f"/><circle cx="100" cy="58" r="7" fill="#d9762a"/><circle cx="95" cy="51" r="7" fill="#e2a83a"/></g>` +
    `<rect x="13" y="22" width="94" height="69" fill="none" stroke="#4a2c12" stroke-width="1.4"/>` +
    `<rect x="1" y="10" width="118" height="93" rx="2" fill="url(#pp-sheen)"/>`;

  // Grapevine ring of loose arcs, two layers of leaves following it clockwise, a twine bow on top.
  const WX = 56, WY = 58, WR = 32, wrn = rng(404), WC = [C.orange, C.rust, C.ochre, C.red, C.gold, C.olive, C.orange];
  let vine = "", ring = "";
  for (let i = 0; i < 7; i++) {
    const r = WR - 3 + wrn() * 6, a0 = wrn() * 6.28, a1 = a0 + 3.4 + wrn() * 1.8;
    vine += `<path d="M${r1(WX + Math.cos(a0) * r)} ${r1(WY + Math.sin(a0) * r)}A${r1(r)} ${r1(r)} 0 1 1 ${r1(WX + Math.cos(a1) * r)} ${r1(WY + Math.sin(a1) * r)}" stroke="${i % 2 ? "#8a5e34" : TWIG}" stroke-width="${r1(1.2 + wrn())}"/>`;
  }
  for (let i = 0; i < 24; i++) {
    const out = i % 2 ? 1 : -1, a = (i / 24 + wrn() * 0.015) * 360, R = WR + out * 4, ar = a * Math.PI / 180;
    ring += leaf(["maple", "oak", "maple", "elm"][i % 4], WX + Math.cos(ar) * R, WY + Math.sin(ar) * R, a + 180 - 40 * out, 0.85 + wrn() * 0.2, WC[i % 7]);
  }
  const wreath = `<path d="M56 24V2" stroke="#a88a5a" stroke-width="1.2"/><circle cx="56" cy="2.2" r="1.8" fill="#5a4030"/>` +
    `<g fill="none" stroke-linecap="round">${vine}</g>` + ring +
    berries(24, 44, 7, 31, 1.1) + berries(92, 72, 7, 33, 1.1) + berries(66, 92, 6, 35, 1.1) + berries(28, 82, 6, 37, 1.1) + berries(84, 32, 5, 39, 1) +
    acorn(92, 50, 20) + acorn(22, 64, -30) + acorn(76, 90, 60, 0.9) + pinecone(44, 92, 26, 16, -62) +
    `<path d="M55 28C51 34 50 40 45 46M57 28C61 34 63 40 67 45" fill="none" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/>` +
    `<path d="M55 28C51 34 50 40 45 46M57 28C61 34 63 40 67 45" fill="none" stroke="#c99e5e" stroke-width="2.2" stroke-linecap="round"/>` +
    `<g stroke="${OL}" stroke-width=".9" fill="#c99e5e"><path d="M56 26C46 15 37 19 39 26C41 32 51 30 56 26Z"/><path d="M56 26C66 15 75 19 73 26C71 32 61 30 56 26Z"/><circle cx="56" cy="26.5" r="3.2"/></g>` +
    `<path d="M42 24C45 21 50 22 53 25M70 24C67 21 62 22 59 25" fill="none" stroke="#f0d49a" stroke-width=".9" opacity=".8"/>`;

  // ---------- Perches ----------
  const sq = { body: "#c25a22", dark: "#9a3e14", cream: "#f2dcb0" };
  const squirrel = `<path d="M34 44C46 44 56 36 56 24C56 12 50 3 41 3C34 3 31 9 34 13C36 16 40 15 41 12C45 14 47 20 45 28C43 35 37 38 31 40Z" fill="#b44e1c"/>` +
    `<path d="M34 44C46 44 56 36 56 24C56 12 50 3 41 3C34 3 31 9 34 13C36 16 40 15 41 12C45 14 47 20 45 28C43 35 37 38 31 40Z" fill="url(#pp-round)" stroke="${OL}" stroke-width="1"/>` +
    `<path d="M50 30C53 24 52 14 46 8M44 38C49 34 50 28 49 22M38 6C42 5 46 7 48 10" fill="none" stroke="#efa060" stroke-width="1" stroke-linecap="round" opacity=".8"/>` +
    `<path d="M20 44C14 42 14 34 18 28C21 23 26 22 30 24C38 27 44 34 42 41C41 45 34 46 28 46Z" fill="${sq.body}"/>` +
    `<path d="M17 31C16 36 18 42 22 44C24 40 24 34 22 28Z" fill="${sq.cream}"/>` +
    `<path d="M20 44C14 42 14 34 18 28C21 23 26 22 30 24C38 27 44 34 42 41C41 45 34 46 28 46Z" fill="url(#pp-round)" stroke="${OL}" stroke-width="1"/>` +
    `<path d="M28 42C26 36 30 31 36 32C41 34 42 40 39 43" fill="${sq.dark}" opacity=".45"/>` +
    `<path d="M17 11L18 4L22 8Z" fill="${sq.dark}" stroke="${OL}" stroke-width=".8"/>` +
    `<path d="M10 21C7 19 8 15 11 13C13 10 18 9 22 10C27 11 29 16 28 21C27 25 22 27 18 26C14 26 11 24 10 21Z" fill="${sq.body}"/>` +
    `<ellipse cx="14" cy="22" rx="4" ry="2.6" fill="${sq.cream}"/>` +
    `<path d="M10 21C7 19 8 15 11 13C13 10 18 9 22 10C27 11 29 16 28 21C27 25 22 27 18 26C14 26 11 24 10 21Z" fill="url(#pp-round)" stroke="${OL}" stroke-width="1"/>` +
    `<path d="M21 11L23 2L26 4.5L26.5 11Z" fill="${sq.body}" stroke="${OL}" stroke-width=".8"/><path d="M23 2.5L22 0M24 3L25 .4" stroke="${sq.dark}" stroke-width=".8"/>` +
    `<circle cx="15.5" cy="16" r="1.8" fill="#1c120a"/><circle cx="15" cy="15.4" r=".6" fill="#fff"/><circle cx="8.6" cy="18.6" r="1.1" fill="#2a1a0c"/>` +
    acorn(12, 28, -10, 0.72) +
    `<g fill="${sq.body}" stroke="${OL}" stroke-width=".8"><ellipse cx="14.5" cy="28.5" rx="2.6" ry="2"/><ellipse cx="15.5" cy="32" rx="2.6" ry="2"/></g>` +
    `<g fill="${sq.dark}" stroke="${OL}" stroke-width=".8"><ellipse cx="21" cy="44.4" rx="4.6" ry="1.6"/><ellipse cx="33" cy="44.6" rx="4.4" ry="1.4"/></g>`;

  const robin = `<path d="M28 22L41 27L39 30.5L27 26Z" fill="#6b5236" stroke="${OL}" stroke-width=".9"/>` +
    `<ellipse cx="22" cy="20" rx="13" ry="11" fill="#8a6a44"/><circle cx="13" cy="12" r="8" fill="#8a6a44"/>` +
    `<path d="M6 11C4.5 18 8 26 15 29C20.5 30.5 24 26 22 21C20 16 17 12 13 9.5C10 8.5 7 9 6 11Z" fill="#d9592a"/>` +
    `<path d="M15 29C20 31.5 28 30.5 31.5 25C28 28 22 29 18 27Z" fill="#f1e2c6"/>` +
    `<path d="M20 15C28 13 35 18 34 25C30 27 24 25 20 15Z" fill="#6e5434" stroke="${OL}" stroke-width=".7"/>` +
    `<path d="M24 18C27 20 29 22 30 25M27 16.5C30 18.5 32 21 32.5 24" fill="none" stroke="#c9a878" stroke-width=".7" opacity=".7"/>` +
    `<path d="M22 9C22 9 30 9 34 18C35 26 30 31 22 31C14 31 8 27 6 20C4.5 14 7 5 13 4C18 3.5 21 6 22 9Z" fill="url(#pp-round)" stroke="${OL}" stroke-width="1"/>` +
    `<path d="M5.5 11L1.2 12.4L5.4 14Z" fill="#3a2a1a"/><circle cx="9.6" cy="10.4" r="1.5" fill="#1c120a"/><circle cx="9.1" cy="9.9" r=".5" fill="#fff"/>` +
    `<path d="M18 29.5L17 34M23.5 30L23.5 34M14.5 34H20M21 34H26.5" stroke="#4a3020" stroke-width="1" stroke-linecap="round"/>`;

  // ---------- Nameplate: kraft harvest tag with twine and a little leaf ----------
  const plate = (w, h) => {
    const c = r1(h * 0.3), hole = r1(h * 0.2 + 2), m = h / 2, body = `M${r1(1 + c)} 1H${w - 1}V${h - 1}H${r1(1 + c)}L1 ${r1(h - 1 - c)}V${r1(1 + c)}Z`;
    const s = h / 50;
    return `<path d="${body}" fill="#dcc196" stroke="#8a6236" stroke-width="1"/>` +
      `<path d="M${r1(4 + c)} 4H${w - 4}V${h - 4}H${r1(4 + c)}L4 ${r1(h - 4 - c)}V${r1(4 + c)}Z" fill="none" stroke="#8a6236" stroke-width=".8" stroke-dasharray="3 2.2" opacity=".5"/>` +
      `<path d="${body}" fill="url(#pp-sheen)" opacity=".45"/>` +
      `<circle cx="${hole}" cy="${m}" r="${r1(h * 0.06 + 0.8)}" fill="#f4e9d6" stroke="#8a6236" stroke-width=".9"/>` +
      `<path d="M${hole} ${m}C${r1(hole - 3)} ${r1(m - 1)} 2 ${r1(m - 3)} 0 ${r1(m - 4.5)}M${hole} ${m}C${r1(hole - 3)} ${r1(m + 1)} 2 ${r1(m + 3)} 0 ${r1(m + 4.5)}" fill="none" stroke="#a07a44" stroke-width="1.5" stroke-linecap="round"/>` +
      leaf("maple", w - 9 * s - 3, 13 * s + 2, 35, 0.55 * s, C.rust) + berries(w - 22 * s - 3, 7 * s + 2, 3, 5, 0.7 * s);
  };

  registerTheme({
    id: "autumn",
    name: "Autumn Harvest",
    blurb: "Maple-leaf wallpaper, honey oak shelves, pumpkins, a lantern and a squirrel.",
    dark: false,
    wall: { base: "#f4e9d6", tile: { w: TW, h: TH, svg: tile } },
    wood: { h: 20, top: "#dcae6c", face: "#c48a46", grain: "#8c5824", dark: "#6a3e16" },
    plate,
    plateInk: "#3a2312",
    ornaments: [
      { id: "autumn-pumpkins", label: "Pumpkin trio", w: 184, h: 130, at: "shelf", svg: pumpkins },
      { id: "autumn-jug", label: "Flower jug", w: 152, h: 190, at: "shelf", svg: jug },
      { id: "autumn-lantern", label: "Brass lantern", w: 92, h: 164, at: "shelf", svg: lantern },
      { id: "autumn-cones", label: "Pinecones and apple", w: 140, h: 120, at: "shelf", svg: cones },
      { id: "autumn-books", label: "Tartan book stack", w: 156, h: 128, at: "shelf", svg: books },
      { id: "autumn-frame", label: "Autumn landscape", w: 120, h: 104, at: "wall", svg: frame },
      { id: "autumn-wreath", label: "Leaf wreath", w: 112, h: 112, at: "wall", svg: wreath },
      { id: "autumn-squirrel", label: "Red squirrel", w: 58, h: 46, at: "perch", svg: squirrel },
      { id: "autumn-robin", label: "Robin", w: 42, h: 34, at: "perch", svg: robin }
    ],
    defs: `<pattern id="autumn-tartan" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="16" height="16" fill="#a8261d"/>` +
      `<rect y="5" width="16" height="5" fill="#33402a" opacity=".55"/><rect x="5" width="5" height="16" fill="#33402a" opacity=".55"/>` +
      `<rect x="12.5" width=".9" height="16" fill="#e8b54a" opacity=".75"/><rect y="12.5" width="16" height=".9" fill="#e8b54a" opacity=".75"/>` +
      `<rect x="1.5" width=".6" height="16" fill="#1e1a2a" opacity=".6"/><rect y="1.5" width="16" height=".6" fill="#1e1a2a" opacity=".6"/></pattern>` +
      `<radialGradient id="autumn-glass" cx=".5" cy=".52" r=".62"><stop offset="0" stop-color="#fff4c4"/><stop offset=".45" stop-color="#f4c463"/><stop offset="1" stop-color="#a86c26"/></radialGradient>` +
      `<linearGradient id="autumn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3cf98"/><stop offset=".6" stop-color="#f8e2b8"/><stop offset="1" stop-color="#f2d29a"/></linearGradient>`
  });
})();
