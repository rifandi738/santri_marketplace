/* Konten statis: FAQ, keunggulan platform, langkah, dan teks halaman informasi. Ubah di sini tanpa menyentuh UI. */
const FAQS = [
 ['Apa itu PDE Marketplace?', 'PDE Marketplace (Pesantren Digital Ecosystem) adalah prototipe marketplace khusus santri, alumni pesantren, dan UMKM komunitas pesantren untuk menjual dan membeli kebutuhan sehari-hari: kitab, busana muslim, perlengkapan ibadah, alat tulis, perlengkapan asrama, makanan, kerajinan, dan karya digital. Seluruh toko, produk, dan harga di sini adalah data demo.'],
 ['Bagaimana cara berbelanja?', 'Cari atau pilih kategori, buka halaman produk, pilih varian bila ada, lalu tekan "Tambah ke keranjang" atau "Beli sekarang". Di halaman checkout pilih alamat, kurir untuk tiap toko, dan metode pembayaran, lalu buat pesanan. Pembayaran pada prototipe ini hanya simulasi.'],
 ['Bagaimana cara berjualan?', 'Masuk, buka halaman "Buka Toko", isi nama dan lokasi toko. Setelah itu Anda dapat menambah produk, mengatur stok dan varian, lalu memproses pesanan (kemas, kirim dengan nomor resi) dari dashboard penjual. Jenis penjual diisi sendiri dan belum diverifikasi pada prototipe ini.'],
 ['Metode pembayaran apa yang tersedia?', 'QRIS, virtual account (BCA, BNI, Mandiri, BRI), dan e-wallet (GoPay, OVO, DANA). Semuanya SIMULASI: tidak ada uang yang berpindah. Di halaman pembayaran tersedia tombol demo untuk mencoba hasil berhasil, gagal, atau kedaluwarsa.'],
 ['Bagaimana ongkos kirim dihitung?', 'Setiap toko mengirim paketnya sendiri, sehingga ongkos dihitung per toko berdasarkan berat dan jarak (satu kota, satu provinsi, atau antar provinsi). Tarifnya simulasi dan bukan tarif kurir sesungguhnya; nama kurir juga generik.'],
 ['Apa arti Pre-order (PO)?', 'Produk PO dibuat atau disiapkan setelah ada pesanan, sehingga membutuhkan waktu beberapa hari sebelum dikirim. Lama PO tertera di halaman produk dan di ringkasan checkout.'],
 ['Bagaimana memakai voucher?', 'Masukkan kode di halaman keranjang. Kode yang dapat dicoba: SANTRI10, HEMAT25, dan GRATISONGKIR. KADALUARSA dan HABIS sengaja disediakan untuk melihat pesan kesalahannya. Syarat minimum belanja ditampilkan jika belum terpenuhi.'],
 ['Bagaimana jika stok habis saat checkout?', 'Stok diperiksa ulang ketika pesanan dibuat. Jika stok tidak lagi mencukupi, Anda akan diberi tahu dan dapat menyesuaikan keranjang. Stok yang ditahan oleh pesanan yang belum dibayar dikembalikan ketika pesanan kedaluwarsa atau dibatalkan.'],
 ['Bagaimana produk digital dikirim?', 'Produk digital tidak memakai ongkos kirim. Setelah pembayaran berhasil, tombol unduh muncul di halaman detail pesanan. Pada prototipe ini berkas yang diunduh adalah berkas contoh, bukan isi produk sebenarnya.'],
 ['Apakah data saya tersimpan aman?', 'Data disimpan di penyimpanan browser perangkat ini saja (localStorage) agar demo dapat dicoba tanpa server. Data tidak dikirim ke mana pun, tidak dibagikan antar perangkat, dan dapat hilang bila data situs dibersihkan. Jangan memasukkan data pribadi atau kata sandi sungguhan.']
];

const BENEFITS = [
 {icon: 'book', t: 'Khusus kebutuhan santri', d: 'Dari kitab dan sarung hingga perlengkapan asrama, semuanya dikurasi untuk keseharian pesantren.'},
 {icon: 'store', t: 'Dukung UMKM santri', d: 'Belanja langsung dari toko milik santri, alumni, dan komunitas pesantren.'},
 {icon: 'truck', t: 'Ongkir jelas per toko', d: 'Setiap toko mengirim sendiri, jadi ongkos dan estimasi tiba terlihat sebelum Anda membayar.'},
 {icon: 'shield', t: 'Checkout terstruktur', d: 'Stok dan voucher diperiksa ulang saat pesanan dibuat, dan status pesanan dapat dilacak.'}
];

const STEPS_BUY = [['Cari & pilih', 'Telusuri kategori atau ketik nama produk.'], ['Masukkan keranjang', 'Pilih varian dan jumlah sesuai stok.'], ['Checkout', 'Pilih alamat, kurir tiap toko, dan metode bayar.'], ['Lacak pesanan', 'Pantau dari dikemas hingga diterima.']];
const STEPS_SELL = [['Buka toko', 'Isi nama dan lokasi toko Anda.'], ['Tambah produk', 'Atur harga, stok, varian, dan foto.'], ['Proses pesanan', 'Kemas, input resi, dan kirim.'], ['Pantau penjualan', 'Lihat pendapatan dan produk terlaris.']];

const LEGAL = {
 syarat: {title: 'Syarat & Ketentuan', note: 'Dokumen contoh untuk prototipe. Tinjau bersama ahli hukum sebelum dipakai di produksi.', sections: [
  ['Sifat layanan', 'PDE Marketplace adalah prototipe demonstrasi. Seluruh toko, produk, harga, ulasan, dan pesanan adalah data sintetis. Tidak ada transaksi keuangan sungguhan dan tidak ada barang yang dikirim.'],
  ['Akun demo', 'Akun demo disediakan untuk mencoba alur pembeli, penjual, dan admin. Kata sandi disimpan dalam bentuk hash di penyimpanan browser Anda, namun mekanisme ini bukan pengganti autentikasi server yang aman.'],
  ['Penjual', 'Jenis penjual (misalnya "Alumni Pesantren") diisi sendiri oleh penjual dan belum diverifikasi. Prototipe ini tidak mengklaim hubungan dengan pesantren tertentu.'],
  ['Pembayaran & pengiriman', 'Pembayaran, voucher, dan tarif kirim adalah simulasi. Nama kurir bersifat generik dan bukan integrasi dengan penyedia sebenarnya.'],
  ['Perubahan', 'Isi dan fitur dapat berubah sewaktu-waktu selama masa pengembangan.']]},
 privasi: {title: 'Kebijakan Privasi', note: 'Dokumen contoh untuk prototipe. Sesuaikan dengan praktik pengolahan data yang sebenarnya.', sections: [
  ['Data yang disimpan', 'Nama, email, alamat, keranjang, favorit, dan pesanan yang Anda buat disimpan hanya di penyimpanan browser perangkat ini (localStorage/sessionStorage).'],
  ['Tidak ada server', 'Prototipe ini tidak memiliki server atau basis data. Tidak ada data yang dikirim, dijual, atau dibagikan. Menghapus data situs akan menghapus seluruh data Anda.'],
  ['Kata sandi', 'Jangan memakai kata sandi sungguhan. Kata sandi demo disimpan sebagai hash bergaram, tetapi penyimpanan di sisi klien tidak cukup aman untuk produksi.'],
  ['Pihak ketiga', 'Font dimuat dari Google Fonts. Selain itu tidak ada pelacak atau layanan analitik.']]}
};
