/* Store & logika bisnis PDE Marketplace (tanpa DOM, sehingga dapat diuji unit di Node).
   State aplikasi `S` disimpan di localStorage SAJA UNTUK DEMO: tidak permanen dan tidak dibagi antar perangkat. */
const STATE_VERSION = 1;
const LS_KEY = CFG.storageKey + CFG.dataVersion;
let S;

/* ---------- penyimpanan ---------- */
const safe = fn => { try { return fn(); } catch (e) { return null; } };
const readStore = (name, key) => safe(() => JSON.parse(globalThis[name].getItem(key)));   // nama storage dibaca di dalam safe(): akses localStorage bisa melempar error bila diblokir
function save() {
 try { localStorage.setItem(LS_KEY, JSON.stringify(S)); return true; }
 catch (e) { if (typeof onSaveFail === 'function') onSaveFail(e); return false; }
}
function loadState() {
 const s = readStore('localStorage', LS_KEY);
 return s && s.v === STATE_VERSION && Array.isArray(s.products) ? s : seed();
}
function resetState() {
 safe(() => localStorage.removeItem(LS_KEY)); clearSession();
 S = seed(); save();
}

/* ---------- sesi (hanya id pengguna; "ingat saya" memakai localStorage, selain itu sessionStorage) ---------- */
const getSession = () => (readStore('sessionStorage', CFG.sessionKey) || readStore('localStorage', CFG.sessionKey) || {}).uid || null;
function setSession(id, remember) {
 clearSession();
 safe(() => (remember ? localStorage : sessionStorage).setItem(CFG.sessionKey, JSON.stringify({uid: id})));
}
function clearSession() { safe(() => localStorage.removeItem(CFG.sessionKey)); safe(() => sessionStorage.removeItem(CFG.sessionKey)); }
const me = () => { const id = getSession(); return id ? S.users.find(u => u.id === id) || null : null; };
const isAdmin = () => me()?.role === 'admin';

/* ---------- pemilih (selector) ---------- */
const prod = id => S.products.find(p => p.id === id);
const shop = id => S.shops.find(s => s.id === id);
const userById = id => S.users.find(u => u.id === id);
const myShop = () => { const u = me(); return u && u.shopId ? shop(u.shopId) : null; };
const shopOwner = sid => S.users.find(u => u.shopId === sid) || null;
const catName = id => (catOf(id) || {}).name || id;

const hasVariants = p => !!(p.variants && p.variants.items && p.variants.items.length);
const variantOf = (p, vid) => hasVariants(p) ? p.variants.items.find(v => v.id === vid) || null : null;
const unitPrice = (p, vid) => p.price + (variantOf(p, vid)?.delta || 0);
const stockOf = (p, vid) => p.digital ? Infinity : hasVariants(p) ? (variantOf(p, vid)?.stock ?? 0) : (p.stock || 0);
const totalStock = p => p.digital ? Infinity : hasVariants(p) ? sum(p.variants.items, v => v.stock || 0) : (p.stock || 0);
const maxQtyOf = (p, vid) => p.digital ? 1 : Math.min(stockOf(p, vid), CFG.maxQty);
const stockState = p => { const t = totalStock(p); return t <= 0 ? 'out' : t <= CFG.lowStock ? 'low' : 'ok'; };
const discountPct = p => p.was && p.was > p.price ? Math.round((1 - p.price / p.was) * 100) : 0;
const listed = p => p.active !== false && !!shop(p.shop) && shop(p.shop).active !== false;
const galleryOf = p => p.imgs && p.imgs.length ? p.imgs : (PRODUCT_IMG[p.id] || []);
function mainImage(p, vid) {
 const g = galleryOf(p), v = variantOf(p, vid), i = v && v.img != null ? v.img : 0;
 return (g[i] || g[0] || {}).src || SITE_IMG.cats[p.cat] || SITE_IMG.placeholder;
}
const reviewsOf = id => S.reviews.filter(r => r.pid === id);
function ratingOf(id) {
 const rs = reviewsOf(id);
 return rs.length ? {avg: sum(rs, r => r.rating) / rs.length, n: rs.length} : null;
}
const shopRating = sid => {
 const rs = S.reviews.filter(r => prod(r.pid)?.shop === sid);
 return rs.length ? {avg: sum(rs, r => r.rating) / rs.length, n: rs.length} : null;
};
const shopProducts = sid => S.products.filter(p => p.shop === sid && listed(p));
const canManageProduct = p => !!p && (isAdmin() || (!!myShop() && p.shop === myShop().id));

