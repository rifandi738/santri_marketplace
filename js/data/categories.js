/* Kategori produk. `id` dipakai di URL (?cat=kitab) dan di data produk.
   `kw` = kata kunci pencarian kategori; `tint` hanya dipakai generator ilustrasi (tools/gen). */
const CATS = [
 {id:'kitab',   name:'Kitab & Buku Islami',                 short:'Kitab & Buku',   icon:'book',   kw:['kitab','buku','islami','mushaf'], tint:'#F4E6C3', d:'Kitab kuning, mushaf, dan buku pegangan santri'},
 {id:'busana',  name:'Busana Muslim',                       short:'Busana Muslim',  icon:'shirt',  kw:['busana','pakaian','baju','muslim'], tint:'#D9EADF', d:'Baju koko, gamis, mukena, dan hijab'},
 {id:'ibadah',  name:'Sarung, Peci & Perlengkapan Ibadah',  short:'Sarung & Ibadah',icon:'rug',    kw:['ibadah','perlengkapan ibadah'], tint:'#D3E8E4', d:'Sarung, peci, sajadah, tasbih, dan rehal'},
 {id:'belajar', name:'Alat Tulis & Perlengkapan Belajar',   short:'Alat Tulis',     icon:'pencil', kw:['alat tulis','belajar','sekolah'], tint:'#D9E7F2', d:'Buku tulis, pulpen, tas, dan alat belajar'},
 {id:'asrama',  name:'Perlengkapan Asrama',                 short:'Perlengkapan Asrama', icon:'bed', kw:['asrama','pondok','kamar'], tint:'#F3E0D2', d:'Bantal, kasur lipat, lemari, dan kebutuhan kamar'},
 {id:'makanan', name:'Makanan & Camilan',                   short:'Makanan & Camilan', icon:'jar', kw:['makanan','camilan','snack','oleh oleh'], tint:'#F7E1C4', d:'Camilan, kurma, madu, dan oleh-oleh pesantren'},
 {id:'kriya',   name:'Kerajinan & Produk UMKM Santri',      short:'Kerajinan UMKM', icon:'craft',  kw:['kerajinan','kriya','umkm'], tint:'#EBD9C7', d:'Hiasan, tas, batik, dan kriya karya santri'},
 {id:'digital', name:'Karya Digital Santri',                short:'Karya Digital',  icon:'tablet', kw:['digital','karya digital','daring'], tint:'#E0E4F5', d:'E-book, template, ilustrasi, dan kursus daring'}
];
const catOf = id => CATS.find(c => c.id === id);
