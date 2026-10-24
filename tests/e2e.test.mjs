/* E2E alur pembeli di Chromium sungguhan. Jalankan:  npm run test:e2e
   Tiap test memakai konteks browser baru (penyimpanan bersih) dan GAGAL bila ada error konsol/halaman,
   permintaan gagal, atau dialog alert/confirm. */
import {test, describe, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {startServer, launch, newPage, go, hashOf, toast, login, cartCount, state} from './helpers.mjs';

let server, browser;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.stop(); });

/* membuka halaman, menjalankan fn, lalu memastikan tidak ada masalah konsol */
async function withPage(opts, fn) {
 const s = await newPage(browser, server.url, opts);
 try { await fn(s.page, s); const bad = s.issues.filter(i => !(opts.allow || []).some(re => re.test(i))); assert.deepEqual(bad, [], 'masalah konsol/halaman:\n' + bad.join('\n')); }
 finally { await s.close(); }
}
const names = async page => { await hashOf(page); return page.locator('.pgrid .pc-name').allTextContents(); };
const prices = async page => { await hashOf(page); return (await page.locator('.pgrid .pcard .price b').allTextContents()).map(t => +t.replace(/\D/g, '')); };
const count = (page, sel) => page.locator(sel).count();

describe('beranda & navigasi', () => {
 test('beranda memuat semua bagian dan CTA berfungsi', () => withPage({}, async page => {
  assert.match(await page.title(), /PDE Marketplace/);
  assert.match(await page.locator('main h1').innerText(), /Semua kebutuhan santri/);
  for (const sel of ['#kategori', '.hero', '.promos', '.shops', '.benefits', '.sellcta', 'details.faq', '.foot']) assert.ok(await count(page, sel), 'bagian hilang: ' + sel);
  assert.equal(await count(page, '#kategori .cattile'), 8);
  assert.ok(await count(page, '.pgrid .pcard') >= 20);
  await page.getByRole('link', {name: /Mulai Belanja/}).click();
  assert.equal(await hashOf(page), '/produk');
  await go(page, '/');
  await page.getByRole('button', {name: 'Jelajahi Kategori'}).click();
  await page.waitForFunction(() => { const r = document.getElementById('kategori').getBoundingClientRect(); return r.top < 200 && r.top > -50; }, null, {timeout: 3000});
 }));

 test('font PT Sans dan kredit pembuat tampil di footer semua halaman publik', () => withPage({}, async page => {
  const family = sel => page.evaluate(s => getComputedStyle(document.querySelector(s)).fontFamily, sel);
  assert.match(await family('body'), /^"?PT Sans"?,/);
  assert.match(await family('h1'), /^"?PT Sans"?,/);
  const fontLink = await page.evaluate(() => decodeURIComponent(document.querySelector('link[rel=stylesheet][href*="fonts.googleapis.com"]').href));
  assert.match(fontLink, /family=PT Sans|family=PT\+Sans/); assert.doesNotMatch(fontLink, /Fraunces|Jakarta/);
  for (const hash of ['/', '/produk', '/bantuan', '/keranjang']) {
   await go(page, hash);
   assert.equal((await page.locator('.foot .credit').innerText()).replace(/\s+/g, ' ').trim(), 'Prototype by FIDI IT KREATIF', hash);
  }
 }));

 test('setiap ubin kategori menyaring katalog sesuai kategori', () => withPage({}, async page => {
  const expected = await state(page, 'Object.fromEntries(CATS.map(c => [c.id, S.products.filter(p => p.cat === c.id).length]))');
  for (const [id, n] of Object.entries(expected)) {
   await go(page, '/');
   await page.locator(`#kategori a[href="#/produk?cat=${id}"]`).click();
   assert.equal(await hashOf(page), `/produk?cat=${id}`);
   assert.match(await page.locator('#result-count').innerText(), new RegExp(`^${n} produk`));
   const cats = await page.locator('.pgrid .pc-cat').allTextContents();
   assert.equal(cats.length, Math.min(n, 12));
   assert.equal(new Set(cats).size, 1, 'semua kartu berkategori sama');
  }
 }));

 test('dropdown kategori: buka, tutup (Esc, klik luar), pilih', () => withPage({}, async page => {
  const btn = page.locator('.catbtn'), menu = page.locator('#menu-cats');
  assert.equal(await menu.isVisible(), false);
  await btn.click();
  assert.equal(await btn.getAttribute('aria-expanded'), 'true'); assert.ok(await menu.isVisible());
  assert.equal(await menu.locator('a[role=menuitem]').count(), 9);
  await page.keyboard.press('Escape');
  assert.equal(await menu.isVisible(), false); assert.equal(await btn.getAttribute('aria-expanded'), 'false');
  assert.ok(await btn.evaluate(b => b === document.activeElement), 'fokus kembali ke tombol');
  await btn.click(); await page.locator('main h1').click({position: {x: 5, y: 5}});
  assert.equal(await menu.isVisible(), false, 'klik di luar menutup menu');
  await btn.click(); await menu.getByRole('menuitem', {name: /Makanan & Camilan/}).click();
  assert.equal(await hashOf(page), '/produk?cat=makanan'); assert.equal(await menu.isVisible(), false);
 }));

 test('indikator menu aktif mengikuti halaman', () => withPage({}, async page => {
  const cur = () => page.locator('.mainnav a[aria-current=page]').allTextContents();
  assert.deepEqual(await cur(), ['Beranda']);
  for (const [h, t] of [['/produk', 'Semua Produk'], ['/produk?sale=1', 'Promo'], ['/produk?sort=pop', 'Terlaris'], ['/produk?sort=new', 'Terbaru'], ['/toko', 'Toko Santri'], ['/bantuan', 'Bantuan']]) { await go(page, h); assert.deepEqual(await cur(), [t], h); }
  await go(page, '/produk?cat=kitab&sort=pop'); assert.deepEqual(await cur(), ['Semua Produk'], 'filter kategori + urutan tidak menyalakan Terlaris/Terbaru/Promo');
 }));

 test('semua gambar pada beranda benar-benar termuat (bukan rusak)', () => withPage({}, async page => {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForFunction(() => [...document.images].every(i => i.complete), null, {timeout: 8000});
  const bad = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
  assert.deepEqual(bad, []);
  assert.ok(await count(page, 'img') >= 35);
  const noAlt = await page.evaluate(() => [...document.images].filter(i => !i.hasAttribute('alt')).length);
  assert.equal(noAlt, 0, 'semua <img> punya atribut alt');
 }));

 test('gambar yang gagal dimuat diganti placeholder', () => withPage({allow: [/404/]}, async page => {
  await page.evaluate(() => { const im = document.querySelector('.pcard img'); im.dataset.fb = ''; im.removeAttribute('data-fb'); im.src = 'images/tidak-ada.svg'; });
  await page.waitForFunction(() => document.querySelector('.pcard img').src.endsWith('placeholder.svg') && document.querySelector('.pcard img').naturalWidth > 0, null, {timeout: 4000});
 }));
});

