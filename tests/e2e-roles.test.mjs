/* E2E peran & akun: dashboard penjual, admin, autentikasi, profil, halaman statis.
   Jalankan:  node --test tests/e2e-roles.test.mjs   (atau npm run test:e2e) */
import {test, describe, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {startServer, launch, newPage, go, hashOf, toast, login, logout, cartCount, state} from './helpers.mjs';

let server, browser;
before(async () => { server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.stop(); });

async function withPage(opts, fn) {
 const s = await newPage(browser, server.url, opts);
 try { await fn(s.page, s); const bad = s.issues.filter(i => !(opts.allow || []).some(re => re.test(i))); assert.deepEqual(bad, [], 'masalah konsol/halaman:\n' + bad.join('\n')); }
 finally { await s.close(); }
}
const count = (page, sel) => page.locator(sel).count();
const errs = async (page, scope = '') => (await page.locator(`${scope} .err`).allInnerTexts()).filter(Boolean);
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const searchCatalog = async (page, q) => { await go(page, '/produk?q=' + encodeURIComponent(q)); return page.locator('.pgrid .pc-name').allTextContents(); };

describe('dashboard penjual: produk', () => {
 test('validasi formulir → tambah dengan varian → tampil di katalog → ubah → sembunyikan → hapus', () => withPage({}, async page => {
  await login(page, 'seller');
  assert.equal(await hashOf(page), '/penjual');
  await go(page, '/penjual/produk/baru');
  await page.locator('form[data-form=product] button.btn.lg').first().click();
  assert.ok((await errs(page, 'form[data-form=product]')).length >= 4);
  await page.locator('#f-name').fill('Kitab Fathul Qorib + Terjemah'); await page.locator('#f-weight').fill('450');
  await page.locator('#f-desc').fill('Kitab fiqih Syafi\'i lengkap dengan terjemah dan penjelasan ringkas.'); await page.locator('#f-tags').fill('fiqih, fathul qorib');
  await page.locator('#f-price').fill('50'); await page.locator('#f-stock').fill('10');
  await page.locator('form[data-form=product] button.btn.lg').first().click();
  assert.match(await page.locator('#err-price').innerText(), /minimal Rp100/);
  await page.locator('#f-price').fill('65000'); await page.locator('#f-was').fill('60000');
  await page.locator('form[data-form=product] button.btn.lg').first().click();
  assert.match(await page.locator('#err-was').innerText(), /lebih besar dari harga jual/);
  await page.locator('#f-was').fill('80000');
  await page.locator('#f-vtext').fill('Jilid 1 | 10 | 0');                                    // label varian kosong
  await page.locator('form[data-form=product] button.btn.lg').first().click();
  assert.match(await page.locator('#err-vtext').innerText(), /nama pilihan varian/i);
  await page.locator('#f-vlabel').fill('Jilid'); await page.locator('#f-vtext').fill('Jilid 1 | 10 | 0\nJilid 2 | banyak | 5000');
  await page.locator('form[data-form=product] button.btn.lg').first().click();
  assert.match(await page.locator('#err-vtext').innerText(), /Baris 2: stok harus angka/);
  await page.locator('#f-vtext').fill('Jilid 1 | 10 | 0\nJilid 2 | 8 | 5000\nSet lengkap | 3 | 30000');
  await page.locator('form[data-form=product] button.btn.lg').first().click();
  await page.waitForFunction(() => location.hash === '#/penjual/produk'); await hashOf(page);
  assert.match(await toast(page).innerText(), /Produk ditambahkan/);
  const id = await state(page, 'S.products[0].id'); assert.match(id, /^n-\d+$/);
  const row = page.locator('tr', {hasText: 'Fathul Qorib'});
  assert.ok(await row.isVisible()); assert.match(await row.innerText(), /21 \(3 varian\)/);
  // tampil di katalog & detail dengan 3 varian dan harga
  assert.ok((await searchCatalog(page, 'fathul')).some(n => /Fathul Qorib/.test(n)));
  await go(page, '/produk/' + id);
  assert.equal(await count(page, 'input[name=variant]'), 3);
  await page.locator('input[name=variant][value=v3]').check({force: true});
  assert.match(await page.locator('.pd-price').innerText(), /95\.000/);
  assert.match(await page.locator('.pd-tags').innerText(), /Kitab & Buku/);
  // ubah harga dan stok varian
  await go(page, '/penjual/produk/' + id);
  assert.equal(await page.locator('#f-name').inputValue(), 'Kitab Fathul Qorib + Terjemah');
  assert.match(await page.locator('#f-vtext').inputValue(), /Set lengkap \| 3 \| 30000/);
  await page.locator('#f-price').fill('70000'); await page.locator('#f-vtext').fill('Jilid 1 | 10 | 0\nJilid 2 | 8 | 5000\nSet lengkap | 0 | 30000');
  await page.locator('form[data-form=product] button.btn.lg').first().click(); await page.waitForFunction(() => location.hash === '#/penjual/produk');
  await go(page, '/produk/' + id);
  assert.match(await page.locator('.pd-price').innerText(), /70\.000/);
  assert.equal(await page.locator('input[name=variant][value=v3]').isDisabled(), true, 'varian stok 0 nonaktif');
  // sembunyikan -> hilang dari katalog; tampilkan lagi
  await go(page, '/penjual/produk?q=fathul');
  await page.locator('tr', {hasText: 'Fathul Qorib'}).locator('[data-act=toggleActive]').uncheck({force: true});
  assert.equal((await searchCatalog(page, 'fathul')).length, 0);
  await go(page, '/penjual/produk?q=fathul'); await page.locator('tr', {hasText: 'Fathul Qorib'}).locator('[data-act=toggleActive]').check({force: true});
  assert.equal((await searchCatalog(page, 'fathul')).length, 1);
  // masuk keranjang lalu dihapus penjual -> keranjang bersih
  await page.evaluate(i => { addToCart(i, 'v1', 1); }, id); assert.equal(await cartCount(page), 1);
  await go(page, '/penjual/produk?q=fathul');
  await page.getByRole('button', {name: /Hapus Kitab Fathul/}).click();
  assert.match(await page.locator('#modal h3').innerText(), /Hapus produk ini/);
  await page.locator('#cfYes').click();
  assert.equal(await count(page, 'tr:has-text("Fathul Qorib")'), 0);
  assert.equal((await searchCatalog(page, 'fathul')).length, 0);
  assert.equal(await cartCount(page), 0);
 }));

 test('unggah foto: pratinjau, tersimpan di kartu, jenis berkas salah ditolak, kembali ke ilustrasi bawaan', () => withPage({}, async page => {
  await login(page, 'seller');
  await go(page, '/penjual/produk/baru');
  await page.setInputFiles('input[data-act=prodImg]', {name: 'catatan.txt', mimeType: 'text/plain', buffer: Buffer.from('bukan gambar')});
  assert.match(await page.locator('#err-img').innerText(), /berkas gambar/i);
  await page.setInputFiles('input[data-act=prodImg]', {name: 'foto.png', mimeType: 'image/png', buffer: PNG});
  await page.waitForFunction(() => document.querySelector('#pimg').src.startsWith('data:image/jpeg'));
  await page.locator('#f-name').fill('Pensil Warna Santri'); await page.locator('#f-cat').selectOption('belajar'); await page.locator('#f-weight').fill('120');
  await page.locator('#f-price').fill('15000'); await page.locator('#f-stock').fill('30'); await page.locator('#f-desc').fill('Pensil warna isi 12 untuk pelajaran seni dan mewarnai.');
  await page.locator('form[data-form=product] button.btn.lg').first().click(); await page.waitForFunction(() => location.hash === '#/penjual/produk'); await hashOf(page);
  const id = await state(page, 'S.products[0].id');
  assert.match(await page.locator('tr', {hasText: 'Pensil Warna Santri'}).locator('img').getAttribute('src'), /^data:image\/jpeg/);
  await go(page, '/produk?q=pensil warna');
  assert.match(await page.locator('.pcard', {hasText: 'Pensil Warna Santri'}).locator('img').getAttribute('src'), /^data:image\/jpeg/);
  await go(page, '/penjual/produk/' + id);
  await page.getByRole('button', {name: 'Pakai ilustrasi bawaan'}).click();
  await page.locator('form[data-form=product] button.btn.lg').first().click(); await page.waitForFunction(() => location.hash === '#/penjual/produk'); await hashOf(page);
  assert.match(await page.locator('tr', {hasText: 'Pensil Warna Santri'}).locator('img').getAttribute('src'), /images\/categories\/belajar\.svg/);
 }));

 test('daftar produk: pencarian, filter kategori & stok; penjual tidak melihat produk toko lain', () => withPage({}, async page => {
  await login(page, 'seller');
  await go(page, '/penjual/produk');
  assert.equal(await count(page, 'tbody tr'), 7);
  assert.equal(await count(page, 'tr:has-text("Madu Hutan")'), 0);
  await page.locator('#aq').fill('aqidatul'); await page.keyboard.press('Enter'); await hashOf(page);
  assert.equal(await count(page, 'tbody tr'), 1);
  await go(page, '/penjual/produk'); await page.locator('#astok').selectOption('low'); await hashOf(page);
  assert.match(await page.locator('tbody').innerText(), /Aqidatul Awam/); assert.equal(await count(page, 'tbody tr'), 1);
  await go(page, '/penjual/produk'); await page.locator('#acat').selectOption('busana'); await hashOf(page);
  assert.match(await page.locator('main').innerText(), /Belum ada produk yang cocok/);
  // tidak berwenang mengubah produk toko lain lewat URL
  await go(page, '/penjual/produk/mk-01');
  assert.match(await page.locator('main').innerText(), /tidak berwenang/i);
 }));
});

describe('dashboard penjual: pesan, profil toko, onboarding', () => {
 test('kotak pesan: hitung belum dibaca, tandai dibaca, balas lewat email, hapus dengan konfirmasi', () => withPage({}, async page => {
  await login(page, 'seller');
  await go(page, '/penjual/pesan');
  assert.equal(await count(page, '.msg'), 2);
  assert.equal(await page.locator('.adm-side a[href="#/penjual/pesan"] .count').innerText(), '1');
  const href = await page.locator('.msg.unread a.btn').getAttribute('href');
  assert.match(href, /^mailto:nabila%40example\.com\?subject=Re%3A/);
  await page.getByRole('button', {name: 'Tandai dibaca'}).click();
  assert.equal(await count(page, '.adm-side a[href="#/penjual/pesan"] .count'), 0);
  await page.locator('.msg').first().getByRole('button', {name: 'Hapus'}).click();
  await page.locator('#cfYes').click();
  assert.equal(await count(page, '.msg'), 1);
 }));

 test('profil toko: nama unik, perubahan tampil, menutup toko menyembunyikan produknya', () => withPage({}, async page => {
  await login(page, 'seller');
  await go(page, '/penjual/toko');
  await page.locator('#f-name').fill('Butik Muslim Barokah'); await page.locator('form[data-form=shopEdit] button.btn').first().click();
  assert.match(await page.locator('#err-name').innerText(), /sudah dipakai/);
  await page.locator('#f-name').fill('Maktabah Nurul Ilmi Baru'); await page.locator('#f-city').fill('Kota Malang'); await page.locator('#f-prov').selectOption('Jawa Timur');
  await page.locator('form[data-form=shopEdit] button.btn').first().click();
  assert.match(await toast(page).innerText(), /Profil toko disimpan/);
  assert.match(await page.locator('.adm-who').innerText(), /Maktabah Nurul Ilmi Baru/);
  await go(page, '/toko/maktabah-nurul-ilmi');
  assert.match(await page.locator('.shop-hero').innerText(), /Kota Malang/);
  await go(page, '/penjual/toko'); await page.locator('input[name=active]').uncheck(); await page.locator('form[data-form=shopEdit] button.btn').first().click();
  assert.equal((await searchCatalog(page, 'safinatun')).length, 0, 'produk toko tertutup tidak tampil');
  await go(page, '/toko/maktabah-nurul-ilmi');
  assert.match(await page.locator('main').innerText(), /tidak ditemukan atau sedang nonaktif/);
 }));

 test('pengguna baru: daftar → buka toko (validasi) → tambah produk → tampil di marketplace dan di panel admin', () => withPage({}, async page => {
  await go(page, '/daftar');
  await page.locator('#f-name').fill('Zahra Alumni'); await page.locator('#f-email').fill('zahra@example.com'); await page.locator('#f-phone').fill('081200003333');
  await page.locator('#f-pass').fill('rahasia1234'); await page.locator('#f-pass2').fill('rahasia1234'); await page.locator('input[name=terms]').check();
  await page.locator('form[data-form=register] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/verifikasi'); assert.equal(await hashOf(page), '/verifikasi');
  await page.locator('[data-otp="0"]').click(); await page.keyboard.type('000000'); await page.locator('form[data-form=otp] button.btn').click();
  await page.waitForFunction(() => document.querySelector('#err-otp').textContent.length > 0);
  assert.match(await page.locator('#err-otp').innerText(), /Kode salah/);
  await page.locator('[data-otp="0"]').click(); await page.keyboard.type('123456'); await page.locator('form[data-form=otp] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/akun'); await hashOf(page);
  assert.match(await page.locator('.acc-main').innerText(), /Halo, Zahra/);
  assert.match(await page.locator('.acc-main').innerText(), /Punya produk untuk dijual/);
  await page.getByRole('link', {name: 'Buka toko'}).first().click();
  assert.equal(await hashOf(page), '/buka-toko');
  await page.locator('form[data-form=openShop] button.btn').click();
  assert.ok((await errs(page, 'form[data-form=openShop]')).length >= 3);
  await page.locator('#f-name').fill('Maktabah Nurul Ilmi'); await page.locator('#f-city').fill('Kota Depok'); await page.locator('#f-desc').fill('Toko perlengkapan santri dari alumni.');
  await page.locator('form[data-form=openShop] button.btn').click();
  assert.match(await page.locator('#err-name').innerText(), /sudah dipakai/);
  await page.locator('#f-name').fill('Toko Berkah Zahra'); await page.locator('#f-prov').selectOption('Jawa Barat');
  await page.locator('form[data-form=openShop] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/penjual/produk/baru'); await hashOf(page);
  await page.locator('#f-name').fill('Kerudung Instan Santri'); await page.locator('#f-cat').selectOption('busana'); await page.locator('#f-weight').fill('150');
  await page.locator('#f-price').fill('45000'); await page.locator('#f-stock').fill('12'); await page.locator('#f-desc').fill('Kerudung instan mudah dipakai untuk kegiatan sehari-hari di pondok.');
  await page.locator('form[data-form=product] button.btn.lg').first().click(); await page.waitForFunction(() => location.hash === '#/penjual/produk'); await hashOf(page);
  assert.equal(await state(page, "S.products[0].shop"), 'toko-berkah-zahra');
  assert.ok((await searchCatalog(page, 'kerudung instan')).some(n => /Kerudung Instan/.test(n)));
  await go(page, '/toko'); assert.ok(await page.locator('.shopcard', {hasText: 'Toko Berkah Zahra'}).isVisible());
  await logout(page); await login(page, 'admin');
  await go(page, '/admin/toko'); assert.match(await page.locator('table').innerText(), /Toko Berkah Zahra/);
  await go(page, '/admin/pelanggan'); assert.match(await page.locator('table').innerText(), /Zahra Alumni[\s\S]*Pembeli \+ penjual/);
 }));
});

describe('admin', () => {
 test('hanya admin yang boleh masuk; pembeli & penjual ditolak; admin tidak memakai dashboard penjual', () => withPage({}, async page => {
  await go(page, '/admin');
  assert.equal(await hashOf(page), '/masuk');
  await login(page, 'buyer'); await go(page, '/admin');
  assert.match(await page.locator('main').innerText(), /Anda tidak punya akses/);
  await go(page, '/penjual'); assert.match(await page.locator('main').innerText(), /Anda belum punya toko/);
  await logout(page); await login(page, 'seller'); await go(page, '/admin');
  assert.match(await page.locator('main').innerText(), /Anda tidak punya akses/);
  await logout(page); await login(page, 'admin'); assert.equal(await hashOf(page), '/admin');
  await go(page, '/penjual'); assert.match(await page.locator('main').innerText(), /Akun admin memakai Panel Admin/);
 }));

 test('ringkasan, semua produk lintas toko, pesanan dengan filter, dan pelanggan', () => withPage({}, async page => {
  await login(page, 'admin');
  assert.equal(await count(page, '.kpi'), 4);
  assert.ok(await page.locator('svg.chart').isVisible());
  await go(page, '/admin/produk');
  assert.ok(await count(page, 'tbody tr') >= 10); assert.match(await page.locator('thead').innerText(), /Toko/);
  await go(page, '/admin/produk?toko=dapur-santri-berkah'); assert.equal(await count(page, 'tbody tr'), 8);
  await go(page, '/admin/pesanan');
  const total = await count(page, 'tbody tr');
  await page.getByRole('tab', {name: /Belum dibayar/}).click(); await hashOf(page);
  assert.ok(await count(page, 'tbody tr') >= 1 && await count(page, 'tbody tr') < total);
  assert.match(await page.locator('tbody').innerText(), /Menunggu Pembayaran/);
  const unpaid = await page.locator('tbody a.strong').first().innerText();
  await go(page, '/admin/pesanan/' + unpaid);
  await page.getByRole('button', {name: /Tandai dibayar/}).click();
  await page.waitForFunction(() => document.querySelector('.od-h .badge')?.textContent.includes('Dikemas'));
  await go(page, '/admin/pelanggan'); assert.ok(await count(page, 'tbody tr') >= 5);
 }));

 test('menonaktifkan toko menyembunyikan produknya; produk admin dapat dihapus', () => withPage({}, async page => {
  await login(page, 'admin');
  await go(page, '/admin/toko');
  await page.locator('tr', {hasText: 'Dapur Santri Berkah'}).locator('[data-act=toggleShop]').uncheck({force: true});
  assert.equal((await searchCatalog(page, 'madu')).length, 0);
  await go(page, '/toko/dapur-santri-berkah'); assert.match(await page.locator('main').innerText(), /sedang nonaktif/);
  await go(page, '/admin/toko'); await page.locator('tr', {hasText: 'Dapur Santri Berkah'}).locator('[data-act=toggleShop]').check({force: true});
  assert.ok((await searchCatalog(page, 'madu')).length >= 1);
  await go(page, '/admin/produk?q=wedang'); await page.getByRole('button', {name: /Hapus Wedang/}).click(); await page.locator('#cfYes').click();
  assert.equal(await count(page, 'tbody tr'), 0);
 }));

 test('voucher: validasi form, dapat dipakai di keranjang, dapat dihapus', () => withPage({}, async page => {
  await login(page, 'admin');
  await go(page, '/admin/voucher');
  await page.locator('form[data-form=voucherNew] button.btn').click(); assert.ok((await errs(page, 'form[data-form=voucherNew]')).length >= 3);
  await page.locator('#f-code').fill('santri10'); await page.locator('#f-val').fill('5'); await page.locator('#f-exp').fill('2030-12-31');
  await page.locator('form[data-form=voucherNew] button.btn').click(); assert.match(await page.locator('#err-code').innerText(), /sudah ada/);
  await page.locator('#f-code').fill('RAMADAN15'); await page.locator('#f-val').fill('95'); await page.locator('form[data-form=voucherNew] button.btn').click();
  assert.match(await page.locator('#err-val').innerText(), /maksimal 90/);
  await page.locator('#f-val').fill('15'); await page.locator('#f-min').fill('50000'); await page.locator('form[data-form=voucherNew] button.btn').click();
  assert.ok(await page.locator('tr', {hasText: 'RAMADAN15'}).isVisible());
  await page.evaluate(() => { addToCart('kt-03', 'v1', 1); render(); });
  await go(page, '/keranjang'); await page.locator('#vc-cart').fill('ramadan15'); await page.locator('form[data-form=voucher] button').click();
  assert.match(await page.locator('.v-on').innerText(), /RAMADAN15/);
  await go(page, '/admin/voucher'); await page.locator('tr', {hasText: 'RAMADAN15'}).getByRole('button', {name: 'Hapus'}).click(); await page.locator('#cfYes').click();
  assert.equal(await count(page, 'tr:has-text("RAMADAN15")'), 0);
 }));

 test('pesan platform dari formulir kontak masuk ke admin; reset data demo memulihkan semuanya', () => withPage({}, async page => {
  await go(page, '/kontak');
  await page.locator('form[data-form=contact] button.btn').click(); assert.ok((await errs(page, 'form[data-form=contact]')).length >= 3);
  await page.locator('#f-name').fill('Budi Pengunjung'); await page.locator('#f-email').fill('budi@example.com'); await page.locator('#f-topic').selectOption('Saran fitur');
  await page.locator('#f-text').fill('Tolong tambahkan metode pembayaran lain.'); await page.locator('form[data-form=contact] button.btn').click();
  await page.waitForFunction(() => document.querySelector('#f-name').value === '');
  assert.match(await toast(page).innerText(), /Pesan terkirim/);
  await login(page, 'admin'); await go(page, '/admin/pesan');
  assert.ok(await page.locator('.msg', {hasText: 'Budi Pengunjung'}).isVisible());
  await go(page, '/admin/data');
  await page.evaluate(() => { S.products[0].name = 'DIUBAH'; S.orders.length = 1; save(); });
  await page.getByRole('button', {name: 'Reset ke data awal'}).click(); await page.locator('#cfYes').click();
  await page.waitForFunction(() => location.hash === '#/');
  assert.equal(await state(page, 'S.orders.length'), 14); assert.notEqual(await state(page, 'S.products[0].name'), 'DIUBAH');
  assert.match(await page.locator('header').innerText(), /Masuk/, 'keluar setelah reset');
 }));
});

describe('autentikasi & akun', () => {
 test('masuk: validasi, kata sandi salah, benar; hash tersimpan (bukan teks asli)', () => withPage({}, async page => {
  await go(page, '/masuk');
  await page.locator('form[data-form=login] button.btn').click();
  assert.ok((await errs(page, 'form[data-form=login]')).length >= 2);
  await page.locator('#f-email').fill('bukan-email'); await page.locator('#f-pass').fill('x'); await page.locator('form[data-form=login] button.btn').click();
  assert.match(await page.locator('#err-email').innerText(), /email yang valid/);
  await page.locator('#f-email').fill('santri@example.com'); await page.locator('#f-pass').fill('salahsandi');
  await page.locator('form[data-form=login] button.btn').click();
  await page.waitForFunction(() => document.querySelector('#err-form').textContent.length > 0);
  assert.match(await page.locator('#err-form').innerText(), /Email atau kata sandi salah/);
  await page.locator('#f-pass').fill('santri123'); await page.locator('form[data-form=login] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/akun'); await hashOf(page);
  assert.match(await page.locator('.acc-main h1').innerText(), /Halo, Ahmad/);
  const raw = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  assert.ok(!raw.includes('santri123'), 'kata sandi mentah tidak ada di localStorage');
  assert.ok(raw.includes('hash'), 'hash tersimpan');
  assert.equal(await page.evaluate(() => typeof me().pass), 'undefined');
 }));

 test('"ingat saya": tanpa centang sesi hanya satu tab; dengan centang bertahan di tab baru', () => withPage({}, async (page, s) => {
  const fill = async remember => { await go(page, '/masuk'); await page.locator('#f-email').fill('santri@example.com'); await page.locator('#f-pass').fill('santri123'); await page.locator('input[name=rem]').setChecked(remember); await page.locator('form[data-form=login] button.btn').click(); await page.waitForFunction(() => location.hash === '#/akun'); };
  await fill(false);
  const p2 = await s.ctx.newPage(); await p2.goto(server.url + '/#/akun'); await p2.waitForSelector('#app > *');
  assert.equal(await p2.evaluate(() => location.hash), '#/masuk', 'tab baru tidak otomatis masuk');
  await p2.close();
  await logout(page); await fill(true);
  const p3 = await s.ctx.newPage(); await p3.goto(server.url + '/#/akun'); await p3.waitForSelector('#app > *');
  await p3.waitForSelector('.acc-main h1'); assert.match(await p3.locator('.acc-main h1').innerText(), /Halo, Ahmad/);
  await p3.close();
 }));

 test('halaman terlindungi mengalihkan ke masuk lalu kembali ke tujuan; keluar menghapus sesi', () => withPage({}, async page => {
  for (const target of ['/akun/pesanan', '/akun/profil', '/penjual/pesanan']) {
   await go(page, target); assert.equal(await hashOf(page), '/masuk', target);
  }
  await go(page, '/akun/pesanan'); assert.equal(await hashOf(page), '/masuk');
  await page.locator('[data-act=demoLogin][data-email="santri@example.com"]').click();
  await page.waitForFunction(() => location.hash === '#/akun/pesanan'); assert.equal(await hashOf(page), '/akun/pesanan');
  await page.locator('.acct-btn').click(); await page.getByRole('menuitem', {name: 'Keluar'}).click();
  assert.equal(await hashOf(page), '/'); assert.ok(await page.locator('header a.hd-login').isVisible());
  await go(page, '/akun'); assert.equal(await hashOf(page), '/masuk');
 }));

 test('daftar: validasi, email ganda, OTP salah/benar, sandi tersimpan sebagai hash', () => withPage({}, async page => {
  await go(page, '/daftar');
  await page.locator('form[data-form=register] button.btn').click(); assert.ok((await errs(page, 'form[data-form=register]')).length >= 5);
  await page.locator('#f-name').fill('Pengguna Baru'); await page.locator('#f-email').fill('santri@example.com'); await page.locator('#f-phone').fill('0812');
  await page.locator('#f-pass').fill('pendek'); await page.locator('#f-pass2').fill('beda');
  await page.locator('form[data-form=register] button.btn').click();
  const e = (await errs(page, 'form[data-form=register]')).join(' | ');
  assert.match(e, /sudah terdaftar/); assert.match(e, /telepon/); assert.match(e, /Minimal 8/); assert.match(e, /syarat/i);
  await page.locator('#f-email').fill('baru@example.com'); await page.locator('#f-phone').fill('081234000111'); await page.locator('#f-pass').fill('rahasia-baru-1'); await page.locator('#f-pass2').fill('rahasia-baru-2'); await page.locator('input[name=terms]').check();
  await page.locator('form[data-form=register] button.btn').click(); assert.match(await page.locator('#err-pass2').innerText(), /tidak sama/);
  await page.locator('#f-pass2').fill('rahasia-baru-1'); await page.locator('form[data-form=register] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/verifikasi'); assert.equal(await hashOf(page), '/verifikasi');
  assert.ok(!(await page.evaluate(() => localStorage.getItem(LS_KEY))).includes('rahasia-baru-1'), 'kata sandi tidak disimpan mentah, termasuk data OTP tertunda');
  await page.locator('[data-otp="0"]').click(); await page.keyboard.type('123456'); await page.locator('form[data-form=otp] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/akun'); await hashOf(page);
  assert.equal(await state(page, "S.users.at(-1).email"), 'baru@example.com');
  assert.match(await state(page, "S.users.at(-1).pw.hash"), /^[0-9a-f]{64}$/);
  await logout(page); await go(page, '/masuk'); await page.locator('#f-email').fill('baru@example.com'); await page.locator('#f-pass').fill('rahasia-baru-1'); await page.locator('form[data-form=login] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/akun');
 }));

 test('lupa kata sandi: email tak dikenal, OTP, sandi baru berlaku, sandi lama ditolak', () => withPage({}, async page => {
  await go(page, '/lupa-sandi');
  await page.locator('#f-email').fill('tidakada@example.com'); await page.locator('form[data-form=forgot] button.btn').click();
  assert.match(await page.locator('#err-email').innerText(), /Tidak ada akun/);
  await page.locator('#f-email').fill('dimas@example.com'); await page.locator('form[data-form=forgot] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/verifikasi');
  await page.locator('[data-otp="0"]').click(); await page.keyboard.type('123456'); await page.locator('form[data-form=otp] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/sandi-baru'); await hashOf(page);
  await page.locator('#f-pass').fill('sandi-baru-77'); await page.locator('#f-pass2').fill('sandi-baru-77'); await page.locator('form[data-form=reset] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/masuk');
  const tryLogin = async pw => { await go(page, '/masuk'); await page.locator('#f-email').fill('dimas@example.com'); await page.locator('#f-pass').fill(pw); await page.locator('form[data-form=login] button.btn').click(); };
  await tryLogin('demo12345'); await page.waitForFunction(() => document.querySelector('#err-form').textContent.length > 0);
  await tryLogin('sandi-baru-77'); await page.waitForFunction(() => location.hash === '#/akun');
  await go(page, '/sandi-baru'); assert.match(await page.locator('main').innerText(), /Verifikasi email dulu/);
 }));

 test('profil: ubah data, email dipakai akun lain ditolak, ganti sandi, buku alamat (tambah/ubah/hapus)', () => withPage({}, async page => {
  await login(page, 'buyer'); await go(page, '/akun/profil');
  await page.locator('#f-email').fill('penjual@example.com'); await page.locator('form[data-form=profile] button.btn').click();
  assert.match(await page.locator('#err-email').innerText(), /dipakai akun lain/);
  await page.locator('#f-email').fill('santri@example.com'); await page.locator('#f-name').fill('Ahmad Fauzan Baru'); await page.locator('form[data-form=profile] button.btn').click();
  assert.match(await toast(page).innerText(), /Profil disimpan/);
  assert.match(await page.locator('.acct-n').innerText(), /Ahmad/);
  await page.locator('#f-old').fill('salah'); await page.locator('form[data-form=pw] #f-pass').fill('sandi-baru-123'); await page.locator('form[data-form=pw] #f-pass2').fill('sandi-baru-123'); await page.locator('form[data-form=pw] button.btn').click();
  await page.waitForFunction(() => document.querySelector('#err-old').textContent.length > 0);
  assert.match(await page.locator('#err-old').innerText(), /saat ini salah/);
  await page.locator('#f-old').fill('santri123'); await page.locator('form[data-form=pw] button.btn').click();
  await page.waitForFunction(() => document.querySelector('.toasts, #toasts').textContent.includes('Kata sandi diganti'));
  // buku alamat
  assert.equal(await count(page, '.addr-row'), 2);
  await page.getByRole('button', {name: /Tambah alamat/}).click(); await page.locator('#modal .modal-primary').click();
  assert.ok((await errs(page, '#modal')).length >= 2);
  await page.locator('#modal #f-line').fill('Jl. Pesantren No. 1, RT 02'); await page.locator('#modal #f-city').fill('Kota Kediri'); await page.locator('#modal #f-prov').selectOption('Jawa Timur'); await page.locator('#modal #f-zip').fill('64111');
  await page.locator('#modal .modal-primary').click(); assert.equal(await count(page, '.addr-row'), 3);
  await page.locator('.addr-row', {hasText: 'Kediri'}).getByRole('button', {name: 'Ubah'}).click(); await page.locator('#modal #f-label').fill('Pondok'); await page.locator('#modal .modal-primary').click();
  assert.ok(await page.locator('.addr-row', {hasText: 'Pondok'}).isVisible());
  await page.locator('.addr-row', {hasText: 'Pondok'}).getByRole('button', {name: 'Hapus'}).click(); await page.locator('#cfYes').click();
  assert.equal(await count(page, '.addr-row'), 2);
  await logout(page);
  await go(page, '/masuk'); await page.locator('#f-email').fill('santri@example.com'); await page.locator('#f-pass').fill('sandi-baru-123'); await page.locator('form[data-form=login] button.btn').click();
  await page.waitForFunction(() => location.hash === '#/akun');
 }));

 test('notifikasi: tampil, tandai dibaca satu per satu dan semuanya', () => withPage({}, async page => {
  await login(page, 'buyer'); await go(page, '/akun/notifikasi');
  const n = await count(page, '.note-line.unread'); assert.ok(n >= 2);
  await page.locator('.note-line.unread').first().getByRole('button', {name: 'Tandai dibaca'}).click();
  assert.equal(await count(page, '.note-line.unread'), n - 1);
  await page.getByRole('button', {name: 'Tandai semua dibaca'}).click();
  assert.equal(await count(page, '.note-line.unread'), 0); assert.equal(await count(page, '[data-act=readAll]'), 0);
 }));
});

describe('halaman informasi & formulir', () => {
 test('tentang, bantuan (pencarian FAQ + kosong), kontak, syarat, privasi, 404', () => withPage({}, async page => {
  for (const [h, re] of [['/tentang', /Marketplace untuk ekosistem pesantren/], ['/bantuan', /Pusat bantuan/], ['/kontak', /Hubungi kami/], ['/syarat', /Syarat & Ketentuan/], ['/privasi', /Kebijakan Privasi/]]) { await go(page, h); assert.match(await page.locator('main h1').innerText(), re, h); }
  await go(page, '/bantuan'); assert.equal(await count(page, 'details.faq'), 10);
  await page.locator('#fq').fill('voucher'); await page.keyboard.press('Enter'); await hashOf(page);
  assert.equal(await count(page, 'details.faq'), 1); assert.match(await page.locator('details.faq').innerText(), /SANTRI10/);
  await go(page, '/bantuan?q=zzzzqq'); assert.match(await page.locator('.empty h2').innerText(), /Tidak ada pertanyaan/);
  await go(page, '/bantuan'); await page.locator('details.faq summary').nth(2).click(); assert.equal(await page.locator('details.faq').nth(2).getAttribute('open'), '');
  await go(page, '/halaman-ngawur'); assert.match(await page.locator('main h1').innerText(), /Halaman tidak ditemukan/);
  await go(page, '/produk/tidak-ada'); assert.match(await page.locator('main').innerText(), /tidak ditemukan/i);
  await go(page, '/toko/tidak-ada'); assert.match(await page.locator('main').innerText(), /tidak ditemukan/i);
 }));

 test('newsletter: validasi, berlangganan, dan email ganda ditolak', () => withPage({}, async page => {
  await page.locator('#nl').fill('salah'); await page.locator('form[data-form=news] button').click();
  assert.match(await page.locator('.foot [data-err=email]').innerText(), /email yang valid/);
  await page.locator('#nl').fill('pembaca@example.com'); await page.locator('form[data-form=news] button').click();
  assert.match(await toast(page).innerText(), /Terima kasih/); assert.equal(await state(page, 'S.subscribers.length'), 1);
  await page.locator('#nl').fill('PEMBACA@example.com'); await page.locator('form[data-form=news] button').click();
  assert.match(await page.locator('.foot [data-err=email]').innerText(), /sudah berlangganan/);
 }));

 test('halaman toko: daftar toko, halaman toko dengan produk & statistik, tanya penjual', () => withPage({}, async page => {
  await go(page, '/toko'); assert.equal(await count(page, '.shopcard'), 8);
  await page.locator('.shopcard', {hasText: 'Karya Digital Santri'}).click();
  assert.equal(await hashOf(page), '/toko/karya-digital-santri');
  assert.equal(await count(page, '.pgrid .pcard'), 5); assert.match(await page.locator('.shop-hero').innerText(), /Kota Bandung/);
  await page.getByRole('button', {name: /Tanya penjual/}).click();
  assert.match(await page.locator('#modal').innerText(), /Karya Digital Santri/);
  await page.keyboard.press('Escape'); assert.equal(await count(page, '#modal'), 0);
 }));
});
