// Bundles src/ and the SQL engine into one self-contained page: dist/index.html
const fs = require('fs');
const read = f => fs.readFileSync(f, 'utf8');
const js = f => read(f).replace(/<\/script/gi, '<\\/script');
const parts = {
  STYLES: read('src/styles.css'), VENDOR: js('vendor/sql-wasm.js'), WASM: fs.readFileSync('vendor/sql-wasm.wasm').toString('base64'),
  DATA: js('src/data.js'), COURSE: js('src/course.js'), ENGINE: js('src/engine.js'), APP: js('src/app.js')
};
const html = read('src/index.html').replace(/\/\*([A-Z]+)\*\//g, (m, k) => parts[k] ?? m);
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
console.log(`dist/index.html ${(html.length / 1024).toFixed(0)} KB`);
