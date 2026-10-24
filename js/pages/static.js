/* Halaman informasi: tentang, bantuan (FAQ), kontak, syarat & privasi. */
function aboutPage() {
 return `<section class="page-hero"><div class="wrap narrow"><span class="eyebrow">${icon('book')} Tentang ${BRAND.name}</span><h1>Marketplace untuk ekosistem pesantren</h1><p class="lead">${BRAND.desc} Prototipe ini memperlihatkan bagaimana santri, alumni, dan komunitas pesantren dapat berjualan dan berbelanja di satu tempat.</p></div></section>
 <section class="sec"><div class="wrap narrow"><div class="prose">
  <h2>Yang dapat Anda coba</h2>
  <ul><li><b>Pembeli:</b> mencari dan memfilter produk, memilih varian, keranjang per toko, voucher, checkout dengan ongkir per toko, pembayaran simulasi, dan pelacakan pesanan.</li>
  <li><b>Penjual:</b> membuka toko, menambah produk beserta stok dan varian, memproses pesanan (kemas, input resi), membaca pesan pembeli, dan melihat ringkasan penjualan.</li>
  <li><b>Admin:</b> melihat seluruh produk, pesanan, toko, pelanggan, dan mengelola voucher.</li></ul>
  <h2>Yang perlu Anda ketahui</h2>
  <div class="note warn">${icon('info')}<span><b>Ini prototipe.</b> Toko, produk, harga, ulasan, dan pesanan adalah data sintetis. Gambar produk berupa ilustrasi buatan sendiri, bukan foto. Pembayaran, voucher, dan ongkir hanyalah simulasi. Data tersimpan di browser perangkat ini, tidak di server.</span></div>
  <p>Nama toko dan penjual bersifat fiktif dan tidak mewakili pesantren atau usaha tertentu. Jenis penjual (misalnya "Alumni Pesantren") diisi sendiri oleh penjual dan belum diverifikasi.</p>
  <h2>Cara berbelanja</h2><ol class="tl-steps">${STEPS_BUY.map(([t, d]) => `<li><b>${t}</b><span class="muted small">${d}</span></li>`).join('')}</ol>
  <h2>Cara berjualan</h2><ol class="tl-steps">${STEPS_SELL.map(([t, d]) => `<li><b>${t}</b><span class="muted small">${d}</span></li>`).join('')}</ol></div>
  <div class="btn-row"><a class="btn" href="#/produk">Mulai belanja</a><a class="btn ghost" href="#/buka-toko">Buka toko</a><a class="btn ghost" href="#/bantuan">Bantuan</a></div></div></section>`;
}

function helpPage(r) {
 const q = norm(r.q.get('q') || ''), list = FAQS.filter(f => !q || norm(f[0] + ' ' + f[1]).includes(q));
 return `<div class="wrap narrow">${crumbs([['Bantuan']])}<div class="page-h"><h1>Pusat bantuan</h1><p class="muted">Jawaban untuk pertanyaan yang sering diajukan.</p></div>
 <form data-form="faq" role="search" aria-label="Cari pertanyaan" class="csearch" novalidate><label class="sr" for="fq">Cari pertanyaan</label>${icon('search')}<input class="inp" id="fq" name="q" placeholder="Cari pertanyaan, mis. ongkir atau voucher" value="${esc(r.q.get('q') || '')}"></form>
 <div class="faq-list">${list.length ? list.map((f, i) => faqItem(f, q ? list.length <= 3 : i === 0)).join('') : empty('search', 'Tidak ada pertanyaan yang cocok', 'Coba kata lain, atau hubungi kami langsung.', '<a class="btn" href="#/kontak">Hubungi kami</a>')}</div>
 <div class="panel promo-inline">${icon('chat')}<div><h2 class="h3">Belum menemukan jawabannya?</h2><p class="muted small">Kirim pertanyaan lewat formulir kontak. Pesan masuk ke kotak pesan admin (demo).</p></div><a class="btn" href="#/kontak">Hubungi kami</a></div><div class="page-pad-b"></div></div>`;
}

function contactPage() {
 const u = me();
 return `<div class="wrap">${crumbs([['Kontak']])}<div class="two"><div class="panel"><h1 class="h2">Hubungi kami</h1><p class="muted">Pertanyaan tentang pesanan, toko, atau saran untuk ${BRAND.name}. Pada prototipe ini pesan tersimpan di kotak pesan admin (browser ini), bukan dikirim lewat email.</p>
 <form data-form="contact" novalidate><div class="row2">${F('name', 'Nama', {v: u?.name, req: true, ac: 'name'})}${F('email', 'Email', {type: 'email', v: u?.email, req: true, ac: 'email'})}</div>
 ${F('topic', 'Topik', {type: 'select', opts: ['Pertanyaan pesanan', 'Membuka toko', 'Masalah teknis', 'Saran fitur', 'Lainnya']})}${F('text', 'Pesan', {type: 'textarea', req: true, attr: 'rows="5"'})}<button class="btn lg">Kirim pesan</button></form></div>
 <aside class="stack"><section class="panel"><h2 class="h3">Informasi</h2><p class="small">${icon('mail')} <b>Email:</b> <a href="mailto:${BRAND.email}">${BRAND.email}</a><br><span class="muted">(alamat contoh; tidak dipantau)</span></p><p class="small">${icon('clock')} <b>Layanan:</b> prototipe demo, tanpa jam layanan.</p></section>
 <section class="panel"><h2 class="h3">Mungkin membantu</h2><ul class="plain"><li><a href="#/bantuan">Pertanyaan umum</a></li><li><a href="#/lacak">Lacak pesanan</a></li><li><a href="#/buka-toko">Cara membuka toko</a></li></ul></section></aside></div></div>`;
}

function legalPage(key) {
 const d = LEGAL[key];
 return `<div class="wrap narrow">${crumbs([[d.title]])}<div class="page-h"><h1>${d.title}</h1></div><div class="note warn">${icon('info')}<span>${d.note}</span></div><div class="prose">${d.sections.map(([h, t]) => `<h2>${h}</h2><p>${t}</p>`).join('')}</div><div class="page-pad-b"></div></div>`;
}
