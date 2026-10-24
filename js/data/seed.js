/* Data demo awal: akun, pesanan, ulasan, pesan, dan voucher. SEMUA SINTETIS.
   seed() mengisi state global `S` lalu mengembalikannya. Dipanggil saat pertama kali dibuka atau saat "Reset data demo". */
const DEMO_PW = {
 santri:  {salt: '79202736805f9447a97b98c9fb7323ec', hash: '198454ca82e774f14dbb32fb1eaadd91babfa169676feee25b9ea0357a27755b', iter: 100000},   // santri123
 penjual: {salt: 'ef311c0579a9fec5b4beda1fdd36e21f', hash: '16998314726c06a2b0d460da5282900523d3112842c694cfe7a70efab849e097', iter: 100000},   // penjual123
 admin:   {salt: '2e1c82a672d037a7230a0c090566be40', hash: '8fa9827277ea12b28d2d6cc1f7f9347f08b1a9b697a0d9992d04b9d59be27212', iter: 100000},   // admin123
 lain:    {salt: '79fd392e258ba10ac3c01d93b58a4b72', hash: 'a2c99e5a77caf8eb5afa7def0061df3f701540922255f9e50c08d30bd2b302d4', iter: 100000}    // demo12345
};
const DEMO_ACCOUNTS = [
 {role: 'Pembeli', email: 'santri@example.com', pass: 'santri123', to: '/akun'},
 {role: 'Penjual', email: 'penjual@example.com', pass: 'penjual123', to: '/penjual'},
 {role: 'Admin', email: 'admin@example.com', pass: 'admin123', to: '/admin'}
];

const REVIEW_TEXT = {
 kitab: [[5, 'Kertas bagus dan jilidnya kuat. Cetakannya jelas, cocok untuk dibawa mengaji.'], [5, 'Pengiriman rapi dibungkus plastik dan kardus, kitab sampai tanpa lecet.'], [4, 'Isinya sesuai deskripsi. Ukuran sedikit lebih kecil dari bayangan, tapi tetap nyaman dibaca.'], [5, 'Rapi dan mudah dibaca. Sangat membantu untuk santri baru.'], [4, 'Barang sesuai, penjual responsif menjawab pertanyaan sebelum membeli.']],
 busana: [[5, 'Bahannya adem dan jahitannya rapi. Ukuran pas sesuai tabel.'], [4, 'Warna sedikit lebih terang dari foto, tapi bahannya nyaman.'], [5, 'Cocok dipakai ke pengajian. Tidak transparan dan tidak mudah kusut.'], [4, 'Pengiriman cepat. Kancingnya kuat, jahitan bagian lengan rapi.'], [5, 'Sesuai ekspektasi, akan beli lagi untuk adik di pondok.']],
 ibadah: [[5, 'Kualitas bagus untuk harganya. Tidak mudah melar setelah dicuci.'], [4, 'Motifnya bagus, bahan tebal dan nyaman dipakai salat.'], [5, 'Rapi dan sesuai gambar. Cocok untuk hadiah.'], [4, 'Barang bagus, hanya pengemasan bisa lebih rapi lagi.'], [5, 'Dipakai tiap hari di pondok dan masih awet.']],
 belajar: [[5, 'Kertas tidak tembus tinta, tulisan jadi rapi.'], [4, 'Kualitas oke untuk harga segini. Pas untuk kebutuhan sekolah dan mengaji.'], [5, 'Tas muat banyak dan resletingnya kuat. Anak saya senang.'], [4, 'Barang sesuai pesanan, dikirim dengan cepat.'], [5, 'Koperasi yang amanah, harga terjangkau untuk santri.']],
 asrama: [[5, 'Awet dan sesuai kebutuhan di asrama. Pengiriman aman.'], [4, 'Barangnya kokoh, perakitan mudah. Cukup berat saat dikirim.'], [5, 'Sangat membantu untuk santri baru. Kualitas sesuai harga.'], [4, 'Sesuai deskripsi, sedikit berbau plastik di awal tapi hilang setelah diangin-anginkan.'], [5, 'Tidak menyesal belanja di sini, penjual ramah.']],
 makanan: [[5, 'Renyah dan tidak berminyak. Habis dalam sehari dimakan se-asrama.'], [5, 'Rasanya enak, kemasan rapat dan masih segar saat sampai.'], [4, 'Enak, tapi porsi lebih sedikit dari bayangan. Tetap akan beli lagi.'], [5, 'Cocok buat oleh-oleh. Pengemasan aman, tidak ada yang remuk.'], [4, 'Rasa pas, tidak terlalu manis. Pengiriman cepat.']],
 kriya: [[5, 'Hasil karyanya halus dan rapi. Cocok jadi hiasan ruang tamu.'], [4, 'Bagus, warna sesuai foto. Pengerjaan teliti.'], [5, 'Mendukung UMKM alumni, kualitasnya tidak mengecewakan.'], [5, 'Sablonnya tajam dan tidak luntur setelah dicuci.'], [4, 'Barang unik dan rapi, pengiriman agak lama tapi sepadan.']],
 digital: [[5, 'Materinya runtut dan mudah diikuti. Sangat membantu.'], [4, 'Desain template rapi dan mudah diedit.'], [5, 'Berkas diterima segera setelah pembayaran. Isi sesuai deskripsi.'], [4, 'Cukup lengkap untuk harganya.'], [5, 'Karya santri yang berkualitas, semoga terus berkarya.']]
};
const REVIEWER = ['Ahmad F.', 'Siti A.', 'Rizky M.', 'Nur H.', 'Zainal A.', 'Fatimah Z.', 'Hasan B.', 'Aisyah R.', 'Yusuf K.', 'Maryam S.', 'Dimas P.', 'Nabila Z.'];

