/* Checkout (alamat, pengiriman per toko, pembayaran simulasi, ringkasan) dan halaman pembayaran. */
let co = {addr: null, choice: {}, pay: 'QRIS', notes: {}, newAddr: false, placing: false, err: ''};

const addrFields = (a = {}) => `<div class="row2">${F('label', 'Label alamat', {v: a.label || 'Rumah', req: true, ph: 'Rumah, Asrama, Kantor'})}${F('name', 'Nama penerima', {v: a.name ?? me()?.name, req: true, ac: 'name'})}</div>
 ${F('phone', 'Nomor telepon', {type: 'tel', v: a.phone ?? me()?.phone, req: true, ac: 'tel', ph: '08xxxxxxxxxx'})}
 ${F('line', 'Alamat lengkap', {type: 'textarea', v: a.line, req: true, ac: 'street-address', ph: 'Nama jalan, nomor, RT/RW, patokan', attr: 'rows="2"'})}
 <div class="row2">${F('city', 'Kota / kabupaten', {v: a.city, req: true, ph: 'mis. Kota Bandung', ac: 'address-level2'})}${F('prov', 'Provinsi', {type: 'select', opts: PROVINCES, v: a.prov || 'Jawa Barat', req: true})}</div>
 ${F('zip', 'Kode pos', {v: a.zip, req: true, attr: 'inputmode="numeric" maxlength="5"', ph: '5 digit', ac: 'postal-code'})}`;
const addrText = a => `${esc(a.line)}, ${esc(a.city)}, ${esc(a.prov)} ${esc(a.zip || '')}`;
const etaText = (o, po = 0) => `${o.eta[0] + po}–${o.eta[1] + po} hari`;

