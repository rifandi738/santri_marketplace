/* Detail produk. State tampilan (varian, jumlah, tab, gambar) disimpan sementara di `pdState`. */
let pdState = {id: null, vid: null, qty: 1, tab: 'desc', img: 0, err: ''};

function pdCap(p) {
 if (!hasVariants(p)) return maxQtyOf(p);
 if (pdState.vid) return maxQtyOf(p, pdState.vid);
 return Math.min(CFG.maxQty, Math.max(0, ...p.variants.items.map(v => v.stock || 0)));
}
const variantChips = (p, selected, name = 'variant', act = 'variant') => `<div class="vchips" role="radiogroup" aria-label="${esc(p.variants.label)}">${p.variants.items.map(v => {
 const out = (v.stock || 0) <= 0;
 return `<label class="vchip ${out ? 'out' : ''}"><input type="radio" name="${name}" value="${v.id}" ${act ? `data-act="${act}"` : ''} ${selected === v.id ? 'checked' : ''} ${out ? 'disabled' : ''}><span>${esc(v.name)}${v.delta ? ` <small>+${rp(v.delta)}</small>` : ''}${out ? ' <small>habis</small>' : ''}</span></label>`;
}).join('')}</div>`;

function reviewList(p) {
 const rs = reviewsOf(p.id).sort((a, b) => b.t - a.t), summary = ratingOf(p.id);
 if (!rs.length) return `<p class="muted">Belum ada ulasan untuk produk ini.</p><button class="btn ghost sm" data-act="review" data-id="${p.id}">Tulis ulasan pertama</button>`;
 const dist = [5, 4, 3, 2, 1].map(n => [n, rs.filter(r => r.rating === n).length]);
 return `<div class="rev-sum"><div class="rev-big"><b>${dec1(summary.avg)}</b>${starsHtml(summary.avg)}<span class="muted small">${summary.n} ulasan</span></div>
  <div class="rev-bars">${dist.map(([n, c]) => `<div><span>${n}</span>${icon('star')}<i><u style="width:${c / rs.length * 100}%"></u></i><span class="muted">${c}</span></div>`).join('')}</div>
  <div><button class="btn ghost sm" data-act="review" data-id="${p.id}">Tulis ulasan</button></div></div>
  <p class="muted small">Ulasan pada prototipe ini adalah data demo kecuali yang Anda tulis sendiri.</p>
  ${rs.map(v => `<article class="review"><div class="review-h"><b>${esc(v.name)}</b>${v.verified ? badge('Pembeli terverifikasi', 'ok') : ''}<span class="muted small">${fdate(v.t)}</span></div>${starsHtml(v.rating)}<p>${esc(v.text)}</p></article>`).join('')}`;
}

