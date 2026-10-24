/* E2E transaksi: keranjang, voucher, checkout, pembayaran, status pesanan, dan siklus lintas peran.
   Jalankan:  node --test tests/e2e-flow.test.mjs   (atau npm run test:e2e) */
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
const rpNum = t => +String(t).replace(/[^\d]/g, '');
/* isi keranjang lewat API aplikasi (persiapan data), lalu render ulang */
const seedCart = (page, items) => page.evaluate(list => { S.cart = []; for (const [id, vid, qty] of list) { const r = addToCart(id, vid, qty); if (!r.ok) throw new Error(id + ': ' + r.msg); } render(); }, items);
const totalText = page => page.locator('.sum-row.tot span').last().innerText();
async function placeOrderUi(page) {
 await page.locator('[data-act=placeOrder]').click();
 await page.waitForFunction(() => location.hash.startsWith('#/bayar/'), null, {timeout: 8000});
 return (await hashOf(page)).split('/')[2];
}

describe('keranjang', () => {
 test('tambah dari kartu: tanpa varian langsung masuk; dengan varian membuka pemilih yang tervalidasi', () => withPage({}, async page => {
  await go(page, '/produk?cat=busana');
  const card = page.locator('.pcard', {hasText: 'Baju Koko Putih Lengan Panjang'});
  await card.locator('[data-act=quickAdd]').click();
  assert.match(await page.locator('#modal h3').innerText(), /Pilih ukuran/);
  await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal [data-err=variant]').innerText(), /Pilih salah satu varian/);
  assert.equal(await cartCount(page), 0);
  await page.locator('#modal input[name=variant][value=v3]').check({force: true});
  await page.locator('#modal input[name=qty]').fill('0'); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal [data-err=qty]').innerText(), /minimal 1/i);
  await page.locator('#modal input[name=qty]').fill('3'); await page.locator('#modal .modal-primary').click();
  assert.equal(await count(page, '#modal'), 0);
  assert.equal(await cartCount(page), 3);
  await go(page, '/produk?cat=kitab');
  await page.locator('.pcard', {hasText: 'Buku Saku Doa'}).locator('[data-act=quickAdd]').click();
  assert.equal(await cartCount(page), 4);
  assert.match(await toast(page).innerText(), /masuk keranjang/);
  assert.match(await page.locator('a[aria-label^="Keranjang"]').getAttribute('aria-label'), /4 item/);
 }));

 test('halaman keranjang: dikelompokkan per toko, total, ubah jumlah dibatasi stok, hapus, pindah ke favorit, persisten', () => withPage({}, async page => {
  await seedCart(page, [['bm-01', 'v3', 2], ['kt-05', null, 1], ['mk-03', null, 1]]);
  await go(page, '/keranjang');
  assert.equal(await count(page, '.cgroup'), 3);
  assert.match(await page.locator('.cgroup', {hasText: 'Butik Muslim Barokah'}).innerText(), /Ukuran: L/);
  assert.equal(rpNum(await totalText(page)), 119000 * 2 + 19000 + 85000);
  const plus = page.locator('.cline', {hasText: 'Baju Koko'}).locator('[data-act=cqty][data-d="1"]');
  await plus.click();
  assert.equal(rpNum(await totalText(page)), 119000 * 3 + 19000 + 85000);
  assert.equal(await page.locator('.cline', {hasText: 'Baju Koko'}).locator('output').innerText(), '3');
  await page.locator('.cline', {hasText: 'Baju Koko'}).locator('[data-act=cqty][data-d="-1"]').click();
  // batas stok
  await page.evaluate(() => { addToCart('kt-07', null, 5); render(); });
  const l = page.locator('.cline', {hasText: 'Aqidatul Awam'});
  assert.equal(await l.locator('[data-act=cqty][data-d="1"]').isDisabled(), true, 'stok 5 sudah tercapai');
  await l.locator('[data-act=rmCart]').click();
  assert.equal(await count(page, '.cline'), 3);
  // hapus
  await page.locator('.cline', {hasText: 'Madu Hutan'}).locator('[data-act=rmCart]').click();
  assert.equal(await count(page, '.cgroup'), 2);
  assert.match(await toast(page).innerText(), /dihapus dari keranjang/);
  assert.equal(rpNum(await totalText(page)), 119000 * 2 + 19000);
  // pindah ke favorit
  await page.locator('.cline', {hasText: 'Buku Saku Doa'}).locator('[data-act=toFav]').click();
  assert.equal(await cartCount(page), 2);
  assert.deepEqual(await state(page, 'S.wish'), ['kt-05']);
  // persisten: navigasi lain + reload
  await go(page, '/produk'); assert.equal(await cartCount(page), 2);
  await page.reload(); await go(page, '/keranjang');
  assert.equal(await count(page, '.cline'), 1); assert.equal(rpNum(await totalText(page)), 119000 * 2);
  await page.locator('[data-act=rmCart]').click();
  assert.match(await page.locator('.empty h2').innerText(), /keranjang Anda masih kosong/i);
  assert.ok(await page.getByRole('link', {name: 'Mulai belanja'}).isVisible());
 }));

 test('stok berubah setelah masuk keranjang: peringatan, checkout diblokir, bisa diperbaiki', () => withPage({}, async page => {
  await seedCart(page, [['kt-07', null, 4]]);
  await page.evaluate(() => { prod('kt-07').stock = 2; save(); });
  await go(page, '/keranjang');
  assert.match(await page.locator('.note.bad').innerText(), /melebihi stok/);
  assert.match(await page.locator('.cline.is-over .err').innerText(), /tersisa 2/);
  assert.equal(await page.locator('a[href="#/checkout"]').getAttribute('aria-disabled'), 'true');
  await page.locator('a[href="#/checkout"]').click({force: true});          // aria-disabled: Playwright menolak klik biasa
  assert.match(await toast(page).innerText(), /Kurangi jumlah/);
  assert.equal(await hashOf(page), '/keranjang');
  await page.locator('.cline [data-act=cqty][data-d="-1"]').click(); await page.locator('.cline [data-act=cqty][data-d="-1"]').click();
  assert.equal(await count(page, '.note.bad'), 0);
  assert.equal(await page.locator('a[href="#/checkout"]').getAttribute('aria-disabled'), null);
 }));
});

