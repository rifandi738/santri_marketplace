/* Tampilan pesanan: lencana status, timeline, detail (dipakai pembeli, penjual, dan admin), faktur, lacak. */
const STATUS_KIND = {'Menunggu Pembayaran': 'warn', 'Pembayaran Gagal': 'bad', 'Kedaluwarsa': 'bad', 'Dibatalkan': 'bad', 'Dikemas': 'info', 'Dikirim': 'info', 'Sebagian Dikirim': 'info', 'Selesai': 'ok', 'Menunggu Pembayaran ': 'warn'};
const statusBadge = s => badge(esc(s), STATUS_KIND[s] || '');
const orderBadge = o => statusBadge(orderStatus(o));
const orderQty = o => sum(o.parcels, p => sum(p.items, i => i.qty));

function parcelTimeline(o, pc) {
 const steps = pc.digital ? ['Selesai'] : ['Dikemas', 'Dikirim', 'Selesai'];
 const h = k => pc.history.find(x => x.s === k);
 const cancelled = pc.status === 'Dibatalkan';
 const prePaid = o.pay === 'pending' || o.pay === 'failed';
 const rows = [{s: 'Pesanan dibuat', t: o.created, done: true}];
 if (prePaid) rows.push({s: o.pay === 'failed' ? 'Pembayaran gagal, coba lagi' : 'Menunggu pembayaran', done: false, now: true});
 else if (o.pay === 'expired' || o.pay === 'cancelled' || cancelled) {
  steps.forEach(s => { if (h(s)) rows.push({s, t: h(s).t, m: h(s).m, done: true}); });
  const c = pc.history.find(x => x.s === 'Dibatalkan') || {t: Date.now(), m: ''};
  rows.push({s: 'Dibatalkan', t: c.t, m: c.m, done: true, bad: true});
 } else {
  rows.push({s: 'Dibayar', t: o.paidAt, done: true});
  let flagged = false;
  steps.forEach(s => { const x = h(s); const d = !!x; rows.push({s: s === 'Dikemas' ? 'Dikemas penjual' : s === 'Selesai' && pc.digital ? 'Produk digital siap diunduh' : s === 'Selesai' ? 'Diterima pembeli' : 'Dikirim', t: x && x.t, m: x && s !== 'Dikemas' ? x.m : '', done: d, now: !d && !flagged}); if (!d) flagged = true; });
 }
 return `<ol class="tl" aria-label="Riwayat status">${rows.map(r => `<li class="${r.done ? 'done' : ''} ${r.now ? 'now' : ''} ${r.bad ? 'bad' : ''}"><span class="dot"></span><b>${esc(r.s)}</b>${r.t ? `<small>${fdt(r.t)}</small>` : ''}${r.m ? `<small class="muted">${esc(r.m)}</small>` : ''}</li>`).join('')}</ol>`;
}

const filterTabs = (cur, base, defs) => `<div class="chips tabs-chips" role="tablist" aria-label="Filter status">${defs.map(([k, t, n]) => `<a role="tab" class="chip-btn ${cur === k ? 'on' : ''}" aria-selected="${cur === k}" href="#/${base}${k === 'all' ? '' : (base.includes('?') ? '&' : '?') + 'f=' + k}">${t}${n != null ? ` <i class="n">${n}</i>` : ''}</a>`).join('')}</div>`;
const ORDER_FILTERS = [['all', 'Semua'], ['unpaid', 'Belum dibayar'], ['packing', 'Dikemas'], ['shipping', 'Dikirim'], ['done', 'Selesai'], ['cancel', 'Dibatalkan']];
function orderMatches(o, f) {
 const s = orderStatus(o);
 return f === 'all' || (f === 'unpaid' && (o.pay === 'pending' || o.pay === 'failed')) || (f === 'packing' && s === 'Dikemas') || (f === 'shipping' && (s === 'Dikirim' || s === 'Sebagian Dikirim')) || (f === 'done' && s === 'Selesai') || (f === 'cancel' && (s === 'Dibatalkan' || s === 'Kedaluwarsa'));
}
function orderCard(o) {
 const items = o.parcels.flatMap(p => p.items), pay = o.pay === 'pending' || o.pay === 'failed';
 return `<article class="ocard"><header><div><a class="o-id" href="#/akun/pesanan/${o.id}">${o.id}</a><span class="muted small">${fdate(o.created)} · ${esc(o.payMethod || '')}</span></div>${orderBadge(o)}</header>
 <div class="o-items">${items.slice(0, 3).map(i => `<div class="o-it">${imgTag(i.img, i.name, '', 'width="72" height="72"')}<span>${esc(i.name)}<small class="muted">${i.vname ? esc(i.vname) + ' · ' : ''}${i.qty} × ${rp(i.price)}</small></span></div>`).join('')}${items.length > 3 ? `<span class="muted small">+${items.length - 3} barang lainnya</span>` : ''}</div>
 <footer><span>Total <b>${rp(o.total)}</b> <span class="muted small">· ${o.parcels.length} paket</span></span><div class="btn-row">${pay ? `<a class="btn sm" href="#/bayar/${o.id}">Bayar sekarang</a>` : ''}<a class="btn sm ghost" href="#/akun/pesanan/${o.id}">Lihat detail</a></div></footer></article>`;
}