/* ---------- pencarian & filter katalog ---------- */
const SYN = {peci: ['kopiah', 'songkok'], kopiah: ['peci', 'songkok'], songkok: ['peci', 'kopiah'], hijab: ['jilbab', 'kerudung'], jilbab: ['hijab', 'kerudung'], kerudung: ['hijab', 'jilbab'],
 quran: ['alquran', 'al quran', 'mushaf'], alquran: ['quran', 'mushaf'], mushaf: ['quran', 'alquran'], mukenah: ['mukena'], buku: ['kitab'], ebook: ['e book', 'pdf'], tas: ['ransel', 'tote']};
function searchScore(p, tokens) {
 const name = norm(p.name), tags = norm((p.tags || []).join(' ')), cat = norm(((catOf(p.cat) || {}).kw || []).join(' ')), sh = norm(shop(p.shop)?.name), desc = norm(p.desc);
 const words = name.split(' ');
 let score = 0;
 for (const t of tokens) {
  let best = 0;
  for (const a of [t, ...(SYN[t] || []).map(norm)]) {
   if (words.some(w => w.startsWith(a))) best = Math.max(best, 5); else if (name.includes(a)) best = Math.max(best, 4);
   if (tags.includes(a)) best = Math.max(best, 3);
   if (cat.includes(a) || sh.includes(a)) best = Math.max(best, 2);
   if (desc.includes(a)) best = Math.max(best, 1);
  }
  if (!best) return 0;                                   // semua kata kunci harus cocok
  score += best;
 }
 return score;
}
/* f: {q, cat:[], shop, min, max, stock, sale, rate, sort} */
function queryProducts(f = {}) {
 let list = S.products.filter(listed);
 const tokens = norm(f.q || '').split(' ').filter(Boolean), scores = new Map();
 if (tokens.length) list = list.filter(p => { const s = searchScore(p, tokens); if (s) scores.set(p.id, s); return s > 0; });
 if (f.cat && f.cat.length) list = list.filter(p => f.cat.includes(p.cat));
 if (f.shop) list = list.filter(p => p.shop === f.shop);
 if (f.stock) list = list.filter(p => totalStock(p) > 0);
 if (f.sale) list = list.filter(p => discountPct(p) > 0);
 if (f.rate) list = list.filter(p => (ratingOf(p.id)?.avg || 0) >= f.rate);
 if (f.min) list = list.filter(p => p.price >= f.min);
 if (f.max) list = list.filter(p => p.price <= f.max);
 const sort = f.sort || (tokens.length ? 'rel' : 'pop');
 const rt = p => ratingOf(p.id) || {avg: 0, n: 0};
 const by = {
  rel: (a, b) => (scores.get(b.id) || 0) - (scores.get(a.id) || 0) || b.sold - a.sold,
  pop: (a, b) => b.sold - a.sold, new: (a, b) => b.created - a.created,
  pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price,
  rate: (a, b) => rt(b).avg - rt(a).avg || rt(b).n - rt(a).n
 }[sort] || ((a, b) => b.sold - a.sold);
 list.sort(by);
 if (sort !== 'pa' && sort !== 'pd') list = [...list.filter(p => totalStock(p) > 0), ...list.filter(p => totalStock(p) <= 0)];   // stok habis di akhir
 return list;
}
function suggestions(q, limit = 5) {
 const tokens = norm(q).split(' ').filter(Boolean);
 if (!tokens.length) return {products: [], cats: []};
 const cats = CATS.filter(c => tokens.every(t => norm(c.name).includes(t))).slice(0, 2);
 return {products: queryProducts({q}).slice(0, limit), cats};
}

