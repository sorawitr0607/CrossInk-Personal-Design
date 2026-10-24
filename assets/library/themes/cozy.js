// Cozy Nook: sprigged cottage wallpaper, a painted shelf with a gingham valance, a sleeping cat and tea.
(() => {
  const ink = K.ink, paper = K.paper;

  // Five-petal floret used by the geranium heads.
  const floret = (x, y, shade) =>
    [[2.2, 0], [0.68, 2.09], [-1.78, 1.29], [-1.78, -1.29], [0.68, -2.09]]
      .map(([dx, dy]) => `<circle cx="${r1(x + dx)}" cy="${r1(y + dy)}" r="1.6" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>`).join("") +
    (shade ? `<circle cx="${x}" cy="${y}" r="3.6" fill="url(#h-diag-fine)"/>` : "") +
    `<circle cx="${x}" cy="${y}" r="0.8" fill="${ink}"/>`;
  const head = (x, y) =>
    [[0, -9, 0], [-4.5, -6, 0], [4, -6.5, 1], [-6, -1, 0], [0, -2, 0], [6, -1.5, 1], [-3, 3, 0], [3.5, 3, 1]]
      .map(([dx, dy, s]) => floret(x + dx, y + dy, s)).join("");

  const cat = `
<ellipse cx="40" cy="42" rx="37" ry="4.5" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M13 45C9 31 19 17 39 16C57 15 73 23 75 35C76 41 73 44 67 45Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M57 17C69 20 75 27 75 35C76 41 73 44 67 45H53C63 41 67 31 57 17Z" fill="url(#h-diag)"/>
<path d="M33 18C35 23 34 27 31 30M43 16.5C45.5 21.5 44.5 27 41.5 31M53 17.5C55.5 22.5 55 28 52 32M62 20C64 25 63.5 30 61 33.5" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M71 42C65 46 39 46 25 44C21 43.5 20 41 23 40.5C35 42 57 42 68 38.5Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M36 42l.8 3.2M44 42.3l.8 3.3M52 42l.8 3.2M60 41l.8 3.2" stroke="${ink}" stroke-width="1.3"/>
<path d="M15.5 28L14 18.5L21.5 24.5ZM27 23.2L32.5 15.5L34.5 25.5Z" fill="${paper}" stroke="${ink}" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M16 26L15.2 21L19.5 24.8ZM29 23.5L32.2 18.6L33.2 24.5Z" fill="url(#h-diag-fine)"/>
<ellipse cx="26" cy="33" rx="12.5" ry="10" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M28 24C33 25 37.5 28 38.4 33C37 38 33 41.5 29 42.6C33 38 34 30 28 24Z" fill="url(#h-diag-fine)"/>
<path d="M18 32.5q3 2.4 6 0M27.5 32q3 2.4 6 0" fill="none" stroke="${ink}" stroke-width="1" stroke-linecap="round"/>
<path d="M24.2 35.6h3l-1.5 1.8Z" fill="${ink}"/>
<path d="M25.7 37.4q-1.2 1.6-2.8.8M25.7 37.4q1.2 1.6 2.8.8M15 36.5L6 34.5M15 38L6 39.2M36.5 36.5L44 35.2" fill="none" stroke="${ink}" stroke-width="0.55"/>
<ellipse cx="31" cy="43" rx="7" ry="2.8" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M29 41.6v2M32 41.6v2" stroke="${ink}" stroke-width="0.5"/>
<path d="M3 42C3 46.5 6 49.6 12 49.6H68C74 49.6 77 46.5 77 42C70 46.2 10 46.2 3 42Z" fill="${paper}"/>
<path d="M3 42C3 46.5 6 49.6 12 49.6H68C74 49.6 77 46.5 77 42C70 46.2 10 46.2 3 42Z" fill="url(#cozy-gingham)" stroke="${ink}" stroke-width="1.2"/>
<path d="M21 46l2 2M23 46l-2 2M39 46.6l2 2M41 46.6l-2 2M57 46l2 2M59 46l-2 2" stroke="${ink}" stroke-width="0.8"/>
<path d="M68 41C76 41 79 46 75 48.6C72.5 50 70 48 71.6 46.4" fill="none" stroke="${ink}" stroke-width="3.6" stroke-linecap="round"/>
<path d="M68 41C76 41 79 46 75 48.6C72.5 50 70 48 71.6 46.4" fill="none" stroke="${paper}" stroke-width="1.6" stroke-linecap="round"/>
<path d="M73.5 42.6l1.6-1.2M76.4 45.6l1.6-.4" stroke="${ink}" stroke-width="0.9"/>
<path d="M4 12h4l-4 4.5h4M8.6 5h3l-3 3.2h3M13 .8h2.2l-2.2 2.4h2.2" fill="none" stroke="${ink}" stroke-width="0.75" stroke-linejoin="round"/>`;

  const teapot = `
<path d="M9 41C3 39 2 30 .8 24L4 23C5 29 7 33 10 34Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M47 28C58 27 58 45 46 45" fill="none" stroke="${ink}" stroke-width="3"/><path d="M47 28C58 27 58 45 46 45" fill="none" stroke="${paper}" stroke-width="1"/>
<path d="M10 50C4 44 4 30 12 24C18 20 38 20 44 24C52 30 52 44 46 50Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M38 21.6C41 22.2 42.6 23 44 24C52 30 52 44 46 50H39C45 42 45 30 38 21.6Z" fill="url(#h-diag)"/>
<path d="M7.5 33C20 37 36 37 48.6 33" fill="none" stroke="${ink}" stroke-width="0.7" stroke-dasharray="1.4 1.8"/>
${floret(26, 42.5, false)}<path d="M19.5 43.5q2-2.2 4-1M32.5 43.5q-2-2.2-4-1" fill="none" stroke="${ink}" stroke-width="0.7"/>
<rect x="12" y="49.5" width="32" height="3" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M15 23C17 17 39 17 41 23Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M33 18.3C37 19 40 20.5 41 23H35C35 21 34.5 19.5 33 18.3Z" fill="url(#h-diag-fine)"/>
<circle cx="28" cy="16" r="2.6" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<ellipse cx="73" cy="50.5" rx="13.5" ry="2.6" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M83 39C88 39 88 45 82 45" fill="none" stroke="${ink}" stroke-width="1.6"/>
<path d="M63 37H83C83 45 79 49 73 49C67 49 63 45 63 37Z" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M76 37H83C83 45 79 49 73 49C77 46 78 42 76 37Z" fill="url(#h-diag)"/>
<path d="M64.2 41.4C68 42.8 78 42.8 81.8 41.4" fill="none" stroke="${ink}" stroke-width="0.6" stroke-dasharray="1.2 1.6"/>
<ellipse cx="73" cy="37" rx="10" ry="2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<ellipse cx="73" cy="37.3" rx="8" ry="1.2" fill="url(#h-cross-dense)"/>
<path d="M70 33C68 29 72 27 70 23M76 33C74 29 78 27 76 23M4 19C2 15 6 13 4 9" fill="none" stroke="${ink}" stroke-width="0.7" stroke-linecap="round"/>`;

  const geranium = `
<path d="M26 44C24 32 20 24 17 17M27 44C29 34 32 28 35 22M26 44C26 36 26 31 26 28" fill="none" stroke="${ink}" stroke-width="1"/>
${[[18, 40], [34, 39], [13, 47], [39, 46], [26, 47]].map(([x, y]) => {
    // Scalloped zonal leaf: nine lobes, a dark horseshoe band open at the stalk, fine veins.
    let edge = "", veins = "";
    for (let i = 0; i <= 9; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 9, px = r1(x + 7 * Math.cos(a)), py = r1(y + 7 * Math.sin(a));
      edge += i ? `A2.5 2.5 0 0 1 ${px} ${py}` : `M${px} ${py}`;
      if (i < 9) veins += `M${x} ${y}L${r1(x + 5.6 * Math.cos(a))} ${r1(y + 5.6 * Math.sin(a))}`;
    }
    return `<path d="${edge}Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>` +
      `<path d="M${x} ${y - 7}A7 7 0 0 1 ${x} ${y + 7}Z" fill="url(#h-diag-fine)"/>` +
      `<path d="${veins}" stroke="${ink}" stroke-width="0.35"/>` +
      `<path d="M${r1(x - 3.5)} ${y + 2}A4 4 0 1 1 ${r1(x + 3.5)} ${y + 2}" fill="none" stroke="${ink}" stroke-width="1.3"/>`;
  }).join("")}
