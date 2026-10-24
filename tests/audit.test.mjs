/* Audit otomatis: elemen interaktif tidak ada yang mati, tautan valid, aksesibilitas (axe-core + keyboard),
   dan responsivitas (tanpa overflow horizontal, drawer/filter/bar beli di seluler).
   Jalankan:  node --test tests/audit.test.mjs   (atau npm run test:e2e) */
import {test, describe, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {startServer, launch, newPage, go, hashOf, login, logout, cartCount, state, ROOT as ROOT_DIR} from './helpers.mjs';

const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core/axe.min.js');
let server, browser;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.stop(); });

async function withPage(opts, fn) {
 const s = await newPage(browser, server.url, opts);
 try { await fn(s.page, s); const bad = s.issues.filter(i => !(opts.allow || []).some(re => re.test(i))); assert.deepEqual(bad, [], 'masalah konsol/halaman:\n' + bad.join('\n')); }
 finally { await s.close(); }
}
const SEEDED = {paid: 'S.orders.find(o => o.userId === "u-santri" && o.pay === "paid").id', pending: 'S.orders.find(o => o.userId === "u-santri" && o.pay === "pending").id', sellerOrder: 'S.orders.find(o => o.pay === "paid" && o.parcels.some(p => p.sid === "maktabah-nurul-ilmi")).id'};

const ROUTES = {
 anon: ['/', '/produk', '/produk?cat=kitab', '/produk?q=zzzzqq', '/produk?sale=1&stock=1', '/produk/kt-01', '/produk/bm-01', '/produk/mk-08', '/produk/dg-01', '/produk/mk-06', '/toko', '/toko/pondok-jaya', '/keranjang', '/favorit', '/masuk', '/daftar', '/lupa-sandi', '/verifikasi', '/bantuan', '/kontak', '/tentang', '/syarat', '/privasi', '/lacak', '/lacak?id=NOPE'],
 buyer: ['/keranjang', '/checkout', '/akun', '/akun/pesanan', '/akun/pesanan?f=unpaid', '/akun/favorit', '/akun/notifikasi', '/akun/profil', '/buka-toko', '/favorit'],
 seller: ['/penjual', '/penjual/produk', '/penjual/produk/baru', '/penjual/produk/kt-01', '/penjual/pesanan', '/penjual/pesan', '/penjual/toko'],
 admin: ['/admin', '/admin/produk', '/admin/pesanan', '/admin/toko', '/admin/pelanggan', '/admin/voucher', '/admin/pesan', '/admin/data']
};

/* audit DOM halaman aktif; mengembalikan daftar masalah */
const AUDIT = () => {
 /* "terlihat bagi teknologi bantu": tampil, tidak visibility:hidden, bukan di dalam aria-hidden */
 const out = [], vis = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[aria-hidden=true], [hidden]');
 const acts = Object.keys(A), forms = Object.keys(FM), chs = Object.keys(CH);
 for (const el of document.querySelectorAll('[data-act]')) { const a = el.dataset.act; if (!acts.includes(a) && !chs.includes(a)) out.push(`aksi tanpa handler: data-act="${a}"`); }
 for (const f of document.querySelectorAll('form')) { const k = f.dataset.form; if (!k) out.push('form tanpa data-form: ' + f.outerHTML.slice(0, 80)); else if (!forms.includes(k)) out.push(`form tanpa handler: ${k}`); }
 for (const a of document.querySelectorAll('a')) {
  const h = a.getAttribute('href');
  if (h == null) { out.push('<a> tanpa href: ' + a.outerHTML.slice(0, 80)); continue; }
  if (h === '#' || h === '' || /^javascript:/i.test(h)) out.push(`tautan dekoratif/mati href="${h}": ${a.textContent.trim().slice(0, 40)}`);
 }
 const nameOf = el => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim() || [...el.querySelectorAll('img[alt]')].map(i => i.alt).join('').trim();
 for (const el of document.querySelectorAll('button, a[href], [role=button], [role=tab], [role=menuitem]')) if (vis(el) && !nameOf(el)) out.push('kontrol tanpa nama aksesibel: ' + el.outerHTML.slice(0, 100));
 for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
  if (el.type === 'file' && el.classList.contains('sr')) { if (!el.closest('label')) out.push('input file tanpa label'); continue; }
  const lbl = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label') || (el.id && document.querySelector(`label[for="${el.id}"]`));
  if (!lbl) out.push(`field tanpa label: ${el.tagName.toLowerCase()}[name=${el.name}]`);
 }
 for (const im of document.images) if (!im.hasAttribute('alt')) out.push('gambar tanpa alt: ' + im.src.slice(-40));
 const ids = [...document.querySelectorAll('[id]')].map(e => e.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
 if (dup.length) out.push('ID ganda: ' + [...new Set(dup)].join(', '));
 const h1 = document.querySelectorAll('h1'); if (h1.length !== 1) out.push(`jumlah h1 = ${h1.length}`);
 if (!document.querySelector('main')) out.push('tidak ada <main>');
 for (const b of document.querySelectorAll('button')) if (!b.type && b.closest('form') === null && !b.dataset.act && vis(b)) out.push('button tanpa aksi: ' + b.outerHTML.slice(0, 80));
 if (/Halaman gagal dimuat/.test(document.body.innerText)) out.push('halaman error');
 return out;
};
const visit = async (page, h) => { await go(page, h); await page.waitForTimeout(80); };