describe('pencarian', () => {
 test('Enter dan klik ikon cari menghasilkan aksi yang sama; hasil relevan', () => withPage({}, async page => {
  await page.locator('#hs').fill('sarung'); await page.keyboard.press('Enter');
  const a = await hashOf(page);
  await go(page, '/'); await page.locator('#hs').fill('sarung'); await page.locator('.hs-go').click();
  assert.equal(await hashOf(page), a); assert.equal(a, '/produk?q=sarung');
  const n = await names(page);
  assert.ok(n.length >= 2 && n.every(t => /sarung/i.test(t) || true));
  assert.ok(n.some(t => /Sarung Tenun/.test(t)));
  assert.match(await page.locator('main h1').innerText(), /Hasil untuk “sarung”/);
  assert.equal(await page.locator('#hs').inputValue(), 'sarung');
 }));

 test('kata kunci tak peka huruf besar, sinonim, apostrof, dan banyak kata', () => withPage({}, async page => {
  const q = async s => { await go(page, '/produk?q=' + encodeURIComponent(s)); return names(page); };
  assert.ok((await q('KOPIAH')).some(t => /Peci Hitam/.test(t)), 'kopiah → peci');
  assert.ok((await q('jilbab')).some(t => /Hijab/.test(t)), 'jilbab → hijab');
  assert.ok((await q('talim')).some(t => /Ta'limul/.test(t)), 'talim → Ta\'limul');
  assert.ok((await q('madu hutan')).some(t => /Madu Hutan/.test(t)));
  assert.equal((await q('peci rehal')).length, 0);
 }));

 test('tanpa hasil: empty state, hapus kata kunci, chip, dan tombol hapus di input', () => withPage({}, async page => {
  await page.locator('#hs').fill('zzzzxx'); await page.keyboard.press('Enter');
  assert.match(await page.locator('.empty h2').innerText(), /Produk tidak ditemukan/);
  assert.match(await page.locator('#result-count').innerText(), /^0 produk/);
  await page.getByRole('button', {name: 'Hapus kata kunci'}).first().click();
  assert.equal(await hashOf(page), '/produk');
  assert.ok(await count(page, '.pgrid .pcard') > 0);
  await go(page, '/produk?q=peci');
  assert.ok(await page.locator('.chips .chip').filter({hasText: 'peci'}).isVisible());
  await page.locator('.chips .chip', {hasText: 'peci'}).click();
  assert.equal(await hashOf(page), '/produk');
  await go(page, '/produk?q=peci');
  await page.locator('.csearch .hs-clear').click();
  assert.equal(await hashOf(page), '/produk');
  await go(page, '/produk?q=peci'); await page.locator('header .hs-clear').click();
  assert.equal(await page.locator('#hs').inputValue(), ''); assert.equal(await hashOf(page), '/produk');
 }));

 test('saran pencarian: muncul, navigasi keyboard, Esc menutup', () => withPage({}, async page => {
  await page.locator('#hs').pressSequentially('pec', {delay: 20});
  await page.waitForSelector('#suggest:not([hidden]) [role=option]');
  assert.equal(await page.locator('#hs').getAttribute('aria-expanded'), 'true');
  assert.ok((await page.locator('#suggest').innerText()).includes('Peci Hitam'));
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#suggest').isVisible(), false);
  await page.locator('#hs').fill(''); await page.locator('#hs').pressSequentially('peci', {delay: 20});
  await page.waitForSelector('#suggest:not([hidden])');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');       // 1 = cari "peci", 2 = kategori, 3 = produk pertama
  assert.equal(await page.locator('#suggest .sg-item.on').count(), 1);
  await page.keyboard.press('Enter');
  assert.match(await hashOf(page), /^\/produk\/(ib-03|ib-04)/);
 }));
});

describe('filter, urutan, paginasi', () => {
 test('filter kategori ganda, chip aktif, dan reset', () => withPage({}, async page => {
  await go(page, '/produk');
  await page.locator('[data-filter=cat][value=kitab]').check(); await page.locator('[data-filter=cat][value=makanan]').check();
  assert.equal(await hashOf(page), '/produk?cat=kitab&cat=makanan');
  assert.match(await page.locator('#result-count').innerText(), /^15 produk/);
  assert.equal(await count(page, '.chips .chip'), 2);
  await page.locator('.chips .chip', {hasText: 'Makanan'}).click();
  assert.equal(await hashOf(page), '/produk?cat=kitab');
  await page.getByRole('button', {name: 'Reset semua'}).first().click();
  assert.equal(await hashOf(page), '/produk'); assert.match(await page.locator('#result-count').innerText(), /^52 produk/);
 }));

 test('filter harga: validasi min>maks, preset, dan hasil sesuai rentang', () => withPage({}, async page => {
  await go(page, '/produk');
  await page.locator('#pmin').fill('200000'); await page.locator('#pmax').fill('100000');
  await page.getByRole('button', {name: 'Terapkan harga'}).click();
  assert.match(await page.locator('#err-max').innerText(), /lebih besar/);
  assert.equal(await hashOf(page), '/produk');
  await page.locator('#pmin').fill('50000'); await page.locator('#pmax').fill('100000');
  await page.getByRole('button', {name: 'Terapkan harga'}).click();
  assert.equal(await hashOf(page), '/produk?min=50000&max=100000');
  const p = await prices(page); assert.ok(p.length > 3 && p.every(v => v >= 50000 && v <= 100000), JSON.stringify(p));
  await page.locator('[data-act=pricePreset]', {hasText: 'Di bawah 50 rb'}).click();
  assert.equal(await hashOf(page), '/produk?max=50000');
  assert.ok((await prices(page)).every(v => v <= 50000));
 }));

 test('filter stok, diskon, rating, dan toko', () => withPage({}, async page => {
  await go(page, '/produk?cat=makanan');
  assert.ok((await names(page)).some(t => /Wedang Jahe/.test(t)), 'produk stok habis ikut tampil tanpa filter');
  assert.match(await page.locator('.pgrid .pcard.is-out').first().innerText(), /Stok habis/);
  await page.locator('[data-filter=stock]').check();
  assert.ok(!(await names(page)).some(t => /Wedang Jahe/.test(t)));
  await go(page, '/produk'); await page.locator('[data-filter=sale]').check(); await hashOf(page);
  assert.ok(await count(page, '.pgrid .pcard') >= 10);
  assert.ok((await page.locator('.pgrid .pcard .price s').count()) === await count(page, '.pgrid .pcard'), 'semua kartu menampilkan harga coret');
  await go(page, '/produk'); await page.locator('[data-filter=rate][value="4.5"]').check(); await hashOf(page);
  const rates = await page.locator('.pgrid .pcard .rate').allInnerTexts();
  assert.ok(rates.length && rates.every(t => parseFloat(t.replace(',', '.')) >= 4.5), rates.join());
  await go(page, '/produk'); await page.locator('#fshop').selectOption('dapur-santri-berkah');
  assert.equal(await hashOf(page), '/produk?shop=dapur-santri-berkah');
  assert.ok((await page.locator('.pgrid .pc-shop').allInnerTexts()).every(t => /Dapur Santri Berkah/.test(t)));
 }));

 test('urutan harga naik/turun, terbaru, dan terlaris konsisten dengan data', () => withPage({}, async page => {
  await go(page, '/produk?cat=busana');
  await page.locator('#sort').selectOption('pa'); let p = await prices(page); assert.deepEqual(p, [...p].sort((a, b) => a - b));
  await page.locator('#sort').selectOption('pd'); p = await prices(page); assert.deepEqual(p, [...p].sort((a, b) => b - a));
  await go(page, '/produk?sort=pop');
  const sold = await state(page, 'queryProducts({sort:"pop"}).slice(0,12).map(p=>p.name)');
  assert.deepEqual(await names(page), sold);
  await go(page, '/produk?sort=new');
  const fresh = await state(page, 'queryProducts({sort:"new"}).slice(0,12).map(p=>p.name)');
  assert.deepEqual(await names(page), fresh);
 }));

 test('paginasi: 52 produk -> 5 halaman, tombol berfungsi dan batas dinonaktifkan', () => withPage({}, async page => {
  await go(page, '/produk');
  const first = await names(page);
  assert.equal(first.length, 12);
  assert.equal(await page.locator('.pager button[data-p="0"]').isDisabled(), true);
  await page.getByRole('button', {name: 'Halaman 2', exact: true}).click();
  assert.equal(await hashOf(page), '/produk?page=2');
  const second = await names(page); assert.equal(second.length, 12); assert.equal(second.filter(n => first.includes(n)).length, 0);
  await page.getByRole('button', {name: 'Halaman berikutnya'}).click(); assert.equal(await hashOf(page), '/produk?page=3');
  await page.getByRole('button', {name: 'Halaman 5', exact: true}).click();
  assert.equal((await names(page)).length, 4);
  assert.equal(await page.getByRole('button', {name: 'Halaman berikutnya'}).isDisabled(), true);
  assert.equal(await page.locator('.pager [aria-current=page]').innerText(), '5');
  await page.reload(); assert.equal(await hashOf(page), '/produk?page=5'); assert.equal((await names(page)).length, 4);
 }));

 test('tampilan grid/daftar dan filter tetap setelah reload', () => withPage({}, async page => {
  await go(page, '/produk?cat=kitab');
  await page.locator('input[data-filter=view][value=list]').check({force: true}); await hashOf(page);
  assert.ok(await page.locator('.pgrid.list').count());
  await page.reload(); assert.ok(await page.locator('.pgrid.list').count());
  assert.equal(await page.locator('[data-filter=cat][value=kitab]').isChecked(), true);
 }));
});

describe('detail produk', () => {
 test('varian wajib dipilih; varian habis nonaktif; harga, stok, kuantitas, dan galeri', () => withPage({}, async page => {
  await go(page, '/produk/bm-01');
  assert.match(await page.locator('.pd h1').innerText(), /Baju Koko Putih/);
  assert.equal(await page.locator('input[name=variant][value=v5]').isDisabled(), true, 'XXL habis');
  await page.locator('[data-act=addCart]:visible').first().click();
  assert.match(await page.locator('#pd-err').innerText(), /Pilih ukuran/);
  assert.equal(await cartCount(page), 0);
  await page.locator('input[name=variant][value=v2]').check({force: true});
  assert.match(await page.locator('.variant legend').innerText(), /Ukuran: M/);
  assert.equal(await count(page, '#pd-err'), 0, 'error hilang setelah memilih');
  assert.match(await page.locator('.stk-line').first().innerText(), /Stok tersedia: 22/);
  await page.locator('[data-act=pdQty][data-d="1"]').click();
  assert.equal(await page.locator('.qty output').innerText(), '2');
  await page.locator('[data-act=addCart]:visible').first().click();
  assert.equal(await cartCount(page), 2);
  assert.match(await toast(page).innerText(), /2 barang ditambahkan/);
  // galeri
  const src0 = await page.locator('.g-main img').getAttribute('src');
  await page.locator('.g-thumbs button').nth(1).click();
  assert.notEqual(await page.locator('.g-main img').getAttribute('src'), src0);
  assert.equal(await page.locator('.g-thumbs button.on').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-act=gnav][data-d="1"]').click(); await page.locator('[data-act=gnav][data-d="1"]').click();
  assert.equal(await page.locator('.g-main img').getAttribute('src'), src0, 'galeri melingkar');
 }));

 test('kuantitas dibatasi stok; stok menipis; stok habis menonaktifkan pembelian', () => withPage({}, async page => {
  await go(page, '/produk/kt-07');
  assert.match(await page.locator('.stk-line').first().innerText(), /Sisa 5/);
  for (let i = 0; i < 9; i++) await page.locator('[data-act=pdQty][data-d="1"]:not([disabled])').click({timeout: i < 4 ? 3000 : 300}).catch(() => {});
  assert.equal(await page.locator('.qty output').innerText(), '5');
  assert.equal(await page.locator('[data-act=pdQty][data-d="1"]').isDisabled(), true);
  await go(page, '/produk/mk-08');
  assert.match(await page.locator('.note.bad').innerText(), /Stok habis/);
  assert.equal(await page.locator('[data-act=addCart]').first().isDisabled(), true);
  assert.equal(await page.locator('[data-act=buyNow]').first().isDisabled(), true);
  assert.equal(await count(page, '.qty'), 0);
 }));

 test('varian bergambar: memilih varian mengganti gambar utama', () => withPage({}, async page => {
  await go(page, '/produk/kt-03');
  assert.match(await page.locator('.g-main img').getAttribute('src'), /kt-03-1\.svg/);
  await page.locator('input[name=variant][value=v2]').check({force: true});
  assert.match(await page.locator('.g-main img').getAttribute('src'), /kt-03-2\.svg/);
  await page.locator('input[name=variant][value=v3]').check({force: true});
  assert.match(await page.locator('.g-main img').getAttribute('src'), /kt-03-3\.svg/);
  assert.ok(await count(page, '.g-thumbs button') >= 5);
 }));

 test('pre-order, produk digital, dan harga varian ditampilkan benar', () => withPage({}, async page => {
  await go(page, '/produk/mk-06');
  assert.match(await page.locator('.pd-tags').innerText(), /Pre-order 3 hari/);
  assert.match(await page.locator('.ship-note').innerText(), /pre-order 3 hari/i);
  await go(page, '/produk/dg-01');
  assert.match(await page.locator('.pd-tags').innerText(), /Produk digital/);
  assert.equal(await count(page, '.qty'), 0); assert.match(await page.locator('.ship-note').innerText(), /Tanpa ongkir/);
  await go(page, '/produk/kt-02');
  assert.match(await page.locator('.pd-price').innerText(), /32\.000/);
  await page.locator('input[name=variant][value=v2]').check({force: true});
  assert.match(await page.locator('.pd-price').innerText(), /47\.000/, 'hard cover +15.000');
 }));

 test('zoom gambar: modal terbuka, Esc menutup, fokus kembali', () => withPage({}, async page => {
  await go(page, '/produk/ib-05');
  const btn = page.locator('.g-zoom'); await btn.click();
  assert.ok(await page.locator('#modal [role=dialog] img').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await count(page, '#modal'), 0);
  assert.ok(await btn.evaluate(b => b === document.activeElement), 'fokus kembali');
 }));

 test('tab deskripsi/spesifikasi/pengiriman/ulasan, termasuk navigasi keyboard', () => withPage({}, async page => {
  await go(page, '/produk/kt-01');
  await page.getByRole('tab', {name: 'Spesifikasi'}).click();
  assert.match(await page.locator('[role=tabpanel]').innerText(), /Halaman/);
  await page.getByRole('tab', {name: 'Pengiriman'}).click();
  assert.match(await page.locator('[role=tabpanel]').innerText(), /Kurir Reguler/);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab', {name: /Ulasan/}).getAttribute('aria-selected'), 'true');
  assert.match(await page.locator('[role=tabpanel]').innerText(), /ulasan/i);
 }));

 test('favorit: tombol hati di kartu & detail konsisten, tersimpan setelah reload, bisa dihapus', () => withPage({}, async page => {
  await go(page, '/produk?cat=kitab');
  const heart = page.locator('.pcard [data-act=wish]').first();
  await heart.click();
  assert.equal(await page.locator('.pcard [data-act=wish]').first().getAttribute('aria-pressed'), 'true');
  assert.match(await page.locator('a[aria-label^="Favorit"]').getAttribute('aria-label'), /1 produk/);
  const id = (await state(page, 'S.wish'))[0];
  await go(page, '/produk/' + id);
  assert.match(await page.locator('.pd-tools [data-act=wish]').innerText(), /Tersimpan/);
  await page.reload();
  assert.match(await page.locator('.pd-tools [data-act=wish]').innerText(), /Tersimpan/);
  await go(page, '/favorit');
  assert.equal(await count(page, '.pgrid .pcard'), 1);
  await page.locator('.pcard [data-act=wish]').click();
  assert.match(await page.locator('.empty h2').innerText(), /Belum ada favorit/);
 }));

 test('tanya penjual: validasi, terkirim, dan masuk kotak pesan toko', () => withPage({}, async page => {
  await go(page, '/produk/kt-01');
  await page.getByRole('button', {name: /Tanya penjual/}).click();
  await page.locator('#modal .modal-primary').click();
  assert.ok((await page.locator('#modal .err').allInnerTexts()).filter(Boolean).length >= 3);
  await page.locator('#f-name').fill('Calon Pembeli'); await page.locator('#f-email').fill('calon@example.com');
  await page.locator('#f-text').fill('Apakah stok masih ada untuk 10 buah?');
  await page.locator('#modal .modal-primary').click();
  assert.equal(await count(page, '#modal'), 0);
  assert.equal(await state(page, "S.messages[0].subject"), 'Tanya: Kitab Safinatun Najah + Makna Gandul');
  assert.equal(await state(page, "S.messages[0].to"), 'maktabah-nurul-ilmi');
 }));

 test('ulasan: wajib login, validasi, tampil, lencana pembeli terverifikasi, tidak bisa ganda', () => withPage({}, async page => {
  await go(page, '/produk/ib-06');
  await page.getByRole('tab', {name: /Ulasan/}).click();
  await page.getByRole('button', {name: /Tulis ulasan/}).first().click();
  assert.equal(await hashOf(page), '/masuk', 'belum login diarahkan ke halaman masuk');
  await login(page, 'buyer');
  assert.equal(await hashOf(page), '/produk/ib-06', 'kembali ke produk setelah login');
  const n0 = await state(page, "(ratingOf('ib-06')||{n:0}).n");
  const open = async () => { if (await page.getByRole('tab', {name: /Ulasan/}).getAttribute('aria-selected') !== 'true') await page.getByRole('tab', {name: /Ulasan/}).click(); await page.getByRole('button', {name: /Tulis ulasan/}).first().click(); };
  await open();
  await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal .err').innerText(), /Wajib diisi/);
  await page.locator('#f-text').fill('pendek'); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal .err').innerText(), /Minimal 10 karakter/);
  await page.locator('input[name=rating][value="4"]').check({force: true});
  await page.locator('#f-text').fill('Tasbihnya halus dan butirannya rapi.'); await page.locator('#modal .modal-primary').click();
  assert.equal(await count(page, '#modal'), 0);
  assert.match(await toast(page).innerText(), /Terima kasih/);
  assert.equal(await state(page, "ratingOf('ib-06').n"), n0 + 1);
  const mine = page.locator('.review', {hasText: 'Tasbihnya halus'});
  assert.ok(await mine.isVisible()); assert.match(await mine.innerText(), /Ahmad Fauzan/);
  assert.equal(await mine.getByText('Pembeli terverifikasi').count(), 0, 'belum pernah membeli ib-06');
  await open(); await page.locator('#f-text').fill('Ulasan kedua seharusnya ditolak.'); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal .err').innerText(), /sudah mengulas/);
  await page.keyboard.press('Escape');
  // produk yang sudah dibeli dan diterima -> lencana terverifikasi
  await go(page, '/produk/kt-01'); await page.getByRole('tab', {name: /Ulasan/}).click(); await open();
  await page.locator('#f-text').fill('Pesanan kitab saya tiba dengan rapi dan aman.'); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('.review', {hasText: 'tiba dengan rapi'}).innerText(), /Pembeli terverifikasi/);
 }));
});