describe('voucher', () => {
 test('pesan kesalahan untuk kode salah/kedaluwarsa/habis/minimum, lalu pemakaian & pelepasan voucher', () => withPage({}, async page => {
  await seedCart(page, [['kt-01', null, 1]]);
  await go(page, '/keranjang');
  const apply = async code => { await page.locator('#vc-cart').fill(code); await page.locator('form[data-form=voucher] button').click(); };
  await apply('ngawur'); assert.match(await page.locator('#err-code').innerText(), /tidak ditemukan/);
  await apply('KADALUARSA'); assert.match(await page.locator('#err-code').innerText(), /kedaluwarsa/);
  await apply('habis'); assert.match(await page.locator('#err-code').innerText(), /Kuota/);
  await apply('SANTRI10'); assert.match(await page.locator('#err-code').innerText(), /72\.000 lagi/);
  assert.equal(await state(page, 'S.voucher'), null);
  assert.equal(await page.locator('[data-act=useVoucher][data-code=SANTRI10]').isDisabled(), true, 'chip voucher dinonaktifkan bila minimum belum terpenuhi');
  await seedCart(page, [['kt-01', null, 1], ['kt-03', 'v1', 1]]);                 // 28.000 + 135.000 = 163.000
  await apply(' santri10 ');
  assert.match(await toast(page).innerText(), /SANTRI10 dipasang/);
  assert.equal(rpNum(await page.locator('.sum-row.ok span').last().innerText()), 16300);
  assert.equal(rpNum(await totalText(page)), 163000 - 16300);
  await page.getByRole('button', {name: 'Lepas'}).click();
  assert.equal(rpNum(await totalText(page)), 163000);
  await page.locator('[data-act=useVoucher][data-code=HEMAT25]').click();
  assert.equal(rpNum(await totalText(page)), 163000 - 25000);
  await page.getByRole('button', {name: 'Lepas'}).click();
  await page.locator('[data-act=useVoucher][data-code=GRATISONGKIR]').click();
  assert.match(await page.locator('.sum-row.ok').innerText(), /Potongan ongkir hingga Rp 20\.000/);
  assert.equal(rpNum(await totalText(page)), 163000);
  // voucher dilepas otomatis bila syarat tak lagi terpenuhi
  await page.evaluate(() => { S.voucher = 'SANTRI10'; S.cart = [{id: 'kt-01', vid: null, qty: 1}]; save(); render(); });
  assert.equal(await state(page, 'S.voucher'), null);
  assert.match(await page.locator('#err-code').innerText(), /lagi untuk memakai voucher/);
 }));
});