/* [pembeli, [[produk, varian, jumlah]...], status, hari lalu, metode bayar] */
const SEED_ORDERS = [
 ['u-santri', [['kt-01', null, 2], ['bl-01', null, 1], ['ib-03', 'v2', 1]], 'selesai', 41, 'QRIS'],
 ['u-b2', [['kt-03', 'v2', 1], ['kt-05', null, 3]], 'selesai', 33, 'Virtual account · BCA'],
 ['u-b4', [['dg-01', null, 1], ['dg-05', null, 1]], 'selesai', 27, 'E-wallet · GoPay'],
 ['u-b3', [['kt-02', 'v2', 1], ['ib-06', null, 1]], 'selesai', 22, 'QRIS'],
 ['u-b2', [['bl-05', 'v1', 1]], 'kedaluwarsa', 18, 'QRIS'],
 ['u-b4', [['kt-04', null, 2], ['kt-01', null, 1]], 'selesai', 14, 'Virtual account · BNI'],
 ['u-b3', [['kt-06', null, 1]], 'selesai', 11, 'E-wallet · DANA'],
 ['u-b2', [['mk-01', 'v2', 2], ['mk-03', null, 1]], 'dikirim', 6, 'QRIS'],
 ['u-b3', [['kt-02', 'v2', 2], ['kt-07', null, 1]], 'dikirim', 5, 'Virtual account · Mandiri'],
 ['u-santri', [['mk-01', 'v2', 2], ['mk-03', null, 1]], 'dikirim', 3, 'QRIS'],
 ['u-b2', [['kt-07', null, 2]], 'dikemas', 2, 'E-wallet · OVO'],
 ['u-santri', [['bm-01', 'v3', 1]], 'dikemas', 1, 'Virtual account · BCA'],
 ['u-b4', [['kt-01', null, 3], ['kt-05', null, 2]], 'dikemas', 0.4, 'QRIS'],
 ['u-santri', [['as-05', null, 1], ['as-04', null, 2]], 'menunggu', 0.12, 'QRIS']
];