/* ---------- keranjang ---------- */
const lineKey = (id, vid) => id + '|' + (vid || '');
function cartLines(src = S.cart) {
 return src.map(i => {
  const p = prod(i.id);
  if (!p || !listed(p)) return null;
  const v = variantOf(p, i.vid);
  if (hasVariants(p) && !v) return null;
  const stock = stockOf(p, i.vid);
  return {id: i.id, vid: i.vid || null, qty: i.qty, key: lineKey(i.id, i.vid), p, v, price: unitPrice(p, i.vid), stock, over: i.qty > stock, shop: shop(p.shop)};
 }).filter(Boolean);
}
const cartCount = () => sum(cartLines(), l => l.qty);
const fail = msg => ({ok: false, msg});
/* validasi pemilihan varian, kuantitas, dan stok sebelum masuk keranjang */
function checkAdd(id, vid, qty, existing = 0) {
 const p = prod(id);
 if (!p || !listed(p)) return fail('Produk ini sudah tidak tersedia.');
 if (hasVariants(p)) {
  if (!vid) return fail(`Pilih ${p.variants.label.toLowerCase()} terlebih dahulu.`);
  if (!variantOf(p, vid)) return fail('Pilihan varian tidak valid.');
 }
 qty = Math.floor(+qty);
 if (!(qty >= 1)) return fail('Jumlah minimal 1.');
 const stock = stockOf(p, vid);
 if (stock <= 0) return fail('Stok produk ini sedang habis.');
 if (p.digital) return existing >= 1 ? fail('Produk digital ini sudah ada di keranjang.') : qty > 1 ? fail('Produk digital hanya dapat dibeli 1 kali per pesanan.') : {ok: true, p, qty};
 if (existing + qty > Math.min(stock, CFG.maxQty)) return fail(existing ? `Stok hanya ${stock}. Di keranjang Anda sudah ada ${existing}.` : `Stok hanya tersisa ${stock}.`);
 return {ok: true, p, qty};
}
function addToCart(id, vid, qty = 1) {
 const ex = S.cart.find(i => i.id === id && (i.vid || '') === (vid || ''));
 const r = checkAdd(id, vid, qty, ex ? ex.qty : 0);
 if (!r.ok) return r;
 if (ex) ex.qty += r.qty; else S.cart.push({id, vid: vid || null, qty: r.qty});
 S.vErr = null; save();
 return {ok: true, qty: r.qty};
}
function setCartQty(key, qty) {
 const l = cartLines().find(x => x.key === key);
 if (!l) return fail('Item tidak ditemukan.');
 const max = maxQtyOf(l.p, l.vid);
 const it = S.cart.find(i => lineKey(i.id, i.vid) === key);
 const want = Math.floor(+qty);
 if (!(want >= 1)) return fail('Jumlah minimal 1. Gunakan Hapus untuk mengeluarkan item.');
 it.qty = Math.min(want, max); S.vErr = null; save();
 return want > max ? {ok: true, clamped: true, msg: max <= 0 ? 'Stok habis.' : `Jumlah disesuaikan dengan stok (${max}).`} : {ok: true};
}
const removeCart = key => { S.cart = S.cart.filter(i => lineKey(i.id, i.vid) !== key); save(); };

