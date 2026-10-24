// Botanical: engraved fern wallpaper, birch shelves on brass brackets, a potted fern, wildflowers and trailing ivy.
(() => {
  const ink = K.ink, paper = K.paper;

  // Engraved fern frond along a quadratic curve; leaflets taper toward the tip.
  const frond = (p0, c, p1, n, maxL, color, width) => {
    const pt = t => [0, 1].map(k => (1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * c[k] + t * t * p1[k]);
    const tan = t => [0, 1].map(k => 2 * (1 - t) * (c[k] - p0[k]) + 2 * t * (p1[k] - c[k]));
    let d = `M${p0.join(" ")}Q${c.join(" ")} ${p1.join(" ")}`;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), [x, y] = pt(t), [dx, dy] = tan(t), len = Math.hypot(dx, dy);
      const tx = dx / len, ty = dy / len, L = maxL * (1 - t) ** 0.6 * Math.min(1, 0.3 + t * 5);
      for (const s of [1, -1]) {
        const nx = -ty * s, ny = tx * s;
        d += `M${r1(x)} ${r1(y)}Q${r1(x + nx * L * 0.6)} ${r1(y + ny * L * 0.6)} ${r1(x + nx * L + tx * L * 0.45)} ${r1(y + ny * L + ty * L * 0.45)}`;
      }
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  };

  // Boston fern: engraved fronds arching from the crown, the same drawing as the wallpaper but in ink.
  const fern = `
${[[[38, 61], [10, 40], [6, 62], 9], [[38, 61], [66, 40], [70, 62], 9], [[38, 61], [14, 10], [8, 40], 13], [[38, 61], [62, 10], [68, 40], 13],
    [[38, 61], [26, 8], [16, 14], 12], [[38, 61], [50, 8], [60, 14], 12], [[38, 61], [36, 20], [40, 4], 12]]
    .map(([p0, c, p1, n]) => frond(p0, c, p1, n, 6, ink, 0.75)).join("")}
<path d="M18 91L15 66H61L58 91Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M49 67H61L58 91H48Z" fill="url(#h-diag)"/>
<path d="M16.2 75l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4" fill="none" stroke="${ink}" stroke-width="0.7"/>
<path d="M16.6 79H59.4" stroke="${ink}" stroke-width="0.6"/>
<rect x="13" y="60" width="50" height="7" rx="1.5" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="54" y="60.7" width="8.4" height="5.6" fill="url(#h-diag)"/>`;

  const daisy = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">` +
    Array.from({ length: 10 }, (_, i) => `<ellipse cx="0" cy="-4.4" rx="1.4" ry="3.6" transform="rotate(${i * 36})" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>`).join("") +
    `<circle r="2.6" fill="${paper}" stroke="${ink}" stroke-width="0.7"/><circle r="2.4" fill="url(#h-dots-dense)"/></g>`;
  const jar = `
<path d="M24 52C22 36 16 24 12 12M24 52C26 38 30 26 32 16M24 52C24 40 24 30 23 24M24 52C20 44 8 38 4 30M24 52C28 44 40 36 44 26" fill="none" stroke="${ink}" stroke-width="0.9"/>
<ellipse cx="4" cy="27.6" rx="1.1" ry="2.6" transform="rotate(-30 4 27.6)" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<ellipse cx="2.6" cy="31.4" rx="1" ry="2.2" transform="rotate(-70 2.6 31.4)" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<ellipse cx="44.6" cy="23.6" rx="1.1" ry="2.6" transform="rotate(25 44.6 23.6)" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<ellipse cx="46" cy="27.4" rx="1" ry="2.2" transform="rotate(70 46 27.4)" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
${daisy(12, 11, 1)}${daisy(32, 15, 0.8)}
<path d="M19 20C19 15 27 15 27 20L28.5 25C26 24 24.5 26 23 24.5C21.5 26 20 24 17.5 25Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M24 16C26 17 27 19 27 20L28.5 25C27 24.6 26 24.8 25 25.4C26 22 26 19 24 16Z" fill="url(#h-diag-fine)"/>
<path d="M10 86C8 86 7 85 7 83V60C7 56 11 54 14 54H34C37 54 41 56 41 60V83C41 85 40 86 38 86Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M8 64H40V83C40 84.6 39 85.6 38 85.6H10C9 85.6 8 84.6 8 83Z" fill="url(#h-horz-wide)"/>
<path d="M8 64H40" stroke="${ink}" stroke-width="0.7"/>
<path d="M22 54C22 64 21 74 20 82M24 54V82M26 54C26 64 27 74 28 82" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M35 55C38 56 41 57 41 60V83C41 85 40 86 38 86H35Z" fill="url(#h-diag-fine)"/>
<path d="M11.2 58C10.2 66 10.2 76 11.2 82" fill="none" stroke="${paper}" stroke-width="2.2" stroke-linecap="round"/>
<rect x="12" y="48" width="24" height="6" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M12 50H36M12 52H36" stroke="${ink}" stroke-width="0.5"/>
<path d="M12 51C7 54 6 58 9 59M12 51C14.5 56 13 60 10.5 61.5" fill="none" stroke="${ink}" stroke-width="0.9"/>`;

  const can = `
<path d="M20 44L5 17L8.5 15.5L21 37Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M15 33L21 37V44Z" fill="url(#h-diag)"/>
<ellipse cx="5.6" cy="14.6" rx="5" ry="2.6" transform="rotate(-60 5.6 14.6)" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<ellipse cx="5.6" cy="14.6" rx="3.6" ry="1.6" transform="rotate(-60 5.6 14.6)" fill="url(#h-dots-dense)"/>
<path d="M24 19C25 5 47 5 49 19" fill="none" stroke="${ink}" stroke-width="3.2"/><path d="M24 19C25 5 47 5 49 19" fill="none" stroke="${paper}" stroke-width="1.2"/>
<path d="M56 25C66 25 67 44 56 46" fill="none" stroke="${ink}" stroke-width="3.2"/><path d="M56 25C66 25 67 44 56 46" fill="none" stroke="${paper}" stroke-width="1.2"/>
<path d="M18 52V24C18 21 20 19 23 19H51C54 19 56 21 56 24V52Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M46 19.2H51C54 19 56 21 56 24V49H46Z" fill="url(#h-vert)"/>
<path d="M18 27H56M18 45H56" stroke="${ink}" stroke-width="0.7"/>
${[21, 29, 37, 45, 53].map(x => `<circle cx="${x}" cy="27" r="0.8" fill="${ink}"/>`).join("")}
<path d="M28 41Q31 31 41 29Q39 39 28 41Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M28 41Q33 36 41 29" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M28 41Q31 31 41 29Q36 34 28 41Z" fill="url(#h-diag-fine)"/>
<ellipse cx="44" cy="19.2" rx="7" ry="2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<ellipse cx="44" cy="19.4" rx="5" ry="1.1" fill="${ink}"/>
<rect x="16.5" y="49" width="41" height="4" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="17" y="51" width="40" height="1.6" fill="url(#h-vert)"/>`;

  const snail = `
<path d="M3 31C3 25 5 21 7 16.5C8.5 13 12.5 13 12.5 17.5C12.5 22 13.5 25.5 17 26.5H41C45 26.5 47 29 46 31Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M3 31C3 25 5 21 7 16.5C8.5 13 12.5 13 12.5 17.5C12.5 22 13.5 25.5 17 26.5H41C45 26.5 47 29 46 31Z" fill="url(#h-dots)"/>
<path d="M7.5 15L4.5 7M10.5 14.5L11.5 6.5" stroke="${ink}" stroke-width="1"/>
<circle cx="4.5" cy="7" r="1.3" fill="${ink}"/><circle cx="11.5" cy="6.5" r="1.3" fill="${ink}"/>
<circle cx="28" cy="15" r="12.5" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M37 6.5A12.5 12.5 0 0 1 21 26A14 14 0 0 0 37 6.5Z" fill="url(#h-diag)"/>
<path d="M26 15a2 2 0 1 1 4 0a4 4 0 1 1 -8 0a6.5 6.5 0 1 1 13 0a9.5 9.5 0 1 1 -19 0" fill="none" stroke="${ink}" stroke-width="1"/>`;

  // Three-lobed ivy leaf hanging from its stalk at 0,0.
  const ivyLeaf = "M0 0C-2 0 -5 1 -6 3L-4 4L-7 7C-5 9 -2 9 -1 8L0 11L1 8C2 9 5 9 7 7L4 4L6 3C5 1 2 0 0 0Z";
  const ivy = `
<path d="M10 0C6 14 14 26 9 40C6 50 12 56 10 62M28 0C32 12 24 22 29 34C32 42 27 48 28 54M47 0C43 8 51 16 47 26" fill="none" stroke="${ink}" stroke-width="0.9"/>
${[[8, 8, 30, 1, 0], [13, 22, -30, 1, 1], [8, 36, 25, 1.1, 0], [10, 49, -20, 1, 1], [10, 58, 0, 0.9, 0],
    [30, 10, -25, 1, 1], [26, 24, 30, 1, 0], [30, 38, -20, 0.9, 0], [28, 51, 10, 0.8, 1], [45, 10, 25, 0.9, 0], [48, 23, -20, 0.8, 1]]
    .map(([x, y, rot, s, dark]) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="${ivyLeaf}" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>` +
      (dark ? `<path d="${ivyLeaf}" fill="url(#h-diag-fine)"/>` : "") + `<path d="M0 0V9M0 3.4L-4 6M0 3.4L4 6" fill="none" stroke="${ink}" stroke-width="0.5"/></g>`).join("")}`;

  const pressedLeaf = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M0 0C-4 -3 -12 -2 -16 2C-12 4 -4 3 0 0Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/><path d="M0 0C-4 -3 -12 -2 -16 2C-12 4 -4 3 0 0Z" fill="url(#h-diag-fine)"/><path d="M0 0L-15 1.6" stroke="${ink}" stroke-width="0.5"/></g>`;
  const herbarium = `
<rect x="1" y="1" width="76" height="96" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
<path d="M4 4H74V94H4ZM8 8V90H70V8Z" fill-rule="evenodd" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<rect x="8" y="8" width="62" height="82" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M38 82C37 66 40 50 37 34C36 26 38 20 37 16M37 30C42 26 46 24 48 20" fill="none" stroke="${ink}" stroke-width="1"/>
<path d="M38 82l-4 4M38 82l3 5M38 82l-1 6M36 84l-3 1M40 85l3 1" stroke="${ink}" stroke-width="0.6"/>
${pressedLeaf(37.6, 70, false)}${pressedLeaf(38.6, 62, true)}${pressedLeaf(38.2, 54, false)}${pressedLeaf(37.6, 46, true)}
<ellipse cx="48.5" cy="18.6" rx="1.8" ry="3.4" transform="rotate(25 48.5 18.6)" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
${[[0, -3.2], [3, -1], [1.9, 2.6], [-1.9, 2.6], [-3, -1]].map(([dx, dy]) => `<circle cx="${r1(37 + dx)}" cy="${r1(13 + dy)}" r="2.6" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>`).join("")}
<circle cx="37" cy="13" r="1.2" fill="${ink}"/>
${[[38, 76, 20], [37, 40, -15]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-5" y="-1.6" width="10" height="3.2" fill="${paper}" stroke="${ink}" stroke-width="0.5"/><rect x="-5" y="-1.6" width="10" height="3.2" fill="url(#h-dots)"/></g>`).join("")}
<rect x="47" y="78" width="20" height="9" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M49 81H64M49 84H60" stroke="${ink}" stroke-width="0.45"/>`;

  // Bell-jar terrarium: moss, a seedling and a toadstool inside; a ladybird climbs the glass.
  const terrarium = `
<path d="M10 77C14 71.6 40 71.6 44 77Z" fill="${paper}" stroke="${ink}" stroke-width="0.6"/><path d="M10 77C14 71.6 40 71.6 44 77Z" fill="url(#h-dots-dense)"/>
<path d="M27 74C27 64 25 58 27 49" fill="none" stroke="${ink}" stroke-width="0.9"/>
<path d="M27 60C22 57 19 58 17 61C21 63 24 62 27 60ZM27 55C31 51 35 51 37 53C34 56 30 57 27 55Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M27 60C22 57 19 58 17 61C21 61 24 61 27 60Z" fill="url(#h-diag-fine)"/>
<path d="M27 49C24 45 24 42 26 40C28 42 29 45 27 49ZM27 49C30 46 33 46 34 47.4C32 49.6 29.6 50 27 49Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M15.6 74V70.6h2.2V74" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M12.6 71C12.6 66.4 21 66.4 21 71Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<circle cx="15" cy="69" r="0.7" fill="${ink}"/><circle cx="18.4" cy="68.4" r="0.6" fill="${ink}"/>
<path d="M36 74c1-3 3-3.4 4-1.6M38 74c.6-2.4 2.6-3.2 3.4-1" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M8 77V34C8 14 46 14 46 34V77" fill="none" stroke="${ink}" stroke-width="1.4"/>
<path d="M41 24C44.6 27 46 30 46 34V77H42.4V34C42.4 30 41.8 27 41 24Z" fill="url(#h-diag-fine)"/>
<path d="M12.6 44C12.6 32 15 26 19.6 22.4" fill="none" stroke="${paper}" stroke-width="2.6" stroke-linecap="round"/>
<path d="M12 44C12 32 14.4 26 19 22.6M14.6 30.4C15.6 27.6 17 25.6 18.6 24.4" fill="none" stroke="${ink}" stroke-width="0.45"/>
<circle cx="27" cy="16.4" r="3" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><path d="M28 14.4a2.6 2.6 0 0 1 1.6 2.6" fill="none" stroke="${ink}" stroke-width="0.5"/>
<g transform="rotate(-30 44.6 47)"><ellipse cx="44.6" cy="47" rx="2.4" ry="2.9" fill="${ink}"/><path d="M44.6 44.2V49.8" stroke="${paper}" stroke-width="0.5"/>
<circle cx="43.6" cy="46.2" r="0.55" fill="${paper}"/><circle cx="45.6" cy="47.6" r="0.55" fill="${paper}"/><circle cx="44.6" cy="43.6" r="1" fill="${ink}"/></g>
<rect x="3" y="77" width="48" height="6" rx="2" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="3.6" y="80" width="46.8" height="2.4" rx="1" fill="url(#h-vert)"/>`;

  // Moth orchid: an arching spray of blooms, a bud, and one petal drifting down.
  const bloom = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${ink}" stroke-width="0.7">
