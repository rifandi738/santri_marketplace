/* Data wilayah untuk formulir alamat dan simulasi ongkos kirim. */
const PROVINCES = ['Aceh','Sumatera Utara','Sumatera Barat','Riau','Kepulauan Riau','Jambi','Sumatera Selatan','Kepulauan Bangka Belitung','Bengkulu','Lampung',
 'DKI Jakarta','Jawa Barat','Banten','Jawa Tengah','DI Yogyakarta','Jawa Timur','Bali','Nusa Tenggara Barat','Nusa Tenggara Timur',
 'Kalimantan Barat','Kalimantan Tengah','Kalimantan Selatan','Kalimantan Timur','Kalimantan Utara',
 'Sulawesi Utara','Gorontalo','Sulawesi Tengah','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tenggara',
 'Maluku','Maluku Utara','Papua','Papua Barat','Papua Barat Daya','Papua Selatan','Papua Tengah','Papua Pegunungan'];

/* Tarif simulasi per zona: biaya dasar + biaya per kg (dibulatkan ke atas).
   Ini BUKAN tarif kurir sesungguhnya. Kurir di bawah adalah nama generik, bukan integrasi nyata. */
const ZONES = {
 local:    {name:'Satu kota',          base: 8000,  perKg: 3000, eta:[1,2]},
 regional: {name:'Satu provinsi',      base: 11000, perKg: 4500, eta:[2,3]},
 national: {name:'Antar provinsi',     base: 16000, perKg: 7000, eta:[3,6]}
};
const COURIERS = [
 {id:'reguler', name:'Kurir Reguler', mult:1,   etaShift:0, note:'Pengiriman standar'},
 {id:'kilat',   name:'Kurir Kilat',   mult:1.7, etaShift:-1, note:'Lebih cepat, tarif lebih tinggi'}
];