function checkoutLines(r) {
 const direct = r.q.get('now') === '1';
 return {direct, lines: direct ? (S.direct ? cartLines([S.direct]) : []) : cartLines()};
}
function checkoutPage(r) {
 const u = me();
 if (!u) { S.redirect = '#/checkout' + (r.q.toString() ? '?' + r.q : ''); save(); setTimeout(() => go('/masuk'), 0); return loginNeeded('Silakan masuk untuk checkout'); }
 const {direct, lines} = checkoutLines(r);
 if (!lines.length) return `<div class="wrap">${crumbs([['Keranjang', '#/keranjang'], ['Checkout']])}<div class="page-h"><h1>Checkout</h1></div>${empty('cart', 'Tidak ada barang untuk di-checkout', 'Tambahkan produk ke keranjang terlebih dahulu.', '<a class="btn" href="#/produk">Mulai belanja</a>')}<div class="page-pad-b"></div></div>`;
 if (!co.addr || !u.addresses.some(a => a.id === co.addr)) co.addr = u.addresses[0]?.id || null;
 const addr = u.addresses.find(a => a.id === co.addr) || null;
 const sub0 = sum(lines, l => l.price * l.qty);
 if (S.voucher) { const [vv, err] = voucherCheck(S.voucher, sub0); if (!vv) { S.voucher = null; S.vErr = err; save(); } }
 const t = checkoutTotals(lines, addr, co.choice, S.voucher);
 t.parcels.forEach(pc => { if (pc.ship) co.choice[pc.key] = pc.ship.id; });
 const over = lines.filter(l => l.over), po = Math.max(0, ...lines.map(l => l.p.po || 0));
 const blocked = over.length || (t.needsAddress && !addr);
 const reason = over.length ? 'Ada barang yang melebihi stok.' : t.needsAddress && !addr ? 'Tambahkan alamat pengiriman untuk melanjutkan.' : '';
 return `<div class="wrap">${crumbs([['Keranjang', '#/keranjang'], ['Checkout']])}<div class="page-h"><h1>Checkout</h1><p class="muted">${direct ? 'Beli sekarang: hanya produk ini yang diproses; keranjang Anda tidak berubah.' : 'Periksa pesanan Anda sebelum membayar.'}</p></div>
 <ol class="steps" aria-label="Langkah checkout"><li class="done"><b>${icon('check')}</b>Keranjang</li><li class="on"><b>2</b>Detail pesanan</li><li><b>3</b>Pembayaran</li></ol>
 ${co.err ? `<div class="note bad" role="alert">${icon('alert')}<span>${esc(co.err)}</span></div>` : ''}
 <div class="two"><div>
  <section class="panel" aria-labelledby="h-addr"><h2 class="h3" id="h-addr">1. Alamat pengiriman</h2>
   ${!t.needsAddress ? '<p class="note">' + icon('download') + '<span>Pesanan ini hanya berisi produk digital sehingga tidak memerlukan alamat.</span></p>' : `${u.addresses.length ? `<div role="radiogroup" aria-label="Pilih alamat">${u.addresses.map(a => `<label class="rcard"><input type="radio" name="addr" data-act="coAddr" value="${a.id}" ${a.id === co.addr ? 'checked' : ''}><span><b>${esc(a.label)}</b> · ${esc(a.name)} · ${esc(a.phone)}<br><span class="muted small">${addrText(a)}</span></span></label>`).join('')}</div>` : '<p class="muted">Anda belum punya alamat tersimpan.</p>'}
   ${co.newAddr ? `<form data-form="addr" data-back="checkout" class="subpanel" novalidate><h3 class="h4">Alamat baru</h3>${addrFields()}<div class="btn-row"><button class="btn sm">Simpan & pakai alamat ini</button><button type="button" class="btn sm ghost" data-act="coNewAddr">Batal</button></div></form>` : `<button class="btn ghost sm" data-act="coNewAddr">${icon('plus')}Tambah alamat baru</button>`}`}</section>
  <section class="panel" aria-labelledby="h-ship"><h2 class="h3" id="h-ship">2. Pengiriman per toko</h2>
   ${t.parcels.map((pc, i) => `<fieldset class="parcel"><legend class="sr">Paket dari ${esc(pc.shop.name)}</legend><div class="parcel-h" aria-hidden="true">${icon('store')}<b>${esc(pc.shop.name)}</b><span class="muted small">dari ${esc(pc.shop.city)}</span></div>
    <ul class="pitems">${pc.lines.map(l => `<li>${imgTag(mainImage(l.p, l.vid), '', '', 'width="64" height="64"')}<span>${esc(l.p.name)}${l.v ? `<small class="muted"> · ${esc(l.v.name)}</small>` : ''}<br><small class="muted">${l.qty} × ${rp(l.price)}</small></span><b>${rp(l.price * l.qty)}</b></li>`).join('')}</ul>
    ${pc.digital ? `<p class="note">${icon('download')}<span>Produk digital: tanpa ongkir. Tombol unduh muncul di halaman pesanan setelah pembayaran.</span></p>`
     : pc.opts.map(o => `<label class="rcard sm"><input type="radio" name="ship-${i}" data-act="coShip" data-key="${esc(pc.key)}" value="${o.id}" ${pc.ship.id === o.id ? 'checked' : ''}><span><b>${o.name}</b> <span class="muted small">· ${o.zone}</span><br><span class="muted small">Estimasi tiba ${etaText(o, Math.max(...pc.lines.map(l => l.p.po || 0)))}${pc.lines.some(l => l.p.po) ? ' (termasuk pre-order)' : ''}</span></span><b class="rc-r">${rp(o.cost)}</b></label>`).join('')}
    ${F('note-' + i, 'Catatan untuk penjual (opsional)', {type: 'textarea', v: co.notes[pc.key] || '', attr: `rows="2" data-note="${esc(pc.key)}" maxlength="200"`, ph: 'mis. mohon bungkus tambahan / desain kaos'})}</fieldset>`).join('')}</section>
  <section class="panel" aria-labelledby="h-pay"><h2 class="h3" id="h-pay">3. Metode pembayaran <span class="badge warn">Simulasi</span></h2><p class="muted small">Tidak ada uang yang berpindah. Anda akan diarahkan ke halaman pembayaran demo.</p>
   <div class="grid-radio" role="radiogroup" aria-label="Metode pembayaran">${PAY_METHODS.map(([m, d]) => `<label class="rcard sm"><input type="radio" name="pay" data-act="coPay" value="${m}" ${co.pay === m ? 'checked' : ''}><span><b>${m}</b>${d ? `<br><span class="muted small">${d}</span>` : ''}</span></label>`).join('')}</div></section>
 </div>
 <aside class="panel sticky" aria-label="Ringkasan pesanan"><h2 class="h3">Ringkasan pesanan</h2>${voucherBox(t.sub, 'co')}
  <div class="sum-row"><span>Subtotal (${sum(lines, l => l.qty)} barang)</span><span>${rp(t.sub)}</span></div>
  ${t.disc ? `<div class="sum-row ok"><span>Voucher ${t.voucher.code}</span><span>−${rp(t.disc)}</span></div>` : ''}
  <div class="sum-row"><span>Ongkos kirim (${t.parcels.filter(p => !p.digital).length} paket)</span><span>${t.needsAddress ? rp(t.shipFee) : 'Gratis'}</span></div>
  ${t.shipDisc ? `<div class="sum-row ok"><span>Subsidi ongkir ${t.voucher.code}</span><span>−${rp(t.shipDisc)}</span></div>` : ''}
  <div class="sum-row tot"><span>Total bayar</span><span>${rp(t.total)}</span></div>
  ${po ? `<p class="muted small">${icon('clock')} Termasuk produk pre-order (${po} hari).</p>` : ''}
  <button class="btn block lg" data-act="placeOrder" ${blocked || co.placing ? 'disabled' : ''}>Buat pesanan</button>
  ${reason ? `<p class="err" role="alert">${reason}</p>` : ''}
  <p class="muted small center">Dengan membuat pesanan, stok ditahan ${CFG.payWindowHours} jam menunggu pembayaran simulasi.</p></aside></div></div>`;
}