/* ---------- voucher ---------- */
function voucherCheck(code, sub) {
 const v = S.vouchers.find(x => x.code === String(code || '').trim().toUpperCase());
 if (!v) return [null, 'Kode voucher tidak ditemukan. Periksa penulisannya.'];
 if (v.exp < Date.now()) return [null, `Voucher ini kedaluwarsa pada ${fdate(v.exp)}.`];
 if (v.used >= v.quota) return [null, 'Kuota voucher ini sudah habis.'];
 if (sub < v.min) return [null, `Belanja ${rp(v.min - sub)} lagi untuk memakai voucher ini (minimum ${rp(v.min)}).`];
 return [v, null];
}
function voucherEffect(v, sub, shipFee) {
 if (!v) return {disc: 0, shipDisc: 0};
 if (v.type === 'pct') return {disc: Math.min(Math.round(sub * v.val / 100), v.cap || Infinity), shipDisc: 0};
 if (v.type === 'fix') return {disc: Math.min(v.val, sub), shipDisc: 0};
 return {disc: 0, shipDisc: Math.min(v.val, shipFee)};
}
const voucherLabel = v => v.type === 'pct' ? `Diskon ${v.val}%${v.cap ? ` (maks. ${rp(v.cap)})` : ''}` : v.type === 'fix' ? `Potongan ${rp(v.val)}` : `Subsidi ongkir hingga ${rp(v.val)}`;

/* ---------- ongkos kirim (SIMULASI) ---------- */
const sameText = (a, b) => norm(a) === norm(b);
function zoneOf(sh, addr) {
 if (!addr || !sh) return 'national';
 if (sameText(sh.prov, addr.prov)) return sameText(sh.city, addr.city) ? 'local' : 'regional';
 return 'national';
}
function shipOptions(weightG, zone) {
 const z = ZONES[zone], kg = Math.max(1, Math.ceil(weightG / 1000));
 return COURIERS.map(c => ({
  id: c.id, name: c.name, note: c.note, zone: z.name,
  cost: Math.round((z.base + z.perKg * (kg - 1)) * c.mult / 500) * 500,
  eta: [Math.max(1, z.eta[0] + c.etaShift), Math.max(1, z.eta[1] + c.etaShift)]
 }));
}
/* kelompokkan item per toko; produk digital dipisah karena tidak dikirim */
function buildParcels(lines) {
 const map = new Map();
 for (const l of lines) {
  const key = l.p.shop + (l.p.digital ? ':digital' : ':fisik');
  if (!map.has(key)) map.set(key, {key, sid: l.p.shop, digital: !!l.p.digital, lines: []});
  map.get(key).lines.push(l);
 }
 return [...map.values()].map(pc => ({...pc, shop: shop(pc.sid), subtotal: sum(pc.lines, l => l.price * l.qty), weight: sum(pc.lines, l => (l.p.weight || 0) * l.qty)}));
}
function checkoutTotals(lines, addr, choice = {}, voucherCode = null) {
 const parcels = buildParcels(lines);
 for (const pc of parcels) {
  if (pc.digital) { pc.opts = []; pc.ship = null; continue; }
  pc.opts = shipOptions(pc.weight, zoneOf(pc.shop, addr));
  pc.ship = pc.opts.find(o => o.id === choice[pc.key]) || pc.opts[0];
 }
 const sub = sum(parcels, p => p.subtotal), shipFee = sum(parcels, p => p.ship ? p.ship.cost : 0);
 let voucher = null, vErr = null;
 if (voucherCode) { const [v, err] = voucherCheck(voucherCode, sub); voucher = v; vErr = err; }
 const {disc, shipDisc} = voucherEffect(voucher, sub, shipFee);
 return {parcels, sub, shipFee, voucher, vErr, disc, shipDisc, total: sub - disc + shipFee - shipDisc, needsAddress: parcels.some(p => !p.digital)};
}