describe('audit elemen interaktif & markup', () => {
 test('tamu: semua halaman publik tanpa kontrol mati, tanpa href dekoratif, label & nama aksesibel lengkap', () => withPage({}, async page => {
  const problems = [], links = new Set();
  for (const r of ROUTES.anon) {
   await visit(page, r);
   for (const p of await page.evaluate(AUDIT)) problems.push(`${r}: ${p}`);
   for (const h of await page.evaluate(() => [...document.querySelectorAll('a[href^="#/"]')].map(a => a.getAttribute('href')))) links.add(h);
  }
  const uniq = [...new Set(problems)]; assert.deepEqual(uniq, [], uniq.slice(0, 40).join('\n'));
  // setiap tautan internal yang ditemukan harus menghasilkan halaman nyata (bukan 404 / galat)
  const dead = [];
  for (const h of links) {
   await visit(page, h.slice(1));
   const t = await page.evaluate(() => document.querySelector('main')?.innerText || '');
   if (/Halaman tidak ditemukan|Halaman gagal dimuat/.test(t)) dead.push(h);
  }
  assert.deepEqual(dead, [], 'tautan menuju halaman kosong/404: ' + dead.join(', '));
  assert.ok(links.size > 40, 'jumlah tautan unik yang diaudit: ' + links.size);
 }));

 test('pembeli, penjual, admin: dashboard dan akun tanpa kontrol mati', () => withPage({}, async page => {
  const problems = [];
  const run = async (who, routes) => {
   await login(page, who);
   const ids = Object.fromEntries(await Promise.all(Object.entries(SEEDED).map(async ([k, e]) => [k, await state(page, e)])));
   const extra = who === 'buyer' ? [`/akun/pesanan/${ids.paid}`, `/bayar/${ids.pending}`, `/bayar/${ids.paid}`] : who === 'seller' ? [`/penjual/pesanan/${ids.sellerOrder}`] : [`/admin/pesanan/${ids.paid}`];
   if (who === 'buyer') await page.evaluate(() => { addToCart('bm-01', 'v2', 1); addToCart('mk-03', null, 1); addToCart('dg-02', null, 1); S.wish = ['kt-01']; save(); });
   for (const r of [...routes, ...extra]) { await visit(page, r); for (const p of await page.evaluate(AUDIT)) problems.push(`[${who}] ${r}: ${p}`); }
   await logout(page);
  };
  await run('buyer', ROUTES.buyer); await run('seller', ROUTES.seller); await run('admin', ROUTES.admin);
  assert.deepEqual(problems, [], problems.join('\n'));
 }));

 test('modal & kotak konfirmasi: punya judul, fokus masuk ke dalam, Tab tidak keluar, Esc menutup & mengembalikan fokus', () => withPage({}, async page => {
  await go(page, '/produk/bm-01');
  const btn = page.getByRole('button', {name: /Tanya penjual/});
  await btn.click();
  assert.ok(await page.locator('#modal [role=dialog][aria-modal=true]').isVisible());
  assert.ok((await page.locator('#modal-title').innerText()).length > 3);
  assert.deepEqual(await page.evaluate(AUDIT), [], 'markup modal');
  await page.waitForFunction(() => document.querySelector('#modal').contains(document.activeElement), null, {timeout: 2000});
  for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => document.querySelector('#modal').contains(document.activeElement)), 'fokus terjebak di modal (Tab) langkah ' + i); }
  for (let i = 0; i < 14; i++) { await page.keyboard.press('Shift+Tab'); assert.ok(await page.evaluate(() => document.querySelector('#modal').contains(document.activeElement)), 'fokus terjebak di modal (Shift+Tab)'); }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#modal').count(), 0);
  assert.ok(await btn.evaluate(b => b === document.activeElement), 'fokus kembali ke pemicu');
  await page.mouse.click(5, 5);
  await login(page, 'buyer'); await go(page, '/akun/profil');
  await page.getByRole('button', {name: 'Hapus'}).first().click();
  assert.match(await page.locator('#modal-title').innerText(), /Hapus alamat/);
  await page.locator('#modal [data-act=closeModal]').first().click();
  assert.equal(await page.locator('#modal').count(), 0);
 }));

 test('navigasi keyboard: tautan lewati-ke-konten, fokus terlihat, dropdown dapat dioperasikan dengan panah', () => withPage({}, async page => {
  await page.keyboard.press('Tab');
  assert.match(await page.evaluate(() => document.activeElement.textContent), /Lewati ke konten/);
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
  assert.equal(await hashOf(page), '', 'tautan lewati tidak mengubah rute');
  await go(page, '/');
  const noRing = [];
  for (let i = 0; i < 16; i++) {
   await page.keyboard.press('Tab');
   const ring = await page.evaluate(() => { const el = document.activeElement, cs = getComputedStyle(el); return {tag: el.tagName, txt: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), vis: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 || cs.boxShadow !== 'none'}; });
   if (!ring.vis) noRing.push(ring.txt || ring.tag);
  }
  assert.deepEqual(noRing, [], 'elemen fokus tanpa indikator terlihat');
  await page.locator('.catbtn').focus(); await page.keyboard.press('Enter');
  assert.ok(await page.locator('#menu-cats').isVisible());
  assert.ok(await page.evaluate(() => document.querySelector('#menu-cats').contains(document.activeElement)), 'fokus pindah ke menu');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('Busana')), true);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#menu-cats').isVisible(), false);
 }));
});

