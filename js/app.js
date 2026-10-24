/* PDE Marketplace - router, aksi (data-act), form (data-form), dan inisialisasi.
   Urutan skrip ada di index.html; berkas ini dimuat paling akhir. */

/* ===== Router ===== */
const route = () => {
 const h = location.hash.slice(1) || '/', [p, qs] = h.split('?');
 const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
 return {parts: p.split('/').filter(Boolean).map(dec), q: new URLSearchParams(qs || ''), path: p};
};
function go(h) { const t = '#' + h; if (location.hash === t) render(); else location.hash = t; }
const PAGES = {
 '': homePage, produk: r => r.parts[1] ? productPage(r) : catalogPage(r), toko: r => r.parts[1] ? shopPage(r) : shopsPage(),
 keranjang: cartPage, favorit: () => wishPage(false), checkout: checkoutPage, bayar: paymentPage, lacak: trackPage,
 masuk: loginPage, daftar: registerPage, 'lupa-sandi': forgotPage, verifikasi: otpPage, 'sandi-baru': resetPage,
 akun: accountPage, 'buka-toko': openShopPage, tentang: aboutPage, bantuan: helpPage, kontak: contactPage,
 syarat: () => legalPage('syarat'), privasi: () => legalPage('privasi')
};
let lastPath = null, after = [], scrollTarget = null, firstRender = true;

const attrSel = (k, v) => `[data-${k}="${String(v).replace(/["\\]/g, '\\$&')}"]`;
function focusSig(el) {                      // petunjuk untuk mengembalikan fokus setelah render ulang
 if (!el || el === document.body || !el.closest) return null;
 if (el.id) return '#' + CSS.escape(el.id);
 const a = el.dataset && el.dataset.act; if (!a) return null;
 return `[data-act="${a}"]` + ['id', 'key', 'i', 'oid', 'pid', 't', 'p', 'k', 'v', 'code', 'shop'].filter(k => el.dataset[k] != null).map(k => attrSel(k, el.dataset[k])).join('') + (el.type === 'radio' ? `[value="${String(el.value).replace(/["\\]/g, '\\$&')}"]` : '');
}
function render() {
 const r = route(), root = r.parts[0] || '', app = $('#app');
 const sig = focusSig(document.activeElement), samePath = r.path === lastPath;
 expireAll();
 document.body.classList.remove('has-mbar');
 if (!samePath) ui.filtersOpen = false;
 let body;
 if (root === 'penjual' || root === 'admin') {
  const out = safeRender(() => dashPage(r, root));
  app.innerHTML = out.startsWith('<div class="adm">') ? out : header(r) + `<main id="main" tabindex="-1">${out}</main>` + footer();   // penolakan akses/arahan login tetap memakai kerangka situs
 }
 else {
  const pg = PAGES[root];
  body = safeRender(() => pg ? pg(r) : notFound());
  app.innerHTML = header(r) + `<main id="main" tabindex="-1">${body}</main>` + footer();
  if (root === 'produk' && r.parts[1] && $('.pd')) document.body.classList.add('has-mbar');
 }
 document.body.classList.toggle('no-scroll', ui.filtersOpen);
 const h1 = $('main h1, .adm-main h1');
 document.title = root === '' ? `${BRAND.name} (${BRAND.fullName})` : `${h1 ? h1.textContent.trim() : BRAND.name} · ${BRAND.name}`;
 if (!samePath) { window.scrollTo(0, 0); lastPath = r.path; if (!firstRender) $('#main')?.focus({preventScroll: true}); }
 else if (scrollTarget) { const t = $(scrollTarget); t && t.scrollIntoView({block: 'start'}); }
 scrollTarget = null;
 after.forEach(fn => fn()); after = [];
 if (samePath && sig) { const t = $(sig); if (t && t !== document.activeElement) t.focus({preventScroll: true}); }
 firstRender = false;
 document.documentElement.dataset.rendered = location.hash;       // penanda selesai render (dipakai pengujian otomatis)
}
function safeRender(fn) { try { return fn(); } catch (e) { console.error(e); return errorPage(); } }

/* ===== Helper umum ===== */
function setQ(mut, keepPage) {                // ubah query katalog lalu pindah ke #/produk?...
 const r = route(), q = new URLSearchParams(r.parts[0] === 'produk' ? r.q : ''); mut(q);
 if (!keepPage) q.delete('page');
 go('/produk' + (q.toString() ? '?' + q : ''));
}
function setDashQ(scope, mut) { const r = route(), q = new URLSearchParams(r.q); mut(q); q.delete('page'); go(`/${scope}/${r.parts[1] || ''}${q.toString() ? '?' + q : ''}`.replace(/\/$/, '')); }
const lockBtn = btn => {                      // cegah kirim ganda untuk proses async
 if (!btn) return () => {};
 btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = '<span class="spin" aria-hidden="true"></span> Memproses…'; btn.setAttribute('aria-busy', 'true');
 return () => { if (btn.isConnected) { btn.disabled = false; btn.innerHTML = btn.dataset.t; btn.removeAttribute('aria-busy'); } };
};
const copyText = (text, okMsg) => {
 const fb = () => toast('Salin manual: ' + text, 'bad');
 if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(okMsg), fb); else fb();
};
function currentSub() { const r = route(); return sum(r.parts[0] === 'checkout' ? checkoutLines(r).lines : cartLines(), l => l.price * l.qty); }
function applyVoucher(code) {
 const [v, err] = voucherCheck(code, currentSub());
 if (!v) { S.vErr = err; save(); render(); $('[data-err="code"]')?.scrollIntoView({block: 'nearest'}); toast(err, 'bad'); return; }
 S.voucher = v.code; S.vErr = null; save(); render(); toast(`Voucher ${v.code} dipasang`);
}
function shrink(file, max = 640) {
 return new Promise((res, rej) => {
  if (!file.type.startsWith('image/')) return rej('Pilih berkas gambar (JPG, PNG, atau WebP).');
  if (file.size > 8 * 1024 * 1024) return rej('Ukuran gambar maksimal 8 MB.');
  const fr = new FileReader();
  fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .78)); }; im.onerror = () => rej('Gambar tidak dapat dibaca.'); im.src = fr.result; };
  fr.onerror = () => rej('Berkas tidak dapat dibaca.'); fr.readAsDataURL(file);
 });
}
function onSaveFail() { if (!onSaveFail.warned) { onSaveFail.warned = true; toast('Penyimpanan browser penuh atau diblokir. Perubahan terakhir mungkin tidak tersimpan.', 'bad'); } }
function closeMenus(except) {
 $$('.menu:not([hidden])').forEach(m => { if (m !== except) { m.hidden = true; const b = $(`[aria-controls="${m.id}"]`); b && b.setAttribute('aria-expanded', 'false'); } });
}
function setDrawer(open) {
 $('#drawer')?.classList.toggle('open', open); $('.drawer-bg')?.classList.toggle('open', open);
 $('#drawer')?.setAttribute('aria-hidden', String(!open)); $('.burger')?.setAttribute('aria-expanded', String(open));
 document.body.classList.toggle('no-scroll', open || ui.filtersOpen);
 if (!open) { const c = $('#drawer-cats'); if (c) { c.hidden = true; $('[data-act=drawerCats]')?.setAttribute('aria-expanded', 'false'); } }      // akordeon kategori menutup bersama drawer
 if (open) setTimeout(() => $('#drawer a')?.focus(), 60); else if (document.activeElement && $('#drawer')?.contains(document.activeElement)) $('.burger')?.focus();
}
const findOrder = id => S.orders.find(o => o.id === id);