/* ---------- pesanan ---------- */
const PAY_METHODS = [['QRIS', 'Pindai dengan aplikasi bank atau e-wallet'], ['Virtual account · BCA', 'Transfer lewat m-banking atau ATM'], ['Virtual account · BNI', ''], ['Virtual account · Mandiri', ''], ['Virtual account · BRI', ''], ['E-wallet · GoPay', ''], ['E-wallet · OVO', ''], ['E-wallet · DANA', '']];
const PARCEL_FLOW = {Dikemas: ['Dikirim', 'Dibatalkan'], Dikirim: ['Selesai']};
function newOrderId() {
 const d = new Date(), ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
 let id;
 do { id = `SM-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; } while (S.orders.some(o => o.id === id));
 return id;
}
function makeOrder({id, user, addr, lines, choice = {}, voucher = null, notes = {}, payMethod = 'QRIS', created = Date.now()}) {
 const t = checkoutTotals(lines, addr, choice, voucher);
 return {
  id, userId: user.id, customer: user.name, email: user.email, phone: (addr && addr.phone) || user.phone || '',
  address: addr ? {...addr} : null,
  parcels: t.parcels.map(pc => ({
   key: pc.key, sid: pc.sid, shopName: pc.shop.name, digital: pc.digital,
   items: pc.lines.map(l => ({id: l.id, vid: l.vid, vname: l.v ? l.v.name : '', vlabel: l.v ? l.p.variants.label : '', name: l.p.name, price: l.price, qty: l.qty, img: mainImage(l.p, l.vid), digital: !!l.p.digital})),
   subtotal: pc.subtotal, ship: pc.ship ? {id: pc.ship.id, name: pc.ship.name, cost: pc.ship.cost, eta: pc.ship.eta} : null,
   note: notes[pc.key] || '', status: 'Menunggu Pembayaran', resi: '', history: [{s: 'Pesanan dibuat', t: created}]
  })),
  subtotal: t.sub, discount: t.disc, shipFee: t.shipFee, shipDisc: t.shipDisc, voucher: t.voucher ? t.voucher.code : null, total: t.total,
  pay: 'pending', payMethod, created, deadline: created + CFG.payWindowHours * HOUR, paidAt: null
 };
}
function reserveStock(o, dir) {      // dir = -1 menahan stok, +1 mengembalikan
 for (const pc of o.parcels) for (const it of pc.items) {
  if (it.digital) continue;
  const p = prod(it.id); if (!p) continue;
  if (hasVariants(p)) { const v = variantOf(p, it.vid); if (v) v.stock = Math.max(0, (v.stock || 0) + dir * it.qty); }
  else p.stock = Math.max(0, (p.stock || 0) + dir * it.qty);
 }
}
const notify = (uid_, m, link = '') => { if (uid_) S.notes.unshift({id: uid('n'), uid: uid_, t: Date.now(), m, link, r: false}); };
const setParcel = (pc, status, m = '', t = Date.now()) => { pc.status = status; pc.history.push({s: status, t, m}); };

/* membuat pesanan dari baris keranjang; memvalidasi ulang stok sebelum menyimpan */
function createOrder({user, addr, lines, choice, voucher, notes, payMethod, fromCart}) {
 if (!lines.length) return fail('Tidak ada item untuk dipesan.');
 const need = new Map();
 for (const l of lines) need.set(l.key, (need.get(l.key) || 0) + l.qty);
 for (const l of lines) {
  const p = prod(l.id);
  if (!p || !listed(p)) return fail(`"${l.p.name}" sudah tidak tersedia. Hapus dari keranjang.`);
  if (need.get(l.key) > stockOf(p, l.vid)) return fail(`Stok "${p.name}"${l.v ? ' (' + l.v.name + ')' : ''} tidak mencukupi (tersisa ${stockOf(p, l.vid)}).`);
 }
 const t = checkoutTotals(lines, addr, choice, voucher);
 if (t.needsAddress && !addr) return fail('Pilih atau tambahkan alamat pengiriman.');
 if (voucher && !t.voucher) return fail(t.vErr);
 const o = makeOrder({id: newOrderId(), user, addr: t.needsAddress ? addr : null, lines, choice, voucher, notes, payMethod});
 reserveStock(o, -1);
 if (t.voucher) t.voucher.used++;
 S.orders.unshift(o);
 if (fromCart) S.cart = []; else S.direct = null;
 S.voucher = null; S.vErr = null;
 notify(user.id, `Pesanan ${o.id} dibuat. Selesaikan pembayaran sebelum ${fdt(o.deadline)}.`, '/bayar/' + o.id);
 save();
 return {ok: true, order: o};
}
function markPaid(o) {
 if (o.pay === 'paid') return;
 o.pay = 'paid'; o.paidAt = Date.now();
 for (const pc of o.parcels) {
  for (const it of pc.items) { const p = prod(it.id); if (p) p.sold += it.qty; }
  if (pc.digital) setParcel(pc, 'Selesai', 'Produk digital siap diunduh'); else setParcel(pc, 'Dikemas', 'Pembayaran diterima. Penjual mengemas pesanan');
 }
 notify(o.userId, `Pembayaran pesanan ${o.id} diterima (simulasi).`, '/akun/pesanan/' + o.id);
 for (const sid of new Set(o.parcels.map(p => p.sid))) { const ow = shopOwner(sid); if (ow) notify(ow.id, `Pesanan baru ${o.id} perlu diproses.`, '/penjual/pesanan/' + o.id); }
}
function closeOrder(o, pay, why) {   // kedaluwarsa / dibatalkan sebelum dibayar: stok & voucher dikembalikan
 if (o.pay === 'paid' || o.pay === 'expired' || o.pay === 'cancelled') return false;
 o.pay = pay; reserveStock(o, +1);
 if (o.voucher) { const v = S.vouchers.find(x => x.code === o.voucher); if (v) v.used = Math.max(0, v.used - 1); }
 for (const pc of o.parcels) setParcel(pc, 'Dibatalkan', why);
 return true;
}
function checkExpiry(o, now = Date.now()) {
 if ((o.pay === 'pending' || o.pay === 'failed') && now > o.deadline && closeOrder(o, 'expired', 'Batas waktu pembayaran habis')) {
  notify(o.userId, `Pesanan ${o.id} dibatalkan otomatis karena belum dibayar.`, '/akun/pesanan/' + o.id);
  return true;
 }
 return false;
}
const expireAll = () => { let ch = false; for (const o of S.orders) if (checkExpiry(o)) ch = true; if (ch) save(); return ch; };

/* status pesanan turunan dari pembayaran + status tiap paket. Produk digital (langsung selesai) tidak dihitung
   bila ada paket fisik, agar status mencerminkan pengiriman barang. */
function orderStatus(o) {
 if (o.pay === 'pending') return 'Menunggu Pembayaran';
 if (o.pay === 'failed') return 'Pembayaran Gagal';
 if (o.pay === 'expired') return 'Kedaluwarsa';
 if (o.pay === 'cancelled') return 'Dibatalkan';
 const live = o.parcels.filter(p => p.status !== 'Dibatalkan');
 if (!live.length) return 'Dibatalkan';
 const phys = live.filter(p => !p.digital), st = (phys.length ? phys : live).map(p => p.status);
 if (st.every(s => s === 'Selesai')) return 'Selesai';
 if (st.some(s => s === 'Dikirim' || s === 'Selesai')) return st.every(s => s === 'Dikirim' || s === 'Selesai') ? 'Dikirim' : 'Sebagian Dikirim';
 return 'Dikemas';
}
/* aksi pada satu paket pesanan: ship (penjual/admin), cancel (penjual/admin), receive (pembeli/admin) */
function parcelAction(o, idx, action, data = {}) {
 const u = me(), pc = o && o.parcels[idx];
 if (!u) return fail('Silakan masuk terlebih dahulu.');
 if (!pc) return fail('Paket pesanan tidak ditemukan.');
 if (o.pay !== 'paid') return fail('Pesanan belum dibayar.');
 const isSeller = u.shopId && u.shopId === pc.sid, isBuyer = u.id === o.userId, admin = u.role === 'admin';
 const to = {ship: 'Dikirim', cancel: 'Dibatalkan', receive: 'Selesai'}[action];
 if (!to || !(PARCEL_FLOW[pc.status] || []).includes(to)) return fail(`Status "${pc.status}" tidak dapat diubah menjadi "${to || action}".`);
 if (action === 'receive' ? !(isBuyer || admin) : !(isSeller || admin)) return fail('Anda tidak berwenang melakukan aksi ini.');
 if (action === 'ship') {
  const resi = String(data.resi || '').trim().toUpperCase();
  if (!/^[A-Z0-9-]{6,24}$/.test(resi)) return fail('Nomor resi 6–24 karakter (huruf/angka).');
  pc.resi = resi; setParcel(pc, 'Dikirim', `Dikirim dengan ${pc.ship ? pc.ship.name : 'kurir'}, resi ${resi}`);
  notify(o.userId, `Paket dari ${pc.shopName} (pesanan ${o.id}) dikirim. Resi ${resi}.`, '/akun/pesanan/' + o.id);
 } else if (action === 'cancel') {
  const reason = String(data.reason || '').trim();
  if (reason.length < 5) return fail('Tulis alasan pembatalan (minimal 5 karakter).');
  for (const it of pc.items) if (!it.digital) { const p = prod(it.id); if (p) { if (hasVariants(p)) { const v = variantOf(p, it.vid); if (v) v.stock += it.qty; } else p.stock = (p.stock || 0) + it.qty; p.sold = Math.max(0, p.sold - it.qty); } }
  pc.refund = pc.subtotal + (pc.ship ? pc.ship.cost : 0);
  setParcel(pc, 'Dibatalkan', `Dibatalkan penjual: ${reason}. Dana dikembalikan (simulasi)`);
  notify(o.userId, `Paket dari ${pc.shopName} (pesanan ${o.id}) dibatalkan penjual. Dana ${rp(pc.refund)} dikembalikan (simulasi).`, '/akun/pesanan/' + o.id);
 } else {
  setParcel(pc, 'Selesai', 'Pesanan diterima pembeli');
  const ow = shopOwner(pc.sid); if (ow) notify(ow.id, `Pesanan ${o.id} dikonfirmasi diterima pembeli.`, '/penjual/pesanan/' + o.id);
 }
 save();
 return {ok: true};
}
function cancelOrder(o) {                       // pembeli membatalkan pesanan yang belum dibayar
 const u = me();
 if (!u || (u.id !== o.userId && u.role !== 'admin')) return fail('Anda tidak berwenang membatalkan pesanan ini.');
 if (o.pay !== 'pending' && o.pay !== 'failed') return fail('Hanya pesanan yang belum dibayar yang dapat dibatalkan.');
 closeOrder(o, 'cancelled', 'Dibatalkan oleh pembeli');
 notify(o.userId, `Pesanan ${o.id} dibatalkan.`, '/akun/pesanan/' + o.id);
 save();
 return {ok: true};
}
const hasPurchased = (userId, pid) => S.orders.some(o => o.userId === userId && o.pay === 'paid' && o.parcels.some(pc => pc.status === 'Selesai' && pc.items.some(i => i.id === pid)));
function addReview(pid, rating, text) {
 const u = me();
 if (!u) return fail('Silakan masuk untuk menulis ulasan.');
 if (!(rating >= 1 && rating <= 5)) return fail('Pilih rating 1–5.');
 if (String(text || '').trim().length < 10) return fail('Ulasan minimal 10 karakter.');
 if (S.reviews.some(r => r.pid === pid && r.uid === u.id)) return fail('Anda sudah mengulas produk ini.');
 S.reviews.unshift({id: uid('r'), pid, uid: u.id, name: u.name, rating: +rating, text: String(text).trim(), t: Date.now(), verified: hasPurchased(u.id, pid)});
 save();
 return {ok: true};
}

/* ---------- data dashboard ---------- */
function parcelsOf(sid) {                       // semua paket milik satu toko (sid kosong = semua toko)
 const out = [];
 for (const o of S.orders) o.parcels.forEach((pc, i) => { if (!sid || pc.sid === sid) out.push({o, pc, i}); });
 return out;
}
const countsRevenue = ({o, pc}) => o.pay === 'paid' && pc.status !== 'Dibatalkan';
function revenueByDay(items, days = 14) {
 const start = new Date(); start.setHours(0, 0, 0, 0);
 const buckets = [...Array(days)].map((_, i) => { const d = new Date(start); d.setDate(d.getDate() - (days - 1 - i)); return {t: d.getTime(), v: 0}; });
 for (const it of items) {
  if (!countsRevenue(it)) continue;
  const b = buckets.find(x => it.o.created >= x.t && it.o.created < x.t + DAY);
  if (b) b.v += it.pc.subtotal;
 }
 return buckets;
}
function topProducts(items, n = 5) {
 const m = new Map();
 for (const it of items) if (countsRevenue(it)) for (const i of it.pc.items) { const r = m.get(i.id) || {id: i.id, name: i.name, qty: 0, rev: 0}; r.qty += i.qty; r.rev += i.price * i.qty; m.set(i.id, r); }
 return [...m.values()].sort((a, b) => b.rev - a.rev).slice(0, n);
}

/* ---------- manajemen produk (penjual/admin) ---------- */
function saveProduct(data, id) {
 const u = me();
 if (!u) return fail('Silakan masuk terlebih dahulu.');
 let p = id ? prod(id) : null;
 if (id && !p) return fail('Produk tidak ditemukan.');
 if (p && !canManageProduct(p)) return fail('Anda tidak berwenang mengubah produk ini.');
 const sid = p ? p.shop : (u.role === 'admin' ? data.shop : u.shopId);
 if (!sid || !shop(sid)) return fail('Toko tidak valid. Buka toko terlebih dahulu.');
 if (!p) { p = {id: nextProductId(), shop: sid, sold: 0, created: Date.now()}; S.products.unshift(p); }
 Object.assign(p, data, {shop: sid});
 save();
 return {ok: true, p};
}
function nextProductId() { let n = 1000 + S.products.length; while (S.products.some(p => p.id === 'n-' + n)) n++; return 'n-' + n; }
function deleteProduct(id) {
 const p = prod(id);
 if (!p) return fail('Produk tidak ditemukan.');
 if (!canManageProduct(p)) return fail('Anda tidak berwenang menghapus produk ini.');
 S.products = S.products.filter(x => x.id !== id);
 S.cart = S.cart.filter(i => i.id !== id); S.wish = S.wish.filter(x => x !== id); S.reviews = S.reviews.filter(r => r.pid !== id);
 if (S.direct && S.direct.id === id) S.direct = null;
 save();
 return {ok: true};
}
function openShop(data) {
 const u = me();
 if (!u) return fail('Silakan masuk terlebih dahulu.');
 if (u.shopId) return fail('Akun Anda sudah memiliki toko.');
 if (S.shops.some(s => norm(s.name) === norm(data.name))) return fail('Nama toko sudah dipakai. Pilih nama lain.');
 let id = norm(data.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'toko'; const base = id; let n = 2;
 while (S.shops.some(s => s.id === id)) id = base + '-' + n++;
 const sh = {id, name: data.name.trim(), type: data.type, city: data.city.trim(), prov: data.prov, since: new Date().getFullYear(), color: '#0F6B4B', owner: u.name, desc: data.desc.trim(), active: true};
 S.shops.push(sh); u.shopId = id; save();
 return {ok: true, shop: sh};
}

/* ---------- pesan ---------- */
function sendMessage({to, from, pid = null, subject, text}) {
 if (String(text || '').trim().length < 10) return fail('Pesan minimal 10 karakter.');
 const m = {id: uid('m'), to, from, pid, subject: subject || 'Pertanyaan', text: String(text).trim(), t: Date.now(), read: false};
 S.messages.unshift(m);
 const ow = to === 'platform' ? null : shopOwner(to);
 if (ow) notify(ow.id, `Pesan baru dari ${from.name}: ${m.subject}`, '/penjual/pesan');
 save();
 return {ok: true, m};
}
