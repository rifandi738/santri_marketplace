/* Generator aset gambar PDE Marketplace.  Jalankan:  node tools/gen/index.mjs
   Hasil: images/products|categories|site|brand/*.svg  dan  js/data/images.js (pemetaan gambar).
   Semua gambar dibuat sendiri (ilustrasi sintetis), jadi tidak ada masalah lisensi.
   Untuk memakai foto asli: letakkan berkasnya di images/ lalu ubah js/data/images.js. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {composeProduct} from './compose.mjs';
import {ART} from './specs.mjs';
import {hero, banner, categoryTile, authArt, logo, placeholder} from './scenes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = (rel, text) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, text); };
const check = (rel, svg) => { if (/NaN|undefined|Infinity|\[object/.test(svg)) throw new Error('Nilai tidak valid pada ' + rel); };

/* baca data katalog (skrip klasik browser) tanpa mengubahnya */
const sandbox = vm.createContext({});
for (const f of ['categories', 'sellers', 'products']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data', f + '.js'), 'utf8'), sandbox, {filename: f + '.js'});
const {CATS, PRODUCTS} = JSON.parse(JSON.stringify(vm.runInContext('({CATS, PRODUCTS})', sandbox)));

const ids = new Set(PRODUCTS.map(p => p.id));
for (const id of Object.keys(ART)) if (!ids.has(id)) throw new Error('Spesifikasi gambar untuk produk yang tidak ada: ' + id);

const productImages = {};
let count = 0;
for (const p of PRODUCTS) {
 const spec = ART[p.id];
 if (!spec) throw new Error('Produk tanpa spesifikasi gambar: ' + p.id);
 const cat = CATS.find(c => c.id === p.cat);
 const variants = spec.v || [{}];
 const names = spec.v ? (p.variants ? p.variants.items.map(i => i.name) : variants.map((_, i) => 'Pilihan ' + (i + 1))) : ['Tampak utama'];
 const jobs = variants.map((vp, i) => ({view: 'main', params: {...(spec.p || {}), ...vp}, label: names[i] || 'Tampak utama'}));
 jobs.push({view: 'detail', params: {...(spec.p || {}), ...variants[0]}, label: 'Detail'});
 jobs.push({view: 'scene', params: {...(spec.p || {}), ...variants[0]}, label: 'Suasana'});
 productImages[p.id] = jobs.map((j, i) => {
  const rel = `images/products/${p.id}-${i + 1}.svg`;
  const svg = composeProduct({kind: spec.kind, params: j.params, tint: cat.tint, cat: cat.id, view: j.view, id: p.id});
  check(rel, svg); out(rel, svg); count++;
  return {src: rel, label: j.label};
 });
 // setiap indeks gambar yang dirujuk varian harus ada
 for (const it of (p.variants ? p.variants.items : [])) if (it.img != null && it.img >= productImages[p.id].length) throw new Error(`${p.id}: indeks gambar varian ${it.img} tidak ada`);
}

const site = {};
const put = (key, rel, svg) => { check(rel, svg); out(rel, svg); site[key] = rel; count++; };
put('hero', 'images/site/hero.svg', hero());
put('authArt', 'images/site/auth-art.svg', authArt());
for (const k of ['ongkir', 'kitab', 'asrama', 'jual']) put('banner_' + k, `images/site/banner-${k}.svg`, banner(k));
put('placeholder', 'images/placeholder.svg', placeholder());
put('logo', 'images/brand/logo.svg', logo());
put('favicon', 'images/brand/favicon.svg', logo());
const cats = {};
for (const c of CATS) { const rel = `images/categories/${c.id}.svg`; const svg = categoryTile(c, c.tint); check(rel, svg); out(rel, svg); cats[c.id] = rel; count++; }

const header = '/* Pemetaan gambar (DIBUAT OTOMATIS oleh tools/gen/index.mjs, boleh diedit manual).\n   Ganti berkas di folder images/ atau ubah path di sini untuk memakai foto produk asli.\n   PRODUCT_IMG[id] = daftar gambar galeri; varian dapat merujuk indeksnya lewat `img` di products.js. */\n';
const q = JSON.stringify;
const prodLines = Object.entries(productImages).map(([id, arr]) => ` ${q(id)}: [${arr.map(a => `{src: ${q(a.src)}, label: ${q(a.label)}}`).join(', ')}]`);
const siteLines = Object.entries(site).map(([k, v]) => ` ${k}: ${q(v)}`);
const catLines = Object.entries(cats).map(([k, v]) => `  ${k}: ${q(v)}`);
out('js/data/images.js', header + `const PRODUCT_IMG = {\n${prodLines.join(',\n')}\n};\nconst SITE_IMG = {\n${siteLines.join(',\n')},\n cats: {\n${catLines.join(',\n')}\n }\n};\n`);
console.log(`Selesai: ${count} gambar, ${PRODUCTS.length} produk.`);
