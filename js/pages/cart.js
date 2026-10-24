/* Keranjang belanja (dikelompokkan per toko) dan favorit. */
const varText = l => l.v ? `${esc(l.p.variants.label)}: ${esc(l.v.name)}` : '';

function qtyStepper(l, act = 'cqty') {
 const max = maxQtyOf(l.p, l.vid);
 return `<div class="qty sm" role="group" aria-label="Jumlah ${esc(l.p.name)}"><button data-act="${act}" data-key="${esc(l.key)}" data-d="-1" aria-label="Kurangi jumlah ${esc(l.p.name)}" ${l.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><output>${l.qty}</output><button data-act="${act}" data-key="${esc(l.key)}" data-d="1" aria-label="Tambah jumlah ${esc(l.p.name)}" ${l.qty >= max ? 'disabled' : ''}>${icon('plus')}</button></div>`;
}
function voucherBox(sub, ctx = 'cart') {
 const active = S.vouchers.filter(v => v.exp > Date.now() && v.used < v.quota);
 const [vOk] = S.voucher ? voucherCheck(S.voucher, sub) : [null];
 return `<div class="voucher"><h3>${icon('tag')}Voucher</h3>
  ${vOk ? `<div class="v-on"><span>${icon('check')}<b>${vOk.code}</b> <small>${voucherLabel(vOk)}</small></span><button class="link small" data-act="rmVoucher">Lepas</button></div>`
   : `<form data-form="voucher" class="v-form" novalidate><label class="sr" for="vc-${ctx}">Kode voucher</label><input class="inp" id="vc-${ctx}" name="code" placeholder="Masukkan kode voucher" autocomplete="off" aria-describedby="err-code" value=""><button class="btn ghost">Terapkan</button></form><span class="err" data-err="code" id="err-code" role="alert">${S.vErr ? esc(S.vErr) : ''}</span>
   <div class="v-list" aria-label="Voucher yang tersedia">${active.map(v => `<button type="button" class="v-chip" data-act="useVoucher" data-code="${v.code}" ${sub < v.min ? 'disabled' : ''}><b>${v.code}</b><small>${voucherLabel(v)}${sub < v.min ? ` · min. ${rp(v.min)}` : ''}</small></button>`).join('')}</div>`}</div>`;
}

