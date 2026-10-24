/* Akun pembeli: ringkasan, pesanan, favorit, notifikasi, profil & alamat. */
const myNotes = () => S.notes.filter(n => n.uid === me()?.id);

function accountPage(r) {
 const u = me();
 if (!u) { S.redirect = '#' + r.path + (r.q.toString() ? '?' + r.q : ''); save(); setTimeout(() => go('/masuk'), 0); return loginNeeded(); }
 const sub = r.parts[1] || '', mine = S.orders.filter(o => o.userId === u.id);
 const unread = myNotes().filter(n => !n.r).length;
 const nav = [['', 'Ringkasan', 'home'], ['pesanan', 'Pesanan saya', 'box'], ['favorit', 'Favorit', 'heart'], ['notifikasi', 'Notifikasi' + (unread ? ` <span class="badge gold">${unread}</span>` : ''), 'bell'], ['profil', 'Profil & alamat', 'user']];
 let body, title = 'Ringkasan';
 if (sub === '') {
  const pend = mine.filter(o => o.pay === 'pending' || o.pay === 'failed'), ship = mine.filter(o => ['Dikirim', 'Sebagian Dikirim'].includes(orderStatus(o)));
  body = `<h1 class="h2">Halo, ${esc(u.name.split(' ')[0])}</h1>
  ${pend.map(o => `<div class="note warn flex" role="status">${icon('clock')}<span>Pesanan <b>${o.id}</b> menunggu pembayaran sebelum <b data-countdown="${o.deadline}" data-oid="${o.id}">${hms(o.deadline - Date.now())}</b>.</span><a class="btn sm" href="#/bayar/${o.id}">Bayar sekarang</a></div>`).join('')}
  <div class="kpis"><a class="kpi" href="#/akun/pesanan"><span class="l">Total pesanan</span><span class="v">${mine.length}</span></a><a class="kpi" href="#/akun/pesanan?f=unpaid"><span class="l">Belum dibayar</span><span class="v">${pend.length}</span></a><a class="kpi" href="#/akun/pesanan?f=shipping"><span class="l">Sedang dikirim</span><span class="v">${ship.length}</span></a><a class="kpi" href="#/favorit"><span class="l">Favorit</span><span class="v">${S.wish.length}</span></a></div>
  <section class="panel"><div class="sec-h sm"><h2 class="h3">Pesanan terbaru</h2><a class="small" href="#/akun/pesanan">Lihat semua</a></div>${mine.length ? mine.slice(0, 3).map(orderCard).join('') : empty('box', 'Belum ada pesanan', 'Pesanan Anda akan muncul di sini.', '<a class="btn" href="#/produk">Mulai belanja</a>')}</section>
  <section class="panel"><div class="sec-h sm"><h2 class="h3">Notifikasi terbaru</h2><a class="small" href="#/akun/notifikasi">Lihat semua</a></div>${myNotes().slice(0, 3).map(n => `<p class="note-row">${n.r ? '' : badge('Baru', 'gold') + ' '}${esc(n.m)} <span class="small muted">${fdt(n.t)}</span></p>`).join('') || '<p class="muted">Belum ada notifikasi.</p>'}</section>
  ${!u.shopId && u.role !== 'admin' ? `<section class="panel promo-inline">${icon('store')}<div><h2 class="h3">Punya produk untuk dijual?</h2><p class="muted small">Buka toko gratis dan kelola pesanan dari dashboard penjual.</p></div><a class="btn" href="#/buka-toko">Buka toko</a></section>` : ''}`;
 } else if (sub === 'pesanan' && r.parts[2]) {
  const o = mine.find(x => x.id === r.parts[2]); title = 'Detail pesanan';
  body = o ? orderDetailView(o, 'akun') : notFound('Pesanan tidak ditemukan di akun Anda.');
 } else if (sub === 'pesanan') {
  const f = r.q.get('f') || 'all', l = mine.filter(o => orderMatches(o, f)); title = 'Pesanan saya';
  body = `<h1 class="h2">Pesanan saya</h1>${filterTabs(f, 'akun/pesanan', ORDER_FILTERS.map(([k, t]) => [k, t, mine.filter(o => orderMatches(o, k)).length]))}${l.length ? l.map(orderCard).join('') : empty('box', 'Belum ada pesanan di sini', 'Pesanan yang sesuai dengan filter ini akan muncul di sini.', '<a class="btn" href="#/produk">Mulai belanja</a>')}`;
 } else if (sub === 'favorit') { title = 'Favorit'; body = wishPage(true); }
 else if (sub === 'notifikasi') {
  title = 'Notifikasi'; const ns = myNotes();
  body = `<div class="od-h"><h1 class="h2">Notifikasi</h1>${unread ? '<button class="btn sm ghost" data-act="readAll">Tandai semua dibaca</button>' : ''}</div>${ns.length ? `<div class="panel">${ns.map(n => `<div class="note-line ${n.r ? '' : 'unread'}"><span>${n.r ? '' : badge('Baru', 'gold') + ' '}${n.link ? `<a href="#${n.link}" data-act="readNote" data-id="${n.id}">${esc(n.m)}</a>` : esc(n.m)}<br><span class="small muted">${fdt(n.t)}</span></span>${n.r ? '' : `<button class="link small" data-act="readNote" data-id="${n.id}" data-stay="1">Tandai dibaca</button>`}</div>`).join('')}</div>` : empty('bell', 'Belum ada notifikasi', 'Kabar pesanan dan pesan akan muncul di sini.')}`;
 } else if (sub === 'profil') {
  title = 'Profil & alamat';
  body = `<h1 class="h2">Profil & alamat</h1>
  <section class="panel"><h2 class="h3">Profil</h2><form data-form="profile" novalidate><div class="row2">${F('name', 'Nama lengkap', {v: u.name, req: true, ac: 'name'})}${F('phone', 'Telepon', {type: 'tel', v: u.phone, req: true, ac: 'tel'})}</div>${F('email', 'Email', {type: 'email', v: u.email, req: true, ac: 'email'})}<button class="btn sm">Simpan profil</button></form></section>
  <section class="panel"><h2 class="h3">Ganti kata sandi</h2><form data-form="pw" novalidate>${F('old', 'Kata sandi saat ini', {type: 'password', req: true})}<div class="row2">${F('pass', 'Kata sandi baru', {type: 'password', req: true, ac: 'new-password', hint: 'Minimal 8 karakter.'})}${F('pass2', 'Ulangi kata sandi baru', {type: 'password', req: true, ac: 'new-password'})}</div><button class="btn sm">Ganti kata sandi</button></form></section>
  <section class="panel"><div class="sec-h sm"><h2 class="h3">Buku alamat</h2><button class="btn sm ghost" data-act="addrModal">${icon('plus')}Tambah alamat</button></div>${u.addresses.length ? u.addresses.map(a => `<div class="addr-row"><span><b>${esc(a.label)}</b> · ${esc(a.name)} · ${esc(a.phone)}<br><span class="small muted">${addrText(a)}</span></span><span class="btn-row"><button class="link small" data-act="addrModal" data-id="${a.id}">Ubah</button><button class="link small danger-t" data-act="rmAddr" data-id="${a.id}">Hapus</button></span></div>`).join('') : '<p class="muted">Belum ada alamat tersimpan.</p>'}</section>
  <section class="panel"><h2 class="h3">Sesi & data demo</h2><p class="small muted">Data tersimpan di browser ini (localStorage) dan dapat hilang bila data situs dibersihkan.</p><div class="btn-row"><button class="btn sm ghost" data-act="resetDemo">Reset data demo</button><button class="btn sm danger" data-act="logout">${icon('logout')}Keluar</button></div></section>`;
 } else { body = notFound(); }
 return `<div class="wrap">${crumbs([['Akun saya', '#/akun'], ...(sub ? [[title]] : [])])}<div class="acc"><nav class="side" aria-label="Menu akun">${nav.map(([k, t, ic]) => `<a href="#/akun${k ? '/' + k : ''}" class="${sub === k ? 'on' : ''}" ${sub === k ? 'aria-current="page"' : ''}>${icon(ic)}<span>${t}</span></a>`).join('')}<button data-act="logout">${icon('logout')}<span>Keluar</span></button></nav><div class="acc-main">${body}</div></div></div>`;
}

