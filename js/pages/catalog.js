/* Katalog: pencarian, filter, urutan, tampilan grid/daftar, paginasi. Seluruh state ada di URL (#/produk?...). */
function parseFilters(q) {
 return {
  q: (q.get('q') || '').trim(), cat: q.getAll('cat').filter(c => catOf(c)), min: +q.get('min') || 0, max: +q.get('max') || 0,
  sort: q.get('sort') || '', stock: q.get('stock') === '1', sale: q.get('sale') === '1', rate: +q.get('rate') || 0, shop: q.get('shop') || ''
 };
}
const SORTS = [['', 'Paling relevan'], ['pop', 'Terlaris'], ['new', 'Terbaru'], ['pa', 'Harga: rendah ke tinggi'], ['pd', 'Harga: tinggi ke rendah'], ['rate', 'Rating tertinggi']];
const PRICE_PRESETS = [['Di bawah 50 rb', 0, 50000], ['50 – 150 rb', 50000, 150000], ['150 – 300 rb', 150000, 300000], ['Di atas 300 rb', 300000, 0]];

function catalogPage(r) {
 const q = r.q, f = parseFilters(q), list = queryProducts(f);
 const per = CFG.perPage, pages = Math.max(1, Math.ceil(list.length / per)), pg = clamp(+q.get('page') || 1, 1, pages);
 const view = q.get('view') === 'list' ? 'list' : 'grid';
 const sortSel = f.sort || '';
 const title = f.q ? `Hasil untuk “${esc(f.q)}”` : f.cat.length === 1 ? esc(catName(f.cat[0])) : f.sale ? 'Promo & Diskon' : f.shop && shop(f.shop) ? esc(shop(f.shop).name) : 'Semua Produk';
 const shopsWithItems = S.shops.filter(s => s.active !== false && shopProducts(s.id).length);
 const counts = Object.fromEntries(CATS.map(c => [c.id, queryProducts({...f, cat: []}).filter(p => p.cat === c.id).length]));
 const chips = [];
 if (f.q) chips.push(['q', f.q, `Kata kunci: “${f.q}”`]);
 f.cat.forEach(c => chips.push(['cat', c, catName(c)]));
 if (f.shop && shop(f.shop)) chips.push(['shop', f.shop, 'Toko: ' + shop(f.shop).name]);
 if (f.stock) chips.push(['stock', '1', 'Stok tersedia']);
 if (f.sale) chips.push(['sale', '1', 'Sedang diskon']);
 if (f.rate) chips.push(['rate', String(f.rate), `Rating ${f.rate}+`]);
 if (f.min) chips.push(['min', String(f.min), 'Min. ' + rp(f.min)]);
 if (f.max) chips.push(['max', String(f.max), 'Maks. ' + rp(f.max)]);
 const crumbItems = f.cat.length === 1 ? [['Produk', '#/produk'], [catName(f.cat[0])]] : [['Produk']];
 const desc = f.cat.length === 1 ? ` · ${esc(catOf(f.cat[0]).d)}` : '';
 return `<div class="wrap">${crumbs(crumbItems)}
 <div class="page-h"><h1>${title}</h1><p class="muted" id="result-count" role="status">${list.length} produk ditemukan${desc}</p></div>
 <div class="cat-layout">
  <div class="filters-bg ${ui.filtersOpen ? 'open' : ''}" data-act="filters" aria-hidden="true"></div>
  <aside class="filters ${ui.filtersOpen ? 'open' : ''}" id="filters" aria-label="Filter produk">
   <div class="filters-h"><h2>Filter</h2><button class="link" data-act="clearFilters">Reset semua</button><button class="icb filt-close" data-act="filters" aria-label="Tutup filter">${icon('x')}</button></div>
   <div class="filters-body">
   <fieldset><legend>Kategori</legend>${CATS.map(c => `<label class="chk"><input type="checkbox" data-filter="cat" value="${c.id}" ${f.cat.includes(c.id) ? 'checked' : ''}><span>${esc(c.short)}</span><i class="n">${counts[c.id]}</i></label>`).join('')}</fieldset>
   <fieldset><legend>Ketersediaan & promo</legend>
    <label class="chk"><input type="checkbox" data-filter="stock" value="1" ${f.stock ? 'checked' : ''}><span>Hanya yang stoknya tersedia</span></label>
    <label class="chk"><input type="checkbox" data-filter="sale" value="1" ${f.sale ? 'checked' : ''}><span>Sedang diskon</span></label></fieldset>
   <fieldset><legend>Rating</legend>${[['', 'Semua rating'], ['4', '4 ke atas'], ['4.5', '4,5 ke atas']].map(([v, t]) => `<label class="chk"><input type="radio" name="rate" data-filter="rate" value="${v}" ${String(f.rate || '') === v ? 'checked' : ''}><span>${t}</span></label>`).join('')}</fieldset>
   <form data-form="price" novalidate><fieldset><legend>Rentang harga</legend>
    <div class="row2"><div class="field"><label class="sr" for="pmin">Harga minimum</label><input class="inp" id="pmin" name="min" inputmode="numeric" placeholder="Min (Rp)" value="${f.min || ''}"></div><div class="field"><label class="sr" for="pmax">Harga maksimum</label><input class="inp" id="pmax" name="max" inputmode="numeric" placeholder="Maks (Rp)" value="${f.max || ''}"></div></div>
    <span class="err" data-err="max" id="err-max" role="alert"></span>
    <button class="btn sm ghost block">Terapkan harga</button>
    <div class="presets">${PRICE_PRESETS.map(([t, a, b]) => `<button type="button" class="chip-btn ${f.min === a && f.max === b ? 'on' : ''}" data-act="pricePreset" data-min="${a}" data-max="${b}">${t}</button>`).join('')}</div></fieldset></form>
   <fieldset><legend>Toko</legend><label class="sr" for="fshop">Pilih toko</label><select class="inp" id="fshop" data-filter="shop"><option value="">Semua toko</option>${shopsWithItems.map(s => `<option value="${s.id}" ${f.shop === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></fieldset>
   </div>
   <button class="btn block filt-apply" data-act="filters">Tampilkan ${list.length} produk</button>
  </aside>
  <section id="hasil" aria-label="Hasil produk">
   <div class="toolbar">
    <button class="btn ghost sm filt-btn" data-act="filters" aria-controls="filters">${icon('filter')}Filter${chips.length ? ` (${chips.length})` : ''}</button>
    <form class="grow csearch" data-form="csearch" role="search" aria-label="Pencarian katalog"><label class="sr" for="cs">Cari di katalog</label>${icon('search')}<input class="inp" id="cs" name="q" placeholder="Cari nama atau kata kunci" value="${esc(f.q)}" enterkeyhint="search">${f.q ? `<button type="button" class="hs-clear" data-act="clearQ" aria-label="Hapus kata kunci">${icon('x')}</button>` : ''}</form>
    <div class="sortbox"><label for="sort" class="sr">Urutkan</label><select class="inp" id="sort" data-filter="sort">${SORTS.map(([v, t]) => `<option value="${v}" ${sortSel === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="seg" role="radiogroup" aria-label="Tampilan"><label title="Grid"><input type="radio" name="view" data-filter="view" value="grid" aria-label="Tampilan grid" ${view === 'grid' ? 'checked' : ''}><span aria-hidden="true">${icon('grid')}</span></label><label title="Daftar"><input type="radio" name="view" data-filter="view" value="list" aria-label="Tampilan daftar" ${view === 'list' ? 'checked' : ''}><span aria-hidden="true">${icon('list')}</span></label></div>
   </div>
   ${chips.length ? `<div class="chips" aria-label="Filter aktif">${chips.map(c => `<button class="chip" data-act="rmFilter" data-k="${c[0]}" data-v="${esc(c[1])}" aria-label="Hapus filter ${esc(c[2])}">${esc(c[2])}${icon('x')}</button>`).join('')}<button class="link small" data-act="clearFilters">Reset semua</button></div>` : ''}
   ${list.length ? productGrid(list.slice((pg - 1) * per, pg * per), view === 'list' ? 'list' : '') + pager(pg, pages)
    : empty('search', 'Produk tidak ditemukan', f.q ? `Tidak ada produk untuk “${esc(f.q)}”${chips.length > 1 ? ' dengan filter yang dipilih' : ''}. Periksa ejaan, coba kata kunci yang lebih umum, atau reset filter.` : 'Tidak ada produk yang cocok dengan filter ini. Coba longgarkan filter.', `<div class="btn-row center">${f.q ? '<button class="btn" data-act="clearQ">Hapus kata kunci</button>' : ''}<button class="btn ghost" data-act="clearFilters">Reset semua filter</button></div>`)}
  </section>
 </div></div>`;
}

/* toko */
function shopsPage() {
 const shops = S.shops.filter(s => s.active !== false);
 return `<div class="wrap">${crumbs([['Toko santri']])}<div class="page-h"><h1>Toko santri</h1><p class="muted">${shops.length} toko dari santri, alumni, dan komunitas pesantren. Seluruhnya data demo; jenis penjual diisi sendiri dan belum diverifikasi.</p></div>
 <div class="shops page-pad-b">${shops.map(shopCard).join('')}</div></div>`;
}
function shopPage(r) {
 const s = shop(r.parts[1]);
 if (!s || s.active === false) return notFound('Toko ini tidak ditemukan atau sedang nonaktif.');
 const list = shopProducts(s.id).sort((a, b) => b.sold - a.sold), rt = shopRating(s.id), owner = shopOwner(s.id);
 const sold = sum(list, p => p.sold);
 return `<div class="wrap">${crumbs([['Toko santri', '#/toko'], [s.name]])}
 <section class="shop-hero" style="--shop:${s.color}">${avatar(s.name, s.color, 'xl')}<div class="shop-info"><h1>${esc(s.name)}</h1><div class="shop-meta"><span class="chip-type">${esc(s.type)}</span><span>${icon('pin')} ${esc(s.city)}, ${esc(s.prov)}</span><span>${icon('clock')} Bergabung ${s.since}</span></div><p class="muted">${esc(s.desc)}</p>
  <div class="shop-stats"><span><b>${list.length}</b> produk</span><span><b>${compact(sold)}</b> terjual</span>${rt ? `<span class="rate">${icon('star')} <b>${dec1(rt.avg)}</b> (${rt.n} ulasan)</span>` : '<span class="muted">Belum ada ulasan</span>'}</div></div>
  <div class="shop-act"><button class="btn" data-act="askSeller" data-shop="${s.id}">${icon('chat')}Tanya penjual</button></div></section>
 <div class="page-h"><h2>Produk dari toko ini</h2></div>${list.length ? productGrid(list) : empty('box', 'Belum ada produk', 'Toko ini belum memasang produk.')}<div class="page-pad-b"></div></div>`;
}
