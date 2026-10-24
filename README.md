# PDE Marketplace (Pesantren Digital Ecosystem)

Prototipe marketplace untuk **santri, alumni pesantren, dan UMKM komunitas pesantren**: kitab dan buku Islami, busana muslim,
sarung/peci/perlengkapan ibadah, alat tulis, perlengkapan asrama, makanan, kerajinan, dan karya digital.
Aplikasi ini adalah transformasi dari repositori [`goen-art-stone`](https://github.com/rifandi738/goen-art-stone)
(situs katalog patung batu) menjadi marketplace multi-penjual.

> **Ini prototipe dengan data demo.** Toko, produk, harga, ulasan, dan pesanan adalah data sintetis.
> Tidak ada server, tidak ada pembayaran sungguhan, dan tidak ada barang yang dikirim.
> Rincian batasan ada di bagian [Keterbatasan](#keterbatasan-demo).

## Menjalankan

Persyaratan: **Node.js 20+** (hanya untuk server lokal dan pengujian; aplikasinya sendiri statis tanpa build). Seluruh pengujian di repositori ini dijalankan pada Node 24.2 dan Chromium; versi Node/browser lain belum diuji.

```bash
npm install        # hanya untuk menjalankan pengujian (axe-core, playwright-core)
npm start          # http://localhost:5173   (PORT=8080 npm start untuk port lain)
```

Alternatif tanpa Node: buka `index.html` langsung di browser, atau sajikan folder ini dengan server statis apa pun
(`npx serve .`, GitHub Pages, Netlify, Vercel "Other"). Routing memakai hash (`#/produk`) sehingga tidak perlu aturan rewrite.
Pada `http://` biasa (mis. IP jaringan lokal) WebCrypto tidak tersedia; aplikasi otomatis memakai implementasi PBKDF2 JavaScript murni.

### Akun demo

| Peran | Email | Kata sandi | Mendarat di |
|---|---|---|---|
| Pembeli | `santri@example.com` | `santri123` | `#/akun` |
| Penjual (Maktabah Nurul Ilmi) | `penjual@example.com` | `penjual123` | `#/penjual` |
| Admin | `admin@example.com` | `admin123` | `#/admin` |

Halaman masuk memiliki tombol akun demo yang mengisi form lalu memverifikasi kata sandi lewat jalur normal.
Kode OTP demo (daftar / lupa sandi): **`123456`** (tidak ada email sungguhan).
Voucher: `SANTRI10` (10%, maks. Rp50.000, min. Rp100.000) · `HEMAT25` (Rp25.000, min. Rp150.000) · `GRATISONGKIR` (subsidi ongkir hingga Rp20.000, min. Rp75.000) ·
`KADALUARSA` dan `HABIS` sengaja disediakan untuk melihat pesan kesalahannya.

### Alur yang dapat dicoba

1. **Belanja**: beranda → kategori/pencarian → filter & urutan → detail produk (galeri, varian, stok) → keranjang (per toko) → voucher.
2. **Checkout**: login → alamat → kurir per toko (ongkir simulasi) → metode bayar → buat pesanan → bayar (berhasil / gagal / kedaluwarsa) → konfirmasi dengan nomor pesanan unik → riwayat & pelacakan.
3. **Penjual**: login penjual → dashboard (grafik pendapatan, antrean) → tambah/ubah produk dengan varian & stok → proses pesanan (kemas → input resi → kirim) → balas pesan pembeli → profil toko. Pengguna baru dapat **membuka toko** sendiri.
4. **Admin**: semua produk & pesanan, aktif/nonaktifkan toko, kelola voucher, pesan platform, reset data demo.
5. **Produk digital**: tanpa ongkir; setelah dibayar muncul tombol unduh (berkas contoh).

## Fitur

| Area | Isi |
|---|---|
| Navigasi | Header dengan dropdown kategori, pencarian + saran (keyboard), menu akun, indikator menu aktif, drawer seluler, breadcrumb |
| Katalog | Pencarian multi-kata dengan sinonim (kopiah↔peci, jilbab↔hijab…), filter kategori/harga/stok/diskon/rating/toko, 6 urutan, grid/daftar, paginasi, chip filter aktif, reset, empty state; seluruh state ada di URL |
| Produk | Galeri, varian (stok per varian, tambahan harga, gambar per varian), kuantitas dibatasi stok, pre-order, produk digital, ulasan (tervalidasi), tanya penjual, produk terkait, favorit |
| Keranjang | Dikelompokkan per toko, ubah jumlah/hapus/pindah ke favorit, peringatan stok, voucher, tersimpan di perangkat |
| Checkout | Alamat (buku alamat + validasi), pengiriman **per toko** (zona kota/provinsi/antar provinsi × berat × kurir), catatan penjual, pembayaran simulasi, "Beli sekarang" terpisah dari keranjang, stok divalidasi ulang, anti klik-ganda |
| Pesanan | Status per paket (Dikemas → Dikirim → Selesai / Dibatalkan), timeline, resi, batal (stok & voucher kembali), kedaluwarsa otomatis 24 jam, faktur cetak, lacak pesanan, notifikasi |
| Akun | Masuk/daftar + OTP/lupa sandi, profil, ganti sandi, buku alamat, favorit, notifikasi, "ingat saya" |
| Dashboard | Penjual (hanya data tokonya) dan admin (semua): ringkasan + grafik, produk (CRUD, unggah foto, varian), pesanan, pesan, toko, pelanggan, voucher |

## Arsitektur

Aplikasi tetap **statis tanpa build** (HTML + CSS + JavaScript klasik, router hash, `localStorage`) seperti repositori asal,
tetapi monolit `app.js` dipecah menurut tanggung jawab:

```
index.html                 kerangka + urutan skrip
css/                       tokens.css (warna/tipografi, ganti merek di sini), components.css, layout.css, pages.css
js/config.js               BRAND (nama, logo, email) dan CFG (batas bisnis)  ← titik ganti merek
js/data/                   categories, sellers, products, geo (wilayah & tarif), content (FAQ), images (pemetaan gambar), seed (data demo)
js/lib/                    util, password (PBKDF2), store (STATE + LOGIKA BISNIS tanpa DOM), ui (komponen)
js/pages/                  layout, home, catalog, product, cart, checkout, orders, auth, account, dashboard, static
js/app.js                  router, aksi (data-act), form (data-form), listener global
images/                    ilustrasi produk/kategori/banner/logo (SVG)
tools/serve.mjs            server statis tanpa dependensi
tools/gen/                 generator ilustrasi (node tools/gen/index.mjs)
tests/                     unit (logika domain), E2E (Playwright), audit (tautan, a11y, responsif)
```

Lapisan data demo dipisahkan dari UI: `js/lib/store.js` memuat seluruh aturan bisnis (varian, stok, voucher, ongkir, pesanan,
hak akses) dan dapat diuji tanpa browser. Untuk memakai backend nyata, ganti fungsi persistensi (`load/save`) dan mutasi di berkas itu.

### Mengubah merek, data, dan gambar

- **Nama/logo/kontak**: `js/config.js` (`BRAND`) dan `images/brand/logo.svg`. **Warna & font**: variabel di `css/tokens.css`.
- **Produk, kategori, toko**: `js/data/products.js`, `categories.js`, `sellers.js`. Setelah mengubahnya naikkan `CFG.dataVersion` di `js/config.js`
  agar browser yang pernah membuka aplikasi memuat data baru (data lama dibuang).
- **Gambar**: dipetakan di `js/data/images.js` (satu berkas, terpisah dari komponen UI). Semua gambar sekarang **ilustrasi sintetis buatan sendiri**
  (bukan foto) yang dihasilkan `tools/gen` — tidak ada masalah lisensi. Untuk memakai foto asli, letakkan berkas di `images/` lalu ubah path di `images.js`.
  Untuk membuat ulang ilustrasi: `npm run gen:images` (spesifikasi per produk di `tools/gen/specs.mjs`).
- Font (Fraunces, Plus Jakarta Sans) dimuat dari Google Fonts dengan fallback sistem; aplikasi tetap berfungsi offline.

## Pengujian

```bash
npm run test:unit   # logika domain, tanpa browser (node:test)
npm run test:e2e    # Chromium sungguhan via playwright-core: alur pembeli/penjual/admin + audit
npm test            # keduanya
```

- **Unit** (`tests/unit.test.mjs`): integritas katalog (ID, harga, stok, gambar ada di disk), hashing password (dicocokkan dengan `crypto.pbkdf2Sync`),
  pencarian/filter/urutan, keranjang & stok, voucher, ongkir, pembuatan/kedaluwarsa/pembatalan pesanan, alur status & hak akses, produk/toko/ulasan.
- **E2E** (`e2e*.test.mjs`): tiap test memakai konteks browser bersih dan **gagal bila ada error konsol/halaman, permintaan gagal, atau dialog `alert/confirm`**.
- **Audit** (`audit.test.mjs`): memastikan tidak ada `data-act`/`data-form` tanpa handler, tidak ada `href="#"`, semua tautan internal valid, setiap kontrol punya
  nama aksesibel dan setiap field punya label, **axe-core (WCAG 2.x A/AA + best-practice) pada 50 kondisi halaman** (publik, pembeli, penjual, admin, dan seluler 390 px), fokus keyboard/jebakan fokus modal,
  tanpa overflow horizontal pada 320, 360, 414, 768, 1024, dan 1440 px, perilaku seluler, persistensi, data rusak, dan XSS.

Chromium dicari otomatis (cache Playwright atau env `CHROMIUM_PATH`); bila belum ada: `npx playwright-core install chromium`.

## Deploy ke Vercel

Aplikasi ini situs statis tanpa build, jadi tidak ada pengaturan khusus. [.vercelignore](.vercelignore) mengecualikan `tests/`, `tools/`, dan `package.json` dari unggahan,
sehingga Vercel menyajikan folder ini apa adanya (routing hash tidak membutuhkan aturan rewrite).

```bash
npx vercel login        # sekali saja
npx vercel --prod       # publikasi ke produksi
```

## Keterbatasan demo

Dicatat apa adanya agar tidak disalahpahami sebagai fitur produksi:

- **Tanpa backend/basis data.** Semua data (produk, pesanan, akun, keranjang) ada di `localStorage` browser ini: tidak permanen, tidak dibagi antar perangkat, dan hilang jika data situs dibersihkan.
  Peran pembeli/penjual/admin hanya dipisahkan di sisi klien; siapa pun dapat membuka DevTools dan mengubah data.
- **Autentikasi bukan keamanan nyata.** Kata sandi disimpan sebagai hash PBKDF2 bergaram (tidak pernah teks asli), tetapi verifikasi berjalan di browser. Jangan memasukkan kata sandi sungguhan.
  OTP adalah kode tetap yang ditampilkan di halaman; tidak ada email dikirim.
- **Pembayaran, voucher, dan ongkir adalah simulasi.** Tidak ada gateway pembayaran; nama kurir generik dan tarif dihitung dari rumus sederhana (zona × berat), bukan API kurir.
- **Gambar produk berupa ilustrasi**, bukan foto. Nama toko/penjual fiktif; "jenis penjual" (mis. Alumni Pesantren) diisi sendiri dan belum diverifikasi; tidak ada klaim terhadap pesantren tertentu.
- **Produk digital**: tombol unduh menghasilkan berkas teks contoh, bukan isi produk.
- **Ulasan**: ulasan awal adalah data demo; ulasan baru hanya tersimpan lokal. Lencana "Pembeli terverifikasi" hanya muncul bila akun itu punya pesanan selesai berisi produk tersebut.
- Foto produk yang diunggah penjual diperkecil dan disimpan sebagai data URL di `localStorage` (batas ±5 MB); aplikasi memberi peringatan bila penyimpanan penuh.
- Untuk produksi diperlukan: backend + basis data, autentikasi server, pembayaran & kurir nyata, penyimpanan berkas, moderasi/verifikasi penjual, email, dan tinjauan hukum atas dokumen syarat & privasi (saat ini hanya contoh).

## Catatan transformasi dari `goen-art-stone`

Nama kerja awal proyek ini "SantriMart" sudah diganti menjadi **PDE Marketplace (Pesantren Digital Ecosystem)**. Nama tampilan dan singkatannya hanya diatur di `js/config.js` (`BRAND.name`, `BRAND.fullName`); kunci penyimpanan browser ikut berganti (`pde-marketplace-demo-v1`), sehingga data demo dari nama lama tidak terbawa.

Dipertahankan: arsitektur SPA statis hash-router, pola event delegation (`data-act`/`data-form`), keranjang, favorit, simulasi pembayaran, OTP, riwayat pesanan, dan dashboard.
Diganti: seluruh domain (patung batu → kebutuhan santri), semua foto (70 foto patung/bengkel: 60 produk + 10 situs → ilustrasi sintetis), bahasa (Inggris → Indonesia), mata uang (IDR/USD → Rupiah),
alur kuotasi/pesanan khusus/ongkir laut (dihapus karena khusus ukiran batu), dan model satu toko menjadi **multi-penjual**.
Diperbaiki: kata sandi plaintext di `localStorage`, tombol/pengaturan yang tidak berfungsi (Google login palsu, "Settings" admin, "Keep me signed in"), ulasan hardcode untuk semua produk,
render ulang yang membuang fokus keyboard, dan `logout` yang tidak memperbarui header saat berada di beranda.