/* buka toko */
function openShopPage() {
 const u = me();
 if (!u) { S.redirect = '#/buka-toko'; save(); setTimeout(() => go('/masuk'), 0); return loginNeeded('Masuk untuk membuka toko'); }
 if (u.shopId) return `<div class="wrap narrow center page-pad"><span class="state-ic ok">${icon('store')}</span><h1>Anda sudah punya toko</h1><p class="muted">Kelola produk dan pesanan dari dashboard penjual.</p><a class="btn" href="#/penjual">Buka dashboard toko</a></div>`;
 if (u.role === 'admin') return deniedPage('Akun admin tidak dapat membuka toko. Gunakan akun pembeli.');
 return `<div class="wrap">${crumbs([['Buka toko']])}<div class="two"><div class="panel"><h1 class="h2">Buka toko di ${BRAND.name}</h1><p class="muted">Isi data dasar toko. Anda dapat mengubahnya lagi nanti, lalu langsung menambah produk.</p>
 <form data-form="openShop" novalidate>${F('name', 'Nama toko', {req: true, ph: 'mis. Toko Berkah Santri', attr: 'maxlength="40"'})}
  ${F('type', 'Jenis penjual', {type: 'select', opts: ['Alumni Pesantren', 'UMKM Santri', 'Komunitas Santri', 'Koperasi Pesantren'], v: 'UMKM Santri', hint: 'Diisi sendiri dan belum diverifikasi pada prototipe ini.'})}
  <div class="row2">${F('city', 'Kota / kabupaten', {req: true, ph: 'mis. Kota Malang'})}${F('prov', 'Provinsi', {type: 'select', opts: PROVINCES, v: 'Jawa Timur'})}</div>
  ${F('desc', 'Deskripsi toko', {type: 'textarea', req: true, ph: 'Apa yang Anda jual dan keunggulannya', attr: 'maxlength="300"'})}
  <button class="btn lg">Buka toko</button></form></div>
 <aside class="panel"><h2 class="h3">Cara berjualan</h2><ol class="tl-steps">${STEPS_SELL.map(([t, d]) => `<li><b>${t}</b><span class="muted small">${d}</span></li>`).join('')}</ol><p class="note small">${icon('info')}<span>Toko dan produk Anda hanya tersimpan di browser ini (demo).</span></p></aside></div></div>`;
}
