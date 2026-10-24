// Oak Study: panelled walls, carved oak shelves, a globe, an inkwell and an hourglass.
(() => {
  const ink = K.ink, paper = K.paper;

  const globe = `
<path d="M14 86v2.5a17 4.5 0 0 0 34 0V86" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M14 86v2.5a17 4.5 0 0 0 34 0V86" fill="url(#h-vert)"/>
<ellipse cx="31" cy="86" rx="17" ry="4.5" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<path d="M28 85C28 79 29 76 30 72V66h2v6c1 4 2 7 2 13z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M31.5 66v6c1 4 2 7 2.5 13h-2.5z" fill="url(#h-diag)"/>
<path d="M31 66Q36 67 40.2 63.4" fill="none" stroke="${ink}" stroke-width="2"/>
<circle cx="31" cy="38" r="23" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<ellipse cx="31" cy="38" rx="23" ry="5.5" transform="rotate(-20 31 38)" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.6 1.6"/>
<ellipse cx="31" cy="38" rx="9" ry="23" transform="rotate(-20 31 38)" fill="none" stroke="${ink}" stroke-width="0.45"/>
<path d="M18 22C22 18 28 19 29 23S26 28 25 32s3 6 2 11-5 7-6 12c-2-3-3-8-4-13s-3-12 1-20z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M18 22C22 18 28 19 29 23S26 28 25 32s3 6 2 11-5 7-6 12c-2-3-3-8-4-13s-3-12 1-20z" fill="url(#h-diag-fine)"/>
<path d="M35 20c5-2 11 2 12 7s-3 6-6 4c-3 4 1 9-1 14s-6 7-7 2 1-9 0-14-2-10 2-13z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M35 20c5-2 11 2 12 7s-3 6-6 4c-3 4 1 9-1 14s-6 7-7 2 1-9 0-14-2-10 2-13z" fill="url(#h-diag-fine)"/>
<path d="M44 19A23 23 0 0 1 22 59A27 27 0 0 0 44 19Z" fill="url(#h-diag)"/>
<path d="M40.2 63.4A27 27 0 0 0 21.8 12.6" fill="none" stroke="${ink}" stroke-width="3.6"/>
<path d="M40.2 63.4A27 27 0 0 0 21.8 12.6" fill="none" stroke="${paper}" stroke-width="1.6"/>
<circle cx="21.8" cy="12.6" r="1.6" fill="${ink}"/><circle cx="40.2" cy="63.4" r="1.6" fill="${ink}"/>`;

  const inkwell = `
<path d="M24 36C30 26 38 14 47 3" fill="none" stroke="${ink}" stroke-width="1.1"/>
<path d="M27.5 31C27 21 34 9 47.5 2.5C45 14 39 25 29.5 32Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M33 25C36 16 41 9 47.5 2.5C45 14 39 25 29.5 32Z" fill="url(#h-back)"/>
<path d="M8 62C6 50 8 44 14 42H34C40 44 42 50 40 62Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M30 42H34C40 44 42 50 40 62H32C34 54 33 47 30 42Z" fill="url(#h-diag)"/>
<rect x="17" y="36" width="14" height="7" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="27" y="36.6" width="3.4" height="5.8" fill="url(#h-diag)"/>
<rect x="15" y="33.5" width="18" height="3.2" rx="1" fill="${ink}"/>
<path d="M18 36.6C17.4 40 17.6 42.4 18.6 43.8C19.4 42.6 19.4 40 19 36.6Z" fill="${ink}"/>
<rect x="14" y="49" width="17" height="8" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M17 52H28M18.5 54.5H26.5" stroke="${ink}" stroke-width="0.5"/>
<line x1="3" y1="62.4" x2="45" y2="62.4" stroke="${ink}" stroke-width="0.9"/>`;

  const hourglass = `
<rect x="3" y="3" width="30" height="5" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="3" y="6" width="30" height="2" fill="url(#h-vert)"/>
<circle cx="8" cy="2" r="1.5" fill="${ink}"/><circle cx="28" cy="2" r="1.5" fill="${ink}"/>
<path d="M10 8C10 22 16 28 17 32C16 36 10 42 10 57H26C26 42 20 36 19 32C20 28 26 22 26 8Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M12.5 17C13.5 23 16 27 18 30.5C20 27 22.5 23 23.5 17Z" fill="url(#h-dots-dense)"/>
<path d="M18 31v15" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1 1"/>
<path d="M11 57C12 50 16 47 18 45C20 47 24 50 25 57Z" fill="url(#h-dots-dense)" stroke="${ink}" stroke-width="0.4"/>
<path d="M12.5 11C12.6 18 15 24 16.5 27" fill="none" stroke="${paper}" stroke-width="1.2"/>
<line x1="6.5" y1="8" x2="6.5" y2="57" stroke="${ink}" stroke-width="2.2"/>
<line x1="29.5" y1="8" x2="29.5" y2="57" stroke="${ink}" stroke-width="2.2"/>
<circle cx="6.5" cy="32" r="2" fill="${paper}" stroke="${ink}" stroke-width="1"/><circle cx="29.5" cy="32" r="2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<rect x="1" y="57" width="34" height="6" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="1.6" y="60" width="32.8" height="2.4" fill="url(#h-vert)"/>`;

  const spectacles = `
<g fill="none" stroke="${ink}">
<circle cx="31" cy="6" r="4.6" fill="${paper}" stroke-width="1.1"/><circle cx="45" cy="6" r="4.6" fill="${paper}" stroke-width="1.1"/>
<path d="M35.6 6Q38 3.6 40.4 6M26.4 6.5L18 10.5M49.6 6.5L58 10.5" stroke-width="1"/>
<path d="M33.5 2.6A4.6 4.6 0 0 1 34.6 8.4" stroke-width="0.6"/><path d="M47.5 2.6A4.6 4.6 0 0 1 48.6 8.4" stroke-width="0.6"/>
</g>`;
  const books3 = `
<rect x="4" y="12" width="70" height="9" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="4" y="12" width="70" height="9" fill="url(#h-cross)"/>
<rect x="26" y="13.8" width="26" height="5.4" fill="${paper}" stroke="${ink}" stroke-width="0.5"/>
<path d="M30 16.5H48" stroke="${ink}" stroke-width="0.5"/>
<rect x="8" y="21" width="66" height="11" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<path d="M15 21V32M67 21V32" stroke="${ink}" stroke-width="2.2"/><path d="M18 21V32M64 21V32" stroke="${ink}" stroke-width="0.6"/>
<path d="M30 26.5H52" stroke="${ink}" stroke-width="0.6"/>
<rect x="66" y="21.6" width="7.4" height="9.8" fill="url(#h-diag)"/>
<rect x="2" y="32" width="80" height="13" fill="${ink}" stroke="${ink}" stroke-width="1.2"/>
<path d="M9 32V45M12 32V45M72 32V45M75 32V45" stroke="${paper}" stroke-width="0.7"/>
<rect x="28" y="35" width="28" height="7" fill="${paper}"/><path d="M32 38.5H52" stroke="${ink}" stroke-width="0.6"/>`;
  const bookStack = spectacles + books3;

  // Banker's lamp: light falls on the shelf, the pull chain still swings, a letter is tucked under the base.
  const bankerLamp = `
<path d="M14 41L9 61M24 41L22 64M50 41L52 64M60 41L65 61" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.5 2"/>
<path d="M54 73L70 70.4L72.4 77H55Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M57 73.6L63.4 75.4L70.4 70.8" fill="none" stroke="${ink}" stroke-width="0.5"/><circle cx="63.4" cy="75" r="1.5" fill="${ink}"/>
<rect x="35.5" y="39" width="3" height="31" fill="${paper}" stroke="${ink}" stroke-width="1"/><rect x="37" y="39.6" width="1.2" height="30" fill="url(#h-vert)"/>
<ellipse cx="37" cy="54" rx="3.4" ry="1.6" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M28 38L37 43L46 38" fill="none" stroke="${ink}" stroke-width="1.2"/>
<path d="M20 72C20 67.6 54 67.6 54 72Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="16" y="72" width="42" height="5" rx="1.5" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>
<rect x="16.6" y="74.6" width="40.8" height="1.8" fill="url(#h-vert)"/>
<circle cx="37" cy="18.2" r="1.8" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M8 36C8 14 66 14 66 36Z" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<path d="M8 36C8 14 66 14 66 36Z" fill="url(#h-diag)"/>
<path d="M46 21.4C58 23.6 66 28 66 36H50C50 30 49 25 46 21.4Z" fill="url(#h-cross-dense)"/>
<path d="M14 30.4C20 24.6 30 22 40 21.6" fill="none" stroke="${paper}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M12.6 33.4C18 29.4 24 28 30 27.4" fill="none" stroke="${paper}" stroke-width="0.8" stroke-linecap="round"/>
<path d="M10.4 35C10.4 25 16 20.6 22 19.2M63.6 35C63.6 25 58 20.6 52 19.2" fill="none" stroke="${ink}" stroke-width="0.6"/>
<rect x="6.6" y="35" width="60.8" height="3.4" rx="1.2" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M56 38.4L58.6 49" stroke="${ink}" stroke-width="0.9" stroke-dasharray="1.2 0.8"/>
<circle cx="58.8" cy="50.6" r="1.6" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M62 44q2.4 2 1.2 5.4M64.4 42.6q3 3 1.4 7.4" fill="none" stroke="${ink}" stroke-width="0.45"/>`;

  // Ship in a bottle on two cradles; sails full, pennant flying.
  const shipBottle = `
<path d="M16 8H58C64 8 68 13 72 16H80V26H72C68 29 64 34 58 34H16C9 34 4 28 4 21C4 14 9 8 16 8Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M7 27q4-3 8 0t8 0t8 0t8 0t8 0t8 0t7 0C62 31 60 33 56 33.4H17C12 33.4 8.4 31 7 27Z" fill="url(#h-horz)"/>
<path d="M7 27q4-3 8 0t8 0t8 0t8 0t8 0t8 0t7 0" fill="none" stroke="${ink}" stroke-width="0.7"/>
<path d="M30 26V9.6M41 26V12" stroke="${ink}" stroke-width="0.9"/>
<path d="M30 9.6l5.4 1.6-5.4 1.6Z" fill="${ink}"/>
<path d="M30.4 12.6C35 14 35.6 19 30.4 21.4ZM41.4 14.4C46 15.6 46.4 20 41.4 22.4ZM30.4 22.4L38.6 23.6L30.4 25ZM29.6 13L22 22.4H29.6Z" fill="${paper}" stroke="${ink}" stroke-width="0.8" stroke-linejoin="round"/>
<path d="M31 14C33 15.4 33.4 18 31.6 20M42 15.6C44 16.8 44.2 19 42.4 21" fill="none" stroke="${ink}" stroke-width="0.4"/>
<path d="M20 25.6H53L49 31H24Z" fill="${ink}"/><path d="M24 28H50" stroke="${paper}" stroke-width="0.5" stroke-dasharray="1.2 1.6"/>
<path d="M14 11.6C26 10 44 10 56 11.4" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M66 14.4C68 15.6 70 16.6 72 17.4" fill="none" stroke="${ink}" stroke-width="0.5"/>
<rect x="80" y="15.4" width="5" height="11.2" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1"/><rect x="80.6" y="16" width="3.8" height="10" fill="url(#h-dots-dense)"/>
${[14, 52].map(x => `<path d="M${x} 40V35C${x} 31.6 ${x + 18} 31.6 ${x + 18} 35V40Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/><path d="M${x + 12} 33C${x + 16} 33.4 ${x + 18} 34 ${x + 18} 35V40H${x + 13}Z" fill="url(#h-diag)"/>`).join("")}`;

  // Regulator wall clock; the pendulum is caught mid-swing.
  const regulator = `
<circle cx="21" cy="2" r="1.4" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M3 12L21 3L39 12Z" fill="${paper}" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M9 11L21 5.4L33 11Z" fill="url(#h-diag-fine)"/>
<rect x="5" y="12" width="32" height="72" fill="${paper}" stroke="${ink}" stroke-width="1.5"/>
<rect x="31" y="12.6" width="5.4" height="70.8" fill="url(#h-diag)"/>
<path d="M5 84L21 89L37 84Z" fill="${paper}" stroke="${ink}" stroke-width="1.3" stroke-linejoin="round"/><path d="M21 89L37 84H27Z" fill="url(#h-diag)"/>
<circle cx="21" cy="25" r="10" fill="${paper}" stroke="${ink}" stroke-width="1.3"/><circle cx="21" cy="25" r="8.2" fill="none" stroke="${ink}" stroke-width="0.4"/>
${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${r1(21 + 7 * Math.sin(a))} ${r1(25 - 7 * Math.cos(a))}L${r1(21 + 8.2 * Math.sin(a))} ${r1(25 - 8.2 * Math.cos(a))}" stroke="${ink}" stroke-width="${i % 3 ? 0.5 : 1.1}"/>`; }).join("")}
<path d="M21 25L25 27.8M21 25L15.6 21.4" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/><circle cx="21" cy="25" r="0.9" fill="${ink}"/>
<rect x="10" y="39" width="22" height="40" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M12 46l6-4M12 52l9-6" stroke="${ink}" stroke-width="0.4"/>
<path d="M21 39.6L17 68" stroke="${ink}" stroke-width="1"/>
<circle cx="16.6" cy="71" r="4.6" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><circle cx="16.6" cy="71" r="2.6" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M19.6 67.6A4.6 4.6 0 0 1 14 74.8A5.4 5.4 0 0 0 19.6 67.6Z" fill="url(#h-diag-fine)"/>
<path d="M12.4 76.4Q21 79.4 29.6 76.4" fill="none" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1 1.4"/>`;

  // A pocket watch hanging from its chain, still swinging.
  const pocketWatch = `
<path d="M9 1.2H21" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M15 2C15 14 13 26 11.6 33.6" fill="none" stroke="${ink}" stroke-width="1.3" stroke-dasharray="2 1.1"/>
<circle cx="11.4" cy="35.4" r="2.2" fill="${paper}" stroke="${ink}" stroke-width="1"/><rect x="10" y="37" width="3" height="2.6" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<circle cx="11.4" cy="49" r="10" fill="${paper}" stroke="${ink}" stroke-width="1.5"/><circle cx="11.4" cy="49" r="8" fill="none" stroke="${ink}" stroke-width="0.5"/>
${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${r1(11.4 + 6.6 * Math.sin(a))} ${r1(49 - 6.6 * Math.cos(a))}L${r1(11.4 + 8 * Math.sin(a))} ${r1(49 - 8 * Math.cos(a))}" stroke="${ink}" stroke-width="${i % 3 ? 0.45 : 1}"/>`; }).join("")}
<path d="M11.4 49L14.6 45.6M11.4 49L9.4 52.6" stroke="${ink}" stroke-width="1" stroke-linecap="round"/>
<path d="M18 42A10 10 0 0 1 5 56.6A11.6 11.6 0 0 0 18 42Z" fill="url(#h-diag)"/>
<path d="M5 44.6A8 8 0 0 1 9 41.6" fill="none" stroke="${paper}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M24 45q2.6 4 0 8.4M26.6 43.4q3.4 5.6 0 11.4" fill="none" stroke="${ink}" stroke-width="0.5"/>`;

  // Perches: a reading mouse in spectacles, and a small brass owl.
  const mouse = `