${head(17, 14)}${head(35, 20)}
<ellipse cx="26" cy="26.5" rx="1.8" ry="3" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<rect x="8" y="52" width="36" height="6" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="34" y="52.6" width="9.4" height="4.8" fill="url(#h-diag)"/>
<path d="M11 58L14 75.5H38L41 58Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M31 58H41L38 75.5H32Z" fill="url(#h-diag)"/>
<path d="M12 63H40" stroke="${ink}" stroke-width="0.6"/>`;

  // Woven basket cells, kept inside the tapering sides.
  const weave = (() => {
    let s = "";
    for (let row = 0; row < 4; row++) {
      const y = 34 + row * 5, inset = (y + 5 - 32) * 4 / 22;
      for (let x = 5 + inset + 0.6, col = 0; x + 6 <= 59 - inset - 0.6; x += 6, col++)
        if ((row + col) % 2) s += `<rect x="${r1(x)}" y="${y}" width="6" height="5" fill="url(#h-horz)"/>`;
    }
    return s;
  })();
  const yarn = `
<path d="M28 30L47 3M34 30L57 6" stroke="${ink}" stroke-width="1.4"/>
<circle cx="47" cy="3" r="1.8" fill="${ink}"/><circle cx="57" cy="6" r="1.8" fill="${ink}"/>
<circle cx="42" cy="27" r="9" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<circle cx="42" cy="27" r="8.4" fill="url(#h-cross)"/>
<path d="M35 22C40 25 44 31 44 35M37 19.5C43 22 48 27 49 30M34 28C38 24 44 20 48 20" fill="none" stroke="${paper}" stroke-width="0.9"/>
<circle cx="22" cy="27" r="11" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M13 21C20 25 26 34 26 38M15 18C23 22 29 30 31 34M18 16.5C25 19 31 25 32.5 29M12 30C16 26 24 22 30 20" fill="none" stroke="${ink}" stroke-width="0.7"/>
<path d="M29 19A11 11 0 0 1 16 36.5A12.5 12.5 0 0 0 29 19Z" fill="url(#h-diag)"/>
<path d="M5 32H59L55 54H9Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
${weave}
<path d="M5.4 37H58.6M6.3 42H57.7M7.2 47H56.8M8.1 52H55.9" stroke="${ink}" stroke-width="0.6"/>
<path d="M48 32H59L55 54H46Z" fill="url(#h-diag)"/>
<rect x="3" y="29" width="58" height="5" rx="2" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="3.6" y="29.6" width="56.8" height="3.8" rx="1.6" fill="url(#h-diag-wide)"/>
<path d="M18 36C16 42 22 46 18 51C16.5 53 19 55 21 53" fill="none" stroke="${ink}" stroke-width="1" stroke-linecap="round"/>`;

  const archWindow = `