describe('aksesibilitas (axe-core WCAG 2.x A/AA)', () => {
 const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
 async function axe(page, label) {
  if (await page.evaluate(() => typeof window.axe) === 'undefined') await page.addScriptTag({path: AXE});
  await page.evaluate(() => { document.getElementById('toasts').innerHTML = ''; });          // toast yang sedang memudar membuat pengukuran kontras tidak stabil
  const res = await page.evaluate(async tags => { const r = await axe.run(document, {runOnly: {type: 'tag', values: tags}, resultTypes: ['violations']}); return r.violations.map(v => ({id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 4).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1])})); }, TAGS);
  return res.map(v => `${label} → [${v.impact}] ${v.id}: ${v.help}\n      ${v.nodes.join('\n      ')}`);
 }
 test('halaman publik (desktop)', () => withPage({}, async page => {
  const found = [];
  for (const r of ['/', '/produk', '/produk?cat=makanan&sort=pa', '/produk?q=zzzzqq', '/produk/bm-01', '/produk/kt-03', '/produk/mk-08', '/toko', '/toko/pondok-jaya', '/keranjang', '/masuk', '/daftar', '/bantuan', '/kontak', '/tentang', '/syarat', '/lacak']) { await visit(page, r); found.push(...await axe(page, r)); }
  assert.deepEqual(found, [], '\n' + found.join('\n'));
 }));
 test('alur transaksi & akun (desktop)', () => withPage({}, async page => {
  const found = [];
  await login(page, 'buyer');
  await page.evaluate(() => { addToCart('bm-01', 'v2', 2); addToCart('mk-03', null, 1); addToCart('dg-02', null, 1); save(); });
  const ids = Object.fromEntries(await Promise.all(Object.entries(SEEDED).map(async ([k, e]) => [k, await state(page, e)])));
  for (const r of ['/keranjang', '/checkout', `/bayar/${ids.pending}`, `/bayar/${ids.paid}`, '/akun', '/akun/pesanan', `/akun/pesanan/${ids.paid}`, '/akun/profil', '/akun/notifikasi', '/favorit', '/buka-toko']) { await visit(page, r); found.push(...await axe(page, r)); }
  await go(page, '/checkout'); await page.getByRole('button', {name: /Tambah alamat baru/}).click(); found.push(...await axe(page, '/checkout (form alamat)'));
  assert.deepEqual(found, [], '\n' + found.join('\n'));
 }));
 test('dashboard penjual & admin (desktop)', () => withPage({}, async page => {
  const found = [];
  await login(page, 'seller');
  const id = await state(page, SEEDED.sellerOrder);
  for (const r of ['/penjual', '/penjual/produk', '/penjual/produk/baru', '/penjual/produk/kt-03', '/penjual/pesanan', `/penjual/pesanan/${id}`, '/penjual/pesan', '/penjual/toko']) { await visit(page, r); found.push(...await axe(page, r)); }
  await logout(page); await login(page, 'admin');
  for (const r of ['/admin', '/admin/produk', '/admin/pesanan', '/admin/toko', '/admin/pelanggan', '/admin/voucher', '/admin/pesan', '/admin/data']) { await visit(page, r); found.push(...await axe(page, r)); }
  assert.deepEqual(found, [], '\n' + found.join('\n'));
 }));
 test('halaman utama di seluler (390 px)', () => withPage({width: 390, height: 844, mobile: true}, async page => {
  const found = [];
  for (const r of ['/', '/produk', '/produk/bm-01', '/keranjang', '/masuk']) { await visit(page, r); found.push(...await axe(page, r + ' [390px]')); }
  assert.deepEqual(found, [], '\n' + found.join('\n'));
 }));
});

