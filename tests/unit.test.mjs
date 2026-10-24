/* Unit test logika domain (tanpa browser). Jalankan:  npm run test:unit   (memakai node:test bawaan Node) */
import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['js/config.js', 'js/data/categories.js', 'js/data/geo.js', 'js/data/sellers.js', 'js/data/products.js', 'js/data/images.js', 'js/data/content.js',
 'js/lib/util.js', 'js/lib/password.js', 'js/lib/store.js', 'js/data/seed.js'];

function memStorage() { const m = new Map(); return {getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m}; }
function env() {
 const ctx = vm.createContext({localStorage: memStorage(), sessionStorage: memStorage(), console, TextEncoder, crypto: crypto.webcrypto, Intl, Date, Math, JSON, Uint8Array, Uint32Array, Int32Array, Map, Set});
 for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, {filename: f});
 vm.runInContext('S = loadState()', ctx);
 const run = code => vm.runInContext(code, ctx);
 const j = code => JSON.parse(JSON.stringify(run(code)));       // salin lintas-realm agar assert.deepEqual stabil
 return {ctx, run, j};
}
const login = (e, id) => e.run(`setSession(${JSON.stringify(id)}, false)`);

describe('integritas data katalog', () => {
 const e = env();
 const P = e.j('S.products');
 test('52 produk dengan ID unik dan 8 kategori terpakai', () => {
  assert.equal(P.length, 52);
  assert.equal(new Set(P.map(p => p.id)).size, 52);
  const cats = new Set(P.map(p => p.cat));
  assert.equal(cats.size, 8);
 });
 test('setiap produk valid: harga, kategori, toko, stok, varian', () => {
  const catIds = e.j('CATS.map(c=>c.id)'), shopIds = e.j('S.shops.map(s=>s.id)');
  for (const p of P) {
   assert.ok(p.price > 0 && Number.isInteger(p.price), p.id + ' harga');
   assert.ok(catIds.includes(p.cat), p.id + ' kategori');
   assert.ok(shopIds.includes(p.shop), p.id + ' toko');
   assert.ok(!p.was || p.was > p.price, p.id + ' harga coret harus lebih besar');
   assert.ok(p.desc.length > 40 && p.specs.length >= 3, p.id + ' deskripsi/spesifikasi');
   if (p.variants) {
    const ids = p.variants.items.map(v => v.id);
    assert.equal(new Set(ids).size, ids.length, p.id + ' id varian unik');
    for (const v of p.variants.items) assert.ok(Number.isInteger(v.stock) && v.stock >= 0, p.id + ' stok varian');
   } else if (!p.digital) assert.ok(Number.isInteger(p.stock) && p.stock >= 0, p.id + ' stok');
   if (!p.digital) assert.ok(p.weight > 0, p.id + ' berat untuk ongkir');
  }
 });
 test('tiap produk punya gambar yang benar-benar ada di disk dan indeks varian valid', () => {
  for (const p of P) {
   const g = e.j(`PRODUCT_IMG[${JSON.stringify(p.id)}]`);
   assert.ok(g && g.length >= 3, p.id + ' minimal 3 gambar galeri');
   for (const im of g) assert.ok(fs.existsSync(path.join(ROOT, im.src)), im.src + ' tidak ada');
   for (const v of (p.variants ? p.variants.items : [])) if (v.img != null) assert.ok(v.img < g.length, p.id + ' indeks gambar varian');
  }
  assert.equal(new Set(P.flatMap(p => e.j(`PRODUCT_IMG[${JSON.stringify(p.id)}]`).map(i => i.src))).size, P.flatMap(p => e.j(`PRODUCT_IMG[${JSON.stringify(p.id)}]`)).length, 'tidak ada gambar yang dipakai ganda');
 });
 test('gambar situs dan kategori ada', () => {
  const site = e.j('SITE_IMG');
  for (const [k, v] of Object.entries(site)) if (typeof v === 'string') assert.ok(fs.existsSync(path.join(ROOT, v)), k);
  for (const c of e.j('CATS')) assert.ok(fs.existsSync(path.join(ROOT, site.cats[c.id])), c.id);
 });
 test('kasus uji sengaja ada: stok habis, menipis, varian habis, pre-order, digital, diskon', () => {
  assert.equal(e.run("stockState(prod('mk-08'))"), 'out');
  assert.equal(e.run("stockState(prod('mk-07'))"), 'low');
  assert.equal(e.run("stockOf(prod('bm-01'),'v5')"), 0);
  assert.equal(e.run("prod('mk-06').po"), 3);
  assert.equal(e.run("prod('dg-01').digital"), true);
  assert.equal(e.run("discountPct(prod('kt-01'))"), 20);
 });
});