<path d="M12 28.6C4 29.6 1.6 24 5.6 21C7.6 19.6 10 21 9 22.6" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>
<circle cx="20" cy="4.4" r="3.4" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<path d="M10 30C8 21 11 13 18 12C24 12 27 18 26 24C25.6 27 24 30 22 30Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M22 13.6C25 15.6 26.6 19.6 26 24C25.6 27 24 30 22 30H19C23 26 24 19 22 13.6Z" fill="url(#h-diag)"/>
<ellipse cx="21" cy="9.4" rx="6.4" ry="5.4" transform="rotate(10 21 9.4)" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M25 6.6C28 7.6 30 9.6 29.6 10.8C27 11.8 25 11.6 23.4 11Z" fill="${paper}" stroke="${ink}" stroke-width="1.1"/>
<circle cx="29.6" cy="10.6" r="0.95" fill="${ink}"/>
<path d="M28 10L34.4 8.4M28 10.6L34.4 11.8M27.6 11.2L33 13.6" stroke="${ink}" stroke-width="0.4"/>
<circle cx="16.4" cy="5" r="4" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><circle cx="16.8" cy="5.4" r="2.3" fill="url(#h-diag-fine)"/>
<circle cx="24.6" cy="8.6" r="2.2" fill="none" stroke="${ink}" stroke-width="0.8"/><path d="M22.4 8.4L18.6 7.6" stroke="${ink}" stroke-width="0.6"/>
<circle cx="24.8" cy="8.6" r="0.75" fill="${ink}"/>
<path d="M23 22.6L28.6 18.6L34.4 21.4L28.6 25Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<path d="M28.6 18.6V25M24.8 22.4l3-2M25.8 23.2l2.4-1.6M30 20.2l3 1.4M29.8 21.6l2.8 1.2" stroke="${ink}" stroke-width="0.4"/>
<ellipse cx="24" cy="22.4" rx="1.6" ry="1.2" fill="${paper}" stroke="${ink}" stroke-width="0.8"/><ellipse cx="33" cy="21.8" rx="1.4" ry="1.1" fill="${paper}" stroke="${ink}" stroke-width="0.8"/>
<path d="M14 30C14 28.2 20 28 22.6 30Z" fill="${paper}" stroke="${ink}" stroke-width="1"/>`;
  const brassOwl = `
