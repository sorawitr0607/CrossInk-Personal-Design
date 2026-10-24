// Evaluate only the original illustration kit: no books, paths or user data.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
for (const file of ['kit.js', ...['cozy', 'botanical', 'oak', 'autumn', 'ukiyoe'].map(n => `themes/${n}.js`)]) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/library', file), 'utf8'), context, {timeout: 5000});
}
const result = vm.runInContext(`({defs: kitDefs().match(/<defs>([\\s\\S]*?)<\\/defs>/)[1], themes: THEMES.map(t => ({
  id: t.id, defs: t.defs || '', wall: t.wall, ornaments: t.ornaments, hero: t.hero,
  plate: t.plate(180, 54), all: t.plate(440, 60), plankHeight: t.plank.height,
  back: t.plank.back(460), front: t.plank.front(460, 1)
}))})`, context);
process.stdout.write(JSON.stringify(result));