<ellipse cx="0" cy="-4" rx="2.4" ry="3.6" fill="${paper}"/><ellipse cx="-2.6" cy="4" rx="1.9" ry="3" transform="rotate(25 -2.6 4)" fill="${paper}"/><ellipse cx="2.6" cy="4" rx="1.9" ry="3" transform="rotate(-25 2.6 4)" fill="${paper}"/>
<ellipse cx="-4.4" cy="0" rx="4.4" ry="4" fill="${paper}"/><ellipse cx="4.4" cy="0" rx="4.4" ry="4" fill="${paper}"/>
<path d="M-6.6 -1.4q2.2 1.4 4.2 1.6M6.6 -1.4q-2.2 1.4 -4.2 1.6" fill="none" stroke-width="0.4"/>
<path d="M-1.8 1C-1.8 4 1.8 4 1.8 1Z" fill="url(#h-cross-dense)"/><circle cx="0" cy="-0.4" r="1" fill="${paper}"/></g>`;
  const orchid = `
<path d="M31 76C31 52 31 32 34 23C38 15 47 12 55 16C57.4 17.6 58.4 20 58.6 22" fill="none" stroke="${ink}" stroke-width="1.1"/>
<path d="M31 78V24" stroke="${ink}" stroke-width="0.7"/><path d="M29.6 50h2.8M29.6 36h2.8" stroke="${ink}" stroke-width="1.2"/>
${bloom(36, 21, 1)}${bloom(46, 14.2, 1)}${bloom(53, 18.6, 0.85)}
<ellipse cx="58.6" cy="24" rx="1.6" ry="2.4" transform="rotate(30 58.6 24)" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M50 30q-2 5 1 9q-3 4 0 8" fill="none" stroke="${ink}" stroke-width="0.45" stroke-dasharray="1 1.4"/>
<ellipse cx="51" cy="50" rx="2" ry="2.8" transform="rotate(40 51 50)" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M31 78C20 76 10 72 4 76C12 80.4 22 80.4 31 78Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M31 78C22 77.4 12 75.6 4 76C12 80.4 22 80.4 31 78Z" fill="url(#h-diag-fine)"/>
<path d="M31 78C42 74 52 72 58 75C50 80 40 80.4 31 78Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M31 78C41 76.6 50 75 58 75" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M30 78C26 70 27 64 33 60C35 66 34 72 30 78Z" fill="${paper}" stroke="${ink}" stroke-width="1"/><path d="M30 78C30 72 31 66 33 60C35 66 34 72 30 78Z" fill="url(#h-diag-fine)"/>
<path d="M24 79C19 84 22 90 17 93" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/><path d="M24 79C19 84 22 90 17 93" fill="none" stroke="${paper}" stroke-width="0.6" stroke-linecap="round"/>
<path d="M18 102L15 81H47L44 102Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M37 81H47L44 102H36Z" fill="url(#h-diag)"/>
<path d="M20 81V102M25 81V102M30 81V102M35 81V102" stroke="${ink}" stroke-width="0.5"/>
<rect x="13" y="77" width="36" height="5" rx="1.5" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>`;

  // Butterfly seen from above, wings open; used in the specimen frame and the hero.
  const flyer = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` + [1, -1].map(m => `<g transform="scale(${m} 1)">
<path d="M0.6 0C4 -10 14 -12 16 -6C17 -1 10 2 0.6 1Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M10 -9.6C13.4 -10.4 16 -9 16 -6C17 -1.6 13 .6 10.6 .9C13 -2 12.8 -6 10 -9.6Z" fill="url(#h-diag-fine)"/>
<circle cx="9" cy="-4.6" r="2" fill="none" stroke="${ink}" stroke-width="0.6"/><circle cx="9" cy="-4.6" r="0.8" fill="${ink}"/>
<path d="M0.6 1.6C8 2 12 6 9 11C6 14 2 9 0.6 3Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M1.4 3.6C4 6 6 8.6 6.4 11.4M1 1.4L13 -5.4" fill="none" stroke="${ink}" stroke-width="0.4"/></g>`).join("") +
    `<ellipse cx="0" cy="2" rx="1.1" ry="6" fill="${ink}"/><path d="M0 -3.6C-1 -7 -3 -9 -4.6 -9.6M0 -3.6C1 -7 3 -9 4.6 -9.6" fill="none" stroke="${ink}" stroke-width="0.5"/>` +
    `<circle cx="-4.6" cy="-9.6" r="0.6" fill="${ink}"/><circle cx="4.6" cy="-9.6" r="0.6" fill="${ink}"/></g>`;
  const specimens = `
<rect x="1" y="1" width="86" height="68" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
<path d="M4 4H84V66H4ZM8 8V62H80V8Z" fill-rule="evenodd" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<rect x="8" y="8" width="72" height="54" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
${flyer(27, 28, 1)}${flyer(62, 29, 0.82, 8)}
<circle cx="27" cy="21.4" r="0.9" fill="${paper}" stroke="${ink}" stroke-width="0.6"/><circle cx="62" cy="23.6" r="0.9" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<rect x="18" y="49" width="18" height="6" fill="${paper}" stroke="${ink}" stroke-width="0.5"/><path d="M20 52H34" stroke="${ink}" stroke-width="0.45"/>
<rect x="53" y="49" width="18" height="6" fill="${paper}" stroke="${ink}" stroke-width="0.5"/><path d="M55 52H66" stroke="${ink}" stroke-width="0.45"/>`;

  // Macrame hanger with string-of-pearls spilling over the rim and a tassel.
  const knotNet = [[22, 5, 15, 14], [22, 5, 22, 14], [22, 5, 29, 14], [15, 14, 10, 26], [15, 14, 18.5, 26], [22, 14, 18.5, 26], [22, 14, 25.5, 26],
    [29, 14, 25.5, 26], [29, 14, 34, 26], [10, 26, 7, 40], [18.5, 26, 17, 40], [25.5, 26, 27, 40], [34, 26, 37, 40]];
  const pearls = [[8, 43], [6.6, 46], [5.6, 49], [5, 52], [5.2, 55], [5.8, 58], [6.6, 61], [7.2, 64], [36, 43], [37.6, 46], [38.6, 49], [39, 52], [38.6, 55], [38, 58],
    [14, 39], [18, 38.4], [22, 38], [26, 38.4], [30, 39], [11, 40.4], [33, 40.4]];
  const macrame = `
<circle cx="22" cy="3" r="2.4" fill="none" stroke="${ink}" stroke-width="1.2"/>
<path d="${knotNet.map(([a, b, c, d]) => `M${a} ${b}L${c} ${d}`).join("")}" stroke="${ink}" stroke-width="0.8"/>
${[[15, 14], [22, 14], [29, 14], [10, 26], [18.5, 26], [25.5, 26], [34, 26]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.2" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>`).join("")}
<path d="M22 56L19 66M22 56V67.4M22 56L25 66M22 56L20.4 66.6M22 56L23.6 66.6" stroke="${ink}" stroke-width="0.6"/>
<ellipse cx="22" cy="57.6" rx="2" ry="1.6" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M6 40H38C38 50 32 56 22 56C12 56 6 50 6 40Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M29 40H38C38 50 32 56 22 56C28 52 30 46 29 40Z" fill="url(#h-diag)"/><path d="M6.4 43.4H37.6" stroke="${ink}" stroke-width="0.6"/>
<path d="M17 38L15 31.6M23 37.6L24 30.6M27 38.4L30 33" stroke="${ink}" stroke-width="0.6"/>
${pearls.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.35" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>`).join("")}
<path d="M8 43C5 50 5 58 7.2 64M36 43C39 47 39.6 53 38 58" fill="none" stroke="${ink}" stroke-width="0.4"/>`;

  // Perches: a robin singing, and a butterfly resting with its wings closed.
  const robin = `
<path d="M7 15L1 10.6L2 16.4L7 19Z" fill="${paper}" stroke="${ink}" stroke-width="1"/><path d="M5 15.4L1.6 13.6L2 16.4L6 18Z" fill="url(#h-diag)"/>
<path d="M14 23V27.6M18 23V27.6M11.4 27.6H15.8M16.6 27.6H21" stroke="${ink}" stroke-width="0.9" stroke-linecap="round"/>
<ellipse cx="16" cy="16" rx="10" ry="8" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M20 11.4C26.4 13.6 26.4 21.6 18.4 23.6C14 23.8 12 20 14 16Z" fill="url(#h-dots-dense)"/>
<path d="M6 12C10 9 18 10 21 15C17 20 10 20 6 16Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M6 12C10 9 18 10 21 15C17 20 10 20 6 16Z" fill="url(#h-diag)"/><path d="M10 11.2l3 6M14 11l3 6.4" stroke="${paper}" stroke-width="0.7"/>
<circle cx="25" cy="9" r="5.5" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M25.6 14.4C28.6 13 30 11 30.2 9.6C29 12.6 27 13.6 25.6 14.4Z" fill="url(#h-dots-dense)"/>
<path d="M29.8 8L33.6 8.6L30 9.6ZM30 10L33 11.4L29.8 10.8Z" fill="${ink}"/>
<circle cx="26.6" cy="7.8" r="0.95" fill="${ink}"/><circle cx="26.9" cy="7.5" r="0.3" fill="${paper}"/>
<circle cx="30.4" cy="4.6" r="1.1" fill="${ink}"/><path d="M31.4 4.6V.8l2 1" fill="none" stroke="${ink}" stroke-width="0.6"/>`;
  const restingButterfly = `
<path d="M14 21C8 18 4 14 6 9C10 9 14 14 15 20Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M14 21C10 18.6 7 15.6 7 12C10 13 13 16 15 20Z" fill="url(#h-diag-fine)"/>
<path d="M14 21C10 12 12 3 22 1C25 6 22 16 15 21Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M22 1C25 6 22 16 15 21C19 14 21 7 22 1Z" fill="url(#h-diag-fine)"/>
<circle cx="18.6" cy="8.4" r="2.2" fill="none" stroke="${ink}" stroke-width="0.7"/><circle cx="18.6" cy="8.4" r="0.8" fill="${ink}"/>
<path d="M15 20L16 12M15 20L19.6 14.6M15 20L13 13" stroke="${ink}" stroke-width="0.4"/>
<ellipse cx="15" cy="21.6" rx="5.6" ry="1.6" fill="${ink}"/><circle cx="21" cy="21" r="1.6" fill="${ink}"/>
<path d="M21.6 19.6C23 15.4 25 13.4 27.4 12.8M22 20C24.6 17 26.4 16.4 28.6 16.6" fill="none" stroke="${ink}" stroke-width="0.5"/>
<circle cx="27.4" cy="12.8" r="0.6" fill="${ink}"/><circle cx="28.6" cy="16.6" r="0.6" fill="${ink}"/>
<path d="M12 22.6L10.4 26M15 23V26M18 22.6L19.6 26" stroke="${ink}" stroke-width="0.6"/>`;

  const bracket = (x, flip) =>
    `<g transform="translate(${x} 0) scale(${flip ? -1 : 1} 1)" fill="none" stroke="${ink}">` +
    `<path d="M0 12V29" stroke-width="2"/><path d="M0 27C1 19 6 13.5 13 12" stroke-width="1.6"/>` +
    `<path d="M3.4 21.6a2.4 2.4 0 1 1 2.6 2.6" stroke-width="1"/><circle cx="0" cy="28" r="1" fill="${paper}" stroke-width="0.6"/></g>`;

  registerTheme({
    id: "botanical",
    name: "Botanical",
    group: "v3",
    blurb: "Engraved fern wallpaper, birch shelves on brass brackets, trailing ivy and pressed flowers.",
    headline: "Stories in bloom",
    tagline: "A little room to let your mind wander.",
    dark: false,
    wall: {
      base: "#edebe4",
      tile: {
        w: 100, h: 120,
        svg: frond([10, 116], [20, 60], [54, 8], 14, 13, K.g2, 0.55) + frond([66, 118], [84, 96], [88, 64], 8, 8, K.g2, 0.5) +
          `<circle cx="80" cy="22" r="0.9" fill="${K.g2}"/><circle cx="86" cy="27" r="0.7" fill="${K.g2}"/><circle cx="76" cy="30" r="0.6" fill="${K.g2}"/>`
      },
      quiet: { w: 100, h: 120, svg: frond([48, 72], [50, 62], [58, 52], 5, 4, "#d3cfc4", 0.6) }
    },
    plank: {
      height: 12,
      back: w => `<path d="M3 -6H${w - 3}L${w} 0H0Z" fill="${paper}"/><path d="M3 -6H${w - 3}L${w} 0H0Z" fill="url(#h-dots)" stroke="${ink}" stroke-width="0.8"/>`,
      front: (w, seed = 1) => {
        const rand = rng(seed * 13 + w);
        let marks = "";
        for (let x = 4 + rand() * 6; x < w - 10; x += 6 + rand() * 10) {
          const y = r1(3.2 + rand() * 6.5), len = r1(2.5 + rand() * 6);
          marks += rand() < 0.12
            ? `<ellipse cx="${r1(x + len / 2)}" cy="${y}" rx="3" ry="1.3" fill="${ink}"/>`
            : `<path d="M${r1(x)} ${y}h${len}" stroke="${ink}" stroke-width="${r1(0.7 + rand() * 1.1)}" stroke-linecap="round"/>`;
        }
        return `<path d="M8 12H${w - 8}L${w - 14} 19H14Z" fill="url(#h-diag-wide)"/>` +
          bracket(24, false) + bracket(w - 24, true) +
          `<rect x="0" y="0" width="${w}" height="12" rx="1.5" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>` +
          `<line x1="0.5" y1="0.7" x2="${w - 0.5}" y2="0.7" stroke="${ink}" stroke-width="1.6"/>` + marks;
      }
    },
    plate: (w, h) => {
      const sprig = `<path d="M5 ${h / 2 + 3.5}q1 -6.5 5.5 -7.5q-1 5.5 -5.5 7.5z" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>`;
      return `<rect x="0.6" y="0.6" width="${w - 1.2}" height="${h - 1.2}" fill="${paper}" stroke="${ink}" stroke-width="1"/>` +
        `<path d="M3 3.2H${w - 3}M3 ${h - 3.2}H${w - 3}" stroke="${ink}" stroke-width="0.5"/>` +
        sprig + `<g transform="translate(${w} 0) scale(-1 1)">${sprig}</g>`;
    },
    plateInk: ink,
    // Tall and low pieces alternate so neighbouring ornaments vary in height.
    ornaments: [
      { id: "fern", label: "Potted fern", w: 76, h: 92, at: "shelf", svg: fern },
      { id: "snail", label: "Garden snail", w: 48, h: 32, at: "shelf", svg: snail },
      { id: "orchid", label: "Moth orchid", w: 62, h: 104, at: "shelf", svg: orchid },
      { id: "can", label: "Watering can", w: 70, h: 54, at: "shelf", svg: can },
      { id: "terrarium", label: "Bell-jar terrarium", w: 54, h: 84, at: "shelf", svg: terrarium },
      { id: "wildflowers", label: "Wildflowers in a jar", w: 48, h: 86, at: "shelf", svg: jar },
      { id: "herbarium", label: "Herbarium sheet", w: 78, h: 98, at: "wall", svg: herbarium },
      { id: "specimens", label: "Butterfly specimens", w: 88, h: 70, at: "wall", svg: specimens },
      { id: "ivy", label: "Trailing ivy", w: 60, h: 70, at: "hang", svg: ivy },
      { id: "macrame", label: "Macrame hanger", w: 44, h: 70, at: "hang", svg: macrame },
      { id: "robin", label: "Robin singing", w: 34, h: 28, at: "perch", svg: robin },
      { id: "butterfly", label: "Resting butterfly", w: 30, h: 26, at: "perch", svg: restingButterfly }
    ],
    hero: {
      w: 132, h: 92,
      svg: `<g transform="translate(0 12.4) scale(0.92)">${jar}</g><g transform="translate(40 8.4) scale(0.9)">${fern}</g>` +
        `<path d="M100 46q-7-10 3-13q8-2 7-9" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.2 1.6"/>${flyer(117, 15, 0.55, -20)}` +
        `<g transform="translate(95 67.4) scale(0.75)">${snail}</g><line x1="0" y1="91.4" x2="132" y2="91.4" stroke="${ink}" stroke-width="1.2"/>`
    }
  });
})();