function cartPage() {
 const lines = cartLines();
 if (!lines.length) return `<div class="wrap">${crumbs([['Keranjang']])}<div class="page-h"><h1>Keranjang belanja</h1></div>${empty('cart', 'Keranjang Anda masih kosong', 'Tambahkan produk dari katalog. Isi keranjang tersimpan di perangkat ini sampai Anda checkout.', '<a class="btn" href="#/produk">Mulai belanja</a>')}<div class="page-pad-b"></div></div>`;
 const sub = sum(lines, l => l.price * l.qty);
 if (S.voucher) { const [vv, err] = voucherCheck(S.voucher, sub); if (!vv) { S.voucher = null; S.vErr = err; save(); } }
 const [v] = S.voucher ? voucherCheck(S.voucher, sub) : [null];
 const eff = voucherEffect(v, sub, 0);
 const groups = [...new Set(lines.map(l => l.p.shop))].map(sid => ({sh: shop(sid), lines: lines.filter(l => l.p.shop === sid)}));
 const over = lines.filter(l => l.over);
 const count = sum(lines, l => l.qty);
 return `<div class="wrap">${crumbs([['Keranjang']])}<div class="page-h"><h1>Keranjang belanja</h1><p class="muted">${count} barang dari ${groups.length} toko</p></div>
 ${over.length ? `<div class="note bad" role="alert">${icon('alert')}<span><b>Stok berubah.</b> ${over.map(l => esc(l.p.name)).join(', ')} melebihi stok yang tersedia. Kurangi jumlahnya sebelum checkout.</span></div>` : ''}
 <div class="two"><div class="cart-groups">${groups.map(g => `<section class="cgroup" aria-label="Barang dari ${esc(g.sh.name)}"><header class="cg-h">${icon('store')}<a href="#/toko/${g.sh.id}"><b>${esc(g.sh.name)}</b></a><span class="muted small">${esc(g.sh.city)}</span></header>
  ${g.lines.map(l => `<article class="cline ${l.over ? 'is-over' : ''}"><a class="cl-img" href="#/produk/${l.id}">${imgTag(mainImage(l.p, l.vid), l.p.name, '', 'width="120" height="120"')}</a>
   <div class="cl-main"><a class="cl-name" href="#/produk/${l.id}">${esc(l.p.name)}</a>${l.v ? `<span class="muted small">${varText(l)}</span>` : ''}${l.p.po ? `<span class="muted small">Pre-order ${l.p.po} hari</span>` : ''}
    <span class="cl-price">${rp(l.price)}${discountPct(l.p) && !l.v?.delta ? ` <s>${rp(l.p.was)}</s>` : ''}</span>
    ${l.over ? `<span class="err block" role="alert">Jumlah melebihi stok${l.stock ? ` (tersisa ${l.stock})` : ' (stok habis)'}. Kurangi atau hapus.</span>` : l.stock <= CFG.lowStock && l.stock !== Infinity ? `<span class="stk-line low">Sisa ${l.stock}</span>` : ''}
    <div class="cl-act">${l.p.digital ? '<span class="muted small">Produk digital · 1 lisensi</span>' : qtyStepper(l)}<button class="link small" data-act="toFav" data-key="${esc(l.key)}">Pindah ke favorit</button><button class="link small danger-t" data-act="rmCart" data-key="${esc(l.key)}" aria-label="Hapus ${esc(l.p.name)} dari keranjang">${icon('trash')}Hapus</button></div></div>
   <div class="cl-total" aria-label="Subtotal ${esc(l.p.name)}">${rp(l.price * l.qty)}</div></article>`).join('')}
  <footer class="cg-f muted small">Subtotal toko: <b>${rp(sum(g.lines, l => l.price * l.qty))}</b> · ongkir dihitung saat checkout</footer></section>`).join('')}</div>
  <aside class="panel sticky" aria-label="Ringkasan belanja"><h2 class="h3">Ringkasan belanja</h2>${voucherBox(sub)}
   <div class="sum-row"><span>Subtotal (${count} barang)</span><span>${rp(sub)}</span></div>
   ${v && eff.disc ? `<div class="sum-row ok"><span>Voucher ${v.code}</span><span>−${rp(eff.disc)}</span></div>` : ''}
   ${v && v.type === 'ship' ? `<div class="sum-row ok"><span>Voucher ${v.code}</span><span>Potongan ongkir hingga ${rp(v.val)}</span></div>` : ''}
   <div class="sum-row"><span>Ongkos kirim</span><span class="muted">Dihitung di checkout</span></div>
   <div class="sum-row tot"><span>Total</span><span>${rp(sub - eff.disc)}</span></div>
   <a class="btn block lg ${over.length ? 'disabled' : ''}" href="#/checkout" ${over.length ? 'aria-disabled="true" data-act="blocked"' : ''}>Lanjut ke checkout</a>
   <a class="btn ghost block" href="#/produk">Lanjut belanja</a>
   <p class="muted small center">Pembayaran bersifat simulasi. Tidak ada uang yang berpindah.</p></aside></div></div>`;
}

function wishPage(embed) {
 const l = S.wish.map(prod).filter(p => p && listed(p));
 const body = l.length ? productGrid(l) : empty('heart', 'Belum ada favorit', 'Ketuk ikon hati pada produk untuk menyimpannya di sini. Favorit disimpan di perangkat ini.', '<a class="btn" href="#/produk">Jelajahi produk</a>');
 if (embed) return `<h1 class="h2">Favorit</h1>${body}`;
 return `<div class="wrap">${crumbs([['Favorit']])}<div class="page-h"><h1>Favorit</h1><p class="muted">${l.length} produk tersimpan di perangkat ini</p></div>${body}<div class="page-pad-b"></div></div>`;
}
