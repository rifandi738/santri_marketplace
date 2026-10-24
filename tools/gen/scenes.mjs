/* Adegan situs: hero, banner promo, ubin kategori, panel login, logo, placeholder. */
import {Ctx, W, f, lighten, darken, rng, R, C, E, P, L, PG, G, star8, crescent, sparkle, lantern, mosqueSilhouette, starTile, backdrop, groundShadow} from './lib.mjs';
import {KINDS} from './kinds.mjs';

const GOLD = '#D9B45B';
const svgWrap = (ctx, body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${ctx.defs.join('')}</defs>${body}</svg>`;

/* sisipkan jenis gambar produk pada posisi (x,y) = titik dasar, skala s */
function place(ctx, kind, params, x, y, s, rot = 0) {
 const d = KINDS[kind](ctx, params);
 return G(d.svg, `translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${f(s)}) translate(-400 ${f(-d.base.y)})`);
}
function parcel(ctx, x, y, w, h, d, col) {
 return PG([[x, y], [x + w, y], [x + w + d, y - d * .7], [x + d, y - d * .7]], lighten(col, .22))
  + PG([[x + w, y], [x + w + d, y - d * .7], [x + w + d, y + h - d * .7], [x + w, y + h]], darken(col, .22))
  + R(x, y, w, h, 3, col) + R(x, y, w, h, 3, ctx.lin([['0', '#fff', .18], [1, '#000', .16]], 'd'))
  + R(x + w * .42, y, w * .16, h, 0, lighten(col, .38), 'opacity=".9"') + PG([[x + w * .42, y], [x + w * .58, y], [x + w * .58 + d, y - d * .7], [x + w * .42 + d, y - d * .7]], lighten(col, .45), 'opacity=".9"')
  + R(x + w * .08, y + h * .58, w * .26, h * .26, 3, '#fff') + R(x + w * .12, y + h * .66, w * .18, 4, 2, '#BFB59B') + R(x + w * .12, y + h * .75, w * .12, 4, 2, '#BFB59B');
}
const skyline = (ctx, w, base, fills) => fills.map(([cx, s, fill, op]) => G(mosqueSilhouette(ctx, cx, base, s, fill), '', `opacity="${op}"`)).join('');
const hangLantern = (ctx, cx, top, s) => L(cx, 0, cx, top - 70 * s, '#8A5F17', 3) + lantern(ctx, cx, top, s, '#C98F2E', '#FFE9A8', '#8A5F17');

/* ---------- hero ---------- */
export function hero() {
 const ctx = new Ctx(), w = 1000, h = 800, r = rng(5);
 let b = R(0, 0, w, h, 0, ctx.lin([[0, '#07281E'], [.35, '#0E5A40'], [.62, '#2A9168'], [.8, '#F2D488'], [.8001, '#0B4331'], [1, '#062A1F']]));
 b += R(0, 0, 1000, 640, 0, starTile(ctx, '#BFE8D2', .05, 140));
 b += C(790, 160, 120, '#F6E7B4', 'opacity=".12"') + C(790, 160, 78, '#F6E7B4', 'opacity=".12"') + crescent(ctx, 790, 160, 64, '#F2D07C', .4, .82);
 for (let i = 0; i < 26; i++) b += sparkle(30 + r() * 940, 24 + r() * 330, 5 + r() * 9, '#fff', .35 + r() * .55);
 b += skyline(ctx, w, 650, [[740, .86, '#1C7A57', .55], [300, 1.2, '#0A3B2B', 1]]);
 b += R(0, 650, w, 150, 0, ctx.lin(['#0B4331', '#051F17'])) + R(0, 650, w, 150, 0, starTile(ctx, '#7FD1A8', .05, 120)) + R(0, 650, w, 4, 0, '#F2D488', 'opacity=".5"');
 b += hangLantern(ctx, 120, 150, .9) + hangLantern(ctx, 228, 90, .62) + hangLantern(ctx, 905, 120, .78);
 b += E(560, 756, 400, 30, '#000', `opacity=".35" filter="${ctx.blur(14)}"`);
 b += place(ctx, 'book', {cover: '#0E5A3F', deco: 'mushaf', w: 300, h: 410, thick: 52}, 290, 768, .58, -4);
 b += place(ctx, 'book', {cover: '#E7D49A', deco: 'kitab', w: 280, h: 400, thick: 24, pages: '#EFE3BE'}, 430, 770, .52, 3);
 b += place(ctx, 'peci', {color: '#1A1A1D'}, 590, 760, .56);
 b += place(ctx, 'tasbih', {}, 736, 742, .5, 6);
 b += place(ctx, 'datesBowl', {}, 880, 776, .36);
 return svgWrap(ctx, b, w, h);
}

/* ---------- banner promo (1200 x 420); sisi kiri dikosongkan untuk teks HTML ---------- */
export function banner(kind) {
 const ctx = new Ctx(), w = 1200, h = 420, r = rng(9);
 let b = '';
 if (kind === 'ongkir') {
  b += R(0, 0, w, h, 0, ctx.lin(['#0A4A34', '#157A56'], 'd')) + R(0, 0, w, h, 0, starTile(ctx, '#BFE8D2', .06, 130));
  b += C(980, 210, 230, '#fff', 'opacity=".06"') + C(980, 210, 160, '#fff', 'opacity=".06"');
  for (let i = 0; i < 14; i++) b += sparkle(560 + r() * 620, 20 + r() * 380, 4 + r() * 8, '#F2D488', .4 + r() * .5);
  b += E(900, 372, 300, 20, '#000', `opacity=".28" filter="${ctx.blur(12)}"`);
  b += parcel(ctx, 700, 250, 160, 120, 44, '#C98F2E') + parcel(ctx, 880, 220, 190, 150, 52, '#B5651D') + parcel(ctx, 790, 130, 130, 120, 38, '#D9A55F');
  b += place(ctx, 'jar', {type: 'honey', lid: '#C98F2E', label: '#B5651D'}, 1110, 374, .34);
  b += hangLantern(ctx, 1130, 80, .5);
 } else if (kind === 'kitab') {
  b += R(0, 0, w, h, 0, ctx.lin(['#4A1420', '#8A2A3A'], 'd')) + R(0, 0, w, h, 0, starTile(ctx, '#F2D0D6', .05, 130));
  b += crescent(ctx, 1090, 90, 54, '#F2D07C', .4, .82);
  for (let i = 0; i < 12; i++) b += sparkle(560 + r() * 620, 20 + r() * 380, 4 + r() * 8, '#F2D488', .4 + r() * .5);
  b += E(880, 384, 340, 20, '#000', `opacity=".3" filter="${ctx.blur(12)}"`);
  b += place(ctx, 'rehal', {}, 1040, 396, .5);
  b += place(ctx, 'book', {cover: '#0E5A3F', deco: 'mushaf', w: 300, h: 410, thick: 52}, 740, 392, .6, -3);
  b += place(ctx, 'book', {cover: '#E7D49A', deco: 'kitab', w: 280, h: 400, thick: 24, pages: '#EFE3BE'}, 890, 394, .55, 2);
  b += place(ctx, 'book', {cover: '#F2B84B', deco: 'kids', w: 270, h: 350, thick: 26}, 560, 394, .42, -6);
 } else if (kind === 'asrama') {
  b += R(0, 0, w, h, 0, ctx.lin(['#F8E1CE', '#EFC3A0'], 'd')) + R(0, 0, w, h, 0, starTile(ctx, '#B5651D', .05, 130));
  b += C(930, 210, 220, '#fff', 'opacity=".28"');
  b += R(0, 340, w, 80, 0, ctx.lin(['#D8B58E', '#B88A5E'])) + R(0, 340, w, 5, 0, '#fff', 'opacity=".4"');
  b += place(ctx, 'lamp', {}, 640, 392, .5) + place(ctx, 'pillow', {}, 850, 396, .58) + place(ctx, 'bucket', {}, 1040, 396, .5) + place(ctx, 'sandals', {}, 1150, 398, .3);
 } else {
  b += R(0, 0, w, h, 0, ctx.lin(['#C98F2E', '#E8C46E'], 'd')) + R(0, 0, w, h, 0, starTile(ctx, '#FFF2C4', .08, 130));
  b += C(930, 220, 210, '#fff', 'opacity=".12"');
  // kios sederhana dengan tenda bergaris
  const x0 = 700, y0 = 90, cw = 400;
  let aw = '';
  for (let i = 0; i < 8; i++) aw += R(x0 + i * cw / 8, y0, cw / 8, 70, 0, i % 2 ? '#FBF3E0' : '#1F6B4A');
  for (let i = 0; i < 8; i++) aw += P(`M${x0 + i * cw / 8} ${y0 + 70} a${cw / 16} ${cw / 16} 0 0 0 ${cw / 8} 0Z`, i % 2 ? '#FBF3E0' : '#1F6B4A');
  b += E(900, 376, 280, 18, '#000', `opacity=".25" filter="${ctx.blur(10)}"`);
  b += R(x0 + 14, y0 + 70, 10, 230, 0, '#8A5F17') + R(x0 + cw - 24, y0 + 70, 10, 230, 0, '#8A5F17') + R(x0 + 14, y0 + 190, cw - 28, 150, 0, '#FBF3E0', 'opacity=".25"');
  b += R(x0 - 10, y0 + 250, cw + 20, 100, 8, '#8A5F17') + R(x0 - 10, y0 + 250, cw + 20, 12, 6, '#B5894A') + aw + R(x0, y0 - 8, cw, 12, 6, '#0A4A34');
  b += place(ctx, 'jar', {type: 'honey', lid: '#C98F2E', label: '#B5651D'}, x0 + 90, y0 + 252, .26) + place(ctx, 'pouch', {color: '#E07A1F', icon: 'tempeh'}, x0 + 170, y0 + 252, .26) + place(ctx, 'book', {cover: '#1F6B4A', deco: 'frame', w: 290, h: 410, thick: 34}, x0 + 250, y0 + 252, .26) + place(ctx, 'tote', {}, x0 + 330, y0 + 252, .24);
  b += parcel(ctx, 1110, 300, 70, 60, 24, '#B5651D');
 }
 return svgWrap(ctx, b, w, h);
}

/* ---------- ubin kategori (800 x 800, ditampilkan persegi) ---------- */
const CAT_SCENES = {
 kitab:   [['book', {cover: '#F2B84B', deco: 'kids', w: 270, h: 350, thick: 26}, 200, 640, .64, -8], ['book', {cover: '#E7D49A', deco: 'kitab', w: 280, h: 400, thick: 24, pages: '#EFE3BE'}, 610, 650, .72, 7], ['book', {cover: '#0E5A3F', deco: 'mushaf', w: 300, h: 410, thick: 52}, 405, 700, .96]],
 busana:  [['shirt', {color: '#1E2F5A', emb: '#D9B45B', btn: '#D9B45B'}, 270, 690, .8], ['scarf', {color: '#D9A5A5'}, 568, 652, .6, 8], ['shirt', {color: '#F4F1EA', emb: '#C9B27C', btn: '#F7F1E0'}, 470, 735, .64]],
 ibadah:  [['sajadah', {color: '#1F6B4A'}, 400, 770, .8, -10], ['peci', {color: '#1A1A1D'}, 620, 660, .66], ['tasbih', {}, 180, 670, .56, -6]],
 belajar: [['backpack', {cover: '#1F6B4A'}, 280, 730, .82], ['notebook', {cover: '#1F6B4A'}, 600, 650, .66], ['penFan', {type: 'pencil', n: 7}, 590, 770, .46]],
 asrama:  [['pillow', {}, 390, 700, .96], ['lamp', {}, 650, 735, .64]],
 makanan: [['jar', {type: 'honey', lid: '#C98F2E', label: '#B5651D'}, 220, 690, .76], ['pouch', {color: '#E07A1F', icon: 'tempeh'}, 420, 730, .76], ['datesBowl', {}, 600, 750, .5]],
 kriya:   [['wallArt', {}, 310, 700, .78], ['tote', {}, 600, 735, .72], ['mug', {}, 460, 740, .46]],
 digital: [['laptop', {}, 370, 650, 1], ['tablet', {}, 612, 750, .66, 6]]
};
export function categoryTile(cat, tint) {
 const ctx = new Ctx();
 let b = backdrop(ctx, {tint, view: 'main', cat: cat.id});
 for (const [kind, params, x, y, s, rot] of CAT_SCENES[cat.id]) b += groundShadow(ctx, x, y, 130 * s * 1.6, 16, .2) + place(ctx, kind, params, x, y, s, rot || 0);
 return svgWrap(ctx, b, W, W);
}

/* ---------- panel gambar halaman masuk/daftar (800 x 1000) ---------- */
export function authArt() {
 const ctx = new Ctx(), w = 800, h = 1000, r = rng(21);
 let b = R(0, 0, w, h, 0, ctx.lin([[0, '#07281E'], [.45, '#0E5A40'], [.78, '#2A9168'], [1, '#0B4331']]));
 b += R(0, 0, w, h, 0, starTile(ctx, '#BFE8D2', .06, 140));
 for (let i = 0; i < 24; i++) b += sparkle(20 + r() * 760, 20 + r() * 520, 5 + r() * 9, '#fff', .3 + r() * .6);
 b += crescent(ctx, 600, 190, 66, '#F2D07C', .4, .82);
 const arch = 'M170 820 V470 Q170 270 400 150 Q630 270 630 470 V820Z';
 b += P(arch, ctx.lin(['#F6EFDD', '#E6D9B8'])) + P('M200 820 V476 Q200 300 400 190 Q600 300 600 476 V820Z', ctx.lin(['#0A3B2B', '#14704F']));
 b += G(mosqueSilhouette(ctx, 400, 800, .78, '#062A1F'), '', 'opacity=".95"') + G(mosqueSilhouette(ctx, 250, 800, .46, '#0E5A40'), '', 'opacity=".6"');
 b += sparkle(330, 330, 11, '#fff', .8) + sparkle(470, 380, 8, '#fff', .7) + star8(400, 262, 16, GOLD) ;
 b += hangLantern(ctx, 400, 360, .9) ;
 b += R(150, 820, 500, 26, 6, GOLD) + R(120, 846, 560, 22, 6, darken(GOLD, .3));
 b += place(ctx, 'tasbih', {}, 140, 980, .4, -10) + place(ctx, 'book', {cover: '#0E5A3F', deco: 'mushaf', w: 300, h: 410, thick: 52}, 690, 990, .46, 6);
 return svgWrap(ctx, b, w, h);
}

/* ---------- logo ---------- */
export function logo() {
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B9468"/><stop offset="1" stop-color="#0A4A34"/></linearGradient></defs>
<rect width="64" height="64" rx="16" fill="url(#g)"/>
<path d="M14 49V30Q14 18 32 9Q50 18 50 30V49Z" fill="#F6EFDD"/>
<path d="M19.5 49V31Q19.5 22.5 32 15.5Q44.5 22.5 44.5 31V49Z" fill="#0F6B4B"/>
<circle cx="30" cy="32" r="8.4" fill="#F6EFDD"/><circle cx="33.4" cy="30.4" r="7.4" fill="#0F6B4B"/>
<path d="M38.5 24l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#E8C46E"/>
<rect x="10" y="49" width="44" height="5" rx="2.5" fill="#D9B45B"/></svg>`;
}
export function placeholder() {
 const ctx = new Ctx();
 let b = R(0, 0, W, W, 0, ctx.lin(['#EEF3F0', '#DCE6E0'])) + R(0, 0, W, W, 0, starTile(ctx, '#7FA796', .1, 120));
 b += E(400, 600, 170, 20, '#000', `opacity=".1" filter="${ctx.blur(10)}"`);
 b += R(270, 250, 260, 340, 18, '#fff') + R(270, 250, 260, 340, 18, 'none', 'stroke="#B8CCC2" stroke-width="6"') + star8(400, 400, 70, '#CFE0D7') + C(400, 400, 26, '#fff') + R(320, 500, 160, 14, 7, '#CFE0D7') + R(350, 526, 100, 12, 6, '#CFE0D7');
 return svgWrap(ctx, b, W, W);
}