<line x1="2" y1="3" x2="98" y2="3" stroke="${ink}" stroke-width="1.6"/>
<circle cx="2.4" cy="3" r="2.2" fill="${paper}" stroke="${ink}" stroke-width="1"/><circle cx="97.6" cy="3" r="2.2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M14 88V44A36 36 0 0 1 86 44V88Z" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
<path d="M14 88V44A36 36 0 0 1 86 44V88ZM20 88H80V45A30 30 0 0 0 20 45Z" fill-rule="evenodd" fill="url(#h-diag-fine)"/>
<g clip-path="url(#cozy-glass)">
<path d="M18 17H82M18 19.5H82M18 22.4H82M18 25.8H82M18 29.6H82M18 34H82M18 39H82" stroke="${ink}" stroke-width="0.45"/>
<circle cx="64" cy="33" r="5" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M40 29q2-2 4 0q2-2 4 0M50 24q1.6-1.6 3.2 0q1.6-1.6 3.2 0" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M18 66C30 58 42 60 52 63C62 56 72 57 82 61V90H18Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M18 66C30 58 42 60 52 63C62 56 72 57 82 61V90H18Z" fill="url(#h-horz)"/>
<path d="M18 77C32 69 46 71 58 76C68 72 76 72 82 74V90H18Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M18 77C32 69 46 71 58 76C68 72 76 72 82 74V90H18Z" fill="url(#h-diag)"/>
<path d="M33 73V65" stroke="${ink}" stroke-width="1.1"/>
<circle cx="33" cy="61" r="4" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.6"/>
<circle cx="30" cy="63.5" r="3" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.6"/>
<circle cx="36" cy="63.5" r="3" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.6"/>
<path d="M62 64h8v-4l-4-3.4-4 3.4Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/><path d="M65 64v-2.4h2V64" stroke="${ink}" stroke-width="0.5"/>
</g>
<path d="M20 88V45A30 30 0 0 1 80 45V88" fill="none" stroke="${ink}" stroke-width="1"/>
<path d="M50 15V88M20 45H80M50 45L28.8 23.8M50 45L71.2 23.8" stroke="${ink}" stroke-width="2"/>
<path d="M20 67H80" stroke="${ink}" stroke-width="1.6"/>
<path d="M66 86L65 80H75L74 86Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M70 80C69 76 71 74 70 71" fill="none" stroke="${ink}" stroke-width="0.8"/>
<ellipse cx="68" cy="75" rx="2" ry="1.2" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.5"/>
<ellipse cx="72" cy="73" rx="2" ry="1.2" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.5"/>
<rect x="8" y="86" width="84" height="5" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="9" y="89" width="82" height="1.6" fill="url(#h-vert)"/>
${[0, 1].map(i => `<g${i ? ` transform="translate(100 0) scale(-1 1)"` : ""}>
<path d="M3 4H20C18 22 20 40 26 54C20 58 16 64 14 70C12 78 11 84 12 92H3Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M13 6H20C18 22 20 40 26 54L19 55C15 46 13 28 13 6Z" fill="url(#h-vert)"/>
<path d="M8 6C8 30 9 60 8 90M13 6C13 28 15 46 19 55M15 62C13 70 12 80 12.6 90" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M14 52L26 57L25 60L13 55Z" fill="${ink}"/></g>`).join("")}`;

  // Ginger-jar lamp with a pleated, fringed shade; a moth loops in the glow.
  const lamp = `