describe('responsif', () => {
 const ALL = [...ROUTES.anon.filter(r => !r.startsWith('/verifikasi')), ...ROUTES.buyer.slice(0, 7)];
 for (const width of [320, 360, 414, 768, 1024, 1440]) {
  test(`tanpa overflow horizontal pada ${width}px`, () => withPage({width, height: 900, mobile: width < 700}, async page => {
   const over = [];
   for (const r of ALL) {
    if (ROUTES.buyer.includes(r) && !(await state(page, 'getSession()'))) await login(page, 'buyer');
    await visit(page, r);
    const w = await page.evaluate(() => ({doc: document.documentElement.scrollWidth, vw: window.innerWidth}));
    if (w.doc > w.vw) over.push(`${r}: dokumen ${w.doc}px > viewport ${w.vw}px`);
   }
   assert.deepEqual(over, [], over.join('\n'));
  }));
 }
 test('seluler 390px: drawer menu, akordeon kategori, tutup dengan Esc/overlay/tautan', () => withPage({width: 390, height: 844, mobile: true}, async page => {
  assert.equal(await page.locator('.mainnav').isVisible(), false); assert.equal(await page.locator('.catmenu').isVisible(), false);
  const burger = page.getByRole('button', {name: 'Buka menu navigasi'});
  assert.equal(await page.locator('#drawer').getAttribute('aria-hidden'), 'true');
  await burger.click();
  assert.equal(await burger.getAttribute('aria-expanded'), 'true'); assert.ok(await page.locator('#drawer').isVisible());
  await page.locator('#drawer').getByRole('button', {name: 'Kategori'}).click();
  assert.equal(await page.locator('#drawer-cats a').count(), 8);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  assert.equal(await page.locator('#drawer').getAttribute('aria-hidden'), 'true');
  await burger.click(); await page.locator('.drawer-bg').click({position: {x: 380, y: 400}, force: true}); await page.waitForTimeout(300);
  assert.equal(await page.locator('#drawer').getAttribute('aria-hidden'), 'true');
  await burger.click(); await page.locator('#drawer').getByRole('button', {name: 'Kategori'}).click(); await page.locator('#drawer-cats a', {hasText: 'Busana Muslim'}).click();
  assert.equal(await hashOf(page), '/produk?cat=busana'); await page.waitForTimeout(300);
  assert.equal(await page.locator('#drawer').getAttribute('aria-hidden'), 'true');
  assert.equal(await page.locator('body').evaluate(b => b.classList.contains('no-scroll')), false);
 }));
 test('seluler 390px: panel filter, bar beli sticky, grid 2 kolom, area sentuh memadai', () => withPage({width: 390, height: 844, mobile: true}, async page => {
  await go(page, '/produk');
  const cols = await page.locator('.pgrid').evaluate(g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
  assert.equal(cols, 2);
  assert.equal(await page.locator('#filters').evaluate(f => f.getBoundingClientRect().right <= 0 || getComputedStyle(f).visibility === 'hidden'), true, 'panel filter tersembunyi');
  await page.getByRole('button', {name: /^Filter/}).click();
  assert.ok(await page.locator('#filters').isVisible());
  await page.locator('[data-filter=cat][value=kitab]').check(); await hashOf(page);
  assert.ok(await page.locator('#filters').isVisible(), 'panel tetap terbuka setelah memilih filter');
  await page.getByRole('button', {name: /Tampilkan 7 produk/}).click(); await page.waitForTimeout(350);
  assert.equal(await page.locator('#filters').evaluate(f => getComputedStyle(f).visibility === 'hidden' || f.getBoundingClientRect().right <= 0), true);
  assert.match(await page.locator('#result-count').innerText(), /^7 produk/);
  // ukuran target sentuh
  const small = await page.evaluate(() => [...document.querySelectorAll('.topbar a, .topbar button, .pc-heart, .pcard .btn')].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); return {t: (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height)}; }).filter(x => x.w < 36 || x.h < 36));
  assert.deepEqual(small, [], 'target sentuh < 36px');
  // halaman produk: bar beli sticky
  await go(page, '/produk/bm-01');
  assert.ok(await page.locator('.mbar').isVisible());
  const bar = await page.locator('.mbar').boundingBox(); assert.ok(Math.abs(bar.y + bar.height - 844) <= 1, 'bar menempel di dasar layar');
  await page.locator('.mbar [data-act=buyNow]').click();
  assert.match(await page.locator('#pd-err').innerText(), /Pilih ukuran/);
  await page.locator('input[name=variant][value=v2]').check({force: true});
  await page.locator('.mbar [data-act=addCart]').click();
  assert.equal(await cartCount(page), 1);
 }));
 test('seluler 390px: keranjang → checkout → bayar dapat diselesaikan dengan sentuhan', () => withPage({width: 390, height: 844, mobile: true}, async page => {
  await login(page, 'buyer');
  await go(page, '/produk/mk-01');
  await page.locator('input[name=variant][value=v2]').check({force: true});
  await page.locator('.pd-info [data-act=addCart]').tap();
  await go(page, '/keranjang'); await page.locator('a[href="#/checkout"]').tap(); await hashOf(page);
  await page.locator('[data-act=placeOrder]').scrollIntoViewIfNeeded(); await page.locator('[data-act=placeOrder]').tap();
  await page.waitForFunction(() => location.hash.startsWith('#/bayar/')); await hashOf(page);
  await page.locator('[data-act=simPay][data-r=paid]').tap(); await page.waitForSelector('.order-no');
  assert.match(await page.locator('main h1').innerText(), /Pesanan berhasil dibuat/);
 }));
 test('seluler 390px: dashboard — menu samping buka/tutup dan tabel dapat digulir tanpa overflow halaman', () => withPage({width: 390, height: 844, mobile: true}, async page => {
  await login(page, 'seller'); await go(page, '/penjual/produk');
  assert.equal(await page.locator('#admSide').evaluate(s => getComputedStyle(s).visibility), 'hidden');
  await page.getByRole('button', {name: 'Buka menu dashboard'}).click();
  assert.ok(await page.locator('#admSide').isVisible());
  await page.locator('#admSide a', {hasText: 'Pesanan'}).click(); await page.waitForTimeout(350);
  assert.equal(await hashOf(page), '/penjual/pesanan');
  assert.equal(await page.locator('#admSide').evaluate(s => getComputedStyle(s).visibility), 'hidden');
  await go(page, '/penjual/produk');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  assert.ok(await page.locator('.scroll-x').evaluate(e => e.scrollWidth > e.clientWidth), 'tabel lebar digulir di dalam wadahnya');
 }));
 test('modal muat di layar kecil dan formulir panjang dapat digulir', () => withPage({width: 360, height: 640, mobile: true}, async page => {
  await login(page, 'buyer'); await go(page, '/akun/profil');
  await page.getByRole('button', {name: /Tambah alamat/}).click();
  const m = await page.locator('#modal .modal').boundingBox();
  assert.ok(m.y >= 0 && m.y + m.height <= 640 + 1 && m.width <= 360, JSON.stringify(m));
  assert.equal(await page.locator('#modal .modal').evaluate(e => e.scrollHeight > e.clientHeight && getComputedStyle(e).overflowY === 'auto'), true);
  await page.locator('#modal .modal-primary').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#modal .modal-primary').isVisible());
 }));
});