<path d="M5 28C3 18 5 9 12 8C19 9 21 18 19 28Z" fill="${paper}" stroke="${ink}" stroke-width="1.4"/>
<path d="M5 28C3 18 5 9 12 8C19 9 21 18 19 28Z" fill="url(#h-diag-fine)"/>
<path d="M7.6 18C7 21 7.4 24 8.4 26.4" fill="none" stroke="${paper}" stroke-width="1.6" stroke-linecap="round"/>
<path d="M6 11L4.8 3.6L10 7.6ZM18 11L19.2 3.6L14 7.6Z" fill="${paper}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>
<circle cx="9" cy="13" r="3.2" fill="${paper}" stroke="${ink}" stroke-width="1"/><circle cx="15" cy="13" r="3.2" fill="${paper}" stroke="${ink}" stroke-width="1"/>
<circle cx="9.3" cy="13.2" r="1.4" fill="${ink}"/><circle cx="15.3" cy="13.2" r="1.4" fill="${ink}"/><circle cx="9.7" cy="12.7" r="0.4" fill="${paper}"/><circle cx="15.7" cy="12.7" r="0.4" fill="${paper}"/>
<path d="M12 15.4L10.9 17.6H13.1Z" fill="${ink}"/>
<path d="M8 20.4q1 1.4 2 0q1 1.4 2 0q1 1.4 2 0q1 1.4 2 0M8.4 23.4q1 1.4 2 0q1 1.4 2 0q1 1.4 2 0q1 1.4 2 0" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M17.6 16C19.6 19 19.6 24 18.4 27" fill="none" stroke="${ink}" stroke-width="0.8"/>
<rect x="3" y="28" width="18" height="4" rx="1" fill="${paper}" stroke="${ink}" stroke-width="1.2"/><rect x="3.6" y="30" width="16.8" height="1.6" fill="url(#h-vert)"/>`;

  const landscape = `
