/* Pustaka kecil untuk menggambar ilustrasi produk SVG (tanpa dependensi).
   Semua gambar dibuat sendiri (sintetis) sehingga bebas masalah lisensi. */

export const W = 800;

/* ---------- warna ---------- */
export const hex2rgb = h => {
 h = h.replace('#', '');
 if (h.length === 3) h = h.split('').map(c => c + c).join('');
 const n = parseInt(h, 16);
 return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgb2hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); };
export const lighten = (c, t) => mix(c, '#ffffff', t);
export const darken = (c, t) => mix(c, '#000000', t);

/* ---------- angka & acak ---------- */
export const f = n => Math.round(n * 10) / 10;
export function rng(seed) {
 let a = seed >>> 0;
 return () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
 };
}
export const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ---------- konteks gambar: id unik, defs ---------- */
export class Ctx {
 constructor() { this.n = 0; this.defs = []; }
 id(p = 'g') { return `${p}${++this.n}`; }
 /* stops: ['#a','#b'] atau [[offset,'#c',opacity?], ...] */
 stopsXml(stops) {
  return stops.map((s, i) => {
   if (typeof s === 'string') return `<stop offset="${f(i / (stops.length - 1) * 100)}%" stop-color="${s}"/>`;
   const [o, c, op] = s;
   return `<stop offset="${f(o * 100)}%" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`;
  }).join('');
 }
 lin(stops, dir = 'v') {
  const id = this.id('lg');
  const d = {v: [0, 0, 0, 1], h: [0, 0, 1, 0], d: [0, 0, 1, 1], u: [0, 1, 0, 0], d2: [1, 0, 0, 1]}[dir] || dir;
  this.defs.push(`<linearGradient id="${id}" x1="${d[0]}" y1="${d[1]}" x2="${d[2]}" y2="${d[3]}">${this.stopsXml(stops)}</linearGradient>`);
  return `url(#${id})`;
 }
 rad(stops, o = {}) {
  const id = this.id('rg');
  const {cx = .5, cy = .5, r = .5, fx = cx, fy = cy} = o;
  this.defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${this.stopsXml(stops)}</radialGradient>`);
  return `url(#${id})`;
 }
 pat(w, h, inner, extra = '') {
  const id = this.id('pt');
  this.defs.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" ${extra}>${inner}</pattern>`);
  return `url(#${id})`;
 }
 blur(std = 10) {
  const id = this.id('bl');
  this.defs.push(`<filter id="${id}" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="${std}"/></filter>`);
  return `url(#${id})`;
 }
 mask(inner) {
  const id = this.id('mk');
  this.defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${W}">${inner}</mask>`);
  return `url(#${id})`;
 }
 clip(inner) {
  const id = this.id('cp');
  this.defs.push(`<clipPath id="${id}">${inner}</clipPath>`);
  return `url(#${id})`;
 }
}

/* ---------- bentuk dasar ---------- */
export const R = (x, y, w, h, r, fill, ex = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r || 0)}" fill="${fill}" ${ex}/>`;
export const C = (cx, cy, r, fill, ex = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" ${ex}/>`;
export const E = (cx, cy, rx, ry, fill, ex = '') => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" ${ex}/>`;
export const P = (d, fill, ex = '') => `<path d="${d}" fill="${fill}" ${ex}/>`;
export const L = (x1, y1, x2, y2, stroke, w = 2, ex = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
export const S = (d, stroke, w = 2, ex = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
export const PG = (pts, fill, ex = '') => `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${fill}" ${ex}/>`;
export const G = (inner, tr = '', ex = '') => `<g${tr ? ` transform="${tr}"` : ''} ${ex}>${inner}</g>`;

/* bintang delapan sudut (khatam): dua persegi bersilang. R = jari-jari luar */
export function star8pts(cx, cy, Rr, rot = 0) {
 const r = Rr * 0.7654, pts = [];
 for (let k = 0; k < 16; k++) {
  const a = (rot + k * 22.5 - 90) * Math.PI / 180, rad = k % 2 ? r : Rr;
  pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
 }
 return pts;
}
export const star8 = (cx, cy, Rr, fill, rot = 0, ex = '') => PG(star8pts(cx, cy, Rr, rot), fill, ex);
export function starN(cx, cy, Ro, Ri, n, fill, rot = 0, ex = '') {
 const pts = [];
 for (let k = 0; k < n * 2; k++) {
  const a = (rot + k * 180 / n - 90) * Math.PI / 180, rad = k % 2 ? Ri : Ro;
  pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
 }
 return PG(pts, fill, ex);
}
/* bulan sabit memakai mask agar tepi bersih */
export function crescent(ctx, cx, cy, r, fill, dx = .42, shrink = .84) {
 // mask dibatasi ke kotak pembatas bulan sabit agar tetap benar di dalam grup yang ditranslasi/diputar
 const pad = r * .25, x = f(cx - r - pad), y = f(cy - r - pad), s = f(2 * (r + pad));
 const id = ctx.id('mk');
 ctx.defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${s}" height="${s}"><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#000"/>${C(cx, cy, r, '#fff')}${C(cx + r * dx, cy - r * .08, r * shrink, '#000')}</mask>`);
 return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fill}" mask="url(#${id})"/>`;
}
/* daun sederhana: pangkal (x,y), panjang len, sudut deg */
export function leaf(x, y, len, deg, fill, vein) {
 const w = len * .34;
 const p = P(`M0 0 C ${f(w)} ${f(-len * .3)} ${f(w * .8)} ${f(-len * .8)} 0 ${f(-len)} C ${f(-w * .8)} ${f(-len * .8)} ${f(-w)} ${f(-len * .3)} 0 0Z`, fill);
 const v = vein ? S(`M0 -2 L0 ${f(-len * .9)}`, vein, Math.max(1.5, len / 60)) : '';
 return G(p + v, `translate(${f(x)} ${f(y)}) rotate(${deg})`);
}
export function sprig(x, y, len, deg, fill, vein) {
 let out = G(S(`M0 0 L0 ${-len}`, darken(fill, .25), 4), `translate(${x} ${y}) rotate(${deg})`);
 const n = 5;
 for (let i = 0; i < n; i++) {
  const yy = -len * (.2 + i * .16), side = i % 2 ? 1 : -1;
  out += G(leaf(0, yy, len * .34, side * 52, fill, vein), `translate(${x} ${y}) rotate(${deg})`);
 }
 out += G(leaf(0, -len, len * .3, 0, fill, vein), `translate(${x} ${y}) rotate(${deg})`);
 return out;
}

/* ---------- pola ---------- */
export function starTile(ctx, color, op = .1, size = 120) {
 const s = size, h = s / 2;
 const star = star8pts(h, h, s * .31).map(p => p.map(f).join(',')).join(' ');
 const d = s * .12;
 const diamond = (x, y) => `<polygon points="${x},${y - d} ${x + d},${y} ${x},${y + d} ${x - d},${y}" />`;
 return ctx.pat(s, s, `<g fill="none" stroke="${color}" stroke-width="2" opacity="${op * 8}"><polygon points="${star}"/>${diamond(0, 0)}${diamond(s, 0)}${diamond(0, s)}${diamond(s, s)}</g>`);
}
export const plaid = (ctx, base, a, b, k = 1) => ctx.pat(64, 64,
 `${R(0, 0, 64, 64, 0, base)}${R(10, 0, 8, 64, 0, a, 'opacity=".9"')}${R(0, 10, 64, 8, 0, a, 'opacity=".9"')}${R(40, 0, 3, 64, 0, b)}${R(0, 40, 64, 3, 0, b)}${R(28, 0, 2, 64, 0, lighten(base, .25), 'opacity=".5"')}${R(0, 28, 64, 2, 0, lighten(base, .25), 'opacity=".5"')}`, `patternTransform="scale(${k})"`);
export const knit = (ctx, color) => ctx.pat(16, 14, `${R(0, 0, 16, 14, 0, color)}${S('M0 7 L4 2 L8 7 L12 2 L16 7', darken(color, .13), 1.6)}${S('M0 14 L4 9 L8 14 L12 9 L16 14', lighten(color, .35), 1.3)}`);
export const weave = (ctx, base, line, size = 20) => ctx.pat(size, size * .8, `${R(0, 0, size, size * .8, 0, base)}${S(`M0 ${size * .4} H${size}`, line, 2)}${S(`M${size * .5} 0 V${size * .4}`, line, 2)}${S(`M0 ${size * .8} H${size}`, line, 2)}${S(`M0 ${size * .4} V${size * .8}`, line, 2)}`);
export const quilt = (ctx, base, line) => ctx.pat(46, 46, `${R(0, 0, 46, 46, 0, base)}${S('M0 23 L23 0 L46 23 L23 46 Z', line, 2)}${C(23, 23, 2.2, line)}`);
export const kawung = (ctx, bg, fg) => ctx.pat(70, 70,
 `${R(0, 0, 70, 70, 0, bg)}${E(35, 17, 14, 22, 'none', `stroke="${fg}" stroke-width="3"`)}${E(35, 53, 14, 22, 'none', `stroke="${fg}" stroke-width="3"`)}${E(17, 35, 22, 14, 'none', `stroke="${fg}" stroke-width="3"`)}${E(53, 35, 22, 14, 'none', `stroke="${fg}" stroke-width="3"`)}${C(35, 35, 4, fg)}${C(0, 0, 4, fg)}${C(70, 0, 4, fg)}${C(0, 70, 4, fg)}${C(70, 70, 4, fg)}`);
export const parang = (ctx, bg, fg, k = 1) => ctx.pat(56, 56,
 `${R(0, 0, 56, 56, 0, bg)}${S('M-8 28 C 6 8, 20 8, 28 28 S 50 48, 64 28', fg, 5)}${S('M-8 56 C 6 36, 20 36, 28 56 S 50 76, 64 56', fg, 5)}${S('M-8 0 C 6 -20, 20 -20, 28 0 S 50 20, 64 0', fg, 5)}${C(14, 46, 2.5, fg)}${C(42, 18, 2.5, fg)}`, `patternTransform="scale(${k})"`);

/* ---------- latar & komposisi ---------- */
const TABLES = {
 kitab: '#B98A5E', busana: '#E7DFD0', ibadah: '#C49A6C', belajar: '#EDE7DB',
 asrama: '#D6DCE3', makanan: '#C9A074', kriya: '#BF9468', digital: '#454B73'
};
export function backdrop(ctx, {tint, view, cat}) {
 const star = starTile(ctx, darken(tint, .28), .1, view === 'detail' ? 170 : 120);
 let out = `<rect width="${W}" height="${W}" fill="${ctx.lin([lighten(tint, .5), lighten(tint, .12), tint])}"/>`;
 if (view === 'scene') {
  const wall = ctx.lin([lighten(tint, .55), lighten(tint, .2)]);
  out = `<rect width="${W}" height="${W}" fill="${wall}"/><rect width="${W}" height="${W}" fill="${star}"/>`;
  const t = TABLES[cat] || '#C49A6C';
  const top = ctx.lin([lighten(t, .22), t, darken(t, .1)]);
  out += `<rect y="548" width="${W}" height="252" fill="${top}"/>`;
  out += `<rect y="548" width="${W}" height="7" fill="${lighten(t, .4)}" opacity=".7"/>`;
  for (let i = 1; i < 5; i++) out += `<line x1="0" x2="${W}" y1="${548 + i * 52}" y2="${548 + i * 52}" stroke="${darken(t, .18)}" stroke-width="2" opacity=".35"/>`;
  out += `<rect y="548" width="${W}" height="60" fill="${ctx.lin([[0, '#000', .16], [1, '#000', 0]])}"/>`;
  return out;
 }
 out += `<rect width="${W}" height="${W}" fill="${star}"/>`;
 out += C(400, view === 'detail' ? 400 : 390, view === 'detail' ? 360 : 300, '#fff', 'opacity=".42"');
 out += C(400, view === 'detail' ? 400 : 390, view === 'detail' ? 250 : 200, '#fff', 'opacity=".28"');
 return out;
}
export const groundShadow = (ctx, cx, cy, rx, ry = 24, op = .2) =>
 E(cx, cy, rx, ry, '#0b2e22', `opacity="${op}" filter="${ctx.blur(12)}"`);

/* ---------- ikon kecil dipakai di beberapa tempat ---------- */
export function mosqueSilhouette(ctx, cx, base, scale, fill) {
 const s = scale;
 const dome = (x, w, h, y) => P(`M${f(x - w / 2)} ${f(y)} C ${f(x - w / 2)} ${f(y - h * 1.15)}, ${f(x + w / 2)} ${f(y - h * 1.15)}, ${f(x + w / 2)} ${f(y)}Z`, fill);
 let o = '';
 o += R(cx - 150 * s, base - 120 * s, 300 * s, 120 * s, 0, fill);
 o += dome(cx, 190 * s, 130 * s, base - 120 * s);
 o += R(cx - 4 * s, base - 300 * s, 8 * s, 40 * s, 0, fill) + C(cx, base - 304 * s, 9 * s, fill);
 o += dome(cx - 112 * s, 80 * s, 56 * s, base - 120 * s) + dome(cx + 112 * s, 80 * s, 56 * s, base - 120 * s);
 for (const dx of [-205, 205]) {
  const x = cx + dx * s;
  o += R(x - 14 * s, base - 270 * s, 28 * s, 270 * s, 0, fill);
  o += R(x - 22 * s, base - 200 * s, 44 * s, 12 * s, 0, fill);
  o += P(`M${f(x - 20 * s)} ${f(base - 270 * s)} L${f(x)} ${f(base - 330 * s)} L${f(x + 20 * s)} ${f(base - 270 * s)}Z`, fill);
 }
 return o;
}
export function lantern(ctx, cx, top, s, body, glow, trim) {
 let o = S(`M${cx} ${top - 70 * s} V${top}`, trim, 4 * s);
 o += R(cx - 22 * s, top, 44 * s, 14 * s, 5 * s, trim);
 o += P(`M${f(cx - 22 * s)} ${f(top + 14 * s)} L${f(cx - 48 * s)} ${f(top + 70 * s)} L${f(cx - 36 * s)} ${f(top + 150 * s)} L${f(cx + 36 * s)} ${f(top + 150 * s)} L${f(cx + 48 * s)} ${f(top + 70 * s)} L${f(cx + 22 * s)} ${f(top + 14 * s)}Z`, body);
 o += P(`M${f(cx - 14 * s)} ${f(top + 34 * s)} L${f(cx - 32 * s)} ${f(top + 74 * s)} L${f(cx - 22 * s)} ${f(top + 130 * s)} L${f(cx + 22 * s)} ${f(top + 130 * s)} L${f(cx + 32 * s)} ${f(top + 74 * s)} L${f(cx + 14 * s)} ${f(top + 34 * s)}Z`, glow);
 o += R(cx - 40 * s, top + 148 * s, 80 * s, 14 * s, 5 * s, trim);
 o += P(`M${f(cx - 14 * s)} ${f(top + 162 * s)} L${f(cx)} ${f(top + 196 * s)} L${f(cx + 14 * s)} ${f(top + 162 * s)}Z`, trim);
 return o;
}
export const sparkle = (x, y, r, fill, op = 1) => starN(x, y, r, r * .28, 4, fill, 0, `opacity="${op}"`);

/* ---------- pembungkus tampilan: main / detail / scene ---------- */
export function wrap(ctx, body) {
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><defs>${ctx.defs.join('')}</defs>${body}</svg>`;
}