describe('persistensi & ketahanan', () => {
 test('keranjang, favorit, sesi, dan pesanan bertahan setelah muat ulang; reset memulihkan awal', () => withPage({}, async page => {
  await login(page, 'buyer');
  await page.evaluate(() => { addToCart('bm-01', 'v2', 2); S.wish.push('kt-01'); save(); });
  await page.reload(); await page.waitForSelector('#app > *');
  assert.equal(await cartCount(page), 2); assert.deepEqual(await state(page, 'S.wish'), ['kt-01']);
  assert.match(await page.locator('.acct-btn').innerText(), /Ahmad/);
  assert.equal(await state(page, 'S.orders.length'), 14);
 }));
 test('data localStorage rusak/versi lama tidak membuat aplikasi mogok (dipulihkan ke data awal)', () => withPage({}, async page => {
  await page.evaluate(() => { localStorage.setItem(LS_KEY, '{rusak'); });
  await page.reload(); await page.waitForSelector('#app > *');
  assert.match(await page.locator('main h1').innerText(), /Semua kebutuhan santri/);
  await page.evaluate(() => { localStorage.setItem(LS_KEY, JSON.stringify({v: 99, products: []})); });
  await page.reload(); await page.waitForSelector('#app > *');
  assert.equal(await state(page, 'S.products.length'), 52);
 }));
 test('rute tidak valid / parameter aneh tidak menimbulkan galat', () => withPage({}, async page => {
  for (const h of ['/produk?page=abc', '/produk?page=-5', '/produk?min=x&max=y', '/produk?cat=tidak-ada', '/produk?sort=ngawur', '/produk/%E0%A4%A', '/produk/<img src=x onerror=alert(1)>', '/toko/%00', '/akun/%00', '/lacak?id=<script>', '/produk?q=%3Cscript%3Ealert(1)%3C/script%3E']) {
   await go(page, h);
   assert.ok(await page.locator('main').count() === 1, h);
   assert.equal(await page.locator('main script, main img[onerror]').count(), 0, 'XSS: ' + h);
  }
  assert.match(await page.locator('main').innerText(), /<script>|tidak ada|ditemukan|produk/i);
 }));
 test('XSS: input pengguna di-escape (nama toko, ulasan, pesan) dan tidak dieksekusi', () => withPage({}, async page => {
  await login(page, 'buyer');
  const evil = '"><img src=x onerror="window.__xss=1"><b>x</b>';
  await page.evaluate(e => { S.users.find(u => u.id === 'u-santri').name = e; save(); addReview('ib-06', 5, e + ' ulasan'); S.shops[0].name = e; save(); render(); }, evil);
  for (const h of ['/akun', '/produk/ib-06', '/toko', '/produk/kt-01', '/akun/profil']) { await go(page, h); await page.getByRole('tab', {name: /Ulasan/}).click({timeout: 500}).catch(() => {}); }
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__xss), undefined);
  assert.equal(await page.locator('main img[src="x"]').count(), 0);
 }));
});

