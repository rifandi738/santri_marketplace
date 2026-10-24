/* Dashboard penjual (/penjual) dan admin (/admin). Penjual hanya melihat data tokonya; admin melihat semua. */
let admImgs = null;   // foto unggahan sementara pada form produk: null = tidak diubah, [] = hapus

const stockTag = p => { const st = stockState(p); return st === 'out' ? badge('Habis', 'bad') : st === 'low' ? badge('Menipis', 'warn') : ''; };

function barChart(buckets, title) {
 const w = 640, h = 220, pl = 8, pr = 8, pt = 22, pb = 30, n = buckets.length, mx = Math.max(...buckets.map(b => b.v), 1), bw = (w - pl - pr) / n;
 const total = sum(buckets, b => b.v);
 return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}. Total ${rp(total)}"><title>${esc(title)}</title>
 ${[0, .5, 1].map(k => `<line x1="${pl}" x2="${w - pr}" y1="${h - pb - (h - pt - pb) * k}" y2="${h - pb - (h - pt - pb) * k}" class="grid"/>`).join('')}
 ${buckets.map((b, i) => { const bh = (b.v / mx) * (h - pt - pb), x = pl + i * bw + bw * .16, d = new Date(b.t); return `<g><rect class="bar ${i === n - 1 ? 'last' : ''}" x="${f1(x)}" y="${f1(h - pb - bh)}" width="${f1(bw * .68)}" height="${f1(Math.max(bh, b.v ? 2 : 0))}" rx="4"><title>${d.getDate()}/${d.getMonth() + 1}: ${rp(b.v)}</title></rect>${i % 2 === 0 || n <= 8 ? `<text x="${f1(x + bw * .34)}" y="${h - 10}" text-anchor="middle">${d.getDate()}/${d.getMonth() + 1}</text>` : ''}${b.v && bh > 16 && n <= 14 ? `<text x="${f1(x + bw * .34)}" y="${f1(h - pb - bh - 5)}" text-anchor="middle" class="val">${b.v >= 1e6 ? dec1(b.v / 1e6) + ' jt' : Math.round(b.v / 1000) + ' rb'}</text>` : ''}</g>`; }).join('')}</svg>`;
}
const f1 = n => Math.round(n * 10) / 10;

function dashAccess(r, scope) {
 const u = me();
 if (!u) { S.redirect = '#' + r.path; save(); setTimeout(() => go('/masuk'), 0); return loginNeeded(); }
 if (scope === 'admin' && u.role !== 'admin') return deniedPage('Panel ini hanya untuk admin. Masuk dengan akun admin demo untuk mencobanya.');
 if (scope === 'penjual' && u.role === 'admin') return deniedPage('Akun admin memakai Panel Admin. Gunakan akun penjual untuk melihat dashboard toko.');
 if (scope === 'penjual' && !u.shopId) return `<div class="wrap narrow center page-pad"><span class="state-ic ok">${icon('store')}</span><h1>Anda belum punya toko</h1><p class="muted">Buka toko untuk mulai menjual dan mengelola pesanan.</p><a class="btn" href="#/buka-toko">Buka toko</a></div>`;
 return null;
}

function dashShell(scope, sub, title, body) {
 const u = me(), sh = scope === 'penjual' ? shop(u.shopId) : null;
 const allParcels = parcelsOf(sh ? sh.id : '');
 const toPack = allParcels.filter(({o, pc}) => o.pay === 'paid' && pc.status === 'Dikemas').length;
 const inbox = S.messages.filter(m => m.to === (sh ? sh.id : 'platform') && !m.read).length;
 const nav = scope === 'penjual'
  ? [['', 'Ringkasan', 'chart'], ['produk', 'Produk', 'tag'], ['pesanan', 'Pesanan', 'box', toPack], ['pesan', 'Pesan', 'chat', inbox], ['toko', 'Profil toko', 'store']]
  : [['', 'Ringkasan', 'chart'], ['produk', 'Produk', 'tag'], ['pesanan', 'Pesanan', 'box'], ['toko', 'Toko', 'store'], ['pelanggan', 'Pelanggan', 'users'], ['voucher', 'Voucher', 'gift'], ['pesan', 'Pesan', 'chat', inbox], ['data', 'Data demo', 'info']];
 const cur = sub === 'order' ? 'pesanan' : sub;
 return `<div class="adm"><nav class="adm-side" id="admSide" aria-label="Menu ${scope === 'penjual' ? 'penjual' : 'admin'}">${logoHtml('#/' + scope, 'on-dark')}
  <p class="adm-who">${scope === 'penjual' ? esc(sh.name) : 'Panel admin'}<small>${esc(u.name)}</small></p>
  ${nav.map(([k, t, ic, n]) => `<a href="#/${scope}${k ? '/' + k : ''}" class="${cur === k || (k === 'produk' && cur === 'produk') ? 'on' : ''}" ${cur === k ? 'aria-current="page"' : ''} data-act="admClose">${icon(ic)}<span>${t}</span>${n ? `<i class="count">${n}</i>` : ''}</a>`).join('')}
  <div class="adm-foot"><a href="#/" data-act="admClose">${icon('home')}<span>Lihat marketplace</span></a><button data-act="logout">${icon('logout')}<span>Keluar</span></button></div></nav>
  <div class="drawer-bg" id="admBg" data-act="admMenu" aria-hidden="true"></div>
  <main class="adm-main" id="main" tabindex="-1"><div class="adm-top"><button class="icb adm-burger" data-act="admMenu" aria-label="Buka menu dashboard" aria-expanded="false" aria-controls="admSide">${icon('menu')}</button><h1>${title}</h1><span class="muted small grow right">Data demo · tersimpan di browser ini</span></div>${body}</main></div>`;
}

/* ---------- ringkasan ---------- */
function dashHome(scope) {
 const u = me(), sh = scope === 'penjual' ? shop(u.shopId) : null, items = parcelsOf(sh ? sh.id : '');
 const rev = revenueByDay(items, 14), revAll = sum(items.filter(countsRevenue), x => x.pc.subtotal);
 const pack = items.filter(({o, pc}) => o.pay === 'paid' && pc.status === 'Dikemas');
 const prods = S.products.filter(p => !sh || p.shop === sh.id);
 const low = prods.filter(p => stockState(p) !== 'ok' && !p.digital);
 const top = topProducts(items, 5);
 const kpis = scope === 'penjual'
  ? [['Pendapatan (14 hari)', rp(sum(rev, b => b.v)), '#/penjual/pesanan'], ['Total pendapatan', rp(revAll), '#/penjual/pesanan'], ['Perlu diproses', pack.length, '#/penjual/pesanan?f=proses'], ['Stok menipis / habis', low.length, '#/penjual/produk?stok=low']]
  : [['Total transaksi (GMV)', rp(sum(S.orders.filter(o => o.pay === 'paid'), o => o.total)), '#/admin/pesanan'], ['Pesanan', S.orders.length, '#/admin/pesanan'], ['Toko aktif', S.shops.filter(s => s.active !== false).length, '#/admin/toko'], ['Produk', S.products.length, '#/admin/produk']];
 return `<div class="kpis">${kpis.map(([l, v, h]) => `<a class="kpi" href="${h}"><span class="l">${l}</span><span class="v">${v}</span></a>`).join('')}</div>
 <div class="two dash"><section class="panel"><h2 class="h3">Pendapatan 14 hari terakhir</h2>${barChart(rev, 'Pendapatan per hari, 14 hari terakhir')}<p class="muted small">Dihitung dari paket yang sudah dibayar dan tidak dibatalkan.</p></section>
 <section class="panel"><h2 class="h3">Produk terlaris</h2>${top.length ? top.map(t => `<div class="bar-row"><div class="sum-row small"><span>${esc(t.name)}</span><b>${rp(t.rev)}</b></div><div class="meter" role="presentation"><i style="width:${t.rev / top[0].rev * 100}%"></i></div></div>`).join('') : '<p class="muted">Belum ada penjualan.</p>'}</section></div>
 <section class="panel"><div class="sec-h sm"><h2 class="h3">${scope === 'penjual' ? 'Perlu diproses' : 'Pesanan terbaru'}</h2><a class="small" href="#/${scope}/pesanan">Lihat semua</a></div>
  ${scope === 'penjual' ? (pack.length ? parcelTable(pack, scope) : '<p class="muted">Semua pesanan sudah diproses. 🎉</p>') : orderTable(S.orders.slice(0, 6), scope)}</section>
 <section class="panel"><div class="sec-h sm"><h2 class="h3">Stok menipis / habis</h2><a class="small" href="#/${scope}/produk">Kelola produk</a></div>${low.length ? `<div class="scroll-x"><table class="tbl"><thead><tr><th>Produk</th><th>Stok</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>${low.slice(0, 6).map(p => `<tr><td>${esc(p.name)}</td><td>${totalStock(p)} ${stockTag(p)}</td><td class="right"><a class="btn sm ghost" href="#/${scope}/produk/${p.id}">Ubah stok</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Stok semua produk aman.</p>'}</section>`;
}

