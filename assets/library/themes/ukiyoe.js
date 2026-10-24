// Ukiyo-e Print: a woodblock study. Seigaiha wave wall, pale hinoki shelves, a bonsai and a paper lantern.
(() => {
  const ink = K.ink, paper = K.paper, BASE = "#efebe2", WAVE = "#d4cec2";

  // Seigaiha: overlapping wave scales; later rows paint over earlier ones, so draw top to bottom.
  const seigaiha = (() => {
    let out = "";
    for (let yc = -12; yc <= 36; yc += 12) {
      const off = (yc / 12) % 2 ? 24 : 0;
      for (const x of [off - 48, off, off + 48]) {
        out += `<circle cx="${x}" cy="${yc}" r="24" fill="${BASE}"/>` +
          [23.4, 18, 12.6, 7.2].map(r => `<circle cx="${x}" cy="${yc}" r="${r}" fill="none" stroke="${WAVE}" stroke-width="0.7"/>`).join("");
      }
    }
    return out;
  })();

  // Pine cloud pad: scalloped top, flat bottom, dark underside.
  const pad = (cx, by, w, h) => {
    const n = Math.max(3, Math.round(w / 8)), x0 = cx - w / 2, bw = w / n;
    let d = `M${r1(x0)} ${by}`;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * bw, b = a + bw, edge = i === 0 || i === n - 1;
      const peak = by - h * (edge ? 0.72 : 1), end = i === n - 1 ? by : by - h * 0.5;
      d += `C${r1(a)} ${r1(peak)} ${r1(b)} ${r1(peak)} ${r1(b)} ${r1(end)}`;
    }
    d += "Z";
    return `<path d="${d}" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><path d="${d}" fill="url(#ukiyoe-needles)"/>` +
      `<path d="M${r1(x0 + 1)} ${by}Q${cx} ${by - 4.5} ${r1(x0 + w - 1)} ${by}Q${cx} ${by + 1.6} ${r1(x0 + 1)} ${by}Z" fill="${ink}"/>`;
  };
  // Five-petal plum blossom; dark ones are cut solid like a woodblock key block.
  const plum = (x, y, s = 1, dark = false) => {
    let p = "";
    for (let k = 0; k < 5; k++) {
      const a = (-90 + k * 72) * Math.PI / 180;
      p += `<circle cx="${r1(x + 2.5 * s * Math.cos(a))}" cy="${r1(y + 2.5 * s * Math.sin(a))}" r="${r1(2.3 * s)}" fill="${dark ? ink : paper}" stroke="${ink}" stroke-width="0.6"/>`;
    }
    return p + `<circle cx="${x}" cy="${y}" r="${r1(1.1 * s)}" fill="${dark ? paper : ink}"/>`;
  };
  const petal = (x, y, rot) => `<path d="M0 0C2-2.2 4.2-1.2 3.6 1C3.1 3 1 3 0 0Z" transform="translate(${x} ${y}) rotate(${rot})" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>`;
  const drift = d => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.4 1.6"/>`;
  // Small wave crest motif used on pots and prints: three nested arcs.
  const crest = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${ink}"><path d="M-6 0A6 6 0 0 1 6 0" stroke-width="${0.8 / s}"/><path d="M-4 0A4 4 0 0 1 4 0M-2 0A2 2 0 0 1 2 0" stroke-width="${0.5 / s}"/></g>`;

  const bonsai = `
<path d="M40 61C38 54 30 50 30 43C30 37 38 35 44 31C50 27 52 23 50 17L54 17C57 24 55 30 48 35C42 39 36 41 36 45C36 51 46 55 48 61Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M40 61C38 54 30 50 30 43C30 37 38 35 44 31C50 27 52 23 50 17L54 17C57 24 55 30 48 35C42 39 36 41 36 45C36 51 46 55 48 61Z" fill="url(#h-back)"/>
<path d="M32.5 41C33 38 36 36.5 39 35.4M37 52C38 55 40 57 41.5 60M47 30C50 27.5 52 24 52 20" fill="none" stroke="${paper}" stroke-width="0.8"/>
<path d="M32 45C27 45 23 44 19 42M46 33C54 34 60 34 66 31" fill="none" stroke="${ink}" stroke-width="2.2"/>
${pad(19, 43, 28, 12)}${pad(70, 32, 30, 12)}${pad(52, 18, 34, 14)}
<path d="M24 62C30 57 38 58 44 59C52 57 62 58 68 62Z" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M24 62C30 57 38 58 44 59C52 57 62 58 68 62Z" fill="url(#h-dots-dense)"/>
<path d="M56 62C56.5 57.4 61 56.4 63.6 58.6C65 57 68.6 57.8 68.4 62Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M63.6 58.6C65 57 68.6 57.8 68.4 62H64C64.6 60.6 64.4 59.4 63.6 58.6Z" fill="url(#h-diag)"/>
<rect x="8" y="62" width="76" height="4" fill="${ink}"/>
<path d="M11 66H81L77 73H15Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M64 66H81L77 73H62Z" fill="url(#h-diag)"/>
${crest(24, 71.6, 0.55)}${crest(31, 71.6, 0.55)}${crest(38, 71.6, 0.55)}${crest(27.5, 69.4, 0.5)}${crest(34.5, 69.4, 0.5)}
<rect x="19" y="73" width="7" height="4" fill="${ink}"/><rect x="66" y="73" width="7" height="4" fill="${ink}"/>`;

  // Paper lantern with a moth circling it.
  const lantern = (() => {
    let ribs = "";
    for (let y = 21; y <= 61; y += 4) {
      const half = 17 * Math.sqrt(Math.max(0, 1 - ((y - 40) / 25) ** 2));
      ribs += `M${r1(20 - half)} ${y}Q20 ${y + 1.6} ${r1(20 + half)} ${y}`;
    }
    let blossom = "";
    for (let k = 0; k < 5; k++) {
      const a = (-90 + k * 72) * Math.PI / 180;
      blossom += `<circle cx="${r1(20 + 3.3 * Math.cos(a))}" cy="${r1(40 + 3.3 * Math.sin(a))}" r="2.5" fill="${ink}"/>`;
    }
    return `<circle cx="20" cy="4" r="3" fill="none" stroke="${ink}" stroke-width="1.2"/>
<path d="M20 7V13" stroke="${ink}" stroke-width="1.2"/>
<ellipse cx="20" cy="40" rx="17" ry="25" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="${ribs}" fill="none" stroke="${ink}" stroke-width="0.55"/>
<path d="M24 15.4C40 22 40 58 24 64.6C33 56 34 24 24 15.4Z" fill="url(#h-diag)"/>
<path d="M8 30C7 36 7 44 8.4 50" fill="none" stroke="${paper}" stroke-width="1.6"/>
<circle cx="20" cy="40" r="7.5" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
${blossom}<circle cx="20" cy="40" r="1.2" fill="${paper}"/>
<rect x="11" y="12.5" width="18" height="5" rx="1" fill="${ink}"/><path d="M12 13.6H28" stroke="${paper}" stroke-width="0.5"/>
<rect x="11" y="62" width="18" height="5" rx="1" fill="${ink}"/>
<rect x="13" y="67" width="14" height="3" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
${drift("M31 28C34.5 26 36.5 22.5 37.6 19")}
<path d="M39.6 13.4L38 9.6M40.4 13.4L42 9.6" stroke="${ink}" stroke-width="0.5"/>
<path d="M40 14C37 9.4 33.6 10.4 34.2 13.8C34.8 16.2 38 15.8 40 14.8ZM40 14C43 9.4 46.4 10.4 45.8 13.8C45.2 16.2 42 15.8 40 14.8Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M40 15.2C37.6 16 36.6 18.4 38 19.4C39 20 39.8 18.2 40 16.4ZM40 15.2C42.4 16 43.4 18.4 42 19.4C41 20 40.2 18.2 40 16.4Z" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<circle cx="36.6" cy="12.6" r="0.8" fill="${ink}"/><circle cx="43.4" cy="12.6" r="0.8" fill="${ink}"/>
<path d="M40 12.8V19" stroke="${ink}" stroke-width="1.1"/>`;
  })();

  // Folding fan with a moon over waves, its tassel trailing.
  const fan = (() => {
    const px = 33, py = 42, R = 31, r = 9, dir = (rad, a) => [r1(px + rad * Math.cos(a * Math.PI / 180)), r1(py + rad * Math.sin(a * Math.PI / 180))];
    let panels = "";
    for (let i = 0; i < 10; i++) {
      const a0 = 200 + i * 14, a1 = a0 + 14;
      const [ix0, iy0] = dir(r, a0), [ox0, oy0] = dir(R, a0), [ox1, oy1] = dir(R, a1), [ix1, iy1] = dir(r, a1);
      const d = `M${ix0} ${iy0}L${ox0} ${oy0}A${R} ${R} 0 0 1 ${ox1} ${oy1}L${ix1} ${iy1}A${r} ${r} 0 0 0 ${ix0} ${iy0}Z`;
      panels += `<path d="${d}" fill="${paper}" stroke="${ink}" stroke-width="0.5"/>` + (i % 2 ? `<path d="${d}" fill="url(#h-diag-fine)" opacity="0.55"/>` : "");
    }
    const [sx, sy] = dir(R, 200), [ex, ey] = dir(R, 340), [isx, isy] = dir(r, 200), [iex, iey] = dir(r, 340);
    return `${panels}
${crest(20.5, 30.4, 0.68)}${crest(29.5, 30.4, 0.68)}${crest(38.5, 30.4, 0.68)}${crest(25, 27, 0.6)}${crest(34, 27, 0.6)}
<path d="M${sx} ${sy}A${R} ${R} 0 0 1 ${ex} ${ey}" fill="none" stroke="${ink}" stroke-width="1.4"/>
<path d="M${isx} ${isy}A${r} ${r} 0 0 1 ${iex} ${iey}" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M${px} ${py}L${sx} ${sy}M${px} ${py}L${ex} ${ey}" stroke="${ink}" stroke-width="1.7"/>
<circle cx="40" cy="20" r="5" fill="${ink}"/><circle cx="41.6" cy="18.6" r="4.2" fill="${paper}"/>
<path d="M25 48L28 42H38L41 48Z" fill="${ink}"/>
<circle cx="${px}" cy="${py}" r="1.8" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M34.6 42.6C40 45.6 46 45.4 51 42.4" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M50.4 41.4L53.4 41L55 47.6L49.6 46.4Z" fill="${ink}"/><path d="M50 46.6l-0.8 1.4M51.6 47l-0.4 1M53.2 47.4l0.2 0.6" stroke="${ink}" stroke-width="0.5"/>`;
  })();

  const teaBowl = `
<path d="M19 14C16 11 22 9 19 5.5C17.6 3.6 19 2 20.2 1.4M26 14.5C23.4 11 29 8.4 26 5C24.6 3 26.4 1.4 27.6 1M33 14C31 11.6 35 10 33 7C32.4 6 32.8 5 33.6 4.4" fill="none" stroke="${ink}" stroke-width="0.6"/>
<rect x="8" y="42" width="5" height="6" fill="${ink}"/><rect x="39" y="42" width="5" height="6" fill="${ink}"/>
<rect x="4" y="38" width="44" height="4" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="34" y="38.6" width="13.4" height="2.8" fill="url(#h-diag)"/>
<rect x="20" y="35.5" width="12" height="2.6" fill="${ink}"/>
<path d="M9 17H43C43 27 39 35 31 36.5H21C13 35 9 27 9 17Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M9 17H43C43 19.5 42.5 21.5 41.5 23C39.5 21 37.5 25 35 22.5C32 25.5 29 21.5 26 24.5C23 21.5 20 25.5 17 22.5C14.5 24.5 12 21 10.2 22.5C9.4 20.5 9 18.8 9 17Z" fill="url(#h-cross-dense)"/>
<path d="M38.5 25C40 29 37 34.5 31 36.5C35 33 37 29 38.5 25Z" fill="url(#h-diag)"/>
<path d="M12.6 26C13.6 29.6 16 32.4 19 33.8" fill="none" stroke="${ink}" stroke-width="0.5"/>
<ellipse cx="26" cy="17" rx="17" ry="2.6" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<ellipse cx="26" cy="17.4" rx="13.5" ry="1.6" fill="url(#h-diag)"/>`;

  // Ikebana: a crooked plum branch in a tall vase, petals drifting off.
  const plumVase = `
<path d="M29 67L27.6 58L31 51L27 44L32 36" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M32 36L39 28L45 19L51 11" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linejoin="round"/>
<path d="M27 44L20 38L14 33L9.5 25.5M20 38L18 31M39 28L46 29L52 26M45 19L43 12.5" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>
${plum(51, 11, 1)}${plum(43, 12.4, 0.8, true)}${plum(9.5, 25.5, 0.95)}${plum(18, 31, 0.72, true)}${plum(46.6, 29.2, 0.85)}${plum(32, 36, 0.78)}${plum(14.4, 33.4, 0.62)}${plum(52.6, 25.4, 0.6, true)}
<g fill="${ink}"><circle cx="36" cy="31" r="1.4"/><circle cx="24" cy="41.2" r="1.3"/><circle cx="48" cy="15.2" r="1.3"/><circle cx="11.6" cy="29.6" r="1.2"/><circle cx="29.6" cy="53" r="1.2"/></g>
${drift("M55 36C51 40 56 43 53 47")}${petal(52.6, 48.6, 30)}${drift("M47 56C51 59 46 62 49 66")}${petal(48, 67.4, -40)}${petal(7, 46, 80)}
<path d="M22 103C15 99 14 89 17.5 81C19.5 76 24 74 24.5 69H33.5C34 74 38.5 76 40.5 81C44 89 43 99 36 103Z" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
<path d="M33.5 69C34 74 38.5 76 40.5 81C44 89 43 99 36 103H31C36 97 37 88 34 80C32.5 76 32 72 33.5 69Z" fill="url(#h-diag)"/>
<path d="M18.6 84H40.4M17.4 95H41" stroke="${ink}" stroke-width="0.6"/>
${crest(23, 91, 0.5)}${crest(29, 91, 0.5)}${crest(35, 91, 0.5)}${crest(26, 88.6, 0.45)}${crest(32, 88.6, 0.45)}
<path d="M19.4 83C19 87 19.4 92 20.6 96" fill="none" stroke="${paper}" stroke-width="1.2"/>
<rect x="22.5" y="66.4" width="13" height="3" rx="1" fill="${ink}"/>
<rect x="20.5" y="102.4" width="17" height="1.6" fill="${ink}"/>`;

  // Daruma doll caught mid-wobble: one eye painted, one still blank.
  const daruma = `<g transform="rotate(-6 20 41)">
<path d="M20 41C8 41 3 33 4 23C5 12 12 4 20 4C28 4 35 12 36 23C37 33 32 41 20 41Z" fill="${ink}"/>
<path d="M8 19C9 13 13 8 18 6" fill="none" stroke="${paper}" stroke-width="1" stroke-dasharray="1.2 1.4"/>
<path d="M11 17C11 11 15 9 20 9C25 9 29 11 29 17C29 23 25 27 20 27C15 27 11 23 11 17Z" fill="${paper}" stroke="${paper}" stroke-width="0.8"/>
<path d="M12.5 13.4C14 11 17 11 18.6 13M21.4 13C23 11 26 11 27.5 13.4" fill="none" stroke="${ink}" stroke-width="1.6"/>
<circle cx="15.6" cy="16.6" r="2.6" fill="${paper}" stroke="${ink}" stroke-width="1"/><circle cx="15.6" cy="16.6" r="1.4" fill="${ink}"/>
<circle cx="24.4" cy="16.6" r="2.6" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M19.2 19.6Q20 21 20.8 19.6" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M14 22.6C16 21 18.5 21.5 20 23C21.5 21.5 24 21 26 22.6" fill="none" stroke="${ink}" stroke-width="1.4"/>
<path d="M15 25l1 1.5M18 26l0.5 1.5M22 26l-0.5 1.5M25 25l-1 1.5" stroke="${ink}" stroke-width="0.7"/>
<path d="M7 30C14 32 26 32 33 30" fill="none" stroke="${paper}" stroke-width="0.8"/>
<path d="M12 34.6c2-3 6-3 7 0s-3 3-3 1M28 34.6c-2-3-6-3-7 0s3 3 3 1" fill="none" stroke="${paper}" stroke-width="1.1"/>
</g>
<ellipse cx="20" cy="41.2" rx="13" ry="0.9" fill="${ink}"/>
<path d="M2.6 38.6C1.4 37.4 1 35.8 1.4 34.2M37.4 37C38.6 35.8 39 34.2 38.6 32.6" fill="none" stroke="${ink}" stroke-width="0.6"/>`;

  const windChime = `
<path d="M15 0V8" stroke="${ink}" stroke-width="0.8"/>
<circle cx="15" cy="9.5" r="1.6" fill="${ink}"/>
<path d="M5 20C5 11 25 11 25 20V21.5H5Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M5.6 16.2H24.4V19H5.6Z" fill="url(#h-diag-fine)"/>
<path d="M8 18C8.2 15.4 9.4 13.8 11 13" fill="none" stroke="${paper}" stroke-width="1"/>
<g transform="rotate(14 15 21.5)"><path d="M15 21.5V32" stroke="${ink}" stroke-width="0.6"/><rect x="13.5" y="23" width="3" height="2.4" fill="${ink}"/>
<rect x="9.5" y="32" width="11" height="31" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M13.2 36.8C14.6 37.2 15.8 37 16.8 36.2M15 35.6V42M13 45.6Q15 44.4 17 46M14.2 49C15 50.4 16 51 17 51.4M13.2 54.4H17M15.4 53V59.6" fill="none" stroke="${ink}" stroke-width="0.8" stroke-linecap="round"/></g>
<path d="M23 36C25.6 38.4 26.4 41.6 25.6 45M26 33.4C29 36.4 29.8 40.4 28.8 44.6" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.2 1.4"/>`;

  // Noren curtain on a bamboo rod; the right panel lifts in a breeze.
  const noren = `
<path d="M6 0V3M52 0V3" stroke="${ink}" stroke-width="0.8"/>
<path d="M4 5.6H28V45H4Z" fill="${ink}"/>
<path d="M30 5.6H54L57 44L33 46.6Z" fill="${ink}"/>
<path d="M4 41.4H28M33.2 43L56.6 40.6" stroke="${paper}" stroke-width="1"/>
<circle cx="16" cy="21" r="7.6" fill="${paper}"/>
<path d="M9.8 22.6A6.2 6.2 0 0 1 22.2 22.6M11.8 22.6A4.2 4.2 0 0 1 20.2 22.6M13.8 22.6A2.2 2.2 0 0 1 18.2 22.6" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M8.6 25.6H23.4" stroke="${ink}" stroke-width="0.8"/>
${plum(43.5, 22, 1.25)}
<rect x="1" y="2.4" width="56" height="3.4" rx="1.7" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M14 2.4v3.4M30 2.4v3.4M44 2.4v3.4" stroke="${ink}" stroke-width="0.8"/>`;

  const fujiPrint = (() => {
    let sea = "";
    [[65, 0], [68.5, 3], [72, 0]].forEach(([y, o]) => {
      for (let x = 12 + o; x < 90; x += 6) sea += `M${x} ${y}q1.5-1.8 3 0`;
    });
    // Flying crane: long neck forward, legs trailing, wings mid-beat.
    const crane = (x, y, s, up) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${ink}">` +
      `<path d="M3.4 -0.3L9 -1.4M-3.6 0.2L-10 1.4" stroke="${ink}" stroke-width="${0.7 / s}" stroke-linecap="round"/>` +
      `<path d="M-4 0C-2 -1.4 2 -1.4 4 0C2 1 -2 1 -4 0Z"/><circle cx="9.4" cy="-1.5" r="0.8"/>` +
      (up ? `<path d="M-1 -0.6C-3 -4 -1 -7 3 -9C1.6 -6 1.4 -3 1.8 -0.8Z"/><path d="M0.6 -0.8C1.2 -3.4 3.6 -5.2 6.6 -5.8C5 -4 3.8 -2.2 2.8 -0.6Z" fill="${K.g3}"/>`
        : `<path d="M-1 0.6C-2.4 3.4 -1 6 2 7.6C1.2 5 1.2 2.6 1.8 0.6Z"/><path d="M0.8 0.4C2 2.6 4 3.8 6.4 4.2C4.8 2.8 3.8 1.6 3 0.2Z" fill="${K.g3}"/>`) + `</g>`;
    return `<rect x="1" y="1" width="102" height="82" fill="${ink}"/>
<rect x="5" y="5" width="94" height="74" fill="${paper}"/>
<rect x="10" y="10" width="84" height="64" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<rect x="10.4" y="10.4" width="83.2" height="8" fill="url(#h-horz)"/>
<circle cx="28" cy="25" r="6" fill="${ink}"/>
${crane(66, 18, 1, true)}${crane(76, 22.4, 0.85, false)}${crane(72, 28, 0.75, true)}
<path d="M18 62L49 27Q53 22.5 57 27L88 62Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M18 62L49 27Q53 22.5 57 27L88 62Z" fill="url(#h-diag)"/>
<path d="M43 33.5L49 27Q53 22.5 57 27L63 33.5L60.5 31.6L58 35L55.5 31.6L53 35.4L50.5 31.6L48 35L45.5 31.6Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M10.4 46H72a4.5 4.5 0 0 1 0 9H10.4Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M93.6 50H62a3.5 3.5 0 0 0 0 7H93.6Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<rect x="10.4" y="62" width="83.2" height="11.6" fill="${paper}"/>
<path d="M10.4 62H93.6" stroke="${ink}" stroke-width="0.6"/>
<path d="${sea}" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M70 73.6C70 67 75 63.4 80 63.6C84.6 63.8 87 67 86 69.6C85 71.6 82.4 71 82.6 69C80 68.4 77.6 70.4 78.4 73.6Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M74 72C74.6 68.6 77 66.4 80 66" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M84 64.6l1.6-1.6M86.6 66.4l1.8-0.8M82 63.2l0.6-1.8" stroke="${ink}" stroke-width="0.6"/>
<path d="M28 64V56L34 63Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M24 64.5H37L35 67H26Z" fill="${ink}"/>
<path d="M15 73.6C16 67 14.5 63 17.5 58.5" fill="none" stroke="${ink}" stroke-width="1.4"/>
<ellipse cx="18" cy="58.5" rx="5" ry="2" fill="${ink}"/><ellipse cx="13.6" cy="63" rx="4" ry="1.6" fill="${ink}"/>
<rect x="82" y="13" width="7" height="20" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M84 17H87M85.5 20V25M84 28H87" stroke="${ink}" stroke-width="0.6"/>
<rect x="83.5" y="35.5" width="4" height="4" fill="${ink}"/>`;
  })();

  // Hanging scroll: a koi leaping out of rings of water.
  const koiScroll = `
<path d="M27 1.4L8 7M27 1.4L46 7" stroke="${ink}" stroke-width="0.6"/><circle cx="27" cy="1.6" r="1.3" fill="${ink}"/>
<rect x="5" y="6" width="44" height="4" rx="1" fill="${ink}"/>
<rect x="8" y="10" width="38" height="72" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<rect x="8.5" y="10.5" width="37" height="71" fill="url(#h-dots)"/>
<rect x="8.5" y="16" width="37" height="3" fill="${ink}"/><rect x="8.5" y="74" width="37" height="3" fill="${ink}"/>
<rect x="12" y="20" width="30" height="53" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M14 66Q19 63 24 66T34 66T40 66M16 70Q21 67.6 26 70T36 70" fill="none" stroke="${ink}" stroke-width="0.6"/>
<ellipse cx="22" cy="64.4" rx="7" ry="1.8" fill="none" stroke="${ink}" stroke-width="0.6"/>
<g transform="translate(21 61) rotate(-62) scale(0.92)">
<path d="M1 0L-7 -6.4C-5.4 -2.2 -5.4 2.2 -7 6.4Z" fill="${paper}" stroke="${ink}" stroke-width="1"/><path d="M-1 -1L-5.6 -4.4M-1 1L-5.6 4.4M-1.4 0H-6" stroke="${ink}" stroke-width="0.45"/>
<path d="M9.6 -5.6C12.6 -9.6 18 -9.6 21 -5" fill="${paper}" stroke="${ink}" stroke-width="0.9"/><path d="M12.6 -7L13.6 -5.6M15.6 -7.8L16.2 -6M18.6 -7.2L18.8 -5.4" stroke="${ink}" stroke-width="0.4"/>
<path d="M0 0C4 -5 14 -6.6 22 -4.6C26 -3.6 29 -1.6 30 0C29 1.8 26 3.4 22 4.2C14 5.8 4 4.6 0 0Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M1 0C4 -4.4 14 -6 22.6 -4.2C23.8 -1.4 23.8 1.6 22.6 4C14 5.4 4 4.2 1 0Z" fill="url(#ukiyoe-scales)"/>
<path d="M5 -3.2C8 -5 12 -5.2 13.4 -4C12 -1.6 8 -1 5 -3.2ZM15.6 0.6C18 -0.4 21 0 21.6 1.6C19.6 3.6 16.6 3.4 15.6 0.6ZM24 -4C26.4 -3.2 28 -1.8 28.6 -0.6C26.6 -0.8 25 -2 24 -4Z" fill="${ink}"/>
<path d="M23.4 -4.2C24.8 -1.6 24.8 1.8 23.4 4" fill="none" stroke="${ink}" stroke-width="0.7"/>
<path d="M19.4 4L16.4 8.6L22 4.4Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<circle cx="25.8" cy="-1.2" r="0.95" fill="${ink}"/><circle cx="25.6" cy="-1.4" r="0.3" fill="${paper}"/>
<path d="M30 0.6Q32.6 1.4 33.4 4M29.6 1.2Q31 2.8 31 5" fill="none" stroke="${ink}" stroke-width="0.45"/></g>
<g fill="${ink}"><circle cx="15.4" cy="57.6" r="0.8"/><circle cx="27.8" cy="60.4" r="0.9"/><circle cx="14.2" cy="52.6" r="0.6"/><circle cx="30.4" cy="55.4" r="0.6"/><circle cx="25" cy="57" r="0.5"/></g>
<path d="M17.6 63.4C16.4 61.4 16.6 59.8 17.8 58.8M26.2 63C27.8 61.4 28 59.6 27 58.4" fill="none" stroke="${ink}" stroke-width="0.6"/>
<rect x="36.4" y="66" width="3.4" height="3.4" fill="${ink}"/>
<rect x="6" y="82" width="42" height="4" rx="1" fill="${ink}"/>
<circle cx="5.2" cy="84" r="2.4" fill="${paper}" stroke="${ink}" stroke-width="1"/><circle cx="48.8" cy="84" r="2.4" fill="${paper}" stroke="${ink}" stroke-width="1"/>`;

  // Perches: sit on the top edge of a book cover.
  const sparrow = `
<path d="M26 14L31.6 9.4L33.4 11L28.4 16.4Z" fill="${ink}"/>
<path d="M4.8 13.4C4.6 8.6 7.6 5.6 11.4 5.6C14 5.6 15.8 7 16.8 8.4C22 8 27.4 10.4 28.6 15C29.4 19 25 22 17.6 22.2C10.4 22.4 5 19.6 4.8 13.4Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M4.8 10C5.6 6.8 8.6 5.4 11.6 5.6C13.8 5.8 15.4 7 16.4 8.4C12.4 8.4 8.4 8.8 4.8 10Z" fill="url(#h-cross-dense)"/>
<circle cx="9.6" cy="12.8" r="1.5" fill="${ink}"/>
<circle cx="7" cy="10.4" r="0.95" fill="${ink}"/><circle cx="6.7" cy="10.1" r="0.32" fill="${paper}"/>
<path d="M5 10.6L1.4 11.8L5 12.8Z" fill="${ink}"/>
<path d="M12.4 13C16 10.8 22 11.6 25.4 15C22.6 18.6 16.6 19.2 12.4 17Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M12.4 13C16 10.8 22 11.6 25.4 15C22.6 18.6 16.6 19.2 12.4 17Z" fill="url(#h-diag)"/>
<path d="M15.6 17.6l2.8-3.4M18.8 18l2.6-3.2M14.2 14.6H19" stroke="${paper}" stroke-width="0.6"/>
<path d="M6 16.6C8 20.4 12 21.6 16 21.8C12 20.6 8.6 19.4 6 16.6Z" fill="url(#h-dots)"/>
<path d="M14.4 22V24.6M18.4 22V24.6" stroke="${ink}" stroke-width="1"/><path d="M12.8 24.6H16M16.8 24.6H20" stroke="${ink}" stroke-width="0.8"/>`;
  const crane = `
<path d="M21 18.4L12.4 3L19 19.4Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M21 18.4L12.4 3L19 19.4Z" fill="url(#h-diag-fine)"/>
<path d="M14 26L21 18L28 26Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M21 18L28 26H22.6Z" fill="url(#h-diag)"/>
<path d="M15.4 24.4L6 8L8.2 8.6L18.6 22Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M6 8L2.4 12.6L7.6 9.8Z" fill="${ink}"/>
<path d="M26.6 24L40 11.6L38.8 14L28.4 25.6Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M21 18.4L36.4 2.4L26.4 20.4Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M21 18.4L31 10.6M26.4 20.4L31 10.6" stroke="${ink}" stroke-width="0.5"/>
<path d="M28.4 13.6L33.6 8.2M30 15.6L34.6 10.6" stroke="${ink}" stroke-width="0.45"/>`;

  registerTheme({
    id: "ukiyoe",
    name: "Ukiyo-e Print",
    group: "new",
    blurb: "A woodblock study: wave-scale walls, pale hinoki shelves, a bonsai and a paper lantern.",
    headline: "The floating world",
    tagline: "Quiet waves, a pine, and a page to turn.",
    dark: false,
    defs: `<pattern id="ukiyoe-needles" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M0.5 4L3 1.2L5.5 4" fill="none" stroke="${ink}" stroke-width="0.5"/></pattern>` +
      `<pattern id="ukiyoe-scales" width="3" height="2.4" patternUnits="userSpaceOnUse"><path d="M0 2.4A1.5 1.5 0 0 1 3 2.4M-1.5 1.2A1.5 1.5 0 0 1 1.5 1.2M1.5 1.2A1.5 1.5 0 0 1 4.5 1.2" fill="none" stroke="${ink}" stroke-width="0.35"/></pattern>`,
    wall: {
      base: BASE,
      tile: { w: 48, h: 24, svg: seigaiha },
      quiet: {
        w: 240, h: 220,
        svg: `<path d="M30 100H190a6 6 0 0 1 0 12H30a6 6 0 0 1 0-12ZM120 112H214a5 5 0 0 1 0 10H120a5 5 0 0 1 0-10Z" fill="${BASE}" stroke="#d3ccbf" stroke-width="0.8"/>`
      }
    },
    plank: {
      height: 12,
      back: w => `<path d="M2 -5H${w - 2}L${w} 0H0Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/><path d="M1 -2.5H${w - 1}" stroke="${ink}" stroke-width="0.35"/>`,
      front: (w, seed = 1) => {
        const rand = rng(seed * 17 + w);
        let lines = "";
        for (const y of [4.2, 6.6, 9]) {
          let x = 18 + rand() * 10;
          while (x < w - 20) {
            const len = 30 + rand() * 70, end = Math.min(x + len, w - 18);
            lines += `M${r1(x)} ${y}H${r1(end)}`;
            x = end + 4 + rand() * 12;
          }
        }
        const tenon = x => `<rect x="${x}" y="-3" width="8" height="17" fill="${paper}" stroke="${ink}" stroke-width="1"/>` +
          `<rect x="${x + 5.4}" y="-2.4" width="2" height="15.8" fill="url(#h-vert)"/>` +
          `<path d="M${x + 1.5} -3H${x + 6.5}L${x + 5.5} 1H${x + 2.5}Z" fill="${ink}"/>`;
        return `<rect x="8" y="12" width="${w - 16}" height="3" fill="url(#h-horz)"/>` +
          `<rect x="0" y="0" width="${w}" height="12" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>` +
          `<line x1="0" y1="0.5" x2="${w}" y2="0.5" stroke="${ink}" stroke-width="1.4"/>` +
          `<path d="${lines}" stroke="${ink}" stroke-width="0.4"/>` +
          tenon(7) + tenon(w - 15);
      }
    },
    plate: (w, h) =>
      `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>` +
      `<path d="M3 3H${w - 3}M3 ${h - 3}H${w - 3}" stroke="${ink}" stroke-width="0.5"/>` +
      `<rect x="${w - 12}" y="${h / 2 - 4}" width="8" height="8" fill="${ink}"/>` +
      `<path d="M${w - 10} ${h / 2 - 2}H${w - 6}M${w - 8} ${h / 2 - 2.5}V${h / 2 + 2.5}M${w - 10} ${h / 2 + 1.5}H${w - 6}" stroke="${paper}" stroke-width="0.8"/>`,
    plateInk: ink,
    ornaments: [
      { id: "bonsai", label: "Bonsai pine", w: 92, h: 78, at: "shelf", svg: bonsai },
      { id: "plum-vase", label: "Plum branch in a vase", w: 62, h: 104, at: "shelf", svg: plumVase },
      { id: "chochin", label: "Paper lantern and moth", w: 46, h: 70, at: "shelf", svg: lantern },
      { id: "daruma", label: "Daruma doll", w: 40, h: 42, at: "shelf", svg: daruma },
      { id: "fan", label: "Folding fan", w: 66, h: 48, at: "shelf", svg: fan },
      { id: "tea-bowl", label: "Tea bowl on stand", w: 52, h: 48, at: "shelf", svg: teaBowl },
      { id: "wind-chime", label: "Wind chime", w: 30, h: 66, at: "hang", svg: windChime },
      { id: "noren", label: "Noren curtain", w: 58, h: 48, at: "hang", svg: noren },
      { id: "fuji-print", label: "Mountain print with cranes", w: 104, h: 84, at: "wall", svg: fujiPrint },
      { id: "koi-scroll", label: "Koi hanging scroll", w: 54, h: 88, at: "wall", svg: koiScroll },
      { id: "sparrow", label: "Sparrow", w: 34, h: 25, at: "perch", svg: sparrow },
      { id: "paper-crane", label: "Paper crane", w: 42, h: 26, at: "perch", svg: crane }
    ],
    hero: {
      w: 132, h: 92,
      svg: `<g transform="translate(0 14)">${bonsai}</g><g transform="translate(57 55.4) scale(0.82)">${sparrow}</g>` +
        `<g transform="translate(87 24.6) scale(0.95)">${lantern}</g>` +
        `${drift("M64 4C67 7 63 9 66 12")}${petal(66.4, 13, 20)}${petal(80, 8, -50)}` +
        `<line x1="0" y1="91.4" x2="132" y2="91.4" stroke="${ink}" stroke-width="1.2"/>`
    }
  });
})();
