// Autumn Harvest: oak leaves on the wall, rough-sawn live-edge shelves, a hedgehog and pumpkins.
(() => {
  const ink = K.ink, paper = K.paper;
  const LEAF = "M0 0C2-3 4-2 5-4C6-7 9-5 10-6C11-9 14-7 15-7C17-9 19-6 20-5C22-5 24-2 24 0C24 2 22 5 20 5C19 6 17 9 15 7C14 7 11 9 10 6C9 5 6 7 5 4C4 2 2 3 0 0Z";
  const VEIN = "M-3 0H21M8 0L10-4M8 0L10 4M14 0L15.5-5M14 0L15.5 5";
  // Oak leaf pointing along +x from its stem at (x, y).
  const leaf = (x, y, rot, s, { stroke = ink, fill = paper, hatch = "url(#h-diag-fine)", width = 0.8 } = {}) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    `<path d="${LEAF}" fill="${fill}" stroke="${stroke}" stroke-width="${width / s}"/>` +
    (hatch ? `<path d="M0 0C4 2 5 4 5 4C6 7 9 5 10 6C11 9 14 7 15 7C17 9 19 6 20 5C22 5 24 2 24 0Z" fill="${hatch}"/>` : "") +
    `<path d="${VEIN}" fill="none" stroke="${stroke}" stroke-width="${width * 0.7 / s}"/></g>`;
  const acorn = (x, y, rot, s, stroke = ink, capFill = "url(#h-cross)") =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    `<path d="M-3.6 0C-3.6 5-1 8 0 9C1 8 3.6 5 3.6 0Z" fill="${paper}" stroke="${stroke}" stroke-width="${0.8 / s}"/>` +
    `<path d="M-4.5 0C-4.5-3.8 4.5-3.8 4.5 0Z" fill="${paper}" stroke="${stroke}" stroke-width="${0.8 / s}"/>` +
    `<path d="M-4.5 0C-4.5-3.8 4.5-3.8 4.5 0Z" fill="${capFill}"/>` +
    `<path d="M0-2.8V-5.5" stroke="${stroke}" stroke-width="${0.9 / s}"/></g>`;
  // Apple with its stem at (x, y); about 14 x 16 at scale 1.
  const apple = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path d="M0 0C-6-1-8 5-6 9C-4 13 0 12 0 12S4 13 6 9C8 5 6-1 0 0Z" fill="${paper}" stroke="${ink}" stroke-width="${1.1 / s}"/>` +
    `<path d="M3 0.5C7 2 7 8 4.5 11C5.5 7 5 3 3 0.5Z" fill="url(#h-diag)"/>` +
    `<path d="M-3.6 2.8C-4.8 4.2-5 6-4.4 7.6" fill="none" stroke="${ink}" stroke-width="${0.5 / s}"/>` +
    `<path d="M0 0.5Q0.5-2.5 2-3.5" fill="none" stroke="${ink}" stroke-width="${1 / s}"/></g>`;
  // Dashed drift line that shows a leaf is still falling.
  const drift = d => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.4 1.6"/>`;

  // Woodcut hedgehog: black body, spines carved out in paper lines, an apple caught on its back.
  const hedgehog = (() => {
    const cx = 46, by = 49, rx = 30, ry = 30, n = 22, rand = rng(911);
    let spikes = "";
    for (let i = 0; i <= n * 2; i++) {
      const a = Math.PI + Math.PI * i / (n * 2), f = i % 2 ? 1.13 : 0.97;
      spikes += `${i ? "L" : "M"}${r1(cx + rx * f * Math.cos(a))} ${r1(by + ry * f * Math.sin(a))}`;
    }
    let carved = "";
    for (const f of [0.86, 0.68, 0.5, 0.32]) {
      const steps = Math.round(18 * f);
      for (let i = 1; i < steps; i++) {
        const a = Math.PI * (1.06 + 0.86 * i / steps) + (rand() - 0.5) * 0.08;
        const r0 = f, r2 = f + 0.13;
        carved += `M${r1(cx + rx * r0 * Math.cos(a))} ${r1(by + ry * r0 * Math.sin(a))}L${r1(cx + rx * r2 * Math.cos(a + 0.05))} ${r1(by + ry * r2 * Math.sin(a + 0.05))}`;
      }
    }
    return `<path d="${spikes}Z" fill="${ink}" stroke="${ink}" stroke-width="1"/>
<path d="${carved}" stroke="${paper}" stroke-width="0.9" stroke-linecap="round"/>
${leaf(64, 30, -35, 0.5)}
${apple(48, 4.5, 0.95)}${leaf(49.5, 1.4, -20, 0.32)}
<path d="M25 29C17 32 10 36 4 40C2 41.6 2.6 45 5 45.8L30 49Z" fill="${paper}" stroke="${ink}" stroke-width="1.3" stroke-linejoin="round"/>
<path d="M24 31l-2 3 3 0-2 3.4 3 .2-1.5 3.6 3 .4-1 3.6" fill="none" stroke="${ink}" stroke-width="0.7"/>
<path d="M14 44.5C18 44 23 44.8 28 46.5V49L8 47Z" fill="url(#h-diag-fine)"/>
<path d="M20.5 33.5C21 30.5 24.6 30.2 25 33" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<circle cx="3.8" cy="42.6" r="1.9" fill="${ink}"/><circle cx="3.2" cy="42" r="0.5" fill="${paper}"/>
<path d="M5 41.2L0.8 38.4M5.2 43.6L0.6 44.2M5.4 44.6L1.2 47" stroke="${ink}" stroke-width="0.4"/>
<circle cx="13.8" cy="37.4" r="1.7" fill="${ink}"/><circle cx="13.2" cy="36.8" r="0.55" fill="${paper}"/>
<path d="M6 45.4Q9 46.8 11.6 45.4" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M13 49.5C13.5 47 16.5 46.6 17.5 49.2Z" fill="${ink}"/>
<ellipse cx="25" cy="49.6" rx="3.2" ry="1.6" fill="${ink}"/><ellipse cx="60" cy="49.6" rx="3.2" ry="1.6" fill="${ink}"/>
<g transform="translate(66 50.6) scale(1 0.45)">${leaf(0, 0, -6, 0.42)}</g>`;
  })();

  // Pumpkin, gourd and a field mouse peeking out from behind the gourd.
  const mouse = `
<path d="M57 51.2Q53.5 52.4 50.5 50.8" fill="none" stroke="${ink}" stroke-width="0.7"/>
<path d="M70 41.5C73 39.5 77.5 40.5 81 45.2C77.5 48 73 49.4 70 48Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M74 47.6C76.5 47.4 79 46.6 81 45.2C79 47.6 76.5 48.6 74 48.4Z" fill="url(#h-diag-fine)"/>
<circle cx="72.6" cy="40.4" r="2.8" fill="${paper}" stroke="${ink}" stroke-width="0.9"/><circle cx="72.8" cy="40.6" r="1.3" fill="url(#h-diag-fine)"/>
<circle cx="76.2" cy="43.6" r="0.85" fill="${ink}"/><circle cx="81.2" cy="45.2" r="0.8" fill="${ink}"/>
<path d="M80.5 45.6L83.6 43.8M80.6 46.1L83.8 46.6M80.2 46.6L83 48.6" stroke="${ink}" stroke-width="0.35"/>`;
  const pumpkins = `${mouse}
<path d="M63 51C53 51 51 43 55.5 38C58.5 35 59.5 31 60 25C60 21 64 21 64 25C64.5 31 65.5 35 68.5 38C73 43 71 51 63 51Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M64.5 31C65.5 35 68.5 38 68.5 38C73 43 71 51 63 51C67 46 67.5 38 64.5 31Z" fill="url(#h-diag)"/>
<path d="M61.6 26C61 34 58 42 58.4 50M62.4 30C62.6 38 62 44 62.2 50.4" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.6 1.4"/>
<path d="M61 22Q62 17 64.5 16L65 18Q63.5 19 63.5 22Z" fill="${ink}"/>
<path d="M24 18C20 15.5 16.5 14.5 13 14.6" fill="none" stroke="${ink}" stroke-width="0.8"/>${leaf(13, 14.6, -165, 0.5)}
<ellipse cx="12" cy="35" rx="11" ry="15" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<ellipse cx="40" cy="35" rx="11" ry="15" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<ellipse cx="40" cy="35" rx="11" ry="15" fill="url(#h-diag)"/>
<ellipse cx="18" cy="35" rx="10" ry="15.6" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<ellipse cx="34" cy="35" rx="10" ry="15.6" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<ellipse cx="34" cy="35" rx="10" ry="15.6" fill="url(#h-diag-fine)"/>
<ellipse cx="26" cy="35" rx="9" ry="16" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M20.5 25C20 29 20 34 21 39M9 24.5C7.5 29 7.5 37 9.5 43" fill="none" stroke="${paper}" stroke-width="1.2"/>
<path d="M23.5 21C23 15 25 11 29 8L31.5 10C28.5 13 27.5 16 28 21Z" fill="${ink}"/>
<path d="M28.5 12C33 7 37.5 11 34.5 14C32.5 15.8 30.5 14 32.2 12.4" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M22 24C20.5 30 20.5 40 22 46" fill="none" stroke="${ink}" stroke-width="0.5"/>`;

  const basket = (() => {
    const xl = y => 10 + 6 * (y - 36) / 26, xr = y => 76 - 6 * (y - 36) / 26;
    let weave = "";
    [40, 46, 52, 58].forEach((y, row) => {
      for (let x = xl(y) + 3 + (row % 2) * 3; x < xr(y) - 2; x += 6)
        weave += `<ellipse cx="${r1(x)}" cy="${y}" rx="2.2" ry="2.6" fill="none" stroke="${ink}" stroke-width="0.6"/>`;
    });
    return `
<path d="M16 34C16 4 70 4 70 34" fill="none" stroke="${ink}" stroke-width="3.2"/>
<path d="M16 34C16 4 70 4 70 34" fill="none" stroke="${paper}" stroke-width="1.2"/>
<path d="M10 36H76L70 62H16Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
${weave}
<path d="M58 36H76L70 62H56Z" fill="url(#h-diag)"/>
${apple(29, 21)}${apple(42, 18)}${apple(55, 21)}
<path d="M44 18.5C47 15 51 15 52 16C49 18 47 19 44 18.5Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<rect x="7" y="31.5" width="72" height="5" rx="2.5" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="8" y="32.2" width="70" height="3.6" rx="1.8" fill="url(#h-back)"/>
<path d="M58 33C66 30 78 31 82 35L85 60C81 62 77 59 73 61L74 40C70 37 64 36 58 35.5Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M58 33C66 30 78 31 82 35L85 60C81 62 77 59 73 61L74 40C70 37 64 36 58 35.5Z" fill="url(#h-cross)"/>
<path d="M77.5 35.5L79 59.5M81.5 37L83 60M74.2 45.5L84 44.5M74 53L84.6 52.5M61 34.4C67 32.4 75 32.6 80 35.6" fill="none" stroke="${ink}" stroke-width="1.6"/>
<path d="M74 61l-0.6 2.6M76 60.4l-0.4 2.6M78 60.2v2.6M80 60.5l0.4 2.6M82 61l0.6 2.4M84.4 60.6l0.8 2.2" stroke="${ink}" stroke-width="0.7"/>
${apple(8, 50.5, 0.9)}
${drift("M21 9.5C24 6 22 3 25 1.5")}${leaf(20, 12, 100, 0.36)}`;
  })();

  const jug = `
<path d="M30 40C28 32 23 26 17 21M30 40C32 31 38 25 45 21M30 40C30 31 31 24 32 17" fill="none" stroke="${ink}" stroke-width="1.1"/>
${leaf(17, 21, -125, 0.65)}${leaf(45, 21, -50, 0.65)}${leaf(32, 17, -85, 0.55)}${leaf(23, 29, 172, 0.5)}${leaf(38, 27, 8, 0.5)}
<g fill="${ink}"><circle cx="25.5" cy="24.5" r="1.5"/><circle cx="27.4" cy="22.4" r="1.5"/><circle cx="24.4" cy="21.6" r="1.5"/><circle cx="37" cy="21.5" r="1.5"/><circle cx="39.2" cy="19.6" r="1.5"/><circle cx="36.4" cy="18.4" r="1.5"/></g>
<g fill="${paper}"><circle cx="25" cy="24" r="0.45"/><circle cx="36.5" cy="21" r="0.45"/></g>
<path d="M38 46C52 44 54 62 43 68" fill="none" stroke="${ink}" stroke-width="3"/>
<path d="M38 46C52 44 54 62 43 68" fill="none" stroke="${paper}" stroke-width="1.2"/>
<path d="M19 94C11 82 11 64 19 54C22 50 23 46 22 42H38C37 46 38 50 41 54C49 64 49 82 41 94Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M22 42H38C37 46 38 50 41 54C43 57 44 59 45 62C41 60 37 64 32 61C27 64 22 60 15 62C16 59 17 57 19 54C22 50 23 46 22 42Z" fill="url(#h-cross)"/>
<path d="M37 56C44 60 46 72 45 80C44 87 43 90 41 94H35C40 84 41 68 37 56Z" fill="url(#h-diag)"/>
<path d="M16.5 70C15.6 76 16 83 18 88" fill="none" stroke="${paper}" stroke-width="1.4"/>
<rect x="20" y="38.5" width="20" height="4.5" rx="2" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<circle cx="30" cy="78" r="4.6" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M30 74.5L31 77.5H34L31.5 79.3L32.5 82.3L30 80.5L27.5 82.3L28.5 79.3L26 77.5H29Z" fill="${ink}"/>
${drift("M47 36C52 40 50 45 53 49")}${leaf(52, 51, 70, 0.4)}
<line x1="12" y1="94.4" x2="48" y2="94.4" stroke="${ink}" stroke-width="0.9"/>`;

  // Toadstools on a mossy mound, with a fallen acorn.
  const mushrooms = `
<path d="M3 22C3 9 33 9 33 22C26 24 10 24 3 22Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M18 12.3C27 12.4 33 16 33 22C29 23.4 24 23.8 20 24C22.5 20 21.5 15 18 12.3Z" fill="url(#h-diag)"/>
<g fill="${paper}" stroke="${ink}" stroke-width="0.6"><circle cx="10.5" cy="16.5" r="2.2"/><circle cx="17.5" cy="13.8" r="1.6"/><circle cx="25" cy="17.5" r="2"/><circle cx="13.5" cy="20.6" r="1.3"/><circle cx="29.5" cy="20.2" r="1.1"/></g>
<path d="M4.5 22.5C11 25.4 25 25.4 31.5 22.5" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M8 23.6L14 24.6M11 24.4L15.6 25M25 24.4L20.4 25M28 23.6L22 24.6" stroke="${ink}" stroke-width="0.4"/>
<path d="M14.5 24.6C14 30 13.5 34 12.5 38H23.5C22.5 34 22 30 21.5 24.6Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M19.5 25C20 30 20.5 34 21.5 38H23.5C22.5 34 22 30 21.5 25Z" fill="url(#h-vert)"/>
<path d="M14.2 28.2C16 29.8 20 29.8 21.8 28.2" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M29 31C29 22.5 47 22.5 47 31C42 32.6 34 32.6 29 31Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M39.5 24.6C44 25.5 47 27.8 47 31C44.5 31.8 42 32.2 40 32.3C41.5 29.5 41.5 27 39.5 24.6Z" fill="url(#h-diag)"/>
<g fill="${paper}" stroke="${ink}" stroke-width="0.6"><circle cx="34" cy="27" r="1.5"/><circle cx="38.5" cy="25.6" r="1.1"/></g>
<path d="M35.5 32C35.2 35 35 37 34.6 39H41.4C41 37 40.8 35 40.5 32Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M46.4 35.4C46.4 31.4 53 31.4 53 35.4Z" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.9"/>
<path d="M48.8 35.4V39.4H50.6V35.4" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M0.8 40C2 36.4 10 35.6 18 37.2C26 35.4 40 35.6 48 37.6C51 37.9 53 38.8 53.4 40Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M0.8 40C2 36.4 10 35.6 18 37.2C26 35.4 40 35.6 48 37.6C51 37.9 53 38.8 53.4 40Z" fill="url(#h-dots-dense)"/>
<path d="M5.5 37.2l-1.6-4M7.8 36.8l0.6-4.4M10 36.6l2-3.4M43.5 37.2l1.4-3.8M45.6 37.6l2.6-3" stroke="${ink}" stroke-width="0.7"/>
${acorn(27, 36.6, 76, 0.75)}`;

  // Wheat sheaf tied with twine; a harvest mouse climbs one stalk.
  const sheaf = (() => {
    const ear = (x, y, rot, dark) => {
      let g = "";
      for (let i = 0; i < 6; i++) {
        const side = i % 2 ? 1 : -1, yy = r1(-i * 2.8);
        g += `<ellipse cx="${side * 1.5}" cy="${yy}" rx="1.5" ry="2.6" transform="rotate(${side * 22} ${side * 1.5} ${yy})" fill="${dark ? ink : paper}" stroke="${ink}" stroke-width="0.6"/>` +
          `<path d="M${side * 2} ${r1(yy - 1.5)}L${side * 3.6} ${r1(yy - 7)}" stroke="${ink}" stroke-width="0.4"/>`;
      }
      return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot})">${g}</g>`;
    };
    let stalksTop = "", ears = "", stalksBottom = "";
    for (let i = 0; i < 9; i++) {
      const a = -16 + i * 4, rad = a * Math.PI / 180, L = 28 + (i % 3) * 3, x0 = 22 + (i - 4) * 0.8;
      const ex = x0 + L * Math.sin(rad), ey = 64 - L * Math.cos(rad);
      stalksTop += `M${r1(x0)} 64L${r1(ex)} ${r1(ey)}`;
      ears += ear(ex, ey, a, i % 2 === 1);
      stalksBottom += `M${r1(x0)} 64L${r1(22 + (i - 4) * 3.6)} 101.4`;
    }
    const ends = Array.from({ length: 9 }, (_, i) => `<ellipse cx="${r1(22 + (i - 4) * 3.6)}" cy="101.6" rx="1.3" ry="0.7" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>`).join("");
    return `<g transform="translate(2 0)"><path d="${stalksTop}" stroke="${ink}" stroke-width="0.8"/>${ears}
<path d="${stalksBottom}" stroke="${ink}" stroke-width="0.9"/>
<path d="M27 70L32 101M29 66L36 100" stroke="${ink}" stroke-width="0.4"/>${ends}
<path d="M15 61.5Q22 59.5 29 61.5V66Q22 64 15 66Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M17 61.2l2 4.2M20 60.6l2 4.4M23 60.6l2 4.2M26 61l2 4" stroke="${ink}" stroke-width="0.5"/>
<path d="M22 63C17 57 12 60 15 63.5C17 65 20 64.5 22 63ZM22 63C27 57 32 60 29 63.5C27 65 24 64.5 22 63Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M21 64L16.5 72.5M23 64L27.5 71.6" stroke="${ink}" stroke-width="1"/>
<g transform="translate(31.5 47) rotate(-62)"><path d="M-4.5 0.6C-8 2.6-8 6-4.8 6.6" fill="none" stroke="${ink}" stroke-width="0.6"/>
<ellipse cx="0" cy="0" rx="4.2" ry="2.6" fill="${paper}" stroke="${ink}" stroke-width="0.9"/><ellipse cx="0.5" cy="1" rx="3" ry="1.3" fill="url(#h-diag-fine)"/>
<circle cx="4" cy="-0.4" r="2" fill="${paper}" stroke="${ink}" stroke-width="0.8"/><circle cx="3" cy="-2.4" r="1.3" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<circle cx="4.7" cy="-0.8" r="0.5" fill="${ink}"/><circle cx="6" cy="-0.1" r="0.45" fill="${ink}"/></g>
<line x1="4" y1="103.3" x2="40" y2="103.3" stroke="${ink}" stroke-width="0.9"/></g>`;
  })();

  const garland = (() => {
    const at = t => [2 * (1 - t) ** 2 + 60 * t * (1 - t) + 58 * t * t, 3 * (1 - t) ** 2 + 32 * t * (1 - t) + 3 * t * t];
    let items = "";
    [0.16, 0.33, 0.5, 0.67, 0.84].forEach((t, i) => {
      const [x, y] = at(t);
      items += i % 2
        ? `<path d="M${r1(x)} ${r1(y)}v3" stroke="${ink}" stroke-width="0.6"/>${acorn(r1(x), r1(y + 6.5), (i - 2) * 8, 0.95)}`
        : leaf(r1(x), r1(y), 84 + (i - 2) * 14, 0.68);
    });
    return `<path d="M2 3Q30 16 58 3" fill="none" stroke="${ink}" stroke-width="0.8"/><circle cx="2" cy="3" r="1.6" fill="${ink}"/><circle cx="58" cy="3" r="1.6" fill="${ink}"/>${items}` +
      `${drift("M44 20C48 22 47 26 50 27")}${leaf(51, 27, 150, 0.42)}`;
  })();

  // Dried lavender hung head-down from a twine loop.
  const herbs = (() => {
    let heads = "";
    [-20, -10, 0, 10, 20].forEach((a, i) => {
      const L = 33 + (i % 2) * 3;
      // Each stem points down in its own frame; buds sit in pairs along its last 12 px like a lavender spike.
      let spike = `<path d="M0 0V${L}" stroke="${ink}" stroke-width="0.7"/>`;
      for (let k = 0; k < 5; k++) {
        const y = L - 12 + k * 2.4;
        spike += `<ellipse cx="-1.1" cy="${r1(y)}" rx="0.85" ry="1.6" transform="rotate(28 -1.1 ${r1(y)})" fill="${ink}"/>` +
          `<ellipse cx="1.1" cy="${r1(y)}" rx="0.85" ry="1.6" transform="rotate(-28 1.1 ${r1(y)})" fill="${ink}"/>`;
      }
      spike += `<ellipse cx="0" cy="${L + 0.6}" rx="0.7" ry="1.3" fill="${paper}" stroke="${ink}" stroke-width="0.5"/>` +
        `<path d="M0 ${r1(L * 0.45)}l${i % 2 ? 2.6 : -2.6} 1.4" stroke="${ink}" stroke-width="0.6"/>`;
      heads += `<g transform="translate(15 12.5) rotate(${-a})">${spike}</g>`;
    });
    return `<path d="M15 0V8" stroke="${ink}" stroke-width="0.8"/>
<path d="M11 3.6L13 9M15 3V9M19 3.6L17 9" stroke="${ink}" stroke-width="0.8"/>
${heads}
<rect x="11.5" y="8.4" width="7" height="4.4" rx="1" fill="${ink}"/><path d="M12.2 10.6h5.6" stroke="${paper}" stroke-width="0.5"/>`;
  })();

  const harvestMoon = (() => {
    let sky = "", y = 12, gap = 1.9;
    while (y < 48) { sky += `M10 ${r1(y)}H94`; y += gap; gap += 0.32; }
    let furrows = "";
    for (let xb = 12; xb <= 92; xb += 8) furrows += `M${r1(52 + (xb - 52) * 0.14)} 50.5L${xb} 73`;
    const stack = (x, y, w, h) => `<path d="M${x - w / 2} ${y}C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y}Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>` +
      `<path d="M${x - w / 2} ${y}C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y}Z" fill="url(#h-vert)"/>`;
    const goose = (x, y, s) => `<path d="M${x - 4 * s} ${y - 2 * s}L${x} ${y}L${x + 4 * s} ${y - 2.4 * s}M${x} ${y}L${x - 1.6 * s} ${y + 0.8 * s}" fill="none" stroke="${ink}" stroke-width="0.8"/>`;
    return `
<rect x="1" y="1" width="102" height="80" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M3.5 3.5H100.5V78.5H3.5ZM9 9V73H95V9Z" fill-rule="evenodd" fill="url(#h-horz-wide)" stroke="${ink}" stroke-width="0.6"/>
<path d="M3.5 3.5L9 9M100.5 3.5L95 9M3.5 78.5L9 73M100.5 78.5L95 73" stroke="${ink}" stroke-width="0.6"/>
<rect x="9" y="9" width="86" height="64" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="${sky}" stroke="${ink}" stroke-width="0.45"/>
<circle cx="52" cy="36" r="14" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M57 26C66 31 66 42 57 48C62 42 62 32 57 26Z" fill="url(#h-diag-fine)"/>
<circle cx="45" cy="30" r="2.3" fill="none" stroke="${ink}" stroke-width="0.5"/><circle cx="50.5" cy="36.5" r="0.9" fill="${ink}"/>
<ellipse cx="55.5" cy="43" rx="2.6" ry="1.3" transform="rotate(30 55.5 43)" fill="none" stroke="${ink}" stroke-width="0.5"/>
${goose(20, 18, 1)}${goose(26, 21.5, 0.9)}${goose(31.5, 25, 0.85)}${goose(26, 15, 0.9)}${goose(31.5, 12.5, 0.8)}
<path d="M9.6 50C30 47 70 47.5 94.4 49.5V72.4H9.6Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="${furrows}" stroke="${ink}" stroke-width="0.5"/>
${stack(28, 63, 17, 11)}${stack(74, 57, 10, 6.5)}
<path d="M83 50V44.6L87.5 41L92 44.6V50Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/><rect x="86.3" y="46" width="2.4" height="4" fill="${ink}"/>
<path d="M90 43V40.6H91.4V44" fill="${ink}"/><path d="M90.7 39.6C89.4 37.6 91.6 36.4 90.4 34.4C89.6 33 90.6 31.8 91.6 31.2" fill="none" stroke="${ink}" stroke-width="0.6"/>`;
  })();

  // Wreath of oak leaves and acorns hung from a nail, tied with a bow.
  const wreath = (() => {
    let ring = "";
    for (let i = 0; i < 20; i++) {
      const a = i * 360 / 20 - 90, rad = a * Math.PI / 180;
      const x = 44 + 30 * Math.cos(rad), y = 44 + 30 * Math.sin(rad);
      ring += leaf(r1(x), r1(y), r1(a + 90 + (i % 2 ? 38 : -38)), i % 3 === 0 ? 0.5 : 0.56, { hatch: i % 2 ? "url(#h-diag-fine)" : "" });
    }
    const acorns = [[30, 14, 20], [72, 30, -30], [16, 56, 40], [70, 62, -50], [44, 15, 0]].map(([x, y, r]) => acorn(x, y, r, 1.05)).join("");
    return `<path d="M44 0V10" stroke="${ink}" stroke-width="0.7"/><circle cx="44" cy="1.6" r="1.5" fill="${ink}"/>
<circle cx="44" cy="44" r="30" fill="none" stroke="${ink}" stroke-width="3.4"/><circle cx="44" cy="44" r="30" fill="none" stroke="${paper}" stroke-width="1.4"/>
${ring}${acorns}
<g fill="${ink}"><circle cx="58" cy="17" r="1.6"/><circle cx="60.4" cy="19" r="1.6"/><circle cx="20" cy="30" r="1.6"/><circle cx="22" cy="27.6" r="1.6"/></g>
<path d="M44 74C37 66 29 69 32 74.5C34 77.5 39 76.5 44 74ZM44 74C51 66 59 69 56 74.5C54 77.5 49 76.5 44 74Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M44 74C40 70.5 35.5 70 34 72.4C38 72 41 73 44 74ZM44 74C48 70.5 52.5 70 54 72.4C50 72 47 73 44 74Z" fill="url(#h-diag)"/>
<path d="M42.6 75L37 88.5L40 86.6L41.6 89.4L45 76M45.4 75L50 88L47 86.4L45.6 89.2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<rect x="41.6" y="71.6" width="4.8" height="4.8" rx="1" fill="${ink}"/>`;
  })();

  // Perches: sit on the top edge of a book cover.
  const squirrel = `
<path d="M22 35.5C34 36 40.5 28 38.5 19C37.4 13.4 33 11.4 34 7.4C35 3.6 39 3.6 40 6.6C41 2 34.5 0.6 30.8 3.6C27 7 28.6 12 30 16C32 21.4 31 27.4 24 30Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M22 35.5C34 36 40.5 28 38.5 19C37.4 13.4 33 11.4 34 7.4C35 3.6 39 3.6 40 6.6C41 2 34.5 0.6 30.8 3.6C27 7 28.6 12 30 16C32 21.4 31 27.4 24 30Z" fill="url(#h-cross)"/>
<path d="M39.6 21l1.4-0.6M39.4 25l1.4 0.2M37.6 29.6l1.2 0.8M35.6 6.2l-1.2-1M32 4.4l-0.6-1.4" stroke="${ink}" stroke-width="0.6"/>
<path d="M11.5 36C7.6 34 7 28 9 23C10.4 19 13 17 16 17C21 17 24.5 21 25.5 26C26.4 30.6 26 34 23.5 36Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M21 18.6C24 21 25.5 26 25.5 30C25.5 33 25 34.6 23.5 36H20C23 32 23.5 24 21 18.6Z" fill="url(#h-diag)"/>
<path d="M17.5 31.4C20 29.6 23.6 30.6 23.8 34" fill="none" stroke="${ink}" stroke-width="0.7"/>
<ellipse cx="11.6" cy="35" rx="4.6" ry="1.2" fill="${ink}"/>
<path d="M4.4 13.8C4.2 9.6 7.6 6.6 11.6 6.6C15.4 6.6 18 9.4 18 12.6C18 16.4 15 18.6 11.4 18.6C7.6 18.6 4.6 17.4 4.4 13.8Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M14.6 7.4C17.4 8.6 18.4 11.4 17.6 14.4C16.6 13 15.6 10 14.6 7.4Z" fill="url(#h-diag-fine)"/>
<path d="M12.6 7.6L14.2 1.6L16.8 8Z" fill="${ink}"/><path d="M14.2 1.6L13.4 0.4M14.2 1.6L15 0.3" stroke="${ink}" stroke-width="0.5"/>
<circle cx="9" cy="11.2" r="1.35" fill="${ink}"/><circle cx="8.6" cy="10.8" r="0.45" fill="${paper}"/>
<circle cx="4.2" cy="13.8" r="0.9" fill="${ink}"/>
<path d="M4.6 14.6L1.4 13.4M4.8 15.2L1.6 16.6" stroke="${ink}" stroke-width="0.35"/>
<path d="M14.4 19.2C12 21.6 9 22 7.2 20.6" fill="none" stroke="${ink}" stroke-width="1.3"/>
${acorn(5.6, 17.8, -24, 0.78)}
<path d="M9 30.6C10 28.4 12.6 27.4 15 28.4" fill="none" stroke="${ink}" stroke-width="0.6"/>`;
  const robin = `
<path d="M8.6 15L1 8.4L3.2 7L11 12.4Z" fill="${ink}"/>
<path d="M6.5 16.5C6 11.4 10 7.6 15.6 7.6C18.4 4 23 3 26.2 5.6C28.8 7.8 29.2 11.6 28 14.6C27 18.8 22.6 22.4 16.8 22.4C11 22.4 7 20 6.5 16.5Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M27.6 11.2C29.6 15 27.4 20.4 21 22C19 21.6 18.4 19.6 19.6 18C23 17 25.6 14.4 27.6 11.2Z" fill="url(#h-cross-dense)"/>
<path d="M10.4 13.4C14 11 19.4 11.6 21.8 15.6C19 19.2 13.4 19.4 9.4 17.4Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M10.4 13.4C14 11 19.4 11.6 21.8 15.6C19 19.2 13.4 19.4 9.4 17.4Z" fill="url(#h-diag)"/>
<path d="M13.6 18.6l2.6-3.4M16.8 18.8l2.4-3.2" stroke="${paper}" stroke-width="0.6"/>
<path d="M28.6 7.6L33.4 8.8L28.8 10.2Z" fill="${ink}"/>
<circle cx="25" cy="7.8" r="1.05" fill="${ink}"/><circle cx="24.7" cy="7.5" r="0.35" fill="${paper}"/>
<path d="M15 22.2V26M19.4 22V26" stroke="${ink}" stroke-width="1"/><path d="M13 26H16.6M17.6 26H21.4" stroke="${ink}" stroke-width="0.8"/>`;

  registerTheme({
    id: "autumn",
    name: "Autumn Harvest",
    group: "new",
    blurb: "Falling oak leaves, rough-sawn shelves, a hedgehog among the pumpkins.",
    headline: "Gathered in",
    tagline: "Crisp leaves outside, warm pages within.",
    dark: false,
    wall: {
      base: "#ece6da",
      tile: {
        w: 140, h: 140,
        svg: [[20, 24, -30, 1, true], [88, 18, 40, 0.9, false], [60, 64, 160, 1, true], [118, 78, -70, 0.85, false], [24, 100, 20, 0.95, false], [82, 116, -140, 1, true]]
          .map(([x, y, a, s, h]) => leaf(x, y, a, s, { stroke: K.g2, fill: "none", hatch: h ? "url(#h-diag-gray)" : "", width: 0.7 })).join("") +
          [[52, 30, 15], [106, 46, -20], [36, 128, 30], [118, 124, -10]].map(([x, y, a]) => acorn(x, y, a, 1, K.g2, "url(#h-diag-gray)")).join("")
      },
      quiet: { w: 140, h: 140, svg: leaf(62, 74, -20, 0.8, { stroke: "#cfc8bb", fill: "none", hatch: "", width: 0.7 }) }
    },
    plank: {
      height: 17,
      back: w => `<path d="M2 -6H${w - 2}L${w} 0H0Z" fill="${paper}"/><path d="M2 -6H${w - 2}L${w} 0H0Z" fill="url(#h-horz-wide)" stroke="${ink}" stroke-width="0.8"/>`,
      front: (w, seed = 1) => {
        const rand = rng(seed * 31 + w);
        const pts = [];
        for (let x = 0; x < w; x += 8) pts.push([x, 15.5 + (rand() - 0.5) * 3.4]);
        pts.push([w, 15.5]);
        const bark = `M0 11.5H${w}` + pts.reverse().map(([x, y]) => `L${r1(x)} ${r1(y)}`).join("") + "Z";
        let saw = "";
        for (let x = 10 + rand() * 12; x < w - 10; x += 18 + rand() * 14) saw += `M${r1(x)} 1.5Q${r1(x + 4)} 6 ${r1(x)} 10.5`;
        const iron = (x, flip) => `<g transform="translate(${x} 15) scale(${flip ? -1 : 1} 1)"><path d="M-1.6 0H1.6V20H-1.6Z" fill="${ink}"/>` +
          `<path d="M1 3C10 3 13 11 7 14C4 15 3 12 5 11" fill="none" stroke="${ink}" stroke-width="1.6"/></g>`;
        return `<path d="M10 17H${w - 10}L${w - 18} 25H18Z" fill="url(#h-diag)"/>` +
          iron(16, false) + iron(w - 16, true) +
          `<path d="${bark}" fill="${paper}"/><path d="${bark}" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="1.1"/>` +
          `<rect x="0" y="0" width="${w}" height="12" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>` +
          `<line x1="0" y1="0.7" x2="${w}" y2="0.7" stroke="${ink}" stroke-width="1.8"/>` +
          `<g transform="translate(3 2.5)">${grain(w - 6, 8, { seed: seed * 11 + w, lines: 3, width: 0.6, amp: 1.8, knots: 2 })}</g>` +
          `<path d="${saw}" fill="none" stroke="${ink}" stroke-width="0.35"/>` +
          `<path d="M0.6 5H7M0.6 8.5H4.5M${w - 0.6} 6.5H${w - 9}" stroke="${ink}" stroke-width="0.7"/>`;
      }
    },
    plate: (w, h) =>
      `<path d="M9 0.6H${w - 0.6}V${h - 0.6}H9L0.6 ${h / 2}Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>` +
      `<path d="M10.4 3H${w - 3}V${h - 3}H10.4L3.8 ${h / 2}Z" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="2 1.6"/>` +
      `<circle cx="7.4" cy="${h / 2}" r="1.8" fill="${K.g3}"/>`,
    plateInk: ink,
    ornaments: [
      { id: "hedgehog", label: "Hedgehog with an apple", w: 84, h: 54, at: "shelf", svg: hedgehog },
      { id: "pumpkins", label: "Pumpkins and a peeking mouse", w: 84, h: 52, at: "shelf", svg: pumpkins },
      { id: "sheaf", label: "Wheat sheaf with harvest mouse", w: 48, h: 104, at: "shelf", svg: sheaf },
      { id: "basket", label: "Apple basket with plaid", w: 88, h: 64, at: "shelf", svg: basket },
      { id: "mushrooms", label: "Toadstools on moss", w: 54, h: 40, at: "shelf", svg: mushrooms },
      { id: "jug", label: "Stoneware jug with branches", w: 60, h: 96, at: "shelf", svg: jug },
      { id: "garland", label: "Leaf garland", w: 60, h: 34, at: "hang", svg: garland },
      { id: "herbs", label: "Drying lavender", w: 30, h: 54, at: "hang", svg: herbs },
      { id: "harvest-moon", label: "Harvest moon print", w: 104, h: 82, at: "wall", svg: harvestMoon },
      { id: "wreath", label: "Oak-leaf wreath", w: 88, h: 90, at: "wall", svg: wreath },
      { id: "squirrel", label: "Squirrel with an acorn", w: 42, h: 36, at: "perch", svg: squirrel },
      { id: "robin", label: "Robin", w: 34, h: 26, at: "perch", svg: robin }
    ],
    hero: {
      w: 132, h: 92,
      svg: `${drift("M88 2C92 6 90 10 94 13")}${leaf(95, 15, 30, 0.5)}${drift("M110 18C114 22 112 27 116 30")}${leaf(117, 32, 120, 0.42)}${leaf(74, 24, -60, 0.4)}` +
        `<g transform="translate(0 44.5) scale(0.88)">${hedgehog}</g><g transform="translate(66 51.4) scale(0.78)">${pumpkins}</g>` +
        `<g transform="translate(86 25.4) scale(0.72)">${robin}</g>` +
        `<line x1="0" y1="91.4" x2="132" y2="91.4" stroke="${ink}" stroke-width="1.2"/>`
    }
  });
})();