/* ===== Aksi (klik) ===== */
const A = {
 closeModal: () => closeModal(),
 toTop: () => window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}),
 skip: (b, e) => { e.preventDefault(); const m = $('#main'); m && (m.setAttribute('tabindex', '-1'), m.focus()); },
 blocked: (b, e) => { e.preventDefault(); toast('Kurangi jumlah barang yang melebihi stok terlebih dahulu.', 'bad'); },
 scrollTo: b => { const t = document.getElementById(b.dataset.target); if (!t) return; t.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'}); const h = t.querySelector('[tabindex="-1"]'); h && setTimeout(() => h.focus({preventScroll: true}), 450); },
 menu: (b, e) => { const m = $('#menu-' + b.dataset.menu); if (!m) return; const open = m.hidden; closeMenus(m); m.hidden = !open; b.setAttribute('aria-expanded', String(open)); if (open) m.querySelector('a,button')?.focus(); e.stopPropagation(); },
 drawer: () => setDrawer(!$('#drawer').classList.contains('open')),
 drawerClose: () => setDrawer(false),
 drawerCats: b => { const el = $('#drawer-cats'); el.hidden = !el.hidden; b.setAttribute('aria-expanded', String(!el.hidden)); },
 admMenu: () => { const s = $('#admSide'), open = !s.classList.contains('open'); s.classList.toggle('open', open); $('#admBg').classList.toggle('open', open); $('.adm-burger')?.setAttribute('aria-expanded', String(open)); },
 admClose: () => { $('#admSide')?.classList.remove('open'); $('#admBg')?.classList.remove('open'); },
 /* pencarian & katalog */
 clearSearch: () => { const i = $('#hs'); if (!i) return; i.value = ''; $('.hs-clear').hidden = true; hideSuggest(); i.focus(); const r = route(); if (r.parts[0] === 'produk' && r.q.get('q')) setQ(q => q.delete('q')); },
 clearQ: () => setQ(q => q.delete('q')),
 clearFilters: () => go('/produk'),
 filters: () => { ui.filtersOpen = !ui.filtersOpen; render(); if (ui.filtersOpen) setTimeout(() => $('#filters input, #filters button')?.focus(), 30); else $('.filt-btn')?.focus(); },
 rmFilter: b => setQ(q => { const k = b.dataset.k, v = b.dataset.v, all = q.getAll(k).filter(x => x !== v); q.delete(k); all.forEach(x => q.append(k, x)); if (k === 'min' || k === 'max') q.delete(k); }),
 pricePreset: b => setQ(q => { +b.dataset.min ? q.set('min', b.dataset.min) : q.delete('min'); +b.dataset.max ? q.set('max', b.dataset.max) : q.delete('max'); }),
 page: b => { scrollTarget = '#hasil'; setQ(q => q.set('page', b.dataset.p), true); },
 dashPage: b => { const r = route(), q = new URLSearchParams(r.q); q.set('page', b.dataset.p); go(`/${r.parts[0]}/${r.parts[1] || ''}?${q}`); },
 dashFilter: s => setDashQ(route().parts[0], q => s.value ? q.set(s.dataset.k, s.value) : q.delete(s.dataset.k)),
 /* favorit & produk */
 wish: b => { const id = b.dataset.id, i = S.wish.indexOf(id); if (i > -1) { S.wish.splice(i, 1); toast('Dihapus dari favorit'); } else { S.wish.push(id); toast('Disimpan ke favorit'); } save(); render(); },
 quickAdd: b => {
  const p = prod(b.dataset.id); if (!p) return;
  if (hasVariants(p)) return variantPickerModal(p);
  const r = addToCart(p.id, null, 1);
  if (r.ok) { toast(`“${p.name}” masuk keranjang`); render(); } else toast(r.msg, 'bad');
 },
 addCart: b => {
  const r = addToCart(b.dataset.id, pdState.vid, pdState.qty);
  if (!r.ok) { pdState.err = r.msg; render(); const t = $('#variant-box input:not([disabled])') || $('#pd-err'); t && t.scrollIntoView({block: 'center'}); (hasVariants(prod(b.dataset.id)) && !pdState.vid ? $('#variant-box input:not([disabled])') : null)?.focus({preventScroll: true}); return; }
  pdState.err = ''; toast(`${pdState.qty} barang ditambahkan ke keranjang`); render();
 },
 buyNow: b => {
  const r = checkAdd(b.dataset.id, pdState.vid, pdState.qty, 0);
  if (!r.ok) { pdState.err = r.msg; render(); $('#variant-box input:not([disabled])')?.focus({preventScroll: true}); return; }
  pdState.err = ''; S.direct = {id: b.dataset.id, vid: pdState.vid || null, qty: r.qty}; save(); co.choice = {}; go('/checkout?now=1');
 },
 variant: input => { const p = prod(pdState.id), v = variantOf(p, input.value); pdState.vid = input.value; if (v && v.img != null) pdState.img = v.img; pdState.err = ''; render(); },
 pdQty: b => { const p = prod(pdState.id); pdState.qty = clamp(pdState.qty + +b.dataset.d, 1, Math.max(1, pdCap(p))); render(); },
 thumb: b => { pdState.img = +b.dataset.i; render(); },
 gnav: b => { const n = galleryOf(prod(pdState.id)).length; pdState.img = (pdState.img + +b.dataset.d + n) % n; render(); },
 zoom: () => { const p = prod(pdState.id), g = galleryOf(p), im = g[clamp(pdState.img, 0, g.length - 1)] || {src: mainImage(p), label: ''}; modal(`<h3 id="modal-title" class="sr">${esc(p.name)}</h3><img src="${esc(im.src)}" alt="${esc(p.name)}${im.label ? ' — ' + esc(im.label) : ''}" width="800" height="800"><p class="center small muted">${esc(p.name)}${im.label ? ' · ' + esc(im.label) : ''}</p>`, 'lightbox'); },
 tab: b => { pdState.tab = b.dataset.t; render(); },
 goReviews: (b, e) => { e.preventDefault(); pdState.tab = 'rev'; scrollTarget = '#pd-tabs'; render(); },
 share: () => copyText(location.href, 'Tautan disalin'),
 copy: b => copyText(b.dataset.v, 'Disalin ke papan klip'),
 copyCode: b => copyText(b.dataset.code, `Kode ${b.dataset.code} disalin. Tempel di keranjang.`),
 review: b => { if (!me()) { S.redirect = '#/produk/' + b.dataset.id; save(); toast('Masuk dulu untuk menulis ulasan', 'bad'); go('/masuk'); return; } reviewModal(b.dataset.id); },
 askSeller: b => askModal(b.dataset.shop, b.dataset.id || null),
 /* keranjang & voucher */
 cqty: b => { const l = cartLines().find(x => x.key === b.dataset.key); if (!l) return; const n = l.qty + +b.dataset.d; if (n < 1) return; const r = setCartQty(b.dataset.key, n); if (r.clamped) toast(r.msg, 'bad'); render(); },
 rmCart: b => { const l = cartLines().find(x => x.key === b.dataset.key); removeCart(b.dataset.key); toast(l ? `“${l.p.name}” dihapus dari keranjang` : 'Item dihapus'); render(); },
 toFav: b => { const l = cartLines().find(x => x.key === b.dataset.key); if (!l) return; if (!S.wish.includes(l.id)) S.wish.push(l.id); removeCart(b.dataset.key); toast('Dipindahkan ke favorit'); render(); },
 rmVoucher: () => { S.voucher = null; S.vErr = null; save(); render(); toast('Voucher dilepas'); },
 useVoucher: b => applyVoucher(b.dataset.code),
 /* checkout & pembayaran */
 coAddr: input => { co.addr = input.value; render(); },
 coShip: input => { co.choice[input.dataset.key] = input.value; render(); },
 coPay: input => { co.pay = input.value; render(); },
 coNewAddr: () => { co.newAddr = !co.newAddr; render(); },
 placeOrder: btn => {
  if (co.placing) return;
  const u = me(), r = route(), {direct, lines} = checkoutLines(r), addr = u.addresses.find(a => a.id === co.addr) || null;
  co.placing = true; co.err = '';
  busy(btn, 900).then(() => {
   const res = createOrder({user: u, addr, lines, choice: co.choice, voucher: S.voucher, notes: co.notes, payMethod: co.pay, fromCart: !direct});
   co.placing = false;
   if (!res.ok) { co.err = res.msg; toast(res.msg, 'bad'); render(); return; }
   co.choice = {}; co.notes = {}; toast(`Pesanan ${res.order.id} dibuat`); go('/bayar/' + res.order.id);
  });
 },
 payMethod: sel => { const o = findOrder(sel.dataset.id); if (!o) return; o.payMethod = sel.value; if (o.pay === 'failed') o.pay = 'pending'; save(); render(); },
 simPay: b => {
  const o = findOrder(b.dataset.id), res = b.dataset.r; if (!o) return;
  busy(b, 700).then(() => {
   if (res === 'paid') { markPaid(o); toast('Pembayaran berhasil (simulasi)'); }
   else if (res === 'failed') { if (o.pay === 'pending') o.pay = 'failed'; toast('Pembayaran gagal (simulasi)', 'bad'); }
   else { o.deadline = Date.now() - 1; checkExpiry(o); toast('Pesanan kedaluwarsa (simulasi)', 'bad'); }
   save(); render();
  });
 },
 cancelOrder: b => confirmBox('Batalkan pesanan?', 'Stok dan voucher akan dikembalikan. Tindakan ini tidak dapat dibatalkan.', 'Ya, batalkan', () => { const r = cancelOrder(findOrder(b.dataset.id)); toast(r.ok ? 'Pesanan dibatalkan' : r.msg, r.ok ? 'ok' : 'bad'); render(); }),
 reorder: b => { const o = findOrder(b.dataset.id); let ok = 0, bad = []; o.parcels.forEach(pc => pc.items.forEach(it => { const r = addToCart(it.id, it.vid, it.qty); r.ok ? ok++ : bad.push(`${it.name}: ${r.msg}`); })); toast(ok ? `${ok} barang ditambahkan ke keranjang${bad.length ? ` (${bad.length} dilewati)` : ''}` : bad[0] || 'Tidak ada barang yang dapat dipesan ulang', ok ? 'ok' : 'bad'); go('/keranjang'); },
 receive: b => confirmBox('Pesanan sudah diterima?', 'Pastikan barang sudah Anda terima dengan baik. Setelah dikonfirmasi, status menjadi selesai.', 'Ya, sudah diterima', () => { const r = parcelAction(findOrder(b.dataset.oid), +b.dataset.i, 'receive'); toast(r.ok ? 'Terima kasih! Pesanan selesai' : r.msg, r.ok ? 'ok' : 'bad'); render(); }, false),
 shipForm: b => modal(`<h3 id="modal-title">Tandai dikirim</h3><p class="muted small">Pesanan ${esc(b.dataset.oid)}. Pembeli akan menerima notifikasi dengan nomor resi.</p><form data-form="ship" data-oid="${esc(b.dataset.oid)}" data-i="${b.dataset.i}" novalidate>${F('resi', 'Nomor resi', {req: true, ph: 'mis. SMK123456789', attr: 'maxlength="24" autocapitalize="characters"', hint: '6–24 huruf/angka.'})}<div class="modal-foot"><button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn modal-primary">Kirim paket</button></div></form>`),
 cancelParcel: b => modal(`<h3 id="modal-title">Batalkan paket</h3><p class="muted small">Pesanan ${esc(b.dataset.oid)}. Stok dikembalikan dan dana pembeli dikembalikan (simulasi).</p><form data-form="cancelParcel" data-oid="${esc(b.dataset.oid)}" data-i="${b.dataset.i}" novalidate>${F('reason', 'Alasan pembatalan', {type: 'textarea', req: true, ph: 'mis. stok fisik ternyata habis', attr: 'rows="3" maxlength="200"'})}<div class="modal-foot"><button type="button" class="btn ghost" data-act="closeModal">Kembali</button><button class="btn danger modal-primary">Batalkan paket</button></div></form>`),
 download: b => {
  const o = findOrder(b.dataset.oid), it = o && o.parcels.flatMap(p => p.items).find(i => i.id === b.dataset.pid); if (!it) return;
  const blob = new Blob([`${BRAND.name} - berkas contoh (demo)\n\nProduk : ${it.name}\nPesanan: ${o.id}\n\nIni hanya berkas contoh untuk prototipe. Isi produk digital yang sebenarnya tidak disertakan.\n`], {type: 'text/plain;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${it.id}-contoh.txt`; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast('Berkas contoh diunduh');
 },
 invoice: b => invoiceModal(findOrder(b.dataset.id)),
 print: () => window.print(),
 /* akun */
 readAll: () => { myNotes().forEach(n => n.r = true); save(); render(); },
 readNote: (b, e) => { const n = S.notes.find(x => x.id === b.dataset.id); if (n) { n.r = true; save(); } if (b.dataset.stay) { e.preventDefault(); render(); } },
 addrModal: b => { const a = me().addresses.find(x => x.id === b.dataset.id) || {}; modal(`<h3 id="modal-title">${a.id ? 'Ubah alamat' : 'Tambah alamat'}</h3><form data-form="addr" data-id="${a.id || ''}" novalidate>${addrFields(a)}<div class="modal-foot"><button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn modal-primary">Simpan alamat</button></div></form>`); },
 rmAddr: b => confirmBox('Hapus alamat ini?', 'Alamat akan dihapus dari akun Anda.', 'Hapus alamat', () => { const u = me(); u.addresses = u.addresses.filter(x => x.id !== b.dataset.id); save(); render(); toast('Alamat dihapus'); }),
 logout: () => { clearSession(); toast('Anda telah keluar'); go('/'); },
 demoLogin: b => { const f = $('form[data-form=login]'); f.elements.email.value = b.dataset.email; f.elements.pass.value = b.dataset.pass; f.dataset.to = b.dataset.to || ''; f.requestSubmit(); },
 pwToggle: b => { const i = b.previousElementSibling, show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'); b.innerHTML = icon(show ? 'eyeoff' : 'eye'); },
 resendOtp: () => { toast(`Kode baru dikirim (demo): ${CFG.otpDemoCode}`); startOtpTimer(); },
 resetDemo: () => confirmBox('Reset data demo?', 'Katalog, pesanan, akun, dan keranjang dikembalikan ke kondisi awal, dan Anda akan keluar.', 'Reset data', () => { resetState(); co = {addr: null, choice: {}, pay: 'QRIS', notes: {}, newAddr: false, placing: false, err: ''}; go('/'); render(); toast('Data demo dikembalikan'); }),
 retry: () => render(),
 /* dashboard */
 toggleActive: input => { const p = prod(input.dataset.id); if (!canManageProduct(p)) { input.checked = !input.checked; return toast('Anda tidak berwenang.', 'bad'); } p.active = input.checked; save(); toast(`“${p.name}” ${p.active ? 'ditampilkan' : 'disembunyikan'}`); },
 delProd: b => { const p = prod(b.dataset.id); confirmBox('Hapus produk ini?', `“${p.name}” akan dihapus permanen dari toko, keranjang, dan favorit. Riwayat pesanan tetap tersimpan.`, 'Hapus produk', () => { const r = deleteProduct(p.id); toast(r.ok ? 'Produk dihapus' : r.msg, r.ok ? 'ok' : 'bad'); render(); }); },
 prodImgClear: () => { admImgs = []; const p = $('#pimg'); const f = $('form[data-form=product]'); p.src = SITE_IMG.cats[f.elements.cat.value] || SITE_IMG.placeholder; toast('Akan memakai ilustrasi bawaan setelah disimpan'); },
 msgRead: b => { const m = S.messages.find(x => x.id === b.dataset.id); if (m) { m.read = true; save(); render(); } },
 msgDel: b => confirmBox('Hapus pesan ini?', 'Pesan akan dihapus dari kotak masuk.', 'Hapus', () => { S.messages = S.messages.filter(x => x.id !== b.dataset.id); save(); render(); toast('Pesan dihapus'); }),
 toggleShop: input => { const s = shop(input.dataset.id); s.active = input.checked; save(); toast(`Toko “${s.name}” ${s.active ? 'diaktifkan' : 'dinonaktifkan'}`); },
 delVoucher: b => { const v = S.vouchers[+b.dataset.i]; confirmBox('Hapus voucher?', `${v.code} tidak dapat dipakai lagi.`, 'Hapus voucher', () => { S.vouchers.splice(+b.dataset.i, 1); save(); render(); toast('Voucher dihapus'); }); }
};

/* ===== Perubahan input (change) ===== */
const CH = {
 prodImg: async el => { const f = el.files[0]; if (!f) return; try { const d = await shrink(f); admImgs = [{src: d, label: 'Foto produk'}]; const p = $('#pimg'); p.src = d; toast('Foto siap. Simpan produk untuk menerapkan.'); $('[data-err=img]').textContent = ''; } catch (e) { $('[data-err=img]').textContent = e; el.value = ''; } }
};

/* ===== Form (submit) ===== */
const phoneRule = v => v.replace(/\D/g, '').length < 9 || v.replace(/\D/g, '').length > 15 ? 'Masukkan nomor telepon yang valid (9–15 digit).' : '';
const FM = {
 search: (f, d) => { hideSuggest(); setDrawer(false); const q = d.get('q').trim(); go('/produk' + (q ? '?q=' + encodeURIComponent(q) : '')); },
 csearch: (f, d) => setQ(q => { const v = d.get('q').trim(); v ? q.set('q', v) : q.delete('q'); }),
 faq: (f, d) => go('/bantuan' + (d.get('q').trim() ? '?q=' + encodeURIComponent(d.get('q').trim()) : '')),
 price: (f, d) => {
  const mn = +d.get('min').replace(/\D/g, '') || 0, mx = +d.get('max').replace(/\D/g, '') || 0;
  if (mn && mx && mx < mn) { $('[data-err=max]', f).textContent = 'Harga maksimum harus lebih besar dari minimum.'; f.elements.max.setAttribute('aria-invalid', 'true'); f.elements.max.focus(); return; }
  setQ(q => { mn ? q.set('min', mn) : q.delete('min'); mx ? q.set('max', mx) : q.delete('max'); });
 },
 dashQ: (f, d) => setDashQ(f.dataset.scope, q => d.get('q').trim() ? q.set('q', d.get('q').trim()) : q.delete('q')),
 news: (f, d) => {
  if (!validate(f, {email: ['req', 'email']})) return;
  const e = d.get('email').trim().toLowerCase();
  if (S.subscribers.includes(e)) { $('[data-err=email]', f).textContent = 'Email ini sudah berlangganan.'; return; }
  S.subscribers.push(e); save(); f.reset(); toast('Terima kasih! Anda terdaftar (demo, tanpa email sungguhan).');
 },
 contact: async (f, d) => {
  if (!validate(f, {name: ['req'], email: ['req', 'email'], text: ['req', 10]})) return;
  const u = me(), done = lockBtn(f.querySelector('button')); await new Promise(r => setTimeout(r, 400));
  const r = sendMessage({to: 'platform', from: {uid: u ? u.id : null, name: d.get('name').trim(), email: d.get('email').trim()}, subject: d.get('topic'), text: d.get('text')});
  done(); if (!r.ok) { toast(r.msg, 'bad'); return; } f.reset(); toast('Pesan terkirim ke kotak pesan admin (demo).');
 },
 voucher: (f, d) => { const c = d.get('code').trim(); if (!c) { S.vErr = 'Masukkan kode voucher.'; save(); render(); return; } applyVoucher(c); },
 addr: (f, d) => {
  if (!validate(f, {label: ['req'], name: ['req'], phone: ['req', phoneRule], line: ['req', 8], city: ['req'], prov: ['req'], zip: ['req', v => /^\d{5}$/.test(v) ? '' : 'Kode pos 5 digit.']})) return;
  const u = me(), a = Object.fromEntries(['label', 'name', 'phone', 'line', 'city', 'prov', 'zip'].map(k => [k, d.get(k).trim()]));
  if (f.dataset.id) Object.assign(u.addresses.find(x => x.id === f.dataset.id), a); else { a.id = uid('a'); u.addresses.push(a); co.addr = a.id; }
  co.newAddr = false; save(); closeModal(true); render(); toast('Alamat disimpan');
 },
 track: (f, d) => { const id = d.get('id').trim().toUpperCase(); if (!id) { $('[data-err=id]').textContent = 'Masukkan nomor pesanan.'; f.elements.id.setAttribute('aria-invalid', 'true'); f.elements.id.focus(); return; } go('/lacak?id=' + encodeURIComponent(id)); },
 login: async (f, d) => {
  if (!validate(f, {email: ['req', 'email'], pass: ['req']})) return;
  const done = lockBtn(f.querySelector('button.btn'));
  try {
   const u = S.users.find(x => x.email.toLowerCase() === d.get('email').trim().toLowerCase());
   const ok = u ? await verifyPassword(d.get('pass'), u.pw) : (await verifyPassword(d.get('pass'), DEMO_PW.lain), false);
   if (!ok) { f.elements.pass.setAttribute('aria-invalid', 'true'); $('[data-err=form]', f).textContent = 'Email atau kata sandi salah. Coba akun demo di atas.'; f.elements.pass.focus(); return; }
   doLogin(u, null, !!f.elements.rem.checked, f.dataset.to || '');
  } finally { done(); }
 },
 register: async (f, d) => {
  const taken = v => S.users.some(u => u.email.toLowerCase() === v.toLowerCase()) ? 'Email ini sudah terdaftar. Silakan masuk.' : '';
  if (!validate(f, {name: ['req', 3], email: ['req', 'email', taken], phone: ['req', phoneRule], pass: ['req', 8], pass2: ['req', (v, ff) => v !== ff.elements.pass.value ? 'Kata sandi tidak sama.' : ''], terms: [(v, ff) => ff.elements.terms.checked ? '' : 'Setujui syarat & ketentuan untuk melanjutkan.']})) return;
  const done = lockBtn(f.querySelector('button.btn'));
  try { const pw = await hashPassword(d.get('pass')); S.pending = {type: 'register', email: d.get('email').trim(), data: {name: d.get('name').trim(), email: d.get('email').trim(), phone: d.get('phone').trim(), pw}}; save(); go('/verifikasi'); } finally { done(); }
 },
 forgot: async (f, d) => {
  if (!validate(f, {email: ['req', 'email', v => S.users.some(u => u.email.toLowerCase() === v.toLowerCase()) ? '' : 'Tidak ada akun dengan email ini.']})) return;
  const done = lockBtn(f.querySelector('button.btn')); await new Promise(r => setTimeout(r, 400)); done();
  S.pending = {type: 'reset', email: d.get('email').trim()}; save(); toast('Kode dikirim (demo)'); go('/verifikasi');
 },
 otp: async f => {
  const code = $$('[data-otp]', f).map(i => i.value).join(''), er = $('[data-err=otp]', f);
  if (code.length < 6) { er.textContent = 'Masukkan 6 digit kode.'; return; }
  const done = lockBtn(f.querySelector('button.btn')); await new Promise(r => setTimeout(r, 400)); done();
  if (code !== CFG.otpDemoCode) { er.textContent = 'Kode salah. Periksa kembali dan coba lagi.'; $$('[data-otp]', f).forEach(i => i.value = ''); $('[data-otp="0"]').focus(); return; }
  const p = S.pending;
  if (p.type === 'register') {
   if (S.users.some(u => u.email.toLowerCase() === p.email.toLowerCase())) { er.textContent = 'Email ini sudah terdaftar.'; return; }
   const u = {id: uid('u'), role: 'user', addresses: [], ...p.data}; S.users.push(u); doLogin(u, 'Akun dibuat. Selamat datang!', true);
  } else { p.ok = true; save(); go('/sandi-baru'); }
 },
 reset: async (f, d) => {
  if (!validate(f, {pass: ['req', 8], pass2: ['req', (v, ff) => v !== ff.elements.pass.value ? 'Kata sandi tidak sama.' : '']})) return;
  const done = lockBtn(f.querySelector('button.btn'));
  try { const u = S.users.find(x => x.email.toLowerCase() === S.pending.email.toLowerCase()); u.pw = await hashPassword(d.get('pass')); S.pending = null; save(); toast('Kata sandi diganti. Silakan masuk.'); go('/masuk'); } finally { done(); }
 },
 profile: (f, d) => {
  const u = me(), taken = v => S.users.some(x => x.id !== u.id && x.email.toLowerCase() === v.toLowerCase()) ? 'Email ini dipakai akun lain.' : '';
  if (!validate(f, {name: ['req', 3], email: ['req', 'email', taken], phone: ['req', phoneRule]})) return;
  Object.assign(u, {name: d.get('name').trim(), email: d.get('email').trim(), phone: d.get('phone').trim()}); save(); render(); toast('Profil disimpan');
 },
 pw: async (f, d) => {
  const u = me(); let wrongOld = false;
  if (!validate(f, {old: ['req'], pass: ['req', 8], pass2: ['req', (v, ff) => v !== ff.elements.pass.value ? 'Kata sandi tidak sama.' : '']})) return;
  const done = lockBtn(f.querySelector('button.btn'));
  try {
   if (!await verifyPassword(d.get('old'), u.pw)) { wrongOld = true; f.elements.old.setAttribute('aria-invalid', 'true'); $('[data-err=old]', f).textContent = 'Kata sandi saat ini salah.'; f.elements.old.focus(); return; }
   u.pw = await hashPassword(d.get('pass')); save(); f.reset(); toast('Kata sandi diganti');
  } finally { done(); }
 },
 review: (f, d) => { if (!validate(f, {text: ['req', 10]})) return; const r = addReview(f.dataset.id, +d.get('rating'), d.get('text')); if (!r.ok) { $('[data-err=text]', f).textContent = r.msg; return; } closeModal(true); pdState.tab = 'rev'; render(); toast('Terima kasih atas ulasan Anda!'); },
 ask: (f, d) => {
  const u = me(), rules = {subject: ['req'], text: ['req', 10]}; if (!u) { rules.name = ['req']; rules.email = ['req', 'email']; }
  if (!validate(f, rules)) return;
  const r = sendMessage({to: f.dataset.shop, from: u ? {uid: u.id, name: u.name, email: u.email} : {uid: null, name: d.get('name').trim(), email: d.get('email').trim()}, pid: f.dataset.pid || null, subject: d.get('subject').trim(), text: d.get('text')});
  if (!r.ok) { $('[data-err=text]', f).textContent = r.msg; return; } closeModal(true); toast('Pesan terkirim ke penjual (demo).');
 },
 quickVariant: (f, d) => {
  const id = f.dataset.id, vid = d.get('variant'), qty = +d.get('qty');
  if (!validate(f, {variant: [() => vid ? '' : 'Pilih salah satu varian.'], qty: [v => qty >= 1 && Number.isInteger(qty) ? '' : 'Jumlah minimal 1.']})) return;
  const r = addToCart(id, vid, qty);
  if (!r.ok) { $('[data-err=qty]', f).textContent = r.msg; return; }
  closeModal(true); toast(`${qty} barang ditambahkan ke keranjang`); render();
 },
 openShop: (f, d) => {
  if (!validate(f, {name: ['req', 4, v => S.shops.some(s => norm(s.name) === norm(v)) ? 'Nama toko sudah dipakai.' : ''], city: ['req'], desc: ['req', 20]})) return;
  const r = openShop({name: d.get('name'), type: d.get('type'), city: d.get('city'), prov: d.get('prov'), desc: d.get('desc')});
  if (!r.ok) { toast(r.msg, 'bad'); return; } toast('Toko dibuka! Tambahkan produk pertama Anda.'); go('/penjual/produk/baru');
 },
 shopEdit: (f, d) => {
  const sh = shop(me().shopId);
  if (!validate(f, {name: ['req', 4, v => S.shops.some(s => s.id !== sh.id && norm(s.name) === norm(v)) ? 'Nama toko sudah dipakai.' : ''], city: ['req'], desc: ['req', 20]})) return;
  Object.assign(sh, {name: d.get('name').trim(), type: d.get('type'), city: d.get('city').trim(), prov: d.get('prov'), desc: d.get('desc').trim(), active: !!f.elements.active.checked}); save(); render(); toast('Profil toko disimpan');
 },
 product: (f, d) => {
  const scope = f.dataset.scope, id = f.dataset.id, old = id ? prod(id) : null, digital = !!f.elements.digital.checked;
  const int = (v, min, max = 1e9) => /^\d+$/.test(v) && +v >= min && +v <= max;
  let vparsed = null;
  const vcheck = (v, ff) => { vparsed = parseVariants(ff.elements.vlabel.value, v, old); return vparsed.err || ''; };
  const ok = validate(f, {
   name: ['req', 3], price: ['req', v => int(v, 100) ? '' : 'Harga minimal Rp100 (angka bulat).'],
   was: [(v, ff) => v && !(+v > +ff.elements.price.value) ? 'Harus lebih besar dari harga jual.' : ''],
   weight: [(v, ff) => !digital && !int(v, 1) ? 'Isi berat (gram) untuk menghitung ongkir.' : ''],
   po: [v => v && !int(v, 0, 60) ? 'Pre-order 0–60 hari.' : ''],
   vtext: [vcheck],
   stock: [(v, ff) => !digital && !vparsed?.items && !int(v, 0) ? 'Isi stok (angka bulat ≥ 0) atau isi varian.' : ''],
   desc: ['req', 20], specs: [v => v.split('\n').filter(l => l.trim() && !l.includes(':')).length ? 'Format tiap baris: Nama: nilai' : '']
  });
  if (!ok) return;
  const data = {
   name: d.get('name').trim(), cat: d.get('cat'), price: +d.get('price'), was: d.get('was') ? +d.get('was') : undefined, weight: digital ? 0 : +d.get('weight'), po: +d.get('po') || 0,
   digital, active: !!f.elements.active.checked, desc: d.get('desc').trim(),
   tags: d.get('tags').split(',').map(s => s.trim()).filter(Boolean), specs: d.get('specs').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  };
  if (!data.specs.length) data.specs = [['Kategori', catName(data.cat)], ['Berat', digital ? 'Produk digital' : data.weight + ' g'], ['Kondisi', 'Baru']];
  if (vparsed && vparsed.items) { data.variants = vparsed.items; data.stock = undefined; } else { data.variants = undefined; data.stock = digital ? 0 : +d.get('stock'); }
  if (scope === 'admin' && f.elements.featured) data.featured = !!f.elements.featured.checked;
  if (admImgs !== null) data.imgs = admImgs.length ? admImgs : undefined;
  if (!old && scope === 'admin') data.shop = d.get('shop');
  if (!old) { data.tags = data.tags.length ? data.tags : [norm(data.name).split(' ')[0]]; }
  const r = saveProduct(data, id || null);
  if (!r.ok) { toast(r.msg, 'bad'); return; }
  admImgs = null; toast(old ? 'Perubahan disimpan' : 'Produk ditambahkan ke toko'); go(`/${scope}/produk`);
 },
 ship: (f, d) => {
  const r = parcelAction(findOrder(f.dataset.oid), +f.dataset.i, 'ship', {resi: d.get('resi')});
  if (!r.ok) { $('[data-err=resi]', f).textContent = r.msg; f.elements.resi.setAttribute('aria-invalid', 'true'); f.elements.resi.focus(); return; }
  closeModal(true); render(); toast('Paket ditandai dikirim. Pembeli diberi tahu.');
 },
 cancelParcel: (f, d) => {
  const r = parcelAction(findOrder(f.dataset.oid), +f.dataset.i, 'cancel', {reason: d.get('reason')});
  if (!r.ok) { $('[data-err=reason]', f).textContent = r.msg; f.elements.reason.setAttribute('aria-invalid', 'true'); f.elements.reason.focus(); return; }
  closeModal(true); render(); toast('Paket dibatalkan dan stok dikembalikan');
 },
 voucherNew: (f, d) => {
  const type = d.get('type');
  if (!validate(f, {code: ['req', 4, v => /^[A-Z0-9]+$/i.test(v) ? '' : 'Hanya huruf dan angka.', v => S.vouchers.some(x => x.code === v.toUpperCase()) ? 'Kode sudah ada.' : ''], val: ['req', v => +v <= 0 ? 'Nilai harus lebih dari 0.' : type === 'pct' && +v > 90 ? 'Persen maksimal 90.' : ''], quota: ['req', v => +v < 1 ? 'Kuota minimal 1.' : ''], exp: ['req', v => new Date(v).getTime() + DAY < Date.now() ? 'Tanggal sudah lewat.' : '']})) return;
  S.vouchers.unshift({code: d.get('code').toUpperCase().trim(), type, val: +d.get('val'), cap: type === 'pct' ? 50000 : undefined, min: +d.get('min') || 0, quota: +d.get('quota'), used: 0, exp: new Date(d.get('exp')).getTime() + DAY - 1});
  save(); render(); toast('Voucher dibuat');
 }
};
/* parse "Nama | stok | tambahan harga" menjadi daftar varian; id lama dipertahankan bila nama sama */
function parseVariants(label, text, old) {
 const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
 if (!lines.length) return {items: null};
 if (!label.trim()) return {err: 'Isi nama pilihan varian (mis. Ukuran) di atas daftar varian.'};
 const items = [], names = new Set(), oldItems = old && hasVariants(old) ? old.variants.items : [];
 let n = oldItems.length;
 for (const [i, l] of lines.entries()) {
  const [name, stock, delta = '0'] = l.split('|').map(s => s.trim());
  if (!name || name.length > 30) return {err: `Baris ${i + 1}: nama varian wajib (maks. 30 karakter).`};
  if (stock == null || !/^\d+$/.test(stock)) return {err: `Baris ${i + 1}: stok harus angka bulat ≥ 0 (format: Nama | stok | tambahan harga).`};
  if (!/^\d+$/.test(delta)) return {err: `Baris ${i + 1}: tambahan harga harus angka bulat ≥ 0.`};
  if (names.has(norm(name))) return {err: `Baris ${i + 1}: nama varian "${name}" ganda.`};
  names.add(norm(name));
  const prev = oldItems.find(o => norm(o.name) === norm(name));
  items.push({id: prev ? prev.id : 'v' + (++n), name, stock: +stock, delta: +delta, ...(prev && prev.img != null ? {img: prev.img} : {})});
 }
 return {items: {label: label.trim(), items}};
}

/* ===== Saran pencarian (header) ===== */
let sgIdx = -1, sgTimer = 0;
const sgItems = () => $$('#suggest [role=option]');
function hideSuggest() { const b = $('#suggest'); if (b) { b.hidden = true; b.innerHTML = ''; } const i = $('#hs'); i && (i.setAttribute('aria-expanded', 'false'), i.removeAttribute('aria-activedescendant')); sgIdx = -1; }
function showSuggest() {
 const i = $('#hs'), b = $('#suggest'); if (!i || !b) return;
 const q = i.value.trim(); if (!q) { hideSuggest(); return; }
 const {products, cats} = suggestions(q);
 b.innerHTML = `<a role="option" id="sg-0" class="sg-item sg-q" href="#/produk?q=${encodeURIComponent(q)}">${icon('search')}<span>Cari “<b>${esc(q)}</b>”</span></a>`
  + cats.map((c, k) => `<a role="option" id="sg-c${k}" class="sg-item" href="#/produk?cat=${c.id}">${icon(c.icon)}<span>Kategori <b>${esc(c.short)}</b></span></a>`).join('')
  + products.map((p, k) => `<a role="option" id="sg-p${k}" class="sg-item" href="#/produk/${p.id}">${imgTag(mainImage(p), '', '', 'width="40" height="40"')}<span>${esc(p.name)}<small>${rp(p.price)}</small></span></a>`).join('')
  + (products.length ? '' : `<p class="sg-none">Tidak ada produk yang cocok</p>`);
 b.hidden = false; i.setAttribute('aria-expanded', 'true'); sgIdx = -1;
}
function moveSuggest(d) {
 const l = sgItems(); if (!l.length) return;
 sgIdx = (sgIdx + d + l.length) % l.length;
 l.forEach((x, k) => { x.classList.toggle('on', k === sgIdx); x.setAttribute('aria-selected', String(k === sgIdx)); });
 $('#hs').setAttribute('aria-activedescendant', l[sgIdx].id); l[sgIdx].scrollIntoView({block: 'nearest'});
}

/* ===== Listener global ===== */
document.addEventListener('click', e => {
 const t = e.target;
 if (!t.closest('.menu-wrap')) closeMenus();
 if (!t.closest('.hsearch')) hideSuggest();
 const a = t.closest('[data-act]'); if (!a) return;
 const fn = A[a.dataset.act]; if (!fn) return;
 if (a.tagName === 'INPUT' || a.tagName === 'SELECT') return;     // ditangani oleh event change
 fn(a, e);
});
document.addEventListener('change', e => {
 const t = e.target;
 if (t.dataset.filter) {
  const k = t.dataset.filter;
  if (k === 'cat') return setQ(q => { const all = $$('[data-filter="cat"]:checked').map(x => x.value); q.delete('cat'); all.forEach(v => q.append('cat', v)); });
  if (k === 'stock' || k === 'sale') return setQ(q => t.checked ? q.set(k, '1') : q.delete(k));
  return setQ(q => t.value ? q.set(k, t.value) : q.delete(k), k === 'view');
 }
 const act = t.dataset.act; if (!act) return;
 if (CH[act]) CH[act](t); else if ((t.tagName === 'INPUT' || t.tagName === 'SELECT') && A[act]) A[act](t, e);
});
document.addEventListener('submit', e => { const f = e.target, k = f.dataset.form; if (!k || !FM[k]) return; e.preventDefault(); FM[k](f, new FormData(f)); });
document.addEventListener('input', e => {
 const t = e.target;
 if (t.dataset.otp != null) { t.value = t.value.replace(/\D/g, '').slice(-1); if (t.value) t.parentElement.querySelector(`[data-otp="${+t.dataset.otp + 1}"]`)?.focus(); }
 if (t.dataset.note != null) co.notes[t.dataset.note] = t.value;
 if (t.getAttribute('aria-invalid')) { t.removeAttribute('aria-invalid'); const er = t.form && t.form.querySelector(`[data-err="${t.name}"]`); if (er) er.textContent = ''; }
 if (t.id === 'hs') { $('.hs-clear').hidden = !t.value; clearTimeout(sgTimer); sgTimer = setTimeout(showSuggest, 120); }
});
document.addEventListener('keydown', e => {
 if (e.key === 'Escape') {
  if ($('#modal')) closeModal(); else if ($('#suggest') && !$('#suggest').hidden) { hideSuggest(); }
  else if ($$('.menu:not([hidden])').length) { const m = $('.menu:not([hidden])'), b = $(`[aria-controls="${m.id}"]`); closeMenus(); b && b.focus(); }
  else if ($('#drawer.open')) setDrawer(false); else if (ui.filtersOpen) A.filters(); else A.admClose();
 }
 trapTab(e);
 const t = e.target;
 if (t.id === 'hs' && !$('#suggest').hidden) {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveSuggest(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); moveSuggest(-1); }
  else if (e.key === 'Enter' && sgIdx >= 0) { e.preventDefault(); const h = sgItems()[sgIdx].getAttribute('href'); hideSuggest(); go(h.slice(1)); }
 }
 if (t.closest && t.closest('.menu') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
  e.preventDefault(); const l = $$('a,button', t.closest('.menu')), i = l.indexOf(t); l[(i + (e.key === 'ArrowDown' ? 1 : -1) + l.length) % l.length].focus();
 }
 if (t.getAttribute && t.getAttribute('role') === 'tab' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
  const l = $$('[role=tab]', t.parentElement), i = l.indexOf(t), n = l[(i + (e.key === 'ArrowRight' ? 1 : -1) + l.length) % l.length]; n.click();
 }
 if (t.dataset && t.dataset.otp != null && e.key === 'Backspace' && !t.value) t.parentElement.querySelector(`[data-otp="${+t.dataset.otp - 1}"]`)?.focus();
});
document.addEventListener('paste', e => {
 const t = e.target;
 if (t.dataset && t.dataset.otp != null) { const v = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (v.length) { e.preventDefault(); $$('[data-otp]').forEach((x, i) => x.value = v[i] || ''); $$('[data-otp]')[Math.min(5, v.length - 1)].focus(); } }
});
document.addEventListener('mousedown', e => { if (e.target.closest && e.target.closest('#suggest')) e.preventDefault(); });   // jaga fokus input saat memilih saran
document.addEventListener('error', e => {                                     // gambar gagal dimuat -> placeholder
 const im = e.target; if (im && im.tagName === 'IMG' && !im.dataset.fb) { im.dataset.fb = '1'; im.src = SITE_IMG.placeholder; }
}, true);
window.addEventListener('hashchange', () => { closeModal(true); hideSuggest(); render(); });
window.addEventListener('scroll', () => { $('#totop')?.classList.toggle('show', scrollY > 900); }, {passive: true});
window.addEventListener('storage', e => { if (e.key === LS_KEY) { S = loadState(); render(); } });
const off = () => { $('#offline').hidden = navigator.onLine; };
window.addEventListener('online', () => { off(); toast('Kembali online'); }); window.addEventListener('offline', off);
setInterval(() => {                                                            // hitung mundur pembayaran
 $$('[data-countdown]').forEach(el => {
  const ms = +el.dataset.countdown - Date.now();
  if (ms <= 0) { const o = findOrder(el.dataset.oid); if (o && checkExpiry(o)) { save(); render(); } return; }
  el.textContent = hms(ms);
 });
}, 1000);

/* ===== Mulai ===== */
S = loadState();
render(); off();
