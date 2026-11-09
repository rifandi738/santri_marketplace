/* Turunan logo merek dari berkas sumber (PNG berlatar putih dari desainer).
   Jalankan:  npm run gen:logo   (memakai Chromium yang sama dengan pengujian E2E)
   Hasil di images/brand/: logo.png (header, footer, menu), favicon-32.png, icon-192.png, apple-touch-icon.png.
   Latar putih di luar ikon dibuang dengan masker yang mengikuti tepi ikon baris per baris. Masker dimasukkan
   beberapa piksel ke dalam agar pinggiran putih tidak ikut terbawa saat gambar diperkecil. */
import fs from 'node:fs';
import path from 'node:path';
import {launch, ROOT} from '../../tests/helpers.mjs';

const SRC = path.join(ROOT, 'tools/brand/logo-source.png');
const OUT = path.join(ROOT, 'images/brand');
/* [berkas, ukuran px, latar] — apple-touch-icon tidak boleh transparan (iOS mengisinya hitam) */
const TARGETS = [['logo.png', 128], ['favicon-32.png', 32], ['icon-192.png', 192], ['apple-touch-icon.png', 180, '#fff']];

const browser = await launch();
try {
 const page = await browser.newPage();
 const res = await page.evaluate(async ({src, targets}) => {
  const img = new Image(); img.src = src; await img.decode();
  const W = img.width, H = img.height;
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const base = canvas(W, H), bx = base.getContext('2d'); bx.drawImage(img, 0, 0);
  const d = bx.getImageData(0, 0, W, H).data;
  const INK = 160, K = 3;                       // ambang "bukan latar" (kanal terkecil) dan inset masker (px sumber)
  // rentang kiri-kanan ikon di setiap baris; simpan rentetan baris berurutan terpanjang (abaikan bintik lepas)
  const rows = [];
  for (let y = 0; y < H; y++) {
   let l = -1, r = -1;
   for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (Math.min(d[i], d[i + 1], d[i + 2]) < INK) { if (l < 0) l = x; r = x; } }
   if (l >= 0) rows.push([y, l, r]);
  }
  let best = [], run = [];
  for (const row of rows) { if (run.length && row[0] !== run[run.length - 1][0] + 1) run = []; run.push(row); if (run.length > best.length) best = run.slice(); }
  const body = best.slice(K, best.length - K);
  if (body.length < H / 4) throw new Error('Ikon tidak terdeteksi pada berkas sumber');
  // masker: sisi kiri dari atas ke bawah, lalu sisi kanan dari bawah ke atas
  const mask = canvas(W, H), mx = mask.getContext('2d');
  mx.beginPath();
  body.forEach(([y, l], i) => i ? mx.lineTo(l + K, y + .5) : mx.moveTo(l + K, y + .5));
  for (let i = body.length - 1; i >= 0; i--) mx.lineTo(body[i][2] + 1 - K, body[i][0] + .5);
  mx.closePath(); mx.fill();
  const cut = canvas(W, H), cx = cut.getContext('2d');
  cx.drawImage(img, 0, 0); cx.globalCompositeOperation = 'destination-in'; cx.drawImage(mask, 0, 0);
  // potong ke batas ikon lalu letakkan di tengah kanvas persegi
  const top = body[0][0], bottom = body[body.length - 1][0] + 1;
  const left = Math.min(...body.map(b => b[1])) + K, right = Math.max(...body.map(b => b[2])) + 1 - K;
  const w = right - left, h = bottom - top, S = Math.max(w, h);
  const sq = canvas(S, S); sq.getContext('2d').drawImage(cut, left, top, w, h, (S - w) / 2, (S - h) / 2, w, h);
  // perkecil bertahap (setengah demi setengah) agar hasil tetap tajam
  const shrink = (c, size) => {
   let cur = c;
   while (cur.width / 2 >= size) { const n = canvas(Math.round(cur.width / 2), Math.round(cur.height / 2)), nx = n.getContext('2d'); nx.imageSmoothingQuality = 'high'; nx.drawImage(cur, 0, 0, n.width, n.height); cur = n; }
   const o = canvas(size, size), ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(cur, 0, 0, size, size); return o;
  };
  const files = targets.map(([name, size, bg]) => {
   if (!bg) return [name, shrink(sq, size).toDataURL('image/png')];
   const o = canvas(size, size), ox = o.getContext('2d'), inner = Math.round(size * .84);
   ox.fillStyle = bg; ox.fillRect(0, 0, size, size);
   ox.drawImage(shrink(sq, inner), Math.round((size - inner) / 2), Math.round((size - inner) / 2));
   return [name, o.toDataURL('image/png')];
  });
  return {files, box: {left, top, w, h}, source: {W, H}};
 }, {src: 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64'), targets: TARGETS});
 fs.mkdirSync(OUT, {recursive: true});
 for (const [name, url] of res.files) fs.writeFileSync(path.join(OUT, name), Buffer.from(url.split(',')[1], 'base64'));
 console.log(`Logo: ikon ${res.box.w}x${res.box.h} px dari sumber ${res.source.W}x${res.source.H}; ${res.files.length} berkas ditulis ke images/brand/.`);
} finally {
 await browser.close();
}
