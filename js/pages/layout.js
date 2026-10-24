/* Kerangka halaman: header, drawer mobile, footer. */
const logoHtml = (href = '#/', cls = '') => `<a class="logo ${cls}" href="${href}"><img src="${BRAND.logo}" alt="" width="36" height="36"><span class="logo-t"><b>${BRAND.name}</b> <small>${BRAND.fullName}</small></span></a>`;

/* menu utama baris kedua; `on` menentukan indikator aktif */
const qkeys = r => [...new Set([...r.q.keys()])].filter(k => k !== 'page' && k !== 'view');
const onlyQ = (r, k, v) => r.parts[0] === 'produk' && !r.parts[1] && qkeys(r).length === 1 && r.q.get(k) === v;
const NAV = [
 ['#/', 'Beranda', r => r.parts[0] === undefined],
 ['#/produk', 'Semua Produk', r => r.parts[0] === 'produk' && !r.parts[1] && !onlyQ(r, 'sale', '1') && !onlyQ(r, 'sort', 'pop') && !onlyQ(r, 'sort', 'new')],
 ['#/produk?sale=1', 'Promo', r => onlyQ(r, 'sale', '1')],
 ['#/produk?sort=pop', 'Terlaris', r => onlyQ(r, 'sort', 'pop')],
 ['#/produk?sort=new', 'Terbaru', r => onlyQ(r, 'sort', 'new')],
 ['#/toko', 'Toko Santri', r => r.parts[0] === 'toko'],
 ['#/bantuan', 'Bantuan', r => r.parts[0] === 'bantuan' || r.parts[0] === 'kontak']
];
const catCount = id => S.products.filter(p => p.cat === id && listed(p)).length;

function accountMenu(u) {
 if (!u) return `<a class="btn sm ghost hd-login" href="#/masuk">Masuk</a><a class="btn sm hd-reg" href="#/daftar">Daftar</a>`;
 const items = [
  ['#/akun', 'user', 'Akun saya'], ['#/akun/pesanan', 'box', 'Pesanan saya'], ['#/favorit', 'heart', 'Favorit'],
  ...(u.shopId ? [['#/penjual', 'store', 'Dashboard toko']] : u.role !== 'admin' ? [['#/buka-toko', 'store', 'Buka toko']] : []),
  ...(u.role === 'admin' ? [['#/admin', 'chart', 'Panel admin']] : [])
 ];
 return `<div class="menu-wrap acct"><button class="acct-btn" data-act="menu" data-menu="acct" aria-expanded="false" aria-controls="menu-acct">${avatar(u.name, '#0F6B4B', 'sm')}<span class="sr">Menu akun </span><span class="acct-n">${esc(u.name.split(' ')[0])}</span>${icon('down', 'chev')}</button>
 <div class="menu right" id="menu-acct" hidden><div class="menu-h"><b>${esc(u.name)}</b><span class="muted small">${esc(u.email)}</span></div>${items.map(i => `<a href="${i[0]}" role="menuitem">${icon(i[1])}${i[2]}</a>`).join('')}<button data-act="logout" role="menuitem">${icon('logout')}Keluar</button></div></div>`;
}

