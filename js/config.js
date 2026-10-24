/* PDE Marketplace - konfigurasi merek dan konstanta bisnis.
   Nama merek dan angka bisnis cukup diubah di sini. Warna ada di css/tokens.css,
   logo ada di images/brand/logo.svg. Semua halaman membaca nilai dari file ini. */
const BRAND = {
 name: 'PDE Marketplace',
 fullName: 'Pesantren Digital Ecosystem',
 tagline: 'Marketplace khusus santri',
 desc: 'Marketplace Pesantren Digital Ecosystem (PDE): tempat santri, alumni, dan UMKM pesantren menjual dan membeli kebutuhan sehari-hari.',
 logo: 'images/brand/logo.svg',
 email: 'halo@pde-marketplace.example'
};
const CFG = {
 dataVersion: 1,                 // naikkan 1 setiap data demo di js/data/* berubah
 storageKey: 'pde-marketplace-demo-v',
 sessionKey: 'pde-marketplace-session',
 payWindowHours: 24,             // batas waktu pembayaran
 lowStock: 5,                    // stok <= angka ini ditandai "Sisa N"
 perPage: 12,                    // produk per halaman katalog
 maxQty: 99,                     // batas atas kuantitas per baris keranjang
 otpDemoCode: '123456'           // kode OTP demo (tidak ada email sungguhan)
};