function parcelTable(rows, scope) {
 return `<div class="scroll-x"><table class="tbl"><thead><tr><th>Pesanan</th><th>Tanggal</th><th>Pembeli</th><th>Barang</th><th class="right">Jumlah</th><th>Status</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>${rows.map(({o, pc}) => `<tr><td><a class="strong" href="#/${scope}/pesanan/${o.id}">${o.id}</a></td><td>${fdate(o.created)}</td><td>${esc(o.customer)}</td><td>${pc.items.map(i => `${i.qty} × ${esc(i.name)}`).join('<br>')}</td><td class="right">${rp(pc.subtotal)}</td><td>${statusBadge(pc.status)}</td><td class="right"><a class="btn sm ${pc.status === 'Dikemas' ? '' : 'ghost'}" href="#/${scope}/pesanan/${o.id}">${pc.status === 'Dikemas' ? 'Proses' : 'Detail'}</a></td></tr>`).join('')}</tbody></table></div>`;
}
function orderTable(rows, scope) {
 if (!rows.length) return '<p class="muted">Belum ada pesanan.</p>';
 return `<div class="scroll-x"><table class="tbl"><thead><tr><th>Pesanan</th><th>Tanggal</th><th>Pembeli</th><th>Paket</th><th class="right">Total</th><th>Status</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>${rows.map(o => `<tr><td><a class="strong" href="#/${scope}/pesanan/${o.id}">${o.id}</a></td><td>${fdate(o.created)}</td><td>${esc(o.customer)}</td><td>${o.parcels.length}</td><td class="right">${rp(o.total)}</td><td>${orderBadge(o)}</td><td class="right"><a class="btn sm ghost" href="#/${scope}/pesanan/${o.id}">Detail</a></td></tr>`).join('')}</tbody></table></div>`;
}