function header(r) {
 const u = me(), cc = cartCount(), wc = S.wish.filter(id => prod(id) && listed(prod(id))).length;
 const q = r.parts[0] === 'produk' ? (r.q.get('q') || '') : '';
 return `<a href="#main" class="skip" data-act="skip">Lewati ke konten utama</a>
 <aside class="utility" aria-label="Informasi platform"><div class="wrap"><span>${BRAND.tagline} · Prototipe dengan data demo</span><nav aria-label="Tautan cepat"><a href="#/buka-toko">Jual di ${BRAND.name}</a><a href="#/bantuan">Bantuan</a><a href="#/lacak">Lacak pesanan</a></nav></div></aside>
 <header class="topbar"><div class="wrap hd">
  <button class="icb burger" data-act="drawer" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="drawer">${icon('menu')}</button>
  ${logoHtml()}
  <div class="menu-wrap catmenu"><button class="catbtn" data-act="menu" data-menu="cats" aria-expanded="false" aria-controls="menu-cats">${icon('grid')}<span>Kategori</span>${icon('down', 'chev')}</button>
   <div class="menu" id="menu-cats" hidden>${CATS.map(c => `<a href="#/produk?cat=${c.id}" role="menuitem">${icon(c.icon)}<span>${esc(c.short)}</span><small>${catCount(c.id)}</small></a>`).join('')}<a class="menu-all" href="#/produk" role="menuitem">Lihat semua produk ${icon('right')}</a></div></div>
  <form class="hsearch" data-form="search" role="search" aria-label="Pencarian produk" autocomplete="off">
   <label class="sr" for="hs">Cari produk</label>
   <input id="hs" name="q" placeholder="Cari kitab, sarung, peci, camilan…" value="${esc(q)}" role="combobox" aria-expanded="false" aria-controls="suggest" aria-autocomplete="list" enterkeyhint="search">
   <button type="button" class="hs-clear" data-act="clearSearch" aria-label="Hapus kata kunci" ${q ? '' : 'hidden'}>${icon('x')}</button>
   <button class="hs-go" aria-label="Cari">${icon('search')}</button>
   <div class="suggest" id="suggest" role="listbox" aria-label="Saran pencarian" hidden></div>
  </form>
  <div class="hd-r">
   <a class="icb" href="#/favorit" aria-label="Favorit, ${wc} produk">${icon('heart')}${wc ? `<span class="cnt">${wc}</span>` : ''}</a>
   <a class="icb" href="#/keranjang" aria-label="Keranjang, ${cc} item">${icon('cart')}${cc ? `<span class="cnt" id="cartCnt">${cc}</span>` : ''}</a>
   ${accountMenu(u)}
  </div></div>
  <nav class="mainnav" aria-label="Menu utama"><div class="wrap">${NAV.map(([h, t, on]) => `<a href="${h}" class="${on(r) ? 'on' : ''}" ${on(r) ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</div></nav>
 </header>
 <div class="drawer-bg" data-act="drawerClose" aria-hidden="true"></div>
 <nav class="drawer" id="drawer" aria-label="Menu seluler" aria-hidden="true" tabindex="-1">
  <div class="drawer-h">${logoHtml('#/', 'on-dark')}<button class="icb" data-act="drawerClose" aria-label="Tutup menu">${icon('x')}</button></div>
  <a href="#/" data-act="drawerClose">${icon('home')}Beranda</a>
  <button class="acc-btn" data-act="drawerCats" aria-expanded="false" aria-controls="drawer-cats">${icon('grid')}Kategori ${icon('down', 'chev')}</button>
  <div class="drawer-cats" id="drawer-cats" hidden>${CATS.map(c => `<a href="#/produk?cat=${c.id}" data-act="drawerClose">${icon(c.icon)}${esc(c.short)}</a>`).join('')}</div>
  <a href="#/produk" data-act="drawerClose">${icon('tag')}Semua produk</a>
  <a href="#/produk?sale=1" data-act="drawerClose">${icon('gift')}Promo & diskon</a>
  <a href="#/toko" data-act="drawerClose">${icon('store')}Toko santri</a>
  <a href="#/favorit" data-act="drawerClose">${icon('heart')}Favorit</a>
  <a href="#/lacak" data-act="drawerClose">${icon('box')}Lacak pesanan</a>
  <a href="#/bantuan" data-act="drawerClose">${icon('info')}Bantuan</a>
  <a href="#/buka-toko" data-act="drawerClose">${icon('store')}Jual di ${BRAND.name}</a>
  <div class="drawer-acct">${u ? `<a href="#/akun" data-act="drawerClose">${icon('user')}${esc(u.name)}</a><button data-act="logout">${icon('logout')}Keluar</button>` : `<a class="btn" href="#/masuk" data-act="drawerClose">Masuk</a><a class="btn ghost on-dark" href="#/daftar" data-act="drawerClose">Daftar</a>`}</div>
 </nav>`;
}

function footer() {
 return `<footer class="foot"><div class="wrap"><div class="cols">
  <div class="fcol-brand">${logoHtml('#/', 'on-dark')}<p>${BRAND.desc}</p>
   <form data-form="news" novalidate><div class="news"><label class="sr" for="nl">Email untuk kabar produk baru</label><input id="nl" name="email" type="email" placeholder="Email Anda" autocomplete="email" aria-describedby="err-nl"><button class="btn sm gold">Berlangganan</button></div><span class="err on-dark" data-err="email" id="err-nl" role="alert"></span></form></div>
  <div><h2 class="fh">Belanja</h2>${CATS.slice(0, 6).map(c => `<a href="#/produk?cat=${c.id}">${esc(c.short)}</a>`).join('')}<a href="#/produk">Semua produk</a></div>
  <div><h2 class="fh">${BRAND.name}</h2><a href="#/tentang">Tentang kami</a><a href="#/toko">Toko santri</a><a href="#/buka-toko">Jual di ${BRAND.name}</a><a href="#/lacak">Lacak pesanan</a></div>
  <div><h2 class="fh">Bantuan</h2><a href="#/bantuan">Pertanyaan umum</a><a href="#/kontak">Hubungi kami</a><a href="#/syarat">Syarat & ketentuan</a><a href="#/privasi">Kebijakan privasi</a><a href="#/akun">Akun saya</a></div>
 </div>
 <div class="bottom"><span>© ${new Date().getFullYear()} ${BRAND.name}. Prototipe: toko, produk, dan transaksi adalah data demo.</span><span>Data tersimpan di browser ini saja · Tidak ada pembayaran sungguhan</span><span class="credit">Prototype by <b>${BRAND.builtBy}</b></span></div></div></footer>`;
}

/* halaman bantuan: tautan yang memerlukan login */
const loginNeeded = (msg = 'Mengalihkan ke halaman masuk…') => `<div class="wrap"><div class="empty" role="status">${icon('user')}<h3>${msg}</h3><p class="muted">Jika tidak berpindah otomatis, <a href="#/masuk">klik di sini</a>.</p></div></div>`;
function notFound(m) { return `<div class="wrap narrow center page-pad"><p class="big-num">404</p><h1>Halaman tidak ditemukan</h1><p class="muted">${m || 'Tautan mungkin salah atau halaman sudah dipindahkan.'}</p><div class="btn-row center"><a class="btn" href="#/">Ke beranda</a><a class="btn ghost" href="#/produk">Lihat produk</a></div></div>`; }
function errorPage() { return `<div class="wrap narrow center page-pad"><span class="state-ic bad">!</span><h1>Halaman gagal dimuat</h1><p class="muted">Terjadi kesalahan saat menampilkan halaman ini. Coba lagi, atau reset data demo bila masalah berulang.</p><div class="btn-row center"><button class="btn" data-act="retry">Coba lagi</button><button class="btn ghost" data-act="resetDemo">Reset data demo</button></div></div>`; }
function deniedPage(msg) { return `<div class="wrap narrow center page-pad"><span class="state-ic warn">${icon('shield')}</span><h1>Anda tidak punya akses</h1><p class="muted">${msg || 'Halaman ini hanya untuk pengguna yang berwenang.'}</p><div class="btn-row center"><a class="btn" href="#/">Ke beranda</a></div></div>`; }