describe('password', () => {
 const e = env();
 test('hash + verifikasi, salah sandi ditolak, salt acak', async () => {
  const rec = await e.run("hashPassword('rahasia-1')");
  assert.match(rec.hash, /^[0-9a-f]{64}$/);
  assert.equal(await e.run(`verifyPassword('rahasia-1', ${JSON.stringify(rec)})`), true);
  assert.equal(await e.run(`verifyPassword('rahasia-2', ${JSON.stringify(rec)})`), false);
  const rec2 = await e.run("hashPassword('rahasia-1')");
  assert.notEqual(rec.salt, rec2.salt);
  assert.notEqual(rec.hash, rec2.hash);
 });
 test('akun demo dapat diverifikasi dan tidak ada password mentah di state', async () => {
  for (const [id, pw] of [['u-santri', 'santri123'], ['u-penjual', 'penjual123'], ['u-admin', 'admin123'], ['u-b2', 'demo12345']]) {
   assert.equal(await e.run(`verifyPassword(${JSON.stringify(pw)}, userById(${JSON.stringify(id)}).pw)`), true, id);
  }
  const blob = JSON.stringify(e.j('S'));
  for (const raw of ['santri123', 'penjual123', 'admin123', 'demo12345']) assert.ok(!blob.includes(raw), 'password mentah bocor: ' + raw);
  assert.ok(!('pass' in e.j('S.users[0]')));
 });
 test('implementasi JS murni identik dengan crypto.pbkdf2Sync Node', () => {
  for (const [pw, it] of [['santri123', 1500], ['x'.repeat(130), 700], ['', 300], ['sandi ünïcode ✓', 900]]) {
   const salt = crypto.randomBytes(16);
   const want = crypto.pbkdf2Sync(pw, salt, it, 32, 'sha256').toString('hex');
   assert.equal(e.run(`hex(pbkdf2Js(${JSON.stringify(pw)}, new Uint8Array(${JSON.stringify([...salt])}), ${it}))`), want);
  }
 });
});