describe('checkout', () => {
 test('wajib login: dialihkan ke halaman masuk lalu kembali ke checkout', () => withPage({}, async page => {
  await seedCart(page, [['kt-01', null, 1]]);
  await go(page, '/keranjang'); await page.locator('a[href="#/checkout"]').click();
  assert.equal(await hashOf(page), '/masuk');
  await page.locator('[data-act=demoLogin][data-email="santri@example.com"]').click();
  await page.waitForFunction(() => location.hash === '#/checkout');
  assert.equal(await hashOf(page), '/checkout');
  assert.match(await page.locator('main h1').innerText(), /Checkout/);
  assert.equal(await cartCount(page), 1, 'keranjang tetap ada setelah login');
 }));

 test('alamat (validasi + tambah), ongkir per toko berubah sesuai alamat & kurir, voucher, lalu pesanan dibuat sekali walau diklik ganda', () => withPage({}, async page => {
  await login(page, 'buyer');
  await seedCart(page, [['kt-01', null, 2], ['mk-03', null, 1], ['bm-01', 'v2', 1]]);
  await go(page, '/checkout');
  assert.equal(await count(page, 'input[name=addr]'), 2);
  assert.equal(await count(page, 'fieldset.parcel'), 3);
  const sumShip = async () => rpNum(await page.locator('.sum-row', {hasText: 'Ongkos kirim'}).first().innerText());
  const toBogor = await sumShip();
  await page.locator('input[name=addr][value=a2]').check({force: true});                 // Jakarta
  const toJakarta = await sumShip();
  assert.ok(toJakarta > toBogor, `ke Jakarta (${toJakarta}) lebih mahal dari satu provinsi (${toBogor})`);
  await page.locator('input[name=addr][value=a1]').check({force: true});
  assert.match(await page.locator('fieldset.parcel', {hasText: 'Butik Muslim Barokah'}).innerText(), /Satu provinsi/);
  assert.match(await page.locator('fieldset.parcel', {hasText: 'Maktabah Nurul Ilmi'}).innerText(), /Antar provinsi/);
  // kurir kilat menaikkan total
  const total0 = rpNum(await totalText(page));
  await page.locator('input[name="ship-0"][value=kilat]').check({force: true});
  assert.ok(rpNum(await totalText(page)) > total0);
  await page.locator('input[name="ship-0"][value=reguler]').check({force: true});
  assert.equal(rpNum(await totalText(page)), total0);
  // alamat baru: validasi
  await page.getByRole('button', {name: /Tambah alamat baru/}).click();
  await page.locator('form[data-form=addr] #f-phone').fill('12'); await page.locator('form[data-form=addr] #f-line').fill('Jl'); await page.locator('form[data-form=addr] #f-zip').fill('123');
  await page.locator('form[data-form=addr] button.btn').first().click();
  const errs = (await page.locator('form[data-form=addr] .err').allInnerTexts()).filter(Boolean);
  assert.ok(errs.some(e => /telepon/i.test(e)) && errs.some(e => /Minimal 8/.test(e)) && errs.some(e => /Kode pos/.test(e)) && errs.some(e => /Wajib/.test(e)), errs.join(' | '));
  await page.locator('form[data-form=addr] #f-label').fill('Kos'); await page.locator('form[data-form=addr] #f-phone').fill('081211112222');
  await page.locator('form[data-form=addr] #f-line').fill('Jl. Dago No. 10, dekat kampus'); await page.locator('form[data-form=addr] #f-city').fill('Kota Bandung');
  await page.locator('form[data-form=addr] #f-prov').selectOption('Jawa Barat'); await page.locator('form[data-form=addr] #f-zip').fill('40135');
  await page.locator('form[data-form=addr] button.btn').first().click();
  assert.equal(await count(page, 'input[name=addr]'), 3);
  assert.equal(await page.locator('input[name=addr]:checked').evaluate(i => i.closest('label').innerText.includes('Kos')), true, 'alamat baru terpilih');
  // catatan penjual & metode bayar
  await page.locator('#f-note-1').fill('Mohon dibungkus rapi');
  await page.locator('input[name=pay][value="E-wallet · GoPay"]').check({force: true});
  // buat pesanan; klik ganda cepat
  const before = await state(page, 'S.orders.length');
  const stockBefore = await state(page, "prod('kt-01').stock");
  await page.locator('[data-act=placeOrder]').dblclick();
  await page.waitForFunction(() => location.hash.startsWith('#/bayar/'), null, {timeout: 8000});
  const id = (await hashOf(page)).split('/')[2];
  assert.match(id, /^SM-\d{8}-[A-Z0-9]{4}$/);
  assert.equal(await state(page, 'S.orders.length'), before + 1, 'klik ganda hanya membuat satu pesanan');
  assert.equal(await state(page, "prod('kt-01').stock"), stockBefore - 2, 'stok ditahan');
  assert.equal(await cartCount(page), 0);
  const o = await state(page, `S.orders.find(o => o.id === '${id}')`);
  assert.equal(o.parcels.length, 3); assert.equal(o.payMethod, 'E-wallet · GoPay'); assert.equal(o.pay, 'pending'); assert.equal(o.address.label, 'Kos');
  assert.ok(o.parcels.some(p => p.note === 'Mohon dibungkus rapi'));
  assert.equal(o.total, o.subtotal - o.discount + o.shipFee - o.shipDisc);
  assert.match(await page.locator('main').innerText(), /GoPay/);
 }));

 test('pembayaran: ganti metode, gagal lalu berhasil, nomor pesanan unik, tampil di riwayat dan lacak', () => withPage({}, async page => {
  await login(page, 'buyer');
  await seedCart(page, [['bl-06', null, 2]]);
  await go(page, '/checkout'); const id = await placeOrderUi(page);
  assert.ok(await page.locator('.qr').isVisible());
  await page.locator('#pm').selectOption('Virtual account · BCA');
  assert.match(await page.locator('.copy').innerText(), /8808/);
  await page.locator('#pm').selectOption('E-wallet · OVO');
  assert.match(await page.locator('.pm-body').innerText(), /OVO/);
  assert.match(await page.locator('[data-countdown]').innerText(), /^\d\d:\d\d:\d\d$/);
  await page.locator('[data-act=simPay][data-r=failed]').click();
  await page.waitForSelector('.note.bad');
  assert.match(await page.locator('.note.bad').innerText(), /Pembayaran gagal/);
  assert.equal(await state(page, `S.orders.find(o=>o.id==='${id}').pay`), 'failed');
  await page.locator('[data-act=simPay][data-r=paid]').click();
  await page.waitForSelector('.order-no');
  assert.match(await page.locator('main h1').innerText(), /Pesanan berhasil dibuat/);
  assert.equal(await page.locator('.order-no b').innerText(), id);
  assert.match(await page.locator('main').innerText(), /tersimpan di browser perangkat ini/);
  await page.getByRole('link', {name: 'Lihat detail pesanan'}).click();
  assert.equal(await hashOf(page), '/akun/pesanan/' + id);
  assert.match(await page.locator('.od-h .badge').first().innerText(), /Dikemas/);
  assert.match(await page.locator('.tl .now b, .tl li.done b').last().innerText(), /\S/);
  await go(page, '/akun/pesanan');
  assert.ok(await page.locator('.ocard', {hasText: id}).isVisible());
  await page.getByRole('tab', {name: /Dikemas/}).click();
  assert.ok(await page.locator('.ocard', {hasText: id}).isVisible());
  await go(page, '/lacak?id=' + id);
  assert.match(await page.locator('.trk-p').first().innerText(), /Dikemas penjual/);
  await go(page, '/lacak?id=SM-00000000-NONE');
  assert.match(await page.locator('#err-id').innerText(), /tidak ditemukan/);
 }));

 test('batalkan pesanan (stok kembali), kedaluwarsa (pesan lagi mengisi keranjang), dan stok divalidasi ulang saat checkout', () => withPage({}, async page => {
  await login(page, 'buyer');
  await seedCart(page, [['as-04', null, 3]]);
  const s0 = await state(page, "prod('as-04').stock");
  await go(page, '/checkout'); const id1 = await placeOrderUi(page);
  assert.equal(await state(page, "prod('as-04').stock"), s0 - 3);
  await page.getByRole('button', {name: 'Batalkan pesanan ini'}).click();
  assert.match(await page.locator('#modal h3').innerText(), /Batalkan pesanan/);
  await page.locator('#cfYes').click();
  await page.waitForFunction(() => document.querySelector('main h1')?.textContent.includes('dibatalkan'));
  assert.equal(await state(page, "prod('as-04').stock"), s0, 'stok dikembalikan');
  assert.equal(await state(page, `orderStatus(S.orders.find(o=>o.id==='${id1}'))`), 'Dibatalkan');
  // kedaluwarsa
  await seedCart(page, [['as-04', null, 2]]);
  await go(page, '/checkout'); await placeOrderUi(page);
  await page.locator('[data-act=simPay][data-r=expired]').click();
  await page.waitForSelector('[data-act=reorder]');
  assert.match(await page.locator('main h1').innerText(), /Batas waktu pembayaran habis/);
  assert.equal(await state(page, "prod('as-04').stock"), s0);
  await page.locator('[data-act=reorder]').click();
  assert.equal(await hashOf(page), '/keranjang'); assert.equal(await cartCount(page), 2);
  // stok berubah di antara keranjang dan checkout -> pesanan ditolak dengan pesan jelas
  await seedCart(page, [['kt-07', null, 4]]);
  await go(page, '/checkout');
  await page.evaluate(() => { prod('kt-07').stock = 1; save(); });
  const n0 = await state(page, 'S.orders.length');
  await page.locator('[data-act=placeOrder]').click();
  await page.waitForSelector('.note.bad');
  assert.match(await page.locator('.note.bad').innerText(), /tidak mencukupi/);
  assert.equal(await hashOf(page), '/checkout');
  assert.equal(await state(page, 'S.orders.length'), n0, 'tidak ada pesanan dibuat');
  assert.equal(await state(page, "prod('kt-07').stock"), 1);
 }));

 test('beli sekarang hanya memproses produk itu dan tidak mengubah keranjang', () => withPage({}, async page => {
  await login(page, 'buyer');
  await seedCart(page, [['kt-05', null, 1]]);
  await go(page, '/produk/bm-02');
  await page.locator('[data-act=buyNow]:visible').first().click();
  assert.match(await page.locator('#pd-err').innerText(), /Pilih ukuran/);
  await page.locator('input[name=variant][value=v2]').check({force: true});
  await page.locator('[data-act=buyNow]:visible').first().click();
  await page.waitForFunction(() => location.hash === '#/checkout?now=1'); await hashOf(page);
  assert.equal(await count(page, 'fieldset.parcel'), 1);
  assert.match(await page.locator('main').innerText(), /Baju Koko Bordir Navy/);
  assert.ok(!(await page.locator('main').innerText()).includes('Buku Saku Doa'));
  await placeOrderUi(page);
  assert.equal(await cartCount(page), 1, 'item keranjang lain tidak ikut');
  assert.equal(await state(page, 'S.direct'), null);
 }));

 test('pesanan hanya produk digital: tanpa alamat/ongkir, status selesai, unduh berkas contoh', () => withPage({}, async page => {
  await login(page, 'buyer');
  await seedCart(page, [['dg-05', null, 1]]);
  await go(page, '/checkout');
  assert.match(await page.locator('#h-addr').locator('xpath=..').innerText(), /hanya berisi produk digital/);
  assert.equal(await count(page, 'input[name=addr]'), 0);
  assert.match(await page.locator('.sum-row', {hasText: 'Ongkos kirim'}).first().innerText(), /Gratis/);
  const id = await placeOrderUi(page);
  await page.locator('[data-act=simPay][data-r=paid]').click(); await page.waitForSelector('.order-no');
  await page.getByRole('link', {name: 'Lihat detail pesanan'}).click();
  assert.match(await page.locator('.od-h .badge').first().innerText(), /Selesai/);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', {name: /Unduh berkas/}).click()]);
  assert.equal(dl.suggestedFilename(), 'dg-05-contoh.txt');
  const text = await (await import('node:fs')).promises.readFile(await dl.path(), 'utf8');
  assert.match(text, /berkas contoh/i); assert.match(text, new RegExp(id));
 }));
});