<rect x="1" y="1" width="102" height="78" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>
<path d="M4 4H100V76H4ZM9 9V71H95V9Z" fill-rule="evenodd" fill="url(#h-diag-fine)" stroke="${ink}" stroke-width="0.6"/>
<rect x="9" y="9" width="86" height="62" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>
<rect x="12.5" y="12.5" width="79" height="55" fill="none" stroke="${ink}" stroke-width="0.5"/>
<path d="M14 15H90M14 17.2H90M14 19.6H90M14 22.3H90M14 25.4H90M14 29H90M14 33.2H90" stroke="${ink}" stroke-width="0.45"/>
<circle cx="70" cy="22" r="5.5" fill="${paper}" stroke="${ink}" stroke-width="0.6"/>
<path d="M13 46C24 38 34 40 44 44C54 36 66 36 78 42C84 40 88 41 91 43V67H13Z" fill="${paper}" stroke="${ink}" stroke-width="0.7"/>
<path d="M13 46C24 38 34 40 44 44C54 36 66 36 78 42C84 40 88 41 91 43V67H13Z" fill="url(#h-horz)"/>
<path d="M13 56C28 48 44 50 60 56C72 52 84 52 91 55V67H13Z" fill="${paper}" stroke="${ink}" stroke-width="0.9"/>
<path d="M13 56C28 48 44 50 60 56C72 52 84 52 91 55V67H13Z" fill="url(#h-diag)"/>
<path d="M30 60V51" stroke="${ink}" stroke-width="1.2"/>
<circle cx="30" cy="46.5" r="4.2" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.6"/>
<circle cx="26.6" cy="49.4" r="3" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.6"/>
<circle cx="33.4" cy="49.4" r="3" fill="url(#h-cross-dense)" stroke="${ink}" stroke-width="0.6"/>
<path d="M48 42.5l3-3 3 3M52.5 41.5l2.5-2.4 2.5 2.4" fill="none" stroke="${ink}" stroke-width="0.6"/>`;

  const bracket = (x, flip) =>
    `<g transform="translate(${x} 16) scale(${flip ? -1 : 1} 1)">` +
    `<path d="M0 0H13V3C13 11 9 17 2 21H0Z" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>` +
    `<path d="M7.5 0H13V3C13 11 9 17 2 21C7 15 8.5 9 7.5 0Z" fill="url(#h-diag)"/></g>`;

  registerTheme({
    id: "oak",
    name: "Oak Study",
    group: "new",
    blurb: "Panelled walls, carved oak shelves, a globe and an inkwell.",
    headline: "The reading room",
    tagline: "For long evenings and longer books.",
    dark: false,
    wall: {
      base: "#e9e4d9",
      tile: {
        w: 120, h: 150, svg: `