describe('pencarian, filter, dan urutan', () => {
 const e = env();
 const ids = f => e.j(`queryProducts(${JSON.stringify(f)}).map(p=>p.id)`);
 test('kata kunci mencari nama, tag, kategori, dan toko', () => {
  assert.ok(ids({q: 'peci'}).includes('ib-03'));
  assert.ok(ids({q: 'madu'}).includes('mk-03'));
  assert.ok(ids({q: 'koperasi'}).includes('bl-01'));          // nama toko
  assert.ok(ids({q: 'makanan'}).length >= 8);                  // nama kategori
 });
 test('sinonim dan apostrof tidak menghalangi hasil', () => {
  assert.ok(ids({q: 'kopiah'}).includes('ib-03'), 'kopiah ~ peci');
  assert.ok(ids({q: 'jilbab'}).includes('bm-05'), 'jilbab ~ hijab');
  assert.ok(ids({q: 'quran'}).includes('kt-03'));
  assert.ok(ids({q: 'talim'}).includes('kt-02'), "talim ~ Ta'lim");
  assert.ok(ids({q: 'SAFINATUN'}).includes('kt-01'), 'tak peka huruf besar');
 });
 test('semua kata kunci harus cocok; tidak ada hasil -> kosong; relevansi menaruh judul cocok di depan', () => {
  assert.deepEqual(ids({q: 'zzzzzz'}), []);
  assert.deepEqual(ids({q: 'peci rehal'}), []);
  assert.equal(ids({q: 'sarung'})[0].startsWith('ib-0'), true);
  assert.equal(ids({q: 'rehal'})[0], 'ib-07');
 });
 test('filter kategori, stok, diskon, harga, toko, rating', () => {
  assert.ok(ids({cat: ['makanan']}).every(i => i.startsWith('mk-')));
  assert.ok(!ids({stock: true}).includes('mk-08'));
  assert.ok(ids({}).includes('mk-08'));
  assert.ok(ids({sale: true}).every(i => e.run(`discountPct(prod('${i}'))`) > 0));
  assert.ok(ids({min: 100000, max: 150000}).every(i => { const p = e.j(`prod('${i}')`); return p.price >= 100000 && p.price <= 150000; }));
  assert.ok(ids({shop: 'dapur-santri-berkah'}).every(i => i.startsWith('mk-')));
  assert.ok(ids({rate: 4}).every(i => e.run(`ratingOf('${i}')`).avg >= 4));
 });
 test('urutan harga naik/turun konsisten', () => {
  const asc = ids({sort: 'pa'}).map(i => e.run(`prod('${i}').price`)), desc = ids({sort: 'pd'}).map(i => e.run(`prod('${i}').price`));
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
 });
 test('produk stok habis diurutkan paling akhir pada urutan populer', () => {
  const l = ids({sort: 'pop'});
  assert.equal(l[l.length - 1], 'mk-08');
 });
 test('produk dari toko nonaktif tidak tampil', () => {
  e.run("shop('dapur-santri-berkah').active = false");
  assert.ok(!ids({}).some(i => i.startsWith('mk-')));
  e.run("shop('dapur-santri-berkah').active = true");
 });
});

describe('keranjang', () => {
 test('varian wajib dipilih, stok divalidasi, kuantitas digabung', () => {
  const e = env();
  assert.match(e.run("addToCart('bm-01', null, 1)").msg, /Pilih ukuran/i);
  assert.equal(e.run("addToCart('bm-01', 'v2', 2)").ok, true);
  assert.equal(e.run("addToCart('bm-01', 'v2', 1)").ok, true);
  assert.equal(e.j('S.cart').length, 1);
  assert.equal(e.j('S.cart')[0].qty, 3);
  assert.equal(e.run("addToCart('bm-01', 'v1', 1)").ok, true);       // varian lain = baris lain
  assert.equal(e.j('S.cart').length, 2);
  assert.match(e.run("addToCart('bm-01', 'zz', 1)").msg, /tidak valid/i);
 });
 test('tidak dapat melebihi stok, termasuk akumulasi dengan isi keranjang', () => {
  const e = env();
  assert.match(e.run("addToCart('kt-07', null, 7)").msg, /tersisa 5/);
  assert.equal(e.run("addToCart('kt-07', null, 4)").ok, true);
  const r = e.run("addToCart('kt-07', null, 3)");
  assert.equal(r.ok, false); assert.match(r.msg, /sudah ada 4/);
  assert.equal(e.run("addToCart('mk-08', null, 1)").ok, false);       // stok habis
  assert.match(e.run("addToCart('bm-01', 'v5', 1)").msg, /habis/i);   // varian habis
  assert.equal(e.run("addToCart('kt-01', null, 0)").ok, false);
  assert.equal(e.run("addToCart('kt-01', null, 1.9)").qty, 1);
  assert.equal(e.run("addToCart('tidak-ada', null, 1)").ok, false);
 });
 test('ubah jumlah dibatasi stok, hapus item, total konsisten', () => {
  const e = env();
  e.run("addToCart('kt-07', null, 2)");
  const key = e.run("S.cart[0].id + '|'");
  assert.equal(e.run(`setCartQty('${key}', 50)`).clamped, true);
  assert.equal(e.j('S.cart')[0].qty, 5);
  assert.equal(e.run(`setCartQty('${key}', 0)`).ok, false);
  e.run("addToCart('kt-01', null, 2)");
  const sub = e.run("cartLines().reduce((s,l)=>s+l.price*l.qty,0)");
  assert.equal(sub, 22000 * 5 + 28000 * 2);
  e.run(`removeCart('${key}')`);
  assert.equal(e.j('S.cart').length, 1);
 });
 test('harga varian memakai tambahan harga; produk digital maksimal 1', () => {
  const e = env();
  assert.equal(e.run("unitPrice(prod('kt-02'), 'v2')"), 32000 + 15000);
  assert.equal(e.run("addToCart('dg-01', null, 1)").ok, true);
  assert.match(e.run("addToCart('dg-01', null, 1)").msg, /sudah ada/);
  assert.equal(e.run("addToCart('dg-02', null, 2)").ok, false);
 });
 test('item yang dihapus penjual disaring dari keranjang', () => {
  const e = env();
  e.run("addToCart('kt-01', null, 1)"); login(e, 'u-penjual');
  assert.equal(e.run("deleteProduct('kt-01')").ok, true);
  assert.equal(e.j('S.cart').length, 0);
 });
});

