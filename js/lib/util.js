/* Utilitas umum: seleksi DOM, escape HTML, format angka/tanggal. Tidak bergantung pada state aplikasi. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const DAY = 864e5, HOUR = 36e5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = p => p + Math.random().toString(36).slice(2, 8).toUpperCase();
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const num = n => Math.round(n).toLocaleString('id-ID');
const compact = n => n >= 1000 ? (n / 1000).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' rb' : String(n);
const dec1 = n => n.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1});
const fdate = t => new Date(t).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
const fdt = t => new Date(t).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const hms = ms => { const t = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(t / 3600), Math.floor(t % 3600 / 60), t % 60].map(n => String(n).padStart(2, '0')).join(':'); };
/* warna teks (putih/hijau tua) dengan kontras >= 4,5:1 di atas latar bg */
const textOn = bg => { const [r, g, b] = [1, 3, 5].map(i => { const c = parseInt(bg.slice(i, i + 2), 16) / 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }); const L = .2126 * r + .7152 * g + .0722 * b; return (1.05 / (L + .05)) >= 4.5 ? '#fff' : '#10261D'; };
const initials = s => String(s || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/* normalisasi untuk pencarian: huruf kecil, tanpa apostrof/diakritik, tanda hubung jadi spasi */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'‘`]/g, '').replace(/[-–—_/]+/g, ' ').replace(/\s+/g, ' ').trim();