<rect x="14" y="16" width="92" height="118" fill="none" stroke="${K.g2}" stroke-width="0.9"/>
<rect x="22" y="24" width="76" height="102" fill="none" stroke="${K.g2}" stroke-width="0.7"/>
<path d="M14 16L22 24M106 16L98 24M14 134L22 126M106 134L98 126" stroke="${K.g2}" stroke-width="0.6"/>
<path d="M106 16V134L98 126V24Z" fill="url(#h-diag-gray)"/><path d="M14 134H106L98 126H22Z" fill="url(#h-diag-gray)"/>
<path d="M4 0V150M9 30V118M111 0V150M116 22V92M24 6H96M34 10H86M22 142H98M42 146H84" stroke="${K.g2}" stroke-width="0.4"/>`
      },
      quiet: { w: 120, h: 150, svg: `<rect x="14" y="16" width="92" height="118" fill="none" stroke="#d7d0c3" stroke-width="0.8"/>` }
    },
    plank: {
      height: 16,
      back: w => `<path d="M3 -7H${w - 3}L${w} 0H0Z" fill="${paper}"/><path d="M3 -7H${w - 3}L${w} 0H0Z" fill="url(#h-horz-wide)" stroke="${ink}" stroke-width="0.8"/>`,
      front: (w, seed = 1) =>
        `<path d="M10 16H${w - 10}L${w - 18} 24H18Z" fill="url(#h-diag)"/>` +
        `<rect x="0" y="0" width="${w}" height="16" fill="${paper}" stroke="${ink}" stroke-width="1.3"/>` +
        `<line x1="0" y1="0.7" x2="${w}" y2="0.7" stroke="${ink}" stroke-width="1.8"/>` +
        `<line x1="1" y1="3.7" x2="${w - 1}" y2="3.7" stroke="${ink}" stroke-width="0.6"/>` +
        `<g transform="translate(3 4.5)">${grain(w - 6, 8, { seed: seed * 7 + w, lines: 3, width: 0.55 })}</g>` +
        `<rect x="0.6" y="12.6" width="${w - 1.2}" height="2.8" fill="url(#h-vert)"/>` +
        bracket(14, false) + bracket(w - 14, true)
    },
    plate: (w, h) =>
      `<rect x="0.6" y="0.6" width="${w - 1.2}" height="${h - 1.2}" rx="2" fill="${paper}" stroke="${ink}" stroke-width="1.2"/>` +
      `<rect x="3.5" y="3.5" width="${w - 7}" height="${h - 7}" rx="1" fill="none" stroke="${ink}" stroke-width="0.5"/>` +
      [7, w - 7].map(x => `<circle cx="${x}" cy="${h / 2}" r="1.7" fill="${paper}" stroke="${ink}" stroke-width="0.7"/><path d="M${x - 1} ${h / 2 + 1}l2 -2" stroke="${ink}" stroke-width="0.5"/>`).join(""),
    plateInk: ink,
    // Tall and low pieces alternate so neighbouring ornaments vary in height.
    ornaments: [
      { id: "globe", label: "Globe", w: 62, h: 92, at: "shelf", svg: globe },
      { id: "stack", label: "Books and spectacles", w: 84, h: 46, at: "shelf", svg: bookStack },
      { id: "lamp", label: "Banker's lamp and a tucked letter", w: 74, h: 78, at: "shelf", svg: bankerLamp },
      { id: "inkwell", label: "Inkwell and quill", w: 50, h: 64, at: "shelf", svg: inkwell },
      { id: "ship", label: "Ship in a bottle", w: 86, h: 40, at: "shelf", svg: shipBottle },
      { id: "hourglass", label: "Hourglass", w: 36, h: 64, at: "shelf", svg: hourglass },
      { id: "landscape", label: "Framed engraving", w: 104, h: 80, at: "wall", svg: landscape },
      { id: "regulator", label: "Regulator clock", w: 42, h: 90, at: "wall", svg: regulator },
      { id: "watch", label: "Pocket watch on its chain", w: 30, h: 60, at: "hang", svg: pocketWatch },
      { id: "mouse", label: "Reading mouse", w: 36, h: 30, at: "perch", svg: mouse },
      { id: "owl", label: "Brass owl", w: 24, h: 32, at: "perch", svg: brassOwl }
    ],
    hero: {
      w: 132, h: 92,
      svg: `<g transform="translate(0 46)">${books3}</g><g transform="translate(36 28)">${mouse}</g><g transform="translate(76 0) scale(0.98)">${globe}</g><line x1="0" y1="91.4" x2="132" y2="91.4" stroke="${ink}" stroke-width="1.2"/>`
    }
  });
})();