function invoiceModal(o) {
 const seller = false;
 modal(`<div id="inv"><div class="inv-h">${logoHtml('#/', '')}<div class="right"><h3 id="modal-title">Faktur</h3><span class="small">${o.id}<br>${fdate(o.created)}</span></div></div>
  <p class="small"><b>Ditagihkan kepada</b><br>${esc(o.customer)} · ${esc(o.email)}${o.address ? `<br>${addrText(o.address)}` : ''}</p>
  <table class="tbl"><thead><tr><th>Barang</th><th>Jml</th><th class="right">Jumlah</th></tr></thead><tbody>${o.parcels.map(pc => pc.items.map(i => `<tr><td>${esc(i.name)}${i.vname ? `<br><small class="muted">${esc(i.vlabel)}: ${esc(i.vname)}</small>` : ''}<br><small class="muted">${esc(pc.shopName)}</small></td><td>${i.qty}</td><td class="right">${rp(i.price * i.qty)}</td></tr>`).join('')).join('')}</tbody></table>
  <div class="sum-row"><span>Subtotal</span><span>${rp(o.subtotal)}</span></div>${o.discount ? `<div class="sum-row"><span>Voucher ${esc(o.voucher)}</span><span>−${rp(o.discount)}</span></div>` : ''}
  <div class="sum-row"><span>Ongkos kirim</span><span>${rp(o.shipFee)}</span></div>${o.shipDisc ? `<div class="sum-row"><span>Subsidi ongkir</span><span>−${rp(o.shipDisc)}</span></div>` : ''}
  <div class="sum-row tot"><span>Total</span><span>${rp(o.total)}</span></div><p class="small muted">Status: ${esc(orderStatus(o))} · Faktur contoh (prototipe), bukan dokumen resmi.</p></div>
  <div class="modal-foot no-print"><button class="btn ghost" data-act="closeModal">Tutup</button><button class="btn modal-primary" data-act="print">Cetak / simpan PDF</button></div>`, 'wide');
}