describe('voucher dan ongkos kirim', () => {
 const e = env();
 test('validasi kode: tidak ada, kedaluwarsa, habis, minimum', () => {
  assert.match(e.run("voucherCheck('NGAWUR', 500000)")[1], /tidak ditemukan/);
  assert.match(e.run("voucherCheck('KADALUARSA', 500000)")[1], /kedaluwarsa/);
  assert.match(e.run("voucherCheck('HABIS', 500000)")[1], /habis/);
  assert.match(e.run("voucherCheck('SANTRI10', 50000)")[1], /50\.000 lagi/);
  assert.equal(e.run("voucherCheck(' santri10 ', 200000)")[0].code, 'SANTRI10');
 });
 test('efek voucher: persen dengan batas, nominal, ongkir', () => {
  assert.deepEqual(e.j("voucherEffect(S.vouchers.find(v=>v.code==='SANTRI10'), 200000, 30000)"), {disc: 20000, shipDisc: 0});
  assert.equal(e.run("voucherEffect(S.vouchers.find(v=>v.code==='SANTRI10'), 900000, 0)").disc, 50000);
  assert.equal(e.run("voucherEffect(S.vouchers.find(v=>v.code==='HEMAT25'), 20000, 0)").disc, 20000);
  assert.deepEqual(e.j("voucherEffect(S.vouchers.find(v=>v.code==='GRATISONGKIR'), 100000, 12000)"), {disc: 0, shipDisc: 12000});
  assert.equal(e.run("voucherEffect(S.vouchers.find(v=>v.code==='GRATISONGKIR'), 100000, 60000)").shipDisc, 20000);
 });
 test('zona kirim: satu kota, satu provinsi, antar provinsi', () => {
  assert.equal(e.run("zoneOf(shop('koperasi-santri-mandiri'), {city:'Kabupaten Bogor', prov:'Jawa Barat'})"), 'local');
  assert.equal(e.run("zoneOf(shop('koperasi-santri-mandiri'), {city:'Kota Bandung', prov:'Jawa Barat'})"), 'regional');
  assert.equal(e.run("zoneOf(shop('koperasi-santri-mandiri'), {city:'Kota Surabaya', prov:'Jawa Timur'})"), 'national');
 });
 test('tarif naik sesuai berat dan zona; kurir kilat lebih mahal dan lebih cepat', () => {
  const a = e.j("shipOptions(500, 'regional')"), b = e.j("shipOptions(5500, 'regional')"), c = e.j("shipOptions(500, 'national')");
  assert.ok(b[0].cost > a[0].cost && c[0].cost > a[0].cost);
  assert.ok(a[1].cost > a[0].cost && a[1].eta[1] <= a[0].eta[1]);
  assert.equal(a[0].cost % 500, 0);
 });
 test('parcel dipisah per toko dan produk digital tidak punya ongkir', () => {
  e.run("S.cart = []"); e.run("addToCart('kt-01', null, 1)"); e.run("addToCart('mk-03', null, 1)"); e.run("addToCart('dg-01', null, 1)");
  const t = e.j("checkoutTotals(cartLines(), S.users[0].addresses[0], {}, null)");
  assert.equal(t.parcels.length, 3);
  assert.equal(t.parcels.filter(p => p.digital).length, 1);
  assert.equal(t.parcels.find(p => p.digital).ship, null);
  assert.equal(t.total, t.sub + t.shipFee);
  assert.equal(t.needsAddress, true);
  e.run("S.cart = []"); e.run("addToCart('dg-01', null, 1)");
  assert.equal(e.run("checkoutTotals(cartLines(), null, {}, null)").needsAddress, false);
 });
});