describe('siklus pesanan lintas peran (pembeli → penjual → pembeli → admin)', () => {
 test('dua toko, penjual hanya melihat paketnya, kirim dengan resi, pembeli menerima, admin dapat bertindak', () => withPage({}, async page => {
  // pembeli membuat dan membayar pesanan dari dua toko
  await login(page, 'buyer');
  await seedCart(page, [['kt-02', 'v1', 1], ['mk-03', null, 1]]);
  await go(page, '/checkout'); const id = await placeOrderUi(page);
  await page.locator('[data-act=simPay][data-r=paid]').click(); await page.waitForSelector('.order-no');
  await logout(page);
  // penjual toko kitab
  await login(page, 'seller');
  assert.equal(await hashOf(page), '/penjual');
  await go(page, '/penjual/pesanan?f=proses');
  assert.ok(await page.locator('table.tbl', {hasText: id}).isVisible(), 'pesanan baru tampil di antrean');
  await go(page, '/penjual/pesanan/' + id);
  const text = await page.locator('.adm-main').innerText();
  assert.match(text, /Maktabah Nurul Ilmi/); assert.ok(!text.includes('Madu Hutan'), 'paket toko lain tidak terlihat');
  assert.ok(!text.includes('Rincian pembayaran'), 'total pembayaran pembeli tidak terlihat penjual');
  await page.locator('[data-act=shipForm]').click();
  await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal [data-err=resi]').innerText(), /6–24 karakter/);
  await page.locator('#f-resi').fill('sm k'); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal [data-err=resi]').innerText(), /6–24 karakter/);
  await page.locator('#f-resi').fill('smk-445566'); await page.locator('#modal .modal-primary').click();
  assert.equal(await count(page, '#modal'), 0);
  assert.match(await page.locator('.parcel-d .badge').first().innerText(), /Dikirim/);
  assert.match(await page.locator('.adm-main').innerText(), /SMK-445566/);
  assert.equal(await count(page, '[data-act=shipForm]'), 0, 'tidak dapat dikirim dua kali');
  // penjual tidak bisa membuka pesanan yang hanya berisi toko lain
  const other = await state(page, "S.orders.find(o => o.pay==='paid' && o.parcels.every(p => p.sid !== 'maktabah-nurul-ilmi')).id");
  await go(page, '/penjual/pesanan/' + other);
  assert.match(await page.locator('.adm-main').innerText(), /tidak ditemukan/i);
  await logout(page);
  // pembeli melihat resi, lalu konfirmasi diterima
  await login(page, 'buyer');
  await go(page, '/akun/pesanan/' + id);
  assert.match(await page.locator('main').innerText(), /SMK-445566/);
  assert.match(await page.locator('.od-h .badge').first().innerText(), /Sebagian Dikirim/);
  await page.locator('[data-act=receive]').click();
  await page.locator('#cfYes').click();
  assert.match(await page.locator('.parcel-d', {hasText: 'Maktabah'}).locator('.badge').first().innerText(), /Selesai/);
  assert.equal(await count(page, '[data-act=receive]'), 0);
  assert.ok(await page.locator('[data-act=review]').first().isVisible(), 'tombol ulas muncul setelah diterima');
  // notifikasi pembeli
  await go(page, '/akun/notifikasi');
  assert.match(await page.locator('main').innerText(), new RegExp(`dikirim\\. Resi SMK-445566`));
  await logout(page);
  // admin melihat semuanya dan dapat mengirim paket toko lain, lalu pembeli menyelesaikan
  await login(page, 'admin');
  await go(page, '/admin/pesanan/' + id);
  assert.equal(await count(page, '.parcel-d'), 2); assert.match(await page.locator('.adm-main').innerText(), /Rincian pembayaran/);
  await page.locator('[data-act=shipForm]').click(); await page.locator('#f-resi').fill('ADM-998877'); await page.locator('#modal .modal-primary').click();
  assert.equal(await count(page, '[data-act=shipForm]'), 0);
  await logout(page);
  await login(page, 'buyer'); await go(page, '/akun/pesanan/' + id);
  await page.locator('[data-act=receive]').click(); await page.locator('#cfYes').click();
  assert.match(await page.locator('.od-h .badge').first().innerText(), /Selesai/);
 }));

 test('penjual membatalkan paket: butuh alasan, stok kembali, pembeli diberi tahu dana dikembalikan', () => withPage({}, async page => {
  await login(page, 'buyer');
  await seedCart(page, [['kt-04', null, 2]]);
  const stock0 = await state(page, "prod('kt-04').stock");
  await go(page, '/checkout'); const id = await placeOrderUi(page);
  await page.locator('[data-act=simPay][data-r=paid]').click(); await page.waitForSelector('.order-no');
  await logout(page); await login(page, 'seller');
  await go(page, '/penjual/pesanan/' + id);
  await page.locator('[data-act=cancelParcel]').click(); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('#modal [data-err=reason]').innerText(), /alasan/i);
  await page.locator('#f-reason').fill('Stok fisik ternyata habis'); await page.locator('#modal .modal-primary').click();
  assert.match(await page.locator('.parcel-d .badge').first().innerText(), /Dibatalkan/);
  assert.equal(await state(page, "prod('kt-04').stock"), stock0, 'stok dikembalikan');
  await logout(page); await login(page, 'buyer');
  await go(page, '/akun/pesanan/' + id);
  assert.match(await page.locator('.od-h .badge').first().innerText(), /Dibatalkan/);
  assert.match(await page.locator('main').innerText(), /dikembalikan \(simulasi\)/);
 }));
});