/* detail pesanan; ctx: 'akun' (pembeli) | 'penjual' | 'admin' */
function orderDetailView(o, ctx) {
 const u = me(), seller = ctx === 'penjual', admin = ctx === 'admin', buyer = ctx === 'akun';
 const list = o.parcels.map((pc, i) => ({pc, i})).filter(x => !seller || x.pc.sid === u.shopId);
 const unpaid = o.pay === 'pending' || o.pay === 'failed';
 const base = buyer ? '#/akun/pesanan' : seller ? '#/penjual/pesanan' : '#/admin/pesanan';
 const parcelHtml = ({pc, i}) => {
  const sh = shop(pc.sid), canShip = o.pay === 'paid' && pc.status === 'Dikemas' && (seller || admin), canRecv = o.pay === 'paid' && pc.status === 'Dikirim' && (buyer || admin);
  return `<section class="panel parcel-d" aria-label="Paket dari ${esc(pc.shopName)}"><header class="pd-h">${icon(pc.digital ? 'download' : 'box')}<div><b>${esc(pc.shopName)}</b>${sh ? ` <a class="small" href="#/toko/${sh.id}">Lihat toko</a>` : ''}<br><span class="muted small">${pc.digital ? 'Produk digital' : esc(pc.ship ? `${pc.ship.name} · estimasi ${pc.ship.eta[0]}–${pc.ship.eta[1]} hari` : '')}</span></div>${statusBadge(pc.status === 'Menunggu Pembayaran' ? orderStatus(o) : pc.status)}</header>
  <ul class="pitems">${pc.items.map(it => `<li>${imgTag(it.img, '', '', 'width="64" height="64"')}<span><a href="#/produk/${it.id}">${esc(it.name)}</a>${it.vname ? `<small class="muted"> · ${esc(it.vlabel)}: ${esc(it.vname)}</small>` : ''}<br><small class="muted">${it.qty} × ${rp(it.price)}</small></span><b>${rp(it.price * it.qty)}</b>
   ${buyer && ((pc.status === 'Selesai' && prod(it.id)) || (it.digital && o.pay === 'paid')) ? `<div class="it-act">${buyer && pc.status === 'Selesai' && prod(it.id) ? `<button class="btn sm ghost" data-act="review" data-id="${it.id}">Ulas produk</button>` : ''}${it.digital && o.pay === 'paid' ? `<button class="btn sm" data-act="download" data-oid="${o.id}" data-pid="${it.id}">${icon('download')}Unduh berkas</button>` : ''}</div>` : ''}</li>`).join('')}</ul>
  ${pc.note ? `<p class="note">${icon('chat')}<span><b>Catatan pembeli:</b> ${esc(pc.note)}</span></p>` : ''}
  ${pc.resi ? `<p class="small">Nomor resi: <b class="mono">${esc(pc.resi)}</b> <button class="link small" data-act="copy" data-v="${esc(pc.resi)}">Salin</button></p>` : ''}
  ${pc.refund ? `<p class="note ok">${icon('check')}<span>Dana ${rp(pc.refund)} dikembalikan (simulasi).</span></p>` : ''}
  ${parcelTimeline(o, pc)}
  <div class="btn-row">${canShip ? `<button class="btn sm" data-act="shipForm" data-oid="${o.id}" data-i="${i}">Tandai dikirim</button><button class="btn sm ghost danger-t" data-act="cancelParcel" data-oid="${o.id}" data-i="${i}">Batalkan paket</button>` : ''}${canRecv ? `<button class="btn sm" data-act="receive" data-oid="${o.id}" data-i="${i}">Pesanan diterima</button>` : ''}</div></section>`;
 };
 const H = buyer ? 'h1' : 'h2';      // di dashboard judul halaman sudah h1
 return `<div class="od-h"><div><${H} class="h2">Pesanan ${o.id}</${H}><p class="muted small">Dibuat ${fdt(o.created)}${o.payMethod ? ' · ' + esc(o.payMethod) : ''}${o.paidAt ? ' · dibayar ' + fdt(o.paidAt) : ''}</p></div><div class="btn-row">${orderBadge(o)}
  ${buyer && unpaid ? `<a class="btn sm" href="#/bayar/${o.id}">Bayar sekarang</a><button class="btn sm ghost danger-t" data-act="cancelOrder" data-id="${o.id}">Batalkan</button>` : ''}
  ${admin && o.pay === 'pending' ? `<button class="btn sm ghost" data-act="simPay" data-id="${o.id}" data-r="paid">Tandai dibayar (demo)</button>` : ''}
  ${buyer && ['expired', 'cancelled'].includes(o.pay) || (buyer && orderStatus(o) === 'Selesai') ? `<button class="btn sm" data-act="reorder" data-id="${o.id}">Beli lagi</button>` : ''}
  ${!seller ? `<button class="btn sm ghost" data-act="invoice" data-id="${o.id}">Faktur</button>` : ''}</div></div>
 ${unpaid ? `<div class="note warn" role="status">${icon('clock')}<span>Bayar sebelum <b>${fdt(o.deadline)}</b>. Setelah itu pesanan dibatalkan otomatis dan stok dikembalikan.</span></div>` : ''}
 <div class="two od"><div class="stack">${list.map(parcelHtml).join('')}</div>
 <aside class="stack">${o.address ? `<section class="panel"><h2 class="h3">${icon('pin')}Alamat pengiriman</h2><p class="small"><b>${esc(o.address.name)}</b> · ${esc(o.address.phone)}<br>${addrText(o.address)}</p></section>` : `<section class="panel"><h2 class="h3">Pengiriman</h2><p class="small muted">Pesanan digital tanpa alamat.</p></section>`}
 ${seller ? `<section class="panel"><h2 class="h3">Pembeli</h2><p class="small"><b>${esc(o.customer)}</b><br>${esc(o.email)}</p></section>` : `<section class="panel"><h2 class="h3">Rincian pembayaran</h2>
  <div class="sum-row"><span>Subtotal</span><span>${rp(o.subtotal)}</span></div>${o.discount ? `<div class="sum-row ok"><span>Voucher ${esc(o.voucher)}</span><span>−${rp(o.discount)}</span></div>` : ''}
  <div class="sum-row"><span>Ongkos kirim</span><span>${rp(o.shipFee)}</span></div>${o.shipDisc ? `<div class="sum-row ok"><span>Subsidi ongkir</span><span>−${rp(o.shipDisc)}</span></div>` : ''}
  <div class="sum-row tot"><span>Total</span><span>${rp(o.total)}</span></div><p class="muted small">Simulasi: tidak ada uang yang berpindah.</p></section>`}
 ${seller ? `<section class="panel"><h2 class="h3">Pendapatan paket ini</h2>${list.map(({pc}) => `<div class="sum-row"><span>${pc.digital ? 'Produk digital' : 'Barang'}</span><span>${rp(pc.subtotal)}</span></div>`).join('')}<p class="muted small">Ongkir dibayar pembeli untuk kurir.</p></section>` : ''}</aside></div>`;
}