/* ---------- pembayaran (simulasi) ---------- */
function qrSvg(seed) {
 let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
 const n = 25, cells = [], fin = (x, y) => (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
 for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (fin(x, y)) continue; h = (h * 1103515245 + 12345) >>> 0; if (h % 7 < 3) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`); }
 const fp = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
 return `<svg class="qr" viewBox="0 0 ${n} ${n}" role="img" aria-label="Contoh kode QR untuk pesanan ini (bukan kode asli)" shape-rendering="crispEdges">${cells.join('')}${fp(0, 0)}${fp(n - 7, 0)}${fp(0, n - 7)}</svg>`;
}
const vaNumber = o => ('8808' + o.id.replace(/\D/g, '') + '0012345678').slice(0, 16);

function paymentPage(r) {
 const u = me();
 if (!u) { S.redirect = '#' + r.path; save(); setTimeout(() => go('/masuk'), 0); return loginNeeded(); }
 const o = S.orders.find(x => x.id === r.parts[1]);
 if (!o || (o.userId !== u.id && u.role !== 'admin')) return notFound('Pesanan tidak ditemukan di akun Anda.');
 if (checkExpiry(o)) save();
 const head = `<div class="wrap narrow">${crumbs([['Pesanan saya', '#/akun/pesanan'], [o.id, '#/akun/pesanan/' + o.id], ['Pembayaran']])}`;
 const fin = (ic, cls, title, msg, btns) => head + `<div class="panel center result"><span class="state-ic ${cls}">${ic}</span><h1>${title}</h1><p class="muted">${msg}</p><div class="order-no" aria-label="Nomor pesanan"><span class="small muted">Nomor pesanan</span><b>${o.id}</b></div><div class="btn-row center">${btns}</div></div></div>`;
 if (o.pay === 'paid') return fin(icon('check'), 'ok', 'Pesanan berhasil dibuat', `Pembayaran (simulasi) untuk <b>${rp(o.total)}</b> diterima. ${o.parcels.some(p => !p.digital) ? 'Penjual akan mengemas dan mengirim pesanan Anda; pantau statusnya di halaman pesanan.' : 'Produk digital Anda siap diunduh dari halaman pesanan.'}<br><span class="small">Catatan: data pesanan ini hanya tersimpan di browser perangkat ini (demo).</span>`, `<a class="btn" href="#/akun/pesanan/${o.id}">Lihat detail pesanan</a><a class="btn ghost" href="#/produk">Lanjut belanja</a>`);
 if (o.pay === 'expired') return fin(icon('clock'), 'warn', 'Batas waktu pembayaran habis', `Pesanan ${o.id} dibatalkan otomatis dan stok dikembalikan. Anda dapat memesan ulang barang yang sama.`, `<button class="btn" data-act="reorder" data-id="${o.id}">Pesan lagi</button><a class="btn ghost" href="#/akun/pesanan">Pesanan saya</a>`);
 if (o.pay === 'cancelled') return fin(icon('x'), 'warn', 'Pesanan dibatalkan', `Pesanan ${o.id} telah dibatalkan dan stok dikembalikan.`, `<button class="btn" data-act="reorder" data-id="${o.id}">Pesan lagi</button><a class="btn ghost" href="#/akun/pesanan">Pesanan saya</a>`);
 const m = o.payMethod || 'QRIS', failed = o.pay === 'failed';
 return head + `<div class="page-h"><h1>Selesaikan pembayaran</h1><p class="muted">Pesanan ${o.id} · ${sum(o.parcels, p => sum(p.items, i => i.qty))} barang</p></div>
 <div class="note warn" role="note">${icon('info')}<span><b>Simulasi.</b> Halaman ini hanya contoh. Tidak ada uang yang dibayarkan dan kode di bawah bukan kode sungguhan.</span></div>
 ${failed ? `<div class="note bad" role="alert">${icon('alert')}<span><b>Pembayaran gagal.</b> Transaksi ditolak (simulasi). Pilih metode lain atau coba lagi.</span></div>` : ''}
 <div class="panel center"><p class="small muted">Total yang harus dibayar</p><p class="amount">${rp(o.total)}</p><p class="small">Bayar sebelum <b data-countdown="${o.deadline}" data-oid="${o.id}">${hms(o.deadline - Date.now())}</b> (${fdt(o.deadline)})</p></div>
 <div class="panel"><div class="pm-h"><h2 class="h3">${esc(m)}</h2><label class="sr" for="pm">Ganti metode pembayaran</label><select class="inp auto" id="pm" data-act="payMethod" data-id="${o.id}">${PAY_METHODS.map(p => `<option ${p[0] === m ? 'selected' : ''}>${p[0]}</option>`).join('')}</select></div>
  <div class="pm-body">${m === 'QRIS' ? `<div class="pm-qr">${qrSvg(o.id)}<ol class="small"><li>Buka aplikasi bank atau e-wallet.</li><li>Pilih “Scan QRIS” lalu pindai kode (contoh).</li><li>Periksa nominal lalu konfirmasi.</li></ol></div>`
   : m.startsWith('Virtual') ? `<p class="small muted">Nomor virtual account (contoh)</p><div class="copy"><span>${vaNumber(o).replace(/(.{4})/g, '$1 ').trim()}</span><button class="btn sm ghost" data-act="copy" data-v="${vaNumber(o)}">${icon('copy')}Salin</button></div><p class="small muted">Bayar lewat m-banking, internet banking, atau ATM ${esc(m.split('· ')[1])}. Nominal harus sama persis.</p>`
   : `<p>Permintaan pembayaran (simulasi) dikirim ke akun ${esc(m.split('· ')[1])} yang tertaut dengan <b>${esc(u.phone || 'nomor Anda')}</b>. Buka aplikasi untuk mengonfirmasi.</p>`}</div></div>
 <div class="panel dashed"><h2 class="h3">Kontrol demo</h2><p class="small muted">Pilih hasil pembayaran untuk mencoba setiap kondisi.</p>
  <div class="btn-row"><button class="btn" data-act="simPay" data-id="${o.id}" data-r="paid">Simulasikan berhasil</button><button class="btn ghost" data-act="simPay" data-id="${o.id}" data-r="failed">Simulasikan gagal</button><button class="btn ghost" data-act="simPay" data-id="${o.id}" data-r="expired">Simulasikan kedaluwarsa</button></div></div>
 <div class="center page-pad-b"><button class="link danger-t" data-act="cancelOrder" data-id="${o.id}">Batalkan pesanan ini</button></div></div>`;
}