function productPage(r) {
 const p = prod(r.parts[1]);
 if (!p || !listed(p)) return notFound('Produk ini tidak ditemukan atau sudah tidak dijual.');
 if (pdState.id !== p.id) pdState = {id: p.id, vid: null, qty: 1, tab: 'desc', img: 0, err: ''};
 if (pdState.vid && (!variantOf(p, pdState.vid) || stockOf(p, pdState.vid) <= 0)) pdState.vid = null;      // varian dihapus/habis sejak dipilih
 const sh = shop(p.shop), g = galleryOf(p), gi = clamp(pdState.img, 0, Math.max(0, g.length - 1)), cur = g[gi] || {src: mainImage(p), label: ''};
 const rt = ratingOf(p.id), w = S.wish.includes(p.id), cap = pdCap(p), out = totalStock(p) <= 0, v = variantOf(p, pdState.vid);
 pdState.qty = clamp(pdState.qty, 1, Math.max(1, cap));
 const st = hasVariants(p) && !pdState.vid ? totalStock(p) : stockOf(p, pdState.vid);
 const stockLine = p.digital ? 'Produk digital · stok tidak terbatas' : out ? 'Stok habis' : st <= CFG.lowStock ? `Sisa ${st} — segera habis` : `Stok tersedia: ${st}`;
 const addr = me()?.addresses?.[0];
 const opts = p.digital ? null : shipOptions(p.weight, zoneOf(sh, addr));
 const eta = opts && opts[0] ? `${opts[0].eta[0]}–${opts[0].eta[1]} hari` : '';
 const rel = queryProducts({cat: [p.cat]}).filter(x => x.id !== p.id).slice(0, 4), more = shopProducts(sh.id).filter(x => x.id !== p.id).slice(0, 4);
 const tabs = [['desc', 'Deskripsi'], ['spec', 'Spesifikasi'], ['ship', 'Pengiriman'], ['rev', `Ulasan (${rt ? rt.n : 0})`]];
 const panels = {
  desc: `<p>${esc(p.desc)}</p>${p.po ? `<p class="note">${icon('clock')} <span><b>Pre-order ${p.po} hari.</b> Barang disiapkan setelah pembayaran, lalu dikirim oleh penjual.</span></p>` : ''}${p.digital ? `<p class="note">${icon('download')} <span><b>Produk digital.</b> Tanpa ongkos kirim. Setelah pembayaran, tombol unduh muncul di halaman pesanan (berkas contoh pada prototipe ini).</span></p>` : ''}${p.tags.length ? `<p class="tags" aria-label="Kata kunci">${p.tags.map(t => `<a class="tag" href="#/produk?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</p>` : ''}`,
  spec: `<dl class="spec">${p.specs.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join('')}<dt>Kategori</dt><dd><a href="#/produk?cat=${p.cat}">${esc(catName(p.cat))}</a></dd>${p.weight ? `<dt>Berat</dt><dd>${p.weight >= 1000 ? dec1(p.weight / 1000) + ' kg' : p.weight + ' g'}</dd>` : ''}<dt>Dikirim dari</dt><dd>${p.digital ? 'Tanpa pengiriman fisik' : esc(sh.city + ', ' + sh.prov)}</dd><dt>Kode produk</dt><dd>${esc(p.id.toUpperCase())}</dd></dl>`,
  ship: p.digital ? '<p>Produk digital tidak memerlukan pengiriman. Setelah pembayaran berhasil, tombol unduh tersedia pada halaman detail pesanan Anda.</p>'
   : `<p>Paket dikirim langsung oleh <b>${esc(sh.name)}</b> dari ${esc(sh.city)}. Ongkos kirim dihitung per toko saat checkout berdasarkan berat dan jarak (satu kota, satu provinsi, atau antar provinsi).</p><ul class="plain">${opts.map(o => `<li><b>${o.name}</b>: estimasi ${o.eta[0]}–${o.eta[1]} hari, mulai ${rp(o.cost)} ${addr ? `ke ${esc(addr.city)}` : '(zona antar provinsi)'}</li>`).join('')}</ul><p class="muted small">Tarif dan nama kurir adalah simulasi, bukan tarif kurir sesungguhnya.</p>`,
  rev: reviewList(p)
 };
 const pct = discountPct(p);
 return `<div class="wrap">${crumbs([['Produk', '#/produk'], [catName(p.cat), '#/produk?cat=' + p.cat], [p.name]])}
 <div class="pd">
  <div class="gallery">
   <div class="g-main"><button class="g-zoom" data-act="zoom" aria-label="Perbesar gambar: ${esc(p.name)}">${imgTag(cur.src, `${p.name}${cur.label ? ' — ' + cur.label : ''}`, '', 'width="800" height="800"')}<span class="g-hint">${icon('search')} Perbesar</span></button>
    ${g.length > 1 ? `<button class="g-nav prev" data-act="gnav" data-d="-1" aria-label="Gambar sebelumnya">${icon('left')}</button><button class="g-nav next" data-act="gnav" data-d="1" aria-label="Gambar berikutnya">${icon('right')}</button>` : ''}
    ${pct ? `<span class="badge gold g-badge">-${pct}%</span>` : ''}</div>
   ${g.length > 1 ? `<div class="g-thumbs" role="group" aria-label="Galeri produk">${g.map((im, i) => `<button class="${i === gi ? 'on' : ''}" data-act="thumb" data-i="${i}" aria-label="Gambar ${i + 1} dari ${g.length}: ${esc(im.label)}" aria-pressed="${i === gi}">${imgTag(im.src, '', '', 'width="120" height="120"')}</button>`).join('')}</div>` : ''}
  </div>
  <div class="pd-info">
   <div class="pd-tags"><a class="chip-type" href="#/produk?cat=${p.cat}">${esc(catOf(p.cat).short)}</a>${p.po ? badge('Pre-order ' + p.po + ' hari', 'info') : ''}${p.digital ? badge('Produk digital', 'dark') : ''}</div>
   <h1>${esc(p.name)}</h1>
   <div class="pd-meta">${rt ? `<a class="rate" href="#/produk/${p.id}" data-act="goReviews">${starsHtml(rt.avg)} <b>${dec1(rt.avg)}</b> <span class="muted">(${rt.n} ulasan)</span></a>` : '<span class="muted">Belum ada ulasan</span>'}<span class="muted">${soldText(p.sold)}</span></div>
   <div class="pd-price" aria-live="polite">${priceHtml(p, pdState.vid)}${v && v.delta ? `<span class="muted small">termasuk tambahan varian ${rp(v.delta)}</span>` : ''}</div>
   ${hasVariants(p) ? `<fieldset class="variant ${pdState.err ? 'has-err' : ''}" id="variant-box"><legend>${esc(p.variants.label)}${v ? `: <b>${esc(v.name)}</b>` : ' <span class="req">(pilih salah satu)</span>'}</legend>${variantChips(p, pdState.vid)}</fieldset>` : ''}
   ${out ? '' : p.digital ? '' : `<div class="qty-row"><span id="qty-l" class="lbl">Jumlah</span><div class="qty" role="group" aria-labelledby="qty-l"><button data-act="pdQty" data-d="-1" aria-label="Kurangi jumlah" ${pdState.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><output aria-live="polite" aria-label="Jumlah dipilih">${pdState.qty}</output><button data-act="pdQty" data-d="1" aria-label="Tambah jumlah" ${pdState.qty >= cap ? 'disabled' : ''}>${icon('plus')}</button></div><span class="stk-line ${out ? 'out' : st <= CFG.lowStock ? 'low' : ''}">${stockLine}</span></div>`}
   ${out ? `<p class="note bad" role="status">${icon('alert')}<span><b>Stok habis.</b> Simpan ke favorit atau tanyakan penjual kapan restock.</span></p>` : p.digital ? `<p class="stk-line">${stockLine}</p>` : ''}
   ${pdState.err ? `<p class="err block" id="pd-err" role="alert">${esc(pdState.err)}</p>` : ''}
   <div class="buy-actions"><button class="btn lg" data-act="addCart" data-id="${p.id}" ${out ? 'disabled' : ''}>${icon('cart')}Tambah ke keranjang</button><button class="btn lg gold" data-act="buyNow" data-id="${p.id}" ${out ? 'disabled' : ''}>Beli sekarang</button></div>
   <div class="pd-tools"><button class="btn ghost sm" data-act="wish" data-id="${p.id}" aria-pressed="${w}">${icon('heart')}${w ? 'Tersimpan di favorit' : 'Simpan ke favorit'}</button><button class="btn ghost sm" data-act="share">${icon('share')}Salin tautan</button><button class="btn ghost sm" data-act="askSeller" data-shop="${sh.id}" data-id="${p.id}">${icon('chat')}Tanya penjual</button></div>
   <div class="ship-note">${icon('truck')}<span>${p.digital ? 'Tanpa ongkir. Unduh setelah pembayaran.' : `Dikirim dari <b>${esc(sh.city)}</b>. ${addr ? `Estimasi tiba ke ${esc(addr.city)}: <b>${eta}</b>.` : `Estimasi ${eta} (ongkir dihitung saat checkout).`}${p.po ? ` Ditambah pre-order ${p.po} hari.` : ''}`}</span></div>
   <div class="seller-card">${avatar(sh.name, sh.color, 'lg')}<div><a class="sc-n" href="#/toko/${sh.id}">${esc(sh.name)}</a><span class="chip-type">${esc(sh.type)}</span><span class="muted small">${icon('pin')} ${esc(sh.city)}, ${esc(sh.prov)}${shopRating(sh.id) ? ` · ${icon('star')} ${dec1(shopRating(sh.id).avg)}` : ''}</span></div><a class="btn sm ghost" href="#/toko/${sh.id}">Kunjungi toko</a></div>
  </div>
 </div>
 <section class="pd-tabs" id="pd-tabs"><div class="tabs" role="tablist" aria-label="Informasi produk">${tabs.map(([k, t]) => `<button role="tab" id="tab-${k}" aria-selected="${pdState.tab === k}" aria-controls="panel-${k}" tabindex="${pdState.tab === k ? 0 : -1}" data-act="tab" data-t="${k}">${t}</button>`).join('')}</div><div class="tabp" role="tabpanel" id="panel-${pdState.tab}" aria-labelledby="tab-${pdState.tab}">${panels[pdState.tab]}</div></section>
 ${rel.length ? `<section class="sec-sm"><h2>Produk serupa</h2>${productGrid(rel)}</section>` : ''}
 ${more.length ? `<section class="sec-sm"><h2>Lainnya dari ${esc(sh.name)}</h2>${productGrid(more)}</section>` : ''}
 </div>
 <div class="mbar"><div class="mbar-p"><small>Harga</small><b>${rp(unitPrice(p, pdState.vid))}</b></div><button class="btn ghost" data-act="addCart" data-id="${p.id}" ${out ? 'disabled' : ''} aria-label="Tambah ke keranjang">${icon('cart')}</button><button class="btn" data-act="buyNow" data-id="${p.id}" ${out ? 'disabled' : ''}>${out ? 'Stok habis' : 'Beli sekarang'}</button></div>`;
}

/* ---------- modal: pilih varian cepat (dari kartu produk) ---------- */
function variantPickerModal(p) {
 modal(`<h3 id="modal-title">Pilih ${esc(p.variants.label.toLowerCase())}</h3><p class="muted small">${esc(p.name)}</p>
 <form data-form="quickVariant" data-id="${p.id}" novalidate>
  <fieldset class="variant"><legend class="sr">${esc(p.variants.label)}</legend>${variantChips(p, null, 'variant', '')}<span class="err" id="err-variant" data-err="variant" role="alert"></span></fieldset>
  <div class="qty-row"><span class="lbl" id="qq-l">Jumlah</span><input class="inp qty-in" name="qty" type="number" min="1" max="${CFG.maxQty}" value="1" inputmode="numeric" aria-labelledby="qq-l"><span class="err" id="err-qty" data-err="qty" role="alert"></span></div>
  <div class="modal-foot"><button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn modal-primary">Tambah ke keranjang</button></div></form>`);
}

/* ---------- modal: ulasan & tanya penjual ---------- */
function reviewModal(pid) {
 const p = prod(pid);
 modal(`<h3 id="modal-title">Tulis ulasan</h3><p class="muted small">${esc(p.name)}</p><form data-form="review" data-id="${pid}" novalidate>
  <fieldset class="field"><legend>Rating</legend><div class="seg stars-in" role="radiogroup" aria-label="Rating">${[5, 4, 3, 2, 1].map(n => `<label><input type="radio" name="rating" value="${n}" ${n === 5 ? 'checked' : ''}><span>${n} ★</span></label>`).join('')}</div></fieldset>
  ${F('text', 'Ulasan Anda', {type: 'textarea', req: true, ph: 'Ceritakan kualitas barang, pengiriman, dan pelayanan penjual.'})}
  <div class="modal-foot"><button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn modal-primary">Kirim ulasan</button></div></form>`);
}
function askModal(shopId, pid) {
 const s = shop(shopId), p = pid ? prod(pid) : null, u = me();
 modal(`<h3 id="modal-title">Tanya penjual</h3><p class="muted small">${esc(s.name)}${p ? ' · ' + esc(p.name) : ''}</p><form data-form="ask" data-shop="${shopId}" data-pid="${pid || ''}" novalidate>
  ${u ? '' : `<div class="row2">${F('name', 'Nama Anda', {req: true, ac: 'name'})}${F('email', 'Email', {type: 'email', req: true, ac: 'email'})}</div>`}
  ${F('subject', 'Judul pesan', {v: p ? 'Tanya: ' + p.name : 'Pertanyaan untuk toko', req: true})}
  ${F('text', 'Pesan', {type: 'textarea', req: true, ph: 'Tulis pertanyaan Anda…'})}
  <p class="muted small">Pesan masuk ke kotak pesan penjual (data demo di browser ini). Penjual membalas lewat email Anda.</p>
  <div class="modal-foot"><button type="button" class="btn ghost" data-act="closeModal">Batal</button><button class="btn modal-primary">Kirim pesan</button></div></form>`);
}