/* ---------- produk ---------- */
function dashProducts(r, scope) {
 const u = me(), sh = scope === 'penjual' ? shop(u.shopId) : null, q = norm(r.q.get('q') || ''), cat = r.q.get('cat') || '', stok = r.q.get('stok') || '', sid = r.q.get('toko') || '';
 let l = S.products.filter(p => (!sh || p.shop === sh.id) && (!sid || p.shop === sid) && (!cat || p.cat === cat) && (!q || norm(p.name + ' ' + p.id).includes(q)) && (!stok || (stok === 'low' ? stockState(p) !== 'ok' && !p.digital : stok === 'out' ? stockState(p) === 'out' : true)));
 const per = 10, pages = Math.max(1, Math.ceil(l.length / per)), pg = clamp(+r.q.get('page') || 1, 1, pages);
 const stockCell = p => p.digital ? '<span class="muted">Digital</span>' : hasVariants(p) ? `${totalStock(p)} <small class="muted">(${p.variants.items.length} varian)</small> ${stockTag(p)}` : `${p.stock || 0} ${stockTag(p)}`;
 return `<div class="toolbar"><form data-form="dashQ" data-scope="${scope}" class="grow csearch" role="search" aria-label="Cari produk toko"><label class="sr" for="aq">Cari produk</label>${icon('search')}<input class="inp" id="aq" name="q" placeholder="Cari nama atau kode produk" value="${esc(r.q.get('q') || '')}"></form>
  <label class="sr" for="acat">Kategori</label><select class="inp auto" id="acat" data-act="dashFilter" data-k="cat"><option value="">Semua kategori</option>${CATS.map(c => `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${esc(c.short)}</option>`).join('')}</select>
  <label class="sr" for="astok">Stok</label><select class="inp auto" id="astok" data-act="dashFilter" data-k="stok"><option value="">Semua stok</option><option value="low" ${stok === 'low' ? 'selected' : ''}>Menipis / habis</option><option value="out" ${stok === 'out' ? 'selected' : ''}>Habis</option></select>
  ${scope === 'admin' ? `<label class="sr" for="atoko">Toko</label><select class="inp auto" id="atoko" data-act="dashFilter" data-k="toko"><option value="">Semua toko</option>${S.shops.map(s => `<option value="${s.id}" ${sid === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>` : ''}
  <a class="btn" href="#/${scope}/produk/baru">${icon('plus')}Tambah produk</a></div>
 ${l.length ? `<div class="scroll-x"><table class="tbl"><caption class="sr">Daftar produk</caption><thead><tr><th><span class="sr">Foto</span></th><th>Produk</th>${scope === 'admin' ? '<th>Toko</th>' : ''}<th>Kategori</th><th class="right">Harga</th><th>Stok</th><th>Status</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>${l.slice((pg - 1) * per, pg * per).map(p => `<tr><td>${imgTag(mainImage(p), '', 'thumb', 'width="48" height="48"')}</td><td><b>${esc(p.name)}</b>${p.featured ? ' ' + badge('Unggulan', 'gold') : ''}<br><small class="muted mono">${p.id}</small></td>${scope === 'admin' ? `<td>${esc(shop(p.shop)?.name || '-')}</td>` : ''}<td>${esc(catOf(p.cat).short)}</td><td class="right">${rp(p.price)}${p.was ? `<br><s class="muted small">${rp(p.was)}</s>` : ''}</td><td class="nowrap">${stockCell(p)}</td>
  <td><label class="switch"><input type="checkbox" data-act="toggleActive" data-id="${p.id}" ${p.active !== false ? 'checked' : ''} aria-label="Produk ${esc(p.name)} ${p.active !== false ? 'aktif' : 'nonaktif'}"><span></span></label></td>
  <td class="right nowrap"><a class="btn sm ghost" href="#/produk/${p.id}">Lihat</a> <a class="btn sm ghost" href="#/${scope}/produk/${p.id}">Ubah</a> <button class="btn sm ghost danger-t" data-act="delProd" data-id="${p.id}" aria-label="Hapus ${esc(p.name)}">Hapus</button></td></tr>`).join('')}</tbody></table></div>${pager(pg, pages, 'dashPage')}`
  : empty('tag', 'Belum ada produk yang cocok', q || cat || stok ? 'Ubah filter atau kata kunci pencarian.' : 'Tambahkan produk pertama Anda.', `<a class="btn" href="#/${scope}/produk/baru">Tambah produk</a>`)}`;
}
const variantsToText = p => hasVariants(p) ? p.variants.items.map(v => `${v.name} | ${v.stock} | ${v.delta || 0}`).join('\n') : '';
const specsToText = p => (p.specs || []).map(([k, v]) => `${k}: ${v}`).join('\n');
function productForm(r, scope) {
 const u = me(), sh = scope === 'penjual' ? shop(u.shopId) : null, id = r.parts[2], isNew = id === 'baru';
 const p = isNew ? {id: '', name: '', cat: 'kitab', price: '', was: '', stock: '', weight: '', po: 0, digital: false, desc: '', tags: [], specs: [], featured: false, active: true, shop: sh ? sh.id : S.shops[0].id} : prod(id);
 if (!p) return notFound('Produk tidak ditemukan.');
 if (!isNew && !canManageProduct(p)) return deniedPage('Anda tidak berwenang mengubah produk ini.');
 admImgs = null;
 const g = isNew ? [] : galleryOf(p);
 return `<form data-form="product" data-scope="${scope}" data-id="${isNew ? '' : p.id}" class="panel prod-form" novalidate>
 <div class="pf-grid"><div class="pf-img"><p class="lbl">Foto produk</p><img id="pimg" class="thumbprev" src="${isNew ? SITE_IMG.placeholder : mainImage(p)}" alt="Pratinjau foto produk" width="200" height="200">
  <label class="btn sm ghost block file-btn">${icon('plus')}Unggah foto<input type="file" accept="image/*" class="sr" data-act="prodImg"></label><span class="err" data-err="img" id="err-img" role="alert"></span>
  ${!isNew && p.imgs && p.imgs.length ? '<button type="button" class="btn sm ghost block" data-act="prodImgClear">Pakai ilustrasi bawaan</button>' : ''}
  <p class="muted small">Opsional. Tanpa unggahan dipakai ilustrasi kategori. Foto diperkecil dan disimpan di browser (demo).${g.length > 1 ? ` Produk ini punya ${g.length} gambar galeri bawaan.` : ''}</p></div>
 <div>${scope === 'admin' && isNew ? F('shop', 'Toko', {type: 'select', opts: S.shops.map(s => [s.id, s.name]), v: p.shop}) : ''}
  ${F('name', 'Nama produk', {v: p.name, req: true, attr: 'maxlength="90"'})}
  <div class="row2">${F('cat', 'Kategori', {type: 'select', opts: CATS.map(c => [c.id, c.name]), v: p.cat})}${F('weight', 'Berat (gram)', {type: 'number', v: p.weight || '', attr: 'min="0" inputmode="numeric"', hint: 'Dipakai menghitung ongkir. Kosongkan/0 untuk produk digital.'})}</div>
  <div class="row2">${F('price', 'Harga (Rp)', {type: 'number', v: p.price, req: true, attr: 'min="100" inputmode="numeric"'})}${F('was', 'Harga sebelum diskon (opsional)', {type: 'number', v: p.was || '', attr: 'min="0" inputmode="numeric"', hint: 'Isi lebih besar dari harga untuk menampilkan diskon.'})}</div>
  <div class="row2">${F('po', 'Pre-order (hari)', {type: 'number', v: p.po || 0, attr: 'min="0" max="60"', hint: '0 = siap kirim.'})}<div class="field"><span class="lbl">Jenis</span>${chk('digital', 'Produk digital (tanpa ongkir, stok tak terbatas)', p.digital)}${chk('active', 'Tampilkan di toko (aktif)', p.active !== false)}${scope === 'admin' ? chk('featured', 'Tampilkan sebagai produk unggulan', p.featured) : ''}</div></div>
  ${F('stock', 'Stok', {type: 'number', v: hasVariants(p) ? '' : (p.stock ?? ''), attr: 'min="0" inputmode="numeric"', hint: 'Dipakai bila produk tidak punya varian.'})}
  <fieldset class="variant-edit"><legend>Varian (opsional)</legend>${F('vlabel', 'Nama pilihan', {v: hasVariants(p) ? p.variants.label : '', ph: 'mis. Ukuran, Warna, Rasa'})}${F('vtext', 'Daftar varian', {type: 'textarea', v: variantsToText(p), ph: 'S | 10 | 0\nM | 12 | 0\nXL | 5 | 10000', attr: 'rows="4"', hint: 'Satu baris per varian: <code>Nama | stok | tambahan harga</code>. Bila diisi, stok produk dihitung dari varian.'})}</fieldset>
  ${F('desc', 'Deskripsi', {type: 'textarea', v: p.desc, req: true, attr: 'rows="4" maxlength="1200"'})}
  <div class="row2">${F('tags', 'Kata kunci (pisahkan koma)', {v: (p.tags || []).join(', '), ph: 'sarung, tenun, pria'})}${F('specs', 'Spesifikasi (satu baris: Nama: nilai)', {type: 'textarea', v: specsToText(p), attr: 'rows="3"', ph: 'Bahan: Katun\nUkuran: 115 × 200 cm'})}</div>
  <div class="btn-row"><button class="btn lg">${isNew ? 'Simpan produk' : 'Simpan perubahan'}</button><a class="btn ghost lg" href="#/${scope}/produk">Batal</a></div></div></div></form>`;
}

/* ---------- pesanan ---------- */
function dashOrders(r, scope) {
 const u = me(), sh = scope === 'penjual' ? shop(u.shopId) : null;
 if (scope === 'penjual') {
  const f = r.q.get('f') || 'semua';
  const rows = parcelsOf(sh.id).filter(({o}) => o.pay === 'paid').sort((a, b) => b.o.created - a.o.created);
  const defs = [['semua', 'Semua', () => true], ['proses', 'Perlu diproses', x => x.pc.status === 'Dikemas'], ['kirim', 'Dikirim', x => x.pc.status === 'Dikirim'], ['selesai', 'Selesai', x => x.pc.status === 'Selesai'], ['batal', 'Dibatalkan', x => x.pc.status === 'Dibatalkan']];
  const cur = defs.find(d => d[0] === f) || defs[0], l = rows.filter(cur[2]);
  return `${filterTabs(cur[0], 'penjual/pesanan', defs.map(d => [d[0], d[1], rows.filter(d[2]).length]))}${l.length ? parcelTable(l, scope) : empty('box', 'Tidak ada pesanan', 'Pesanan dengan status ini akan muncul di sini.')}`;
 }
 const f = r.q.get('f') || 'all', l = S.orders.filter(o => orderMatches(o, f));
 return `${filterTabs(f, 'admin/pesanan', ORDER_FILTERS.map(([k, t]) => [k, t, S.orders.filter(o => orderMatches(o, k)).length]))}${l.length ? orderTable(l, scope) : empty('box', 'Tidak ada pesanan', 'Pesanan dengan status ini akan muncul di sini.')}`;
}

/* ---------- pesan masuk ---------- */
function dashMessages(scope) {
 const u = me(), to = scope === 'penjual' ? u.shopId : 'platform', l = S.messages.filter(m => m.to === to);
 if (!l.length) return empty('chat', 'Belum ada pesan', 'Pertanyaan dari pembeli akan muncul di sini.');
 return l.map(m => `<article class="panel msg ${m.read ? '' : 'unread'}"><header><div><b>${esc(m.subject)}</b> ${m.read ? '' : badge('Baru', 'gold')}<br><span class="muted small">${esc(m.from.name)} · ${esc(m.from.email)} · ${fdt(m.t)}${m.pid && prod(m.pid) ? ` · <a href="#/produk/${m.pid}">${esc(prod(m.pid).name)}</a>` : ''}</span></div></header><p>${esc(m.text)}</p>
  <div class="btn-row"><a class="btn sm" href="mailto:${encodeURIComponent(m.from.email)}?subject=${encodeURIComponent('Re: ' + m.subject)}">${icon('mail')}Balas lewat email</a>${m.read ? '' : `<button class="btn sm ghost" data-act="msgRead" data-id="${m.id}">Tandai dibaca</button>`}<button class="btn sm ghost danger-t" data-act="msgDel" data-id="${m.id}">Hapus</button></div></article>`).join('');
}

/* ---------- profil toko / toko (admin) / pelanggan / voucher / data ---------- */
function shopForm() {
 const sh = shop(me().shopId);
 return `<form data-form="shopEdit" class="panel narrow-form" novalidate>${F('name', 'Nama toko', {v: sh.name, req: true, attr: 'maxlength="40"'})}${F('type', 'Jenis penjual', {type: 'select', opts: ['Alumni Pesantren', 'UMKM Santri', 'Komunitas Santri', 'Koperasi Pesantren'], v: sh.type, hint: 'Diisi sendiri dan belum diverifikasi.'})}
 <div class="row2">${F('city', 'Kota / kabupaten', {v: sh.city, req: true})}${F('prov', 'Provinsi', {type: 'select', opts: PROVINCES, v: sh.prov})}</div>${F('desc', 'Deskripsi toko', {type: 'textarea', v: sh.desc, req: true, attr: 'rows="4" maxlength="300"'})}
 ${chk('active', 'Toko buka (produk tampil di marketplace)', sh.active !== false)}<div class="btn-row"><button class="btn">Simpan profil toko</button><a class="btn ghost" href="#/toko/${sh.id}">Lihat halaman toko</a></div></form>`;
}
function adminShops() {
 return `<div class="scroll-x"><table class="tbl"><thead><tr><th>Toko</th><th>Pemilik</th><th>Jenis*</th><th>Lokasi</th><th class="right">Produk</th><th>Status</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>${S.shops.map(s => `<tr><td><b>${esc(s.name)}</b><br><small class="muted mono">${s.id}</small></td><td>${esc(s.owner)}${shopOwner(s.id) ? '<br><small class="muted">akun: ' + esc(shopOwner(s.id).email) + '</small>' : ''}</td><td>${esc(s.type)}</td><td>${esc(s.city)}, ${esc(s.prov)}</td><td class="right">${S.products.filter(p => p.shop === s.id).length}</td><td><label class="switch"><input type="checkbox" data-act="toggleShop" data-id="${s.id}" ${s.active !== false ? 'checked' : ''} aria-label="Toko ${esc(s.name)} ${s.active !== false ? 'aktif' : 'nonaktif'}"><span></span></label></td><td class="right"><a class="btn sm ghost" href="#/toko/${s.id}">Lihat</a></td></tr>`).join('')}</tbody></table></div><p class="muted small">*Jenis penjual diisi sendiri dan belum diverifikasi. Menonaktifkan toko menyembunyikan seluruh produknya.</p>`;
}
function adminCustomers() {
 const rows = S.users.filter(u => u.role !== 'admin').map(u => { const os = S.orders.filter(o => o.userId === u.id); return {u, n: os.length, paid: sum(os.filter(o => o.pay === 'paid'), o => o.total), last: Math.max(0, ...os.map(o => o.created))}; }).sort((a, b) => b.paid - a.paid);
 return `<div class="scroll-x"><table class="tbl"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th class="right">Pesanan</th><th class="right">Total dibayar</th><th>Pesanan terakhir</th></tr></thead><tbody>${rows.map(({u, n, paid, last}) => `<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td><td>${u.shopId ? 'Pembeli + penjual' : 'Pembeli'}</td><td class="right">${n}</td><td class="right">${rp(paid)}</td><td>${last ? fdate(last) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
}
function adminVouchers() {
 return `<section class="panel"><h2 class="h3">Voucher baru</h2><form data-form="voucherNew" novalidate><div class="row3">${F('code', 'Kode', {ph: 'mis. RAMADAN15', req: true, attr: 'maxlength="20"'})}${F('type', 'Jenis', {type: 'select', opts: [['pct', 'Persen'], ['fix', 'Nominal'], ['ship', 'Subsidi ongkir']]})}${F('val', 'Nilai', {type: 'number', req: true, ph: '15 atau 20000'})}</div><div class="row3">${F('min', 'Minimum belanja (Rp)', {type: 'number', v: 0})}${F('quota', 'Kuota', {type: 'number', v: 50, req: true})}${F('exp', 'Berlaku sampai', {type: 'date', req: true})}</div><button class="btn sm">Buat voucher</button></form></section>
 <div class="scroll-x"><table class="tbl"><thead><tr><th>Kode</th><th>Potongan</th><th class="right">Minimum</th><th class="right">Terpakai</th><th>Berlaku sampai</th><th>Status</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>${S.vouchers.map((v, i) => `<tr><td><b>${v.code}</b></td><td>${voucherLabel(v)}</td><td class="right">${rp(v.min)}</td><td class="right">${v.used} / ${v.quota}</td><td>${fdate(v.exp)}</td><td>${v.exp < Date.now() ? badge('Kedaluwarsa', 'bad') : v.used >= v.quota ? badge('Habis', 'warn') : badge('Aktif', 'ok')}</td><td class="right"><button class="btn sm ghost danger-t" data-act="delVoucher" data-i="${i}">Hapus</button></td></tr>`).join('')}</tbody></table></div>`;
}
function adminData() {
 return `<section class="panel narrow-form"><h2 class="h3">Data demo</h2><p class="muted">Seluruh data (produk, toko, pesanan, ulasan) disimpan di <b>localStorage</b> browser ini dan tidak dikirim ke server. Mengosongkan data situs menghapusnya.</p>
 <ul class="plain"><li>${S.products.length} produk · ${S.shops.length} toko · ${S.users.length} akun</li><li>${S.orders.length} pesanan · ${S.reviews.length} ulasan · ${S.messages.length} pesan</li></ul>
 <button class="btn danger" data-act="resetDemo">Reset ke data awal</button></section>`;
}

function dashPage(r, scope) {
 const deny = dashAccess(r, scope); if (deny) return deny;
 const sub = r.parts[1] || '', id = r.parts[2];
 let title = 'Ringkasan', body = '';
 if (sub === '') body = dashHome(scope);
 else if (sub === 'produk') { title = id ? (id === 'baru' ? 'Tambah produk' : 'Ubah produk') : 'Produk'; body = id ? productForm(r, scope) : dashProducts(r, scope); }
 else if (sub === 'pesanan' && id) {
  title = 'Detail pesanan'; const o = S.orders.find(x => x.id === id);
  const sid = scope === 'penjual' ? me().shopId : null;
  body = o && (!sid || o.parcels.some(p => p.sid === sid)) && (scope === 'admin' || o.pay === 'paid') ? orderDetailView(o, scope) : notFound('Pesanan tidak ditemukan untuk toko Anda.');
  return dashShell(scope, 'order', title, `<p><a class="small" href="#/${scope}/pesanan">${icon('left')}Kembali ke daftar pesanan</a></p>${body}`);
 }
 else if (sub === 'pesanan') { title = 'Pesanan'; body = dashOrders(r, scope); }
 else if (sub === 'pesan') { title = 'Pesan masuk'; body = dashMessages(scope); }
 else if (sub === 'toko') { title = scope === 'penjual' ? 'Profil toko' : 'Toko'; body = scope === 'penjual' ? shopForm() : adminShops(); }
 else if (sub === 'pelanggan' && scope === 'admin') { title = 'Pelanggan'; body = adminCustomers(); }
 else if (sub === 'voucher' && scope === 'admin') { title = 'Voucher'; body = adminVouchers(); }
 else if (sub === 'data' && scope === 'admin') { title = 'Data demo'; body = adminData(); }
 else body = notFound();
 return dashShell(scope, sub, title, body);
}