describe('ketahanan lingkungan', () => {
 test('dibuka langsung dari berkas (file://): render, navigasi, login, dan keranjang berfungsi', async () => {
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
  const page = await ctx.newPage(), issues = [];
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/fonts\.g/.test(m.location().url || '')) issues.push(m.text()); });
  page.on('pageerror', e => issues.push(e.message));
  try {
   await page.goto('file://' + ROOT_DIR + '/index.html'); await page.waitForSelector('#app > *');
   assert.match(await page.locator('main h1').innerText(), /Semua kebutuhan santri/);
   await go(page, '/produk/kt-05'); await page.locator('[data-act=addCart]:visible').first().click();
   assert.equal(await cartCount(page), 1);
   await login(page, 'buyer');
   assert.match(await page.locator('.acc-main h1').innerText(), /Halo, Ahmad/);
   assert.equal(await page.evaluate(() => location.protocol), 'file:');
   assert.deepEqual(issues, []);
  } finally { await ctx.close(); }
 });

 test('login, ganti sandi, dan daftar tetap berfungsi tanpa WebCrypto (http non-aman) lewat PBKDF2 JavaScript murni', async () => {
  const ctx = await browser.newContext(); await ctx.addInitScript(() => Object.defineProperty(crypto, 'subtle', {value: undefined, configurable: true}));
  const page = await ctx.newPage(), issues = [];
  page.on('pageerror', e => issues.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.location().url || '')) issues.push(m.text()); });
  try {
   await page.goto(server.url + '/'); await page.waitForSelector('#app > *');
   assert.equal(await page.evaluate(() => typeof crypto.subtle), 'undefined');
   await login(page, 'buyer'); assert.match(await page.locator('.acc-main h1').innerText(), /Halo, Ahmad/);
   await go(page, '/akun/profil');
   await page.locator('#f-old').fill('santri123'); await page.locator('form[data-form=pw] #f-pass').fill('sandi-js-murni-1'); await page.locator('form[data-form=pw] #f-pass2').fill('sandi-js-murni-1');
   await page.locator('form[data-form=pw] button.btn').click();
   await page.waitForFunction(() => document.getElementById('toasts').textContent.includes('Kata sandi diganti'), null, {timeout: 8000});
   await logout(page); await go(page, '/masuk');
   await page.locator('#f-email').fill('santri@example.com'); await page.locator('#f-pass').fill('sandi-js-murni-1'); await page.locator('form[data-form=login] button.btn').click();
   await page.waitForFunction(() => location.hash === '#/akun', null, {timeout: 8000});
   assert.deepEqual(issues, []);
  } finally { await ctx.close(); }
 });

 test('salin ke papan klip: kode voucher di banner, tautan produk, dan nomor VA', () => withPage({ctxOpts: {permissions: ['clipboard-read', 'clipboard-write']}}, async page => {
  const clip = () => page.evaluate(() => navigator.clipboard.readText());
  await page.getByRole('button', {name: 'Salin kode'}).click();
  assert.equal(await clip(), 'GRATISONGKIR'); assert.match(await page.locator('#toasts .toast').last().innerText(), /GRATISONGKIR disalin/);
  await go(page, '/produk/ib-03'); await page.getByRole('button', {name: 'Salin tautan'}).click();
  assert.equal(await clip(), await page.evaluate(() => location.href));
  await login(page, 'buyer'); await page.evaluate(() => { S.cart = []; addToCart('bl-06', null, 1); }); await go(page, '/checkout');
  await page.locator('[data-act=placeOrder]').click(); await page.waitForFunction(() => location.hash.startsWith('#/bayar/'));
  await page.locator('#pm').selectOption('Virtual account · BNI'); await page.getByRole('button', {name: 'Salin'}).click();
  assert.match(await clip(), /^8808\d{12}$/);
 }));

 test('offline: banner muncul/hilang dan aplikasi tetap bisa dipakai', () => withPage({allow: [/ERR_INTERNET_DISCONNECTED/, /\[requestfailed\] .*\/images\//]}, async (page, s) => {
  await s.ctx.setOffline(true);
  await page.waitForFunction(() => !document.getElementById('offline').hidden);
  await go(page, '/produk?cat=kitab'); assert.ok(await page.locator('.pgrid .pcard').count() > 0);
  await page.locator('.pcard [data-act=quickAdd]').first().click(); assert.equal(await cartCount(page), 1);
  await s.ctx.setOffline(false);
  await page.waitForFunction(() => document.getElementById('offline').hidden);
  assert.match(await page.locator('#toasts .toast').last().innerText(), /Kembali online/);
 }));

 test('penyimpanan penuh/diblokir: pengguna diberi tahu, aplikasi tidak mogok', () => withPage({allow: [/QuotaExceeded|Quota/]}, async page => {
  await go(page, '/produk?cat=kitab');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('penuh', 'QuotaExceededError'); }; });
  await page.locator('.pcard [data-act=quickAdd]').first().click();
  await page.waitForFunction(() => document.getElementById('toasts').textContent.includes('Penyimpanan browser penuh'));
  assert.equal(await cartCount(page), 1, 'keranjang tetap bekerja di memori');
  await go(page, '/keranjang'); assert.equal(await page.locator('.cline').count(), 1);
 }));

 test('faktur: modal berisi rincian pesanan dan CSS cetak hanya menampilkan faktur', () => withPage({}, async page => {
  await login(page, 'buyer'); const id = await state(page, SEEDED.paid); await go(page, '/akun/pesanan/' + id);
  await page.getByRole('button', {name: 'Faktur'}).click();
  assert.match(await page.locator('#inv').innerText(), new RegExp(id)); assert.match(await page.locator('#inv').innerText(), /Total/);
  assert.ok(await page.getByRole('button', {name: /Cetak/}).isVisible());
  await page.emulateMedia({media: 'print'});
  assert.equal(await page.locator('#app').evaluate(e => getComputedStyle(e).display), 'none');
  assert.notEqual(await page.locator('#inv').evaluate(e => getComputedStyle(e).display), 'none');
  assert.equal(await page.locator('#modal .x').evaluate(e => getComputedStyle(e).display), 'none');
 }));
});