describe('pesanan end-to-end', () => {
 const setup = () => {
  const e = env(); login(e, 'u-santri');
  e.run("S.cart = []");
  return e;
 };
 test('membuat pesanan menahan stok, mengosongkan keranjang, ID unik, voucher terpakai', () => {
  const e = setup();
  const before = e.run("prod('kt-01').stock"), vBefore = e.run("S.vouchers.find(v=>v.code==='SANTRI10').used");
  e.run("addToCart('kt-01', null, 3)"); e.run("addToCart('bm-01', 'v2', 1)");
  const r = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: 'SANTRI10', notes: {}, payMethod: 'QRIS', fromCart: true})");
  assert.equal(r.ok, true, r.msg);
  assert.match(r.order.id, /^SM-\d{8}-[A-Z0-9]{4}$/);
  assert.equal(e.run("prod('kt-01').stock"), before - 3);
  assert.equal(e.run("prod('bm-01').variants.items[1].stock"), 22 - 1);
  assert.equal(e.j('S.cart').length, 0);
  assert.equal(e.run("S.vouchers.find(v=>v.code==='SANTRI10').used"), vBefore + 1);
  assert.equal(r.order.pay, 'pending');
  assert.equal(r.order.parcels.length, 2);
  assert.equal(r.order.total, r.order.subtotal - r.order.discount + r.order.shipFee - r.order.shipDisc);
  const ids = new Set(e.j('S.orders.map(o=>o.id)'));
  assert.equal(ids.size, e.j('S.orders').length);
 });
 test('stok divalidasi ulang saat membuat pesanan', () => {
  const e = setup();
  e.run("addToCart('kt-07', null, 5)");
  e.run("prod('kt-07').stock = 2");                               // stok berubah setelah masuk keranjang
  const r = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})");
  assert.equal(r.ok, false); assert.match(r.msg, /tidak mencukupi/);
  assert.equal(e.run("prod('kt-07').stock"), 2);                  // tidak ada perubahan stok
  assert.equal(e.j('S.cart').length, 1);
 });
 test('alamat wajib untuk produk fisik, voucher tidak valid menolak pesanan', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 1)");
  assert.match(e.j("createOrder({user: me(), addr: null, lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").msg, /alamat/i);
  assert.equal(e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: 'HEMAT25', notes: {}, payMethod: 'QRIS', fromCart: true})").ok, false);
  e.run("S.cart = []"); e.run("addToCart('dg-01', null, 1)");
  assert.equal(e.j("createOrder({user: me(), addr: null, lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").ok, true);
 });
 test('beli sekarang tidak menyentuh keranjang', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 1)");
  e.run("S.direct = {id: 'bl-06', vid: null, qty: 2}");
  const r = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines([S.direct]), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: false})");
  assert.equal(r.ok, true);
  assert.equal(e.j('S.cart').length, 1);
  assert.equal(e.run('S.direct'), null);
 });
 test('pembayaran berhasil: status dikemas, terjual bertambah, penjual diberi tahu', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 2)");
  const id = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  const sold = e.run("prod('kt-01').sold");
  e.run(`markPaid(S.orders.find(o=>o.id==='${id}'))`);
  assert.equal(e.run(`orderStatus(S.orders.find(o=>o.id==='${id}'))`), 'Dikemas');
  assert.equal(e.run("prod('kt-01').sold"), sold + 2);
  assert.ok(e.j("S.notes.filter(n=>n.uid==='u-penjual' && n.m.includes('" + id + "'))").length === 1);
  e.run(`markPaid(S.orders.find(o=>o.id==='${id}'))`);              // idempoten
  assert.equal(e.run("prod('kt-01').sold"), sold + 2);
 });
 test('kedaluwarsa mengembalikan stok dan kuota voucher; pesanan terbayar tidak ikut kedaluwarsa', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 4)");                          // subtotal 112.000 >= minimum voucher 100.000
  const stock = e.run("prod('kt-01').stock");
  const id = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: 'SANTRI10', notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  const used = e.run("S.vouchers.find(v=>v.code==='SANTRI10').used");
  e.run(`S.orders.find(o=>o.id==='${id}').deadline = Date.now() - 1`);
  assert.equal(e.run('expireAll()'), true);
  assert.equal(e.run(`S.orders.find(o=>o.id==='${id}').pay`), 'expired');
  assert.equal(e.run("prod('kt-01').stock"), stock);
  assert.equal(e.run("S.vouchers.find(v=>v.code==='SANTRI10').used"), used - 1);
  assert.equal(e.run('expireAll()'), false);                       // tidak diproses dua kali
  assert.equal(e.run("prod('kt-01').stock"), stock);
  e.run("addToCart('kt-01', null, 1)");
  const id2 = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  e.run(`markPaid(S.orders.find(o=>o.id==='${id2}'))`); e.run(`S.orders.find(o=>o.id==='${id2}').deadline = Date.now() - 1`);
  e.run('expireAll()');
  assert.equal(e.run(`S.orders.find(o=>o.id==='${id2}').pay`), 'paid');
 });
 test('pembeli dapat membatalkan pesanan belum dibayar tetapi tidak yang sudah dibayar', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 1)");
  const stock = e.run("prod('kt-01').stock");
  const id = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  assert.equal(e.run("prod('kt-01').stock"), stock - 1);          // stok ditahan selama belum dibayar
  assert.equal(e.run(`cancelOrder(S.orders.find(o=>o.id==='${id}'))`).ok, true);
  assert.equal(e.run("prod('kt-01').stock"), stock);              // dikembalikan saat dibatalkan
  assert.equal(e.run(`orderStatus(S.orders.find(o=>o.id==='${id}'))`), 'Dibatalkan');
  assert.equal(e.run(`cancelOrder(S.orders.find(o=>o.id==='${id}'))`).ok, false);
 });
 test('alur status paket: hanya penjual mengirim (dengan resi), hanya pembeli menerima, penjual lain ditolak', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 1)"); e.run("addToCart('mk-03', null, 1)");
  const id = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  const O = `S.orders.find(o=>o.id==='${id}')`;
  assert.match(e.run(`parcelAction(${O}, 0, 'ship', {resi:'ABC123456'})`).msg, /belum dibayar/);
  e.run(`markPaid(${O})`);
  const idxKitab = e.run(`${O}.parcels.findIndex(p=>p.sid==='maktabah-nurul-ilmi')`);
  assert.match(e.run(`parcelAction(${O}, ${idxKitab}, 'ship', {resi:'ABC123456'})`).msg, /tidak berwenang/);   // pembeli tak boleh kirim
  login(e, 'u-penjual');
  const idxMadu = 1 - idxKitab;
  assert.match(e.run(`parcelAction(${O}, ${idxMadu}, 'ship', {resi:'ABC123456'})`).msg, /tidak berwenang/);    // paket toko lain
  assert.match(e.run(`parcelAction(${O}, ${idxKitab}, 'ship', {resi:'x'})`).msg, /resi/i);
  assert.equal(e.run(`parcelAction(${O}, ${idxKitab}, 'ship', {resi:'smk-998877'})`).ok, true);
  assert.equal(e.run(`${O}.parcels[${idxKitab}].resi`), 'SMK-998877');
  assert.match(e.run(`parcelAction(${O}, ${idxKitab}, 'ship', {resi:'SMK-998877'})`).msg, /tidak dapat diubah/);  // tidak bisa dua kali
  assert.match(e.run(`parcelAction(${O}, ${idxKitab}, 'receive', {})`).msg, /tidak berwenang/);                  // penjual tak boleh konfirmasi terima
  login(e, 'u-santri');
  assert.equal(e.run(`parcelAction(${O}, ${idxKitab}, 'receive', {})`).ok, true);
  assert.equal(e.run(`orderStatus(${O})`), 'Sebagian Dikirim');                         // satu paket selesai, paket madu masih dikemas
  login(e, 'u-admin');
  assert.equal(e.run(`parcelAction(${O}, ${idxMadu}, 'ship', {resi:'ADM-123456'})`).ok, true);      // admin boleh
  login(e, 'u-santri');
  e.run(`parcelAction(${O}, ${idxMadu}, 'receive', {})`);
  assert.equal(e.run(`orderStatus(${O})`), 'Selesai');
 });
 test('penjual membatalkan paket: stok dikembalikan, dana simulasi, butuh alasan', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 2)");
  const id = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  const O = `S.orders.find(o=>o.id==='${id}')`;
  e.run(`markPaid(${O})`);
  const stock = e.run("prod('kt-01').stock");
  login(e, 'u-penjual');
  assert.match(e.run(`parcelAction(${O}, 0, 'cancel', {reason:'x'})`).msg, /alasan/i);
  assert.equal(e.run(`parcelAction(${O}, 0, 'cancel', {reason:'Stok fisik habis'})`).ok, true);
  assert.equal(e.run("prod('kt-01').stock"), stock + 2);
  assert.equal(e.run(`${O}.parcels[0].refund`) > 0, true);
  assert.equal(e.run(`orderStatus(${O})`), 'Dibatalkan');
 });
 test('produk digital langsung selesai setelah dibayar', () => {
  const e = setup();
  e.run("addToCart('dg-05', null, 1)");
  const id = e.j("createOrder({user: me(), addr: null, lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  e.run(`markPaid(S.orders.find(o=>o.id==='${id}'))`);
  assert.equal(e.run(`orderStatus(S.orders.find(o=>o.id==='${id}'))`), 'Selesai');
 });
 test('pesanan campuran fisik + digital: status mengikuti paket fisik, bukan produk digital', () => {
  const e = setup();
  e.run("addToCart('kt-01', null, 1)"); e.run("addToCart('dg-05', null, 1)");
  const id = e.j("createOrder({user: me(), addr: me().addresses[0], lines: cartLines(), choice: {}, voucher: null, notes: {}, payMethod: 'QRIS', fromCart: true})").order.id;
  const O = `S.orders.find(o=>o.id==='${id}')`;
  e.run(`markPaid(${O})`);
  assert.equal(e.run(`${O}.parcels.find(p=>p.digital).status`), 'Selesai');
  assert.equal(e.run(`orderStatus(${O})`), 'Dikemas');           // paket fisik masih dikemas
 });
 test('data seed konsisten: total cocok, status beragam, tidak ada stok negatif', () => {
  const e = env();
  const orders = e.j('S.orders');
  assert.ok(orders.length >= 12);
  for (const o of orders) {
   assert.equal(o.total, o.subtotal - o.discount + o.shipFee - o.shipDisc, o.id);
   assert.equal(o.subtotal, o.parcels.reduce((s, p) => s + p.subtotal, 0), o.id);
  }
  const st = new Set(orders.map(o => e.run(`orderStatus(S.orders.find(x=>x.id==='${o.id}'))`)));
  for (const s of ['Selesai', 'Dikirim', 'Dikemas', 'Menunggu Pembayaran', 'Kedaluwarsa']) assert.ok(st.has(s), 'status seed ' + s);
  for (const p of e.j('S.products')) for (const v of (p.variants ? p.variants.items : [{stock: p.stock || 0}])) assert.ok(v.stock >= 0);
 });
});

