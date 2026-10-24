/* Penjual (toko). SEMUA DATA DEMO / SINTETIS: nama toko dan pemilik fiktif,
   tidak mewakili pesantren atau usaha tertentu. `type` diisi sendiri oleh penjual dan belum diverifikasi. */
const SHOPS = [
 {id:'maktabah-nurul-ilmi', name:'Maktabah Nurul Ilmi', type:'Alumni Pesantren', city:'Kota Kediri', prov:'Jawa Timur', since:2019, color:'#7B4A24',
  owner:'Hasan Basri', desc:'Kitab klasik, mushaf, dan buku pegangan santri yang disortir dan dikemas rapi. Cocok untuk santri baru maupun pengajar.'},
 {id:'butik-barokah', name:'Butik Muslim Barokah', type:'UMKM Santri', city:'Kota Tasikmalaya', prov:'Jawa Barat', since:2020, color:'#2F6F55',
  owner:'Nur Hidayah', desc:'Busana muslim sederhana dan nyaman untuk keseharian di pondok, dijahit oleh penjahit rumahan alumni.'},
 {id:'sarung-nusantara', name:'Sarung Nusantara Santri', type:'UMKM Santri', city:'Kota Pekalongan', prov:'Jawa Tengah', since:2018, color:'#1F3A5F',
  owner:'Zainal Abidin', desc:'Sarung, peci, dan perlengkapan ibadah dengan pilihan motif yang mudah dicari santri.'},
 {id:'koperasi-santri-mandiri', name:'Koperasi Santri Mandiri', type:'Koperasi Pesantren', city:'Kabupaten Bogor', prov:'Jawa Barat', since:2017, color:'#0F6B4B',
  owner:'Pengurus Koperasi', desc:'Koperasi santri yang menyediakan alat tulis dan perlengkapan belajar dengan harga terjangkau.'},
 {id:'pondok-jaya', name:'Toko Pondok Jaya', type:'UMKM Santri', city:'Kota Serang', prov:'Banten', since:2021, color:'#4B6584',
  owner:'Rizky Maulana', desc:'Perlengkapan asrama untuk santri: dari bantal dan kasur lipat hingga lemari dan gembok.'},
 {id:'dapur-santri-berkah', name:'Dapur Santri Berkah', type:'Komunitas Santri', city:'Kabupaten Sleman', prov:'DI Yogyakarta', since:2020, color:'#9A5415',
  owner:'Siti Maryam', desc:'Camilan dan oleh-oleh buatan komunitas santri, dikemas per pesanan agar tetap segar.'},
 {id:'kriya-alumni', name:'Kriya Alumni Pesantren', type:'Alumni Pesantren', city:'Kabupaten Jepara', prov:'Jawa Tengah', since:2016, color:'#8A5A2B',
  owner:'Yusuf Kholil', desc:'Kerajinan kayu, anyaman, dan batik karya alumni; tiap barang dibuat dalam jumlah terbatas.'},
 {id:'karya-digital-santri', name:'Karya Digital Santri', type:'Komunitas Santri', city:'Kota Bandung', prov:'Jawa Barat', since:2022, color:'#4A4E9E',
  owner:'Aisyah Rahmah', desc:'E-book, template desain, ilustrasi, dan kursus daring yang dibuat oleh santri kreator.'}
];