function seed() {
 const now = Date.now();
 const addr = (id, label, name, phone, line, city, prov, zip) => ({id, label, name, phone, line, city, prov, zip});
 const users = [
  {id: 'u-santri', role: 'user', name: 'Ahmad Fauzan', email: 'santri@example.com', phone: '081234567890', pw: DEMO_PW.santri, addresses: [
   addr('a1', 'Asrama', 'Ahmad Fauzan', '081234567890', 'Asrama Putra Blok C, Jl. Raya Parung No. 12', 'Kabupaten Bogor', 'Jawa Barat', '16330'),
   addr('a2', 'Rumah', 'Ahmad Fauzan', '081234567890', 'Jl. Melati No. 7, Kemang', 'Kota Jakarta Selatan', 'DKI Jakarta', '12730')]},
  {id: 'u-penjual', role: 'user', shopId: 'maktabah-nurul-ilmi', name: 'Hasan Basri', email: 'penjual@example.com', phone: '081322223333', pw: DEMO_PW.penjual, addresses: []},
  {id: 'u-admin', role: 'admin', name: 'Admin PDE Marketplace', email: 'admin@example.com', phone: '', pw: DEMO_PW.admin, addresses: []},
  {id: 'u-b2', role: 'user', name: 'Nabila Zahra', email: 'nabila@example.com', phone: '081355556666', pw: DEMO_PW.lain, addresses: [addr('a1', 'Rumah', 'Nabila Zahra', '081355556666', 'Jl. Cihampelas No. 88', 'Kota Bandung', 'Jawa Barat', '40131')]},
  {id: 'u-b3', role: 'user', name: 'Dimas Prasetyo', email: 'dimas@example.com', phone: '081377778888', pw: DEMO_PW.lain, addresses: [addr('a1', 'Kos', 'Dimas Prasetyo', '081377778888', 'Jl. Gubeng Kertajaya No. 5', 'Kota Surabaya', 'Jawa Timur', '60281')]},
  {id: 'u-b4', role: 'user', name: 'Rina Marlina', email: 'rina@example.com', phone: '081399990000', pw: DEMO_PW.lain, addresses: [addr('a1', 'Rumah', 'Rina Marlina', '081399990000', 'Jl. Kaliurang Km 5', 'Kabupaten Sleman', 'DI Yogyakarta', '55281')]}
 ];

 const products = PRODUCTS.map(p => {
  const c = JSON.parse(JSON.stringify(p)); delete c.days;
  return {...c, tags: c.tags || [], active: true, created: now - p.days * DAY};
 });
 const shops = SHOPS.map(s => ({...s, active: true}));

 /* draf state agar fungsi domain (makeOrder dll.) dapat dipakai saat seeding */
 const draft = S = {
  v: STATE_VERSION, products, shops, users, orders: [], reviews: [], messages: [], notes: [], vouchers: [],
  cart: [], wish: [], voucher: null, vErr: null, direct: null, subscribers: [], pending: null, redirect: null
 };

 draft.vouchers = [
  {code: 'SANTRI10', type: 'pct', val: 10, cap: 50000, min: 100000, exp: now + 90 * DAY, quota: 200, used: 34},
  {code: 'HEMAT25', type: 'fix', val: 25000, min: 150000, exp: now + 60 * DAY, quota: 100, used: 41},
  {code: 'GRATISONGKIR', type: 'ship', val: 20000, min: 75000, exp: now + 45 * DAY, quota: 300, used: 120},
  {code: 'KADALUARSA', type: 'pct', val: 15, min: 0, exp: now - 5 * DAY, quota: 20, used: 3},
  {code: 'HABIS', type: 'pct', val: 20, min: 0, exp: now + 30 * DAY, quota: 10, used: 10}
 ];

 /* pesanan contoh dengan berbagai status */
 SEED_ORDERS.forEach(([uidv, items, status, daysAgo, pay], i) => {
  const user = users.find(u => u.id === uidv);
  const lines = cartLines(items.map(([id, vid, qty]) => ({id, vid, qty})));
  const created = now - daysAgo * DAY;
  const ymd = new Date(created); const stamp = ymd.getFullYear() + String(ymd.getMonth() + 1).padStart(2, '0') + String(ymd.getDate()).padStart(2, '0');
  const o = makeOrder({id: `${CFG.orderPrefix}-${stamp}-${(46656 + 123 + i * 997).toString(36).toUpperCase()}`, user, addr: user.addresses[0] || null, lines, payMethod: pay, created});
  if (status === 'kedaluwarsa') { o.pay = 'expired'; o.parcels.forEach(pc => setParcel(pc, 'Dibatalkan', 'Batas waktu pembayaran habis', created + CFG.payWindowHours * HOUR)); }
  else if (status !== 'menunggu') {
   o.pay = 'paid'; o.paidAt = created + 20 * 60 * 1000;
   o.parcels.forEach((pc, j) => {
    if (pc.digital) { setParcel(pc, 'Selesai', 'Produk digital siap diunduh', o.paidAt); return; }
    setParcel(pc, 'Dikemas', 'Pembayaran diterima. Penjual mengemas pesanan', o.paidAt);
    if (status === 'dikemas') return;
    pc.resi = 'SMK' + String(100000000 + i * 7919 + j * 131).slice(0, 9);
    setParcel(pc, 'Dikirim', `Dikirim dengan ${pc.ship.name}, resi ${pc.resi}`, o.paidAt + DAY);
    if (status === 'selesai') setParcel(pc, 'Selesai', 'Pesanan diterima pembeli', o.paidAt + 3 * DAY);
   });
  }
  draft.orders.push(o);
 });
 draft.orders.sort((a, b) => b.created - a.created);

 /* ulasan contoh (hanya sebagian produk punya ulasan agar status "belum ada ulasan" juga terlihat) */
 products.forEach((p, i) => {
  const pool = REVIEW_TEXT[p.cat], n = (i * 7 + 3) % 5 === 0 ? 0 : 1 + ((i * 5 + p.sold) % 4);
  for (let k = 0; k < n; k++) {
   const [rating, text] = pool[(i + k * 2) % pool.length];
   draft.reviews.push({id: 'r-' + p.id + '-' + k, pid: p.id, uid: null, name: REVIEWER[(i * 3 + k * 5) % REVIEWER.length], rating, text, t: now - (4 + ((i * 11 + k * 23) % 110)) * DAY, verified: k === 0});
  }
 });

 draft.messages = [
  {id: 'm1', to: 'maktabah-nurul-ilmi', from: {uid: 'u-b2', name: 'Nabila Zahra', email: 'nabila@example.com'}, pid: 'kt-03', subject: 'Ketersediaan mushaf warna marun', text: "Assalamu'alaikum, apakah mushaf warna marun akan restock minggu ini? Saya ingin memesan 3 buah untuk hadiah wisuda.", t: now - 2 * DAY, read: false},
  {id: 'm2', to: 'maktabah-nurul-ilmi', from: {uid: null, name: 'Rina Marlina', email: 'rina@example.com'}, pid: 'kt-07', subject: 'Syarah Aqidatul Awam', text: 'Apakah syarah ringkasnya memakai bahasa Indonesia atau Jawa pegon? Terima kasih.', t: now - 5 * DAY, read: true},
  {id: 'm3', to: 'platform', from: {uid: null, name: 'Dimas Prasetyo', email: 'dimas@example.com'}, subject: 'Saran fitur', text: 'Mohon ditambahkan filter toko di halaman produk agar lebih mudah mencari barang dari satu penjual.', t: now - 3 * DAY, read: false}
 ];
 draft.notes = [
  {id: 'n1', uid: 'u-santri', t: now - 3 * HOUR, m: 'Pesanan menunggu pembayaran. Selesaikan sebelum batas waktu.', link: '/akun/pesanan', r: false},
  {id: 'n2', uid: 'u-santri', t: now - 2 * DAY, m: 'Paket pesanan Anda sedang dalam pengiriman.', link: '/akun/pesanan', r: false},
  {id: 'n3', uid: 'u-santri', t: now - 40 * DAY, m: 'Selamat datang di PDE Marketplace (demo)! Jelajahi produk dan coba checkout simulasi.', link: '/produk', r: true},
  {id: 'n4', uid: 'u-penjual', t: now - 0.4 * DAY, m: 'Pesanan baru perlu diproses.', link: '/penjual/pesanan', r: false},
  {id: 'n5', uid: 'u-penjual', t: now - 2 * DAY, m: 'Pesan baru dari Nabila Zahra: Ketersediaan mushaf warna marun', link: '/penjual/pesan', r: false}
 ];
 return draft;
}