describe('manajemen produk, toko, ulasan, pesan', () => {
 test('penjual hanya boleh mengubah/menghapus produk tokonya sendiri', () => {
  const e = env(); login(e, 'u-penjual');
  assert.equal(e.run("saveProduct({name: 'Kitab Baru Uji', cat: 'kitab', price: 15000, stock: 9, weight: 100, desc: 'Deskripsi uji panjang', tags: [], specs: []})").ok, true);
  assert.equal(e.run("S.products[0].shop"), 'maktabah-nurul-ilmi');
  assert.match(e.run("saveProduct({name: 'Retas'}, 'mk-01')").msg, /tidak berwenang/);
  assert.match(e.run("deleteProduct('mk-01')").msg, /tidak berwenang/);
  assert.equal(e.run("deleteProduct('kt-05')").ok, true);
  login(e, 'u-santri');
  assert.match(e.run("saveProduct({name: 'Retas'}, 'kt-01')").msg, /tidak berwenang/);
  login(e, 'u-admin');
  assert.equal(e.run("deleteProduct('mk-01')").ok, true);
 });
 test('buka toko: nama unik, mengikat akun ke toko', () => {
  const e = env(); login(e, 'u-santri');
  const d = {name: 'Toko Uji Santri', type: 'UMKM Santri', city: 'Kota Depok', prov: 'Jawa Barat', desc: 'Deskripsi toko uji.'};
  assert.equal(e.run(`openShop(${JSON.stringify(d)})`).ok, true);
  assert.equal(e.run("me().shopId"), 'toko-uji-santri');
  assert.match(e.run(`openShop(${JSON.stringify(d)})`).msg, /sudah memiliki/);
  login(e, 'u-b2');
  assert.match(e.run(`openShop(${JSON.stringify(d)})`).msg, /sudah dipakai/);
 });
 test('ulasan: validasi, satu per pengguna, memperbarui rating', () => {
  const e = env();
  assert.match(e.run("addReview('kt-01', 5, 'Bagus sekali barangnya')").msg, /masuk/);
  login(e, 'u-santri');
  assert.match(e.run("addReview('kt-01', 0, 'Bagus sekali barangnya')").msg, /rating/i);
  assert.match(e.run("addReview('kt-01', 5, 'pendek')").msg, /minimal 10/);
  const n = e.run("(ratingOf('kt-01')||{n:0}).n");
  assert.equal(e.run("addReview('kt-01', 5, 'Bagus sekali barangnya')").ok, true);
  assert.equal(e.run("ratingOf('kt-01').n"), n + 1);
  assert.match(e.run("addReview('kt-01', 4, 'Ulasan kedua tidak boleh')").msg, /sudah mengulas/);
  assert.equal(e.run("S.reviews[0].verified"), true);              // pembeli ini punya pesanan selesai kt-01
 });
 test('pesan ke penjual masuk inbox toko dan memberi notifikasi', () => {
  const e = env();
  assert.match(e.run("sendMessage({to:'maktabah-nurul-ilmi', from:{name:'A', email:'a@example.com'}, subject:'x', text:'pendek'})").msg, /minimal 10/);
  assert.equal(e.run("sendMessage({to:'maktabah-nurul-ilmi', from:{name:'A', email:'a@example.com'}, pid:'kt-01', subject:'Tanya stok', text:'Apakah masih ada stok?'})").ok, true);
  assert.equal(e.run("S.messages[0].subject"), 'Tanya stok');
  assert.ok(e.run("S.notes.some(n=>n.uid==='u-penjual' && n.m.includes('Tanya stok'))"));
 });
 test('statistik dashboard: pendapatan harian & produk terlaris hanya menghitung paket tidak dibatalkan', () => {
  const e = env();
  const items = e.j("parcelsOf('maktabah-nurul-ilmi').map(({o,pc})=>({o:{pay:o.pay,created:o.created},pc:{status:pc.status,subtotal:pc.subtotal,items:pc.items}}))");
  assert.ok(items.length >= 5);
  const rev = e.j("revenueByDay(parcelsOf('maktabah-nurul-ilmi'), 30)");
  assert.equal(rev.length, 30);
  const total = e.run("parcelsOf('maktabah-nurul-ilmi').filter(countsRevenue).reduce((s,x)=>s+x.pc.subtotal,0)");
  assert.ok(total > 0);
  assert.ok(rev.reduce((s, b) => s + b.v, 0) <= total);
  assert.ok(e.j("topProducts(parcelsOf('maktabah-nurul-ilmi'))").length > 0);
 });
});