function trackPage(r) {
 const id = (r.q.get('id') || '').trim().toUpperCase(), o = id ? S.orders.find(x => x.id === id) : null;
 return `<div class="wrap narrow">${crumbs([['Lacak pesanan']])}<div class="page-h"><h1>Lacak pesanan</h1><p class="muted">Masukkan nomor pesanan, contoh: <b>${S.orders[0] ? S.orders[0].id : CFG.orderPrefix + '-20261024-ABCD'}</b>. Hanya nomor pesanan dari data demo di browser ini yang dapat dilacak.</p></div>
 <form data-form="track" class="panel track-f" novalidate><div class="field grow"><label class="sr" for="tid">Nomor pesanan</label><input class="inp" id="tid" name="id" value="${esc(id)}" placeholder="${CFG.orderPrefix}-YYYYMMDD-XXXX" autocomplete="off" aria-describedby="err-id"><span class="err" data-err="id" id="err-id" role="alert">${id && !o ? 'Nomor pesanan tidak ditemukan. Periksa kembali penulisannya.' : ''}</span></div><button class="btn">Lacak</button></form>
 ${o ? `<div class="panel"><div class="od-h"><h2 class="h3">${o.id}</h2>${orderBadge(o)}</div><p class="small muted">${fdate(o.created)} · ${orderQty(o)} barang</p>${o.parcels.map(pc => `<div class="trk-p"><b>${esc(pc.shopName)}</b> ${statusBadge(pc.status === 'Menunggu Pembayaran' ? orderStatus(o) : pc.status)}${pc.resi ? ` <span class="small mono">Resi ${esc(pc.resi)}</span>` : ''}<p class="small muted">${pc.items.map(i => i.qty + ' × ' + esc(i.name)).join(', ')}</p>${parcelTimeline(o, pc)}</div>`).join('')}</div>` : ''}<div class="page-pad-b"></div></div>`;
}