describe('gambar & kontrol bantu', () => {
 test('SEMUA gambar yang dipetakan (produk, kategori, banner, logo) benar-benar termuat di browser', () => withPage({}, async page => {
  const res = await page.evaluate(async () => {
   const srcs = [...new Set([...Object.values(PRODUCT_IMG).flat().map(i => i.src), ...Object.values(SITE_IMG).flatMap(v => typeof v === 'string' ? [v] : Object.values(v))])];
   const bad = [];
   await Promise.all(srcs.map(src => new Promise(r => { const i = new Image(); i.onload = () => { if (!i.naturalWidth) bad.push(src); r(); }; i.onerror = () => { bad.push(src); r(); }; i.src = src; })));
   return {n: srcs.length, bad};
  });
  assert.deepEqual(res.bad, []); assert.ok(res.n >= 189, 'jumlah gambar yang diperiksa: ' + res.n);
 }));
 test('semua kartu produk di seluruh katalog menampilkan gambar yang sesuai (satu gambar unik per produk) tanpa yang rusak', () => withPage({}, async page => {
  const seen = new Set();
  for (let pg = 1; pg <= 5; pg++) {
   await go(page, '/produk?page=' + pg);
   await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
   await page.waitForFunction(() => [...document.querySelectorAll('.pgrid img')].every(i => i.complete), null, {timeout: 6000});
   const info = await page.evaluate(() => [...document.querySelectorAll('.pgrid .pcard')].map(c => ({src: c.querySelector('img').getAttribute('src'), ok: c.querySelector('img').naturalWidth > 0})));
   assert.ok(info.every(i => i.ok), `halaman ${pg}: ada gambar rusak`);
   info.forEach(i => seen.add(i.src));
  }
  assert.equal(seen.size, 52, 'tiap produk punya gambar utama yang berbeda');
 }));
 test('tombol kembali ke atas: muncul setelah menggulir dan berfungsi', () => withPage({}, async page => {
  await go(page, '/produk');
  assert.equal(await page.locator('#totop').evaluate(e => getComputedStyle(e).opacity), '0');
  await page.evaluate(() => window.scrollTo(0, 1600)); await page.waitForFunction(() => document.getElementById('totop').classList.contains('show'));
  await page.locator('#totop').click(); await page.waitForFunction(() => window.scrollY < 5, null, {timeout: 4000});
 }));
 test('lacak pesanan: input kosong ditolak dengan pesan, id seed valid menampilkan riwayat', () => withPage({}, async page => {
  await go(page, '/lacak'); await page.locator('form[data-form=track] button').click();
  assert.match(await page.locator('#err-id').innerText(), /Masukkan nomor pesanan/);
  const id = await state(page, 'S.orders.find(o => o.pay === "paid").id');
  await page.locator('#tid').fill(id.toLowerCase()); await page.locator('form[data-form=track] button').click();
  await page.waitForFunction(() => location.hash.startsWith('#/lacak?id=')); await hashOf(page);
  assert.ok(await page.locator('.trk-p').count() >= 1); assert.match(await page.locator('main').innerText(), new RegExp(id));
 }));
});
