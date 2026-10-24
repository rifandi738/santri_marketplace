/* Beranda. */
const secHead = (title, sub, link) => `<div class="sec-h"><div><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${link || ''}</div>`;
const seeAll = (href, t = 'Lihat semua') => `<a class="btn sm ghost" href="${href}">${t} ${icon('right')}</a>`;

function shopCard(s) {
 const n = shopProducts(s.id).length, r = shopRating(s.id);
 return `<a class="shopcard" href="#/toko/${s.id}">${avatar(s.name, s.color, 'lg')}<div><b>${esc(s.name)}</b><span class="chip-type">${esc(s.type)}</span>
  <span class="muted small">${icon('pin')} ${esc(s.city)}, ${esc(s.prov)}</span>
  <span class="small">${n} produk${r ? ` · <span class="rate">${icon('star')} ${dec1(r.avg)}</span>` : ''}</span></div></a>`;
}

function homePage() {
 const ok = S.products.filter(listed), inStock = p => totalStock(p) > 0;
 /* tiap seksi mengambil produk yang belum tampil di seksi lain (bila stok kandidat cukup) */
 const seen = new Set();
 const pick = (list, n) => { const out = list.filter(p => !seen.has(p.id)).slice(0, n); for (const p of list) { if (out.length >= n) break; if (!out.includes(p)) out.push(p); } out.forEach(p => seen.add(p.id)); return out; };
 const bySold = [...ok].filter(inStock).sort((a, b) => b.sold - a.sold);
 const featured = pick([...bySold.filter(p => p.featured), ...bySold], 8);
 const best = pick(bySold, 8);
 const umkm = pick(bySold.filter(p => ['kriya', 'makanan', 'digital'].includes(p.cat)), 4);
 const newest = pick([...ok].filter(inStock).sort((a, b) => b.created - a.created), 4);
 const shops = S.shops.filter(s => s.active !== false);
 const kitabMax = Math.max(0, ...ok.filter(p => p.cat === 'kitab').map(discountPct));
 const vShip = S.vouchers.find(v => v.code === 'GRATISONGKIR');
 return `<section class="hero"><div class="wrap hero-in">
  <div class="hero-c">
   <span class="eyebrow">${icon('book')} Marketplace khusus santri</span>
   <h1>Semua kebutuhan santri, dari kitab hingga karya UMKM pesantren</h1>
   <p class="lead">Belanja kitab, busana muslim, perlengkapan ibadah dan asrama, camilan, hingga kerajinan langsung dari toko santri, alumni, dan komunitas pesantren.</p>
   <div class="btn-row"><a class="btn lg" href="#/produk">Mulai Belanja ${icon('right')}</a><button class="btn lg ghost" data-act="scrollTo" data-target="kategori">Jelajahi Kategori</button></div>
   <ul class="trust"><li>${icon('store')}<span><b>${shops.length}</b> toko santri</span></li><li>${icon('tag')}<span><b>${ok.length}</b> produk</span></li><li>${icon('truck')}<span>Ongkir per toko</span></li></ul>
  </div>
  <div class="hero-art"><img src="${SITE_IMG.hero}" alt="Ilustrasi siluet masjid dengan lentera, kitab, peci, tasbih, dan kurma" width="1000" height="800" fetchpriority="high"></div>
 </div></section>

 <section class="sec" id="kategori" aria-labelledby="h-kat"><div class="wrap">${secHead('<span id="h-kat" tabindex="-1">Belanja berdasarkan kategori</span>', 'Pilih kategori untuk menyaring produk.', seeAll('#/produk', 'Semua produk'))}
  <div class="cats">${CATS.map(c => `<a class="cattile" href="#/produk?cat=${c.id}"><img src="${SITE_IMG.cats[c.id]}" alt="" width="400" height="400" loading="lazy"><span><b>${esc(c.short)}</b><small>${catCount(c.id)} produk</small></span></a>`).join('')}</div></div></section>

 <section class="sec tint" aria-labelledby="h-unggul"><div class="wrap">${secHead('<span id="h-unggul">Produk unggulan</span>', 'Pilihan kurasi yang sedang banyak dicari.', seeAll('#/produk?sort=pop'))}${productGrid(featured)}</div></section>

 <section class="sec" aria-label="Promo"><div class="wrap promos">
  ${vShip ? `<article class="promo p-green"><img class="promo-bg" src="${SITE_IMG.banner_ongkir}" alt="" width="1200" height="420" loading="lazy"><div class="promo-t"><span class="eyebrow gold">Subsidi ongkir</span><h3>Potongan ongkir hingga ${rp(vShip.val)}</h3><p>Belanja minimal ${rp(vShip.min)}. Pakai kode <b>${vShip.code}</b> di keranjang.</p><div class="btn-row"><button class="btn sm gold" data-act="copyCode" data-code="${vShip.code}">${icon('copy')}Salin kode</button><a class="btn sm ghost on-dark" href="#/produk">Belanja sekarang</a></div></div></article>` : ''}
  <article class="promo p-maroon"><img class="promo-bg" src="${SITE_IMG.banner_kitab}" alt="" width="1200" height="420" loading="lazy"><div class="promo-t"><span class="eyebrow gold">Kitab & buku</span><h3>${kitabMax ? `Diskon hingga ${kitabMax}%` : 'Kitab pilihan'} untuk kitab dan mushaf</h3><p>Stok terbatas pada produk bertanda diskon.</p><div class="btn-row"><a class="btn sm gold" href="#/produk?cat=kitab&sale=1">Lihat kitab diskon</a></div></div></article>
  <article class="promo p-peach"><img class="promo-bg" src="${SITE_IMG.banner_asrama}" alt="" width="1200" height="420" loading="lazy"><div class="promo-t dark"><span class="eyebrow">Santri baru</span><h3>Lengkapi kamar asrama</h3><p>Bantal, kasur lipat, lemari, lampu belajar, dan gembok.</p><div class="btn-row"><a class="btn sm" href="#/produk?cat=asrama">Belanja perlengkapan asrama</a></div></div></article>
 </div></section>

 <section class="sec" aria-labelledby="h-laris"><div class="wrap">${secHead('<span id="h-laris">Terlaris</span>', 'Paling banyak dibeli santri.', seeAll('#/produk?sort=pop'))}${productGrid(best)}</div></section>

 <section class="sec tint" aria-labelledby="h-toko"><div class="wrap">${secHead('<span id="h-toko">Toko santri pilihan</span>', 'Dikelola santri, alumni, dan komunitas pesantren. Jenis penjual diisi sendiri dan belum diverifikasi (data demo).', seeAll('#/toko', 'Semua toko'))}<div class="shops">${shops.slice(0, 6).map(shopCard).join('')}</div></div></section>

 <section class="sec" aria-labelledby="h-umkm"><div class="wrap">${secHead('<span id="h-umkm">Karya UMKM santri</span>', 'Kerajinan, camilan, dan karya digital buatan komunitas.', seeAll('#/produk?cat=kriya&cat=makanan&cat=digital', 'Lihat semua UMKM'))}${productGrid(umkm)}</div></section>

 <section class="sec tint" aria-labelledby="h-baru"><div class="wrap">${secHead('<span id="h-baru">Produk terbaru</span>', '', seeAll('#/produk?sort=new'))}${productGrid(newest)}</div></section>

 <section class="sec" aria-labelledby="h-unggulan2"><div class="wrap">${secHead('<span id="h-unggulan2">Mengapa belanja di ' + BRAND.name + '</span>', '')}
  <div class="benefits">${BENEFITS.map(b => `<div class="benefit"><span class="b-ic">${icon(b.icon)}</span><h3>${b.t}</h3><p class="muted">${b.d}</p></div>`).join('')}</div></div></section>

 <section class="sec" aria-labelledby="h-jual"><div class="wrap"><div class="sellcta"><img src="${SITE_IMG.banner_jual}" alt="" width="1200" height="420" loading="lazy"><div class="sellcta-t"><span class="eyebrow dark">Untuk penjual</span><h2 id="h-jual">Punya produk? Buka toko di ${BRAND.name}</h2><p>Santri, alumni, dan UMKM pesantren dapat membuka toko, mengatur stok dan varian, lalu memproses pesanan dari satu dashboard.</p><div class="btn-row"><a class="btn" href="#/buka-toko">Buka toko</a><a class="btn ghost" href="#/bantuan">Pelajari caranya</a></div></div></div></div></section>

 <section class="sec" aria-labelledby="h-faq"><div class="wrap narrow">${secHead('<span id="h-faq">Pertanyaan yang sering diajukan</span>', '', seeAll('#/bantuan', 'Semua pertanyaan'))}${FAQS.slice(0, 4).map((f, i) => faqItem(f, i === 0)).join('')}</div></section>`;
}
const faqItem = (f, open) => `<details class="faq" ${open ? 'open' : ''}><summary>${f[0]}</summary><p>${f[1]}</p></details>`;