<path d="M40 14q5-11 12-5q4 6-2 6" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.2 1.4"/>
<path d="M52 9l-5-4q-1 4 5 4ZM52 9l5-4q1 4-5 4Z" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M52 9l5-4q1 4-5 4Z" fill="url(#h-diag-fine)"/><ellipse cx="52" cy="9.6" rx="0.9" ry="2.4" fill="${ink}"/>
<path d="M12 53L5 62M48 53L55 62M20 54L17 66M40 54L43 66" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.4 2"/>
<path d="M30 40V61" stroke="${ink}" stroke-width="2.6"/><path d="M30 40V61" stroke="${paper}" stroke-width="0.9"/>
<circle cx="30" cy="15" r="2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M18 18H42L54 46H6Z" fill="${paper}" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M35 18H42L54 46H43Z" fill="url(#h-diag-fine)"/>
<path d="M21 18L12 46M24 18L18 46M27 18L24 46M30 18V46M33 18L36 46M36 18L42 46M39 18L48 46" stroke="${ink}" stroke-width="0.5"/>
<path d="M17.4 19.4H42.6M6 44.6H54" stroke="${ink}" stroke-width="1"/>
${Array.from({ length: 12 }, (_, i) => `<path d="M${8 + i * 4} 46v3.4" stroke="${ink}" stroke-width="0.7"/><circle cx="${8 + i * 4}" cy="50" r="0.8" fill="${ink}"/>`).join("")}
<rect x="26.5" y="60" width="7" height="8" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M22 97C14 92 13 78 18 72C21 69 24 68 26 67H34C36 68 39 69 42 72C47 78 46 92 38 97Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M36 68C39 69 42 72 42 72C47 78 46 92 38 97H33C40 90 41 78 36 68Z" fill="url(#h-diag)"/>
<path d="M16 78Q30 83 44 78M15.6 91Q30 95 44.4 91" fill="none" stroke="${ink}" stroke-width="0.6" stroke-dasharray="1.4 1.6"/>
${floret(27, 85, false)}<path d="M20.5 86.5q2-2.4 4-1.2M33.5 86.5q-2-2.4-4-1.2" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M19.5 75C18.5 79 18.6 84 19.6 88" fill="none" stroke="${paper}" stroke-width="1.8" stroke-linecap="round"/>
<path d="M13 98v2.5a17 4 0 0 0 34 0V98" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M13 98v2.5a17 4 0 0 0 34 0V98" fill="url(#h-vert)"/>
<ellipse cx="30" cy="98" rx="17" ry="4" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>`;

  // Cookie jar; a mouse peeks out from behind it.
  const cookie = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${paper}" stroke="${ink}" stroke-width="0.9"/><circle cx="${x}" cy="${y}" r="${r - 0.6}" fill="url(#h-dots)"/>` +
    `<circle cx="${x - r / 3}" cy="${y - r / 4}" r="0.9" fill="${ink}"/><circle cx="${x + r / 3}" cy="${y + r / 3}" r="0.8" fill="${ink}"/>`;
  const cookieJar = `
<path d="M45 61C51 62 56 60 55 56" fill="none" stroke="${ink}" stroke-width="0.8" stroke-linecap="round"/>
<circle cx="50" cy="43" r="4.5" fill="${paper}" stroke="${ink}" stroke-width="1"/><circle cx="50.4" cy="43.3" r="2.4" fill="url(#h-diag-fine)"/>
<path d="M44 50C44 45 49 43 53 45C56 46 57.4 49 57 51C55.5 53.2 50 54 44 53Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<circle cx="53" cy="48.6" r="0.9" fill="${ink}"/><circle cx="53.3" cy="48.3" r="0.3" fill="${paper}"/><circle cx="56.9" cy="50.9" r="0.8" fill="${ink}"/>
<path d="M55 51.6L57.8 54M54.6 52.4L57 55.6M56 50L57.8 47.6" stroke="${ink}" stroke-width="0.4"/>
<path d="M8 60C6 54 6 31 9 27H45C48 31 48 54 46 60Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
${cookie(17, 51, 6.5)}${cookie(31, 52, 6.5)}${cookie(24, 41, 6.5)}${cookie(38, 40, 5.5)}${cookie(15, 36.5, 5)}
<path d="M40 27H45C48 31 48 54 46 60H41C43 52 43 34 40 27Z" fill="url(#h-diag-fine)"/>
<path d="M12 31C10.6 40 10.6 50 12 56" fill="none" stroke="${paper}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M12 31C10.6 40 10.6 50 12 56" fill="none" stroke="${ink}" stroke-width="0.4"/>
<ellipse cx="45.5" cy="53.5" rx="1.8" ry="1.2" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<rect x="6" y="21" width="42" height="7" rx="2" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="38" y="21.6" width="9.4" height="5.8" fill="url(#h-vert)"/>
<ellipse cx="27" cy="18.6" rx="5" ry="2.8" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><ellipse cx="28.6" cy="19.2" rx="2.6" ry="1.6" fill="url(#h-diag-fine)"/>
<path d="M9 28C6 30 4 33 5 36" fill="none" stroke="${ink}" stroke-width="0.6"/>
<path d="M2 36L8 35L9 42L3 43Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/><path d="M3.8 38.6l3.6-.5M4.2 40.6l2.6-.4" stroke="${ink}" stroke-width="0.45"/>`;

  // Cuckoo clock: the bird is calling, the pendulum is mid-swing, one weight hangs lower than the other.
  const cuckoo = `
<circle cx="35" cy="2" r="1.3" fill="${ink}"/>
<path d="M21 66V79M47 66V71" stroke="${ink}" stroke-width="1" stroke-dasharray="1.6 0.9"/>
<ellipse cx="21" cy="83" rx="3.6" ry="6" fill="${paper}" stroke="${ink}" stroke-width="1"/><ellipse cx="21" cy="83" rx="3.2" ry="5.6" fill="url(#h-cross-dense)"/>
<ellipse cx="47" cy="75" rx="3.6" ry="6" fill="${paper}" stroke="${ink}" stroke-width="1"/><ellipse cx="47" cy="75" rx="3.2" ry="5.6" fill="url(#h-cross-dense)"/>
<path d="M35 62L30.6 82" stroke="${ink}" stroke-width="1.1"/>
<path d="M30.4 81l-3.4 4.6 3 4 3.6-4.2Z" fill="${paper}" stroke="${ink}" stroke-width="1"/><path d="M30.4 81l3.2 4.4-3.6 4.2Z" fill="url(#h-diag-fine)"/>
<path d="M24.5 79q-1.5 3 .6 6M39 79q1.6 3-.4 6" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1 1.2"/>
<rect x="12" y="24" width="46" height="38" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<rect x="50" y="24.6" width="7.4" height="36.8" fill="url(#h-diag)"/>
<path d="M14.5 34c3-2 3-6 0-8M14.5 52c3 2 3 6 0 8M55.5 34c-3-2-3-6 0-8M55.5 52c-3 2-3 6 0 8" fill="none" stroke="${ink}" stroke-width="0.8"/>
<path d="M2 28L35 3L68 28L63 30.6L35 10L7 30.6Z" fill="${paper}" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M42 15.3L63 30.6L68 28L35 3Z" fill="url(#h-diag)"/>
<path d="M7 30.6L35 10L63 30.6Z" fill="url(#h-horz)" stroke="${ink}" stroke-width="0.6"/>
${[[29, 6, -40], [35, 3.4, 0], [41, 6, 40]].map(([x, y, a]) => `<path d="M${x} ${y}q-2-3.4 0-6q2 2.6 0 6Z" transform="rotate(${a} ${x} ${y})" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>`).join("")}
<rect x="30" y="15" width="10" height="10" fill="${ink}"/>
<path d="M30 15L25.4 17.4V27L30 25Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<ellipse cx="32" cy="20" rx="5" ry="3" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M33 18.6c2 0 4 .6 5.4 2.2" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M27.2 19.2L23.6 18.2L27.4 20.4Z" fill="${ink}"/><path d="M27.2 20.6L24 22L27.6 21.4Z" fill="${ink}"/><circle cx="29" cy="18.8" r="0.7" fill="${ink}"/>
<path d="M21 15q-2.6-1.6-1.6-4.2M19.6 19.4q-3.4-.2-4.6-2.8M20.4 23.4q-2.8 1.2-5 0" fill="none" stroke="${ink}" stroke-width="0.6" stroke-linecap="round"/>
<circle cx="35" cy="43" r="13" fill="${paper}" stroke="${ink}" stroke-width="1.4"/><circle cx="35" cy="43" r="10.5" fill="none" stroke="${ink}" stroke-width="0.5"/>
${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${r1(35 + 9 * Math.sin(a))} ${r1(43 - 9 * Math.cos(a))}L${r1(35 + 10.5 * Math.sin(a))} ${r1(43 - 10.5 * Math.cos(a))}" stroke="${ink}" stroke-width="${i % 3 ? 0.6 : 1.2}"/>`; }).join("")}
<path d="M35 43L29.4 39.6M35 43L39.6 35.4" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/><circle cx="35" cy="43" r="1.2" fill="${ink}"/>
<path d="M44 52A13 13 0 0 1 26 53A14.6 14.6 0 0 0 44 52Z" fill="url(#h-diag-fine)"/>
<path d="M10 62H60L57 66H13Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><path d="M11 63.4H59L57.6 65.4H12.4Z" fill="url(#h-vert)"/>`;

  // Bunting swag; flags follow the sag of the string.
  const bunting = (() => {
    const P0 = [2, 1.5], C = [30, 24], P2 = [58, 1.5];
    const at = t => [0, 1].map(k => (1 - t) ** 2 * P0[k] + 2 * (1 - t) * t * C[k] + t * t * P2[k]);
    const fills = ["url(#cozy-gingham)", "url(#h-dots)", paper, "url(#h-diag-fine)", "url(#cozy-gingham)"];
    return `<path d="M${P0.join(" ")}Q${C.join(" ")} ${P2.join(" ")}" fill="none" stroke="${ink}" stroke-width="0.9"/>` +
      [0.13, 0.31, 0.5, 0.69, 0.87].map((t, i) => {
        const [x, y] = at(t), dx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P2[0] - C[0]), dy = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P2[1] - C[1]);
        return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(Math.atan2(dy, dx) * 180 / Math.PI)})"><path d="M-5 0H5L0 13Z" fill="${paper}"/>` +
          `<path d="M-5 0H5L0 13Z" fill="${fills[i]}" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/>` +
          (fills[i] === paper ? `<circle cx="0" cy="4.4" r="1.7" fill="none" stroke="${ink}" stroke-width="0.6"/><circle cx="0" cy="4.4" r="0.5" fill="${ink}"/>` : "") + `</g>`;
      }).join("") + `<circle cx="2" cy="1.5" r="1.4" fill="${ink}"/><circle cx="58" cy="1.5" r="1.4" fill="${ink}"/>`;
  })();

  // Mugs hanging by their handles from cup hooks, each swinging a little.
  const mug = (x, rot, fill) => `<g transform="translate(${x} 0) rotate(${rot} 0 2)">
<path d="M-4 13C-4 6.6 2 6.6 2 13" fill="none" stroke="${ink}" stroke-width="2.4"/><path d="M-4 13C-4 6.6 2 6.6 2 13" fill="none" stroke="${paper}" stroke-width="0.8"/>
<path d="M0 0V6C0 9.4 -3.6 9.4 -3.6 7" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>
<path d="M-8 12H5C7.6 12 7.6 26 5 26H-8C-9.6 26 -9.6 12 -8 12Z" fill="${paper}"/>
<path d="M-8 12H5C7.6 12 7.6 26 5 26H-8C-9.6 26 -9.6 12 -8 12Z" fill="${fill}" stroke="${ink}" stroke-width="1.2"/>
<path d="M-8.8 22H6.8C6.6 24.6 6 26 5 26H-8C-9 26 -9.4 24 -8.8 22Z" fill="url(#h-diag)"/>
<ellipse cx="5.2" cy="19" rx="2.2" ry="7" fill="${paper}" stroke="${ink}" stroke-width="1"/><ellipse cx="5.4" cy="19" rx="1.1" ry="5.4" fill="${ink}"/></g>`;
  const mugs = mug(12, -6, "url(#cozy-gingham)") + mug(30, 4, "url(#h-dots)") + mug(47, -3, paper) +
    `<g transform="translate(47 0) rotate(-3 0 2)">${floret(-2, 17.5, false)}</g>`;

  // Perches: a curious kitten loafing on a book, and a sparrow mid-hop.
  const kitten = `
<path d="M36 29.4C40.4 29 40.6 24 37 22.6" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
<path d="M36 29.4C40.4 29 40.6 24 37 22.6" fill="none" stroke="${paper}" stroke-width="1.3" stroke-linecap="round"/>
<path d="M6 30C4 22 10 15 20 14C31 13 38 19 38 26C38 28 37 30 36 30Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M30 15.5C35 18 38 22 38 26C38 28 37 30 36 30H30C34 26 34 20 30 15.5Z" fill="url(#h-diag)"/>
<path d="M21 14.8q2.4 4 .4 7.4M26.6 14.4q2.2 4.2 0 7.8M32 16.8q1.8 3.6-.4 7" fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round"/>
<path d="M4.6 10.4L3.4 1.6L10.4 6.8ZM11.6 7.2L16 1L17.4 9.4Z" fill="${paper}" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>
<path d="M5.2 8.6L4.6 4L8.4 6.8ZM13 7.4L15.6 3.6L16.4 8.4Z" fill="url(#h-diag-fine)"/>
<ellipse cx="10.6" cy="15" rx="8" ry="6.8" transform="rotate(-15 10.6 15)" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M13 8.6C17 10 19 13.6 18.4 17C17 19.6 14.6 21 12.4 21.4C15.6 17.6 16 12.6 13 8.6Z" fill="url(#h-diag-fine)"/>
<circle cx="7.6" cy="14.4" r="1.5" fill="${ink}"/><circle cx="8" cy="14" r="0.45" fill="${paper}"/>
<circle cx="12.8" cy="13.4" r="1.5" fill="${ink}"/><circle cx="13.2" cy="13" r="0.45" fill="${paper}"/>
<path d="M9.2 16.8h2l-1 1.2Z" fill="${ink}"/><path d="M10.2 18q-.8 1.2-2 .6M10.2 18q.8 1.2 2 .6" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M7 17.6L1 16.4M7.2 18.8L1.2 20.4M13.6 17.6L18.4 17" stroke="${ink}" stroke-width="0.45"/>
<ellipse cx="9" cy="28.6" rx="3.6" ry="1.6" fill="${paper}" stroke="${ink}" stroke-width="0.9"/><ellipse cx="14.6" cy="29" rx="3.2" ry="1.3" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M8 28v1.4M10 27.8v1.6M14 28.4v1.2" stroke="${ink}" stroke-width="0.4"/>`;
  const sparrow = `
<path d="M24 11L30.6 4.6L31.6 8L25.6 14Z" fill="${paper}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>
<path d="M26 11.6L30.8 6.6M27 12.8L31.2 8.4" stroke="${ink}" stroke-width="0.5"/>
<path d="M15 18V23.6M13 24H17.6M15 24L13.6 23M19 18L21.4 20.8L23.6 20.2M21.4 20.8L22.6 22.4" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linecap="round"/>
<ellipse cx="16.6" cy="13.2" rx="9.2" ry="5.6" transform="rotate(-12 16.6 13.2)" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<ellipse cx="12.4" cy="15" rx="4.4" ry="2.8" fill="url(#h-dots)"/>
<path d="M13 10.4C17 8.4 23 9 26 12.2C22 15.4 17 15.4 13 13Z" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M13 10.4C17 8.4 23 9 26 12.2C22 15.4 17 15.4 13 13Z" fill="url(#h-diag)"/>
<path d="M17 10.6l2 3.4M20.6 10.4l2 3.6" stroke="${paper}" stroke-width="0.7"/>
<circle cx="8.6" cy="8.8" r="4.6" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M4.4 7.4A4.6 4.6 0 0 1 12.8 6.6L9 9Z" fill="url(#h-cross-dense)"/>
<path d="M4.4 8.4L1 9.2L4.6 9.8ZM4.6 10.2L1.6 11.4L4.8 11Z" fill="${ink}"/>
<circle cx="7.2" cy="8.4" r="0.9" fill="${ink}"/><circle cx="7.4" cy="8.1" r="0.3" fill="${paper}"/>
<path d="M2.4 4.6q-1-1.6.2-3M5 3.4q-.4-1.6 1-2.4" fill="none" stroke="${ink}" stroke-width="0.5" stroke-linecap="round"/>
<path d="M26.6 20.4q2.2-.6 3.2-2.6M27.4 23.2q2-.4 3-2" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1 1"/>`;

  registerTheme({
    id: "cozy",
    name: "Cozy Nook",
    group: "v3",
    blurb: "Sprigged wallpaper, a gingham-trimmed shelf, a sleeping cat and a pot of tea.",
    headline: "Your little library",
    tagline: "A good book. A quiet afternoon.",
    dark: false,
    wall: {
      base: "#efeae1",
      tile: {
        w: 52, h: 52, svg: [[13, 12], [39, 38]].map(([x, y]) => `
<path d="M${x} ${y + 3}q-1.2 5 .8 9.5" fill="none" stroke="${K.g2}" stroke-width="0.6"/>
<path d="M${x - 0.3} ${y + 8}q-4-1-5.4 1.6q3.4 1.2 5.4-1.6ZM${x + 0.2} ${y + 6}q3.6-2.2 5.4-.4q-2.8 2-5.4.4Z" fill="url(#h-diag-gray)" stroke="${K.g2}" stroke-width="0.5"/>
${[[0, -2.4], [2.3, -0.7], [1.4, 1.9], [-1.4, 1.9], [-2.3, -0.7]].map(([dx, dy]) => `<circle cx="${r1(x + dx)}" cy="${r1(y + dy)}" r="1.5" fill="none" stroke="${K.g2}" stroke-width="0.55"/>`).join("")}
<circle cx="${x}" cy="${y}" r="0.8" fill="${K.g2}"/>`).join("")
      },
      quiet: { w: 52, h: 52, svg: `<path d="M24 26h4M26 24v4" stroke="#d8d1c4" stroke-width="0.8"/>` }
    },
    plank: {
      height: 13,
      back: w => `<path d="M3 -6H${w - 3}L${w} 0H0Z" fill="${paper}"/><path d="M3 -6H${w - 3}L${w} 0H0Z" fill="url(#h-horz-wide)" stroke="${ink}" stroke-width="0.8"/>`,
      front: w => {
        const n = Math.max(1, Math.floor((w - 12) / 14)), sw = (w - 12) / n;
        let scallops = `M6 12V17.5`, eyelets = "";
        for (let i = 0; i < n; i++) {
          scallops += `A${r1(sw / 2)} 5 0 0 0 ${r1(6 + (i + 1) * sw)} 17.5`;
          eyelets += `<circle cx="${r1(6 + (i + 0.5) * sw)}" cy="18" r="1" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>`;
        }
        scallops += `V12Z`;
        return `<path d="M10 14H${w - 10}L${w - 16} 28H16Z" fill="url(#h-diag-wide)"/>` +
          `<path d="${scallops}" fill="${paper}"/><path d="${scallops}" fill="url(#cozy-gingham)" stroke="${ink}" stroke-width="1"/>` +
          `<path d="M7 14.4H${w - 7}" stroke="${ink}" stroke-width="0.6" stroke-dasharray="1.6 1.4"/>` + eyelets +
          `<rect x="0" y="0" width="${w}" height="13" rx="3" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>` +
          `<path d="M3 3.4H${w - 3}" stroke="${ink}" stroke-width="0.6"/>` +
          `<rect x="1.4" y="9.2" width="${w - 2.8}" height="2.6" rx="1" fill="url(#h-vert)"/>`;
      }
    },
    plate: (w, h) =>
      `<rect x="0.6" y="0.6" width="${w - 1.2}" height="${h - 1.2}" rx="${h / 2 - 0.6}" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>` +
      `<rect x="3.4" y="3.4" width="${w - 6.8}" height="${h - 6.8}" rx="${Math.max(0, h / 2 - 3.4)}" fill="none" stroke="${ink}" stroke-width="0.6" stroke-dasharray="2 1.6"/>`,
    plateInk: ink,
    // Tall and low pieces alternate so neighbouring ornaments vary in height.
    ornaments: [
      { id: "cat", label: "Sleeping cat on a cushion", w: 80, h: 50, at: "shelf", svg: cat },
      { id: "lamp", label: "Fringed lamp with a moth", w: 60, h: 104, at: "shelf", svg: lamp },
      { id: "teapot", label: "Teapot and cup", w: 88, h: 53, at: "shelf", svg: teapot },
      { id: "geranium", label: "Potted geranium", w: 52, h: 76, at: "shelf", svg: geranium },
      { id: "yarn", label: "Yarn basket", w: 64, h: 56, at: "shelf", svg: yarn },
      { id: "cookie-jar", label: "Cookie jar and a peeking mouse", w: 58, h: 62, at: "shelf", svg: cookieJar },
      { id: "window", label: "Arched window with curtains", w: 100, h: 92, at: "wall", svg: archWindow },
      { id: "cuckoo", label: "Cuckoo clock", w: 70, h: 90, at: "wall", svg: cuckoo },
      { id: "bunting", label: "Gingham bunting", w: 60, h: 30, at: "hang", svg: bunting },
      { id: "mugs", label: "Mugs on cup hooks", w: 56, h: 32, at: "hang", svg: mugs },
      { id: "kitten", label: "Kitten on a book", w: 40, h: 30, at: "perch", svg: kitten },
      { id: "sparrow", label: "Sparrow mid-hop", w: 32, h: 24, at: "perch", svg: sparrow }
    ],
    hero: {
      w: 132, h: 92,
      svg: `<g transform="translate(42 0) scale(0.88)">${archWindow}</g><g transform="translate(60 56.5) scale(0.8)">${sparrow}</g>` +
        `<g transform="translate(2 56.4) scale(0.7)">${cat}</g><line x1="0" y1="91.4" x2="132" y2="91.4" stroke="${ink}" stroke-width="1.2"/>`
    },
    defs: `<pattern id="cozy-gingham" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M.6 0V7M1.8 0V7M3 0V7" stroke="${ink}" stroke-width="0.45"/><path d="M0 .6H7M0 1.8H7M0 3H7" stroke="${ink}" stroke-width="0.45"/></pattern>` +
      `<clipPath id="cozy-glass"><path d="M20 88V45A30 30 0 0 1 80 45V88Z"/></clipPath>`
  });
})();
