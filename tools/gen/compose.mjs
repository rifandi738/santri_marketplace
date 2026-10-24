/* Merakit satu gambar produk: latar + objek, dalam tiga tampilan.
   main   = produk utama di tengah
   detail = perbesaran pada bagian penting produk
   scene  = produk di atas meja bersama beberapa properti (suasana) */
import {Ctx, f, darken, G, R, C, E, P, L, backdrop, groundShadow, wrap, sprig, crescent, sparkle, hashStr, rng} from './lib.mjs';
import {KINDS} from './kinds.mjs';

function plant(ctx, x, y, s, tone) {
 const pot = P(`M${f(x - 46 * s)} ${f(y - 70 * s)} H${f(x + 46 * s)} L${f(x + 34 * s)} ${f(y)} H${f(x - 34 * s)}Z`, '#C0714A')
  + R(x - 52 * s, y - 84 * s, 104 * s, 20 * s, 6 * s, '#D08358') + R(x - 34 * s, y - 62 * s, 12 * s, 56 * s, 4, '#fff', 'opacity=".14"');
 const g = '#3E8E62', g2 = '#2F7752';
 let pl = sprig(x, y - 84 * s, 190 * s, -12, g, g2) + sprig(x, y - 84 * s, 150 * s, 16, g2, darken(g2, .2)) + sprig(x, y - 84 * s, 120 * s, 40, g, g2);
 return E(x, y + 2, 60 * s, 12 * s, '#000', 'opacity=".16"') + pl + pot;
}
function tableLantern(ctx, x, y, s) {
 const body = '#C98F2E', glow = '#FFE9A8', trim = '#8A5F17';
 const k = s;
 return E(x, y + 6, 54 * k, 11 * k, '#000', 'opacity=".18"')
  + R(x - 40 * k, y - 18 * k, 80 * k, 18 * k, 6 * k, trim)
  + P(`M${f(x - 30 * k)} ${f(y - 18 * k)} L${f(x - 50 * k)} ${f(y - 100 * k)} L${f(x - 34 * k)} ${f(y - 196 * k)} L${f(x + 34 * k)} ${f(y - 196 * k)} L${f(x + 50 * k)} ${f(y - 100 * k)} L${f(x + 30 * k)} ${f(y - 18 * k)}Z`, body)
  + P(`M${f(x - 20 * k)} ${f(y - 34 * k)} L${f(x - 34 * k)} ${f(y - 100 * k)} L${f(x - 22 * k)} ${f(y - 176 * k)} L${f(x + 22 * k)} ${f(y - 176 * k)} L${f(x + 34 * k)} ${f(y - 100 * k)} L${f(x + 20 * k)} ${f(y - 34 * k)}Z`, glow)
  + L(x, y - 34 * k, x, y - 176 * k, body, 3 * k) + L(x - 28 * k, y - 105 * k, x + 28 * k, y - 105 * k, body, 3 * k)
  + R(x - 42 * k, y - 210 * k, 84 * k, 16 * k, 6 * k, trim)
  + P(`M${f(x - 24 * k)} ${f(y - 210 * k)} Q${f(x)} ${f(y - 250 * k)} ${f(x + 24 * k)} ${f(y - 210 * k)}Z`, body)
  + C(x, y - 252 * k, 6 * k, trim);
}

export function composeProduct({kind, params = {}, tint, cat, view, id = ''}) {
 const ctx = new Ctx();
 const drawer = KINDS[kind];
 if (!drawer) throw new Error('Jenis gambar tidak dikenal: ' + kind);
 const d = drawer(ctx, params);
 let body = backdrop(ctx, {tint, view, cat});
 if (view === 'main') {
  const z = Math.max(1, Math.min(1.5, 540 / d.box.h, 600 / d.box.w));
  body += groundShadow(ctx, 400, d.base.y + (z - 1) * 4, d.base.rx * z);
  body += G(d.svg, `translate(400 ${f(d.base.y)}) scale(${f(z)}) translate(-400 ${f(-d.base.y)})`);
 } else if (view === 'detail') {
  const {x, y, z} = d.focus;
  body += G(d.svg, `translate(400 400) scale(${z}) translate(${f(-x)} ${f(-y)})`);
 } else {
  const r = rng(hashStr(id + 'scene'));
  const sc = Math.max(.62, Math.min(.98, 390 / d.box.h, 400 / d.box.w * 1.3));
  const by = 655;
  const left = r() > .5;
  body += crescent(ctx, left ? 640 : 160, 150, 70, '#fff', .42, .84).replace('fill="#fff"', 'fill="#fff" opacity=".5"');
  body += sparkle(left ? 560 : 240, 110, 16, '#fff', .8) + sparkle(left ? 700 : 100, 240, 11, '#fff', .7);
  body += plant(ctx, left ? 120 : 690, 610, 1, tint);
  body += groundShadow(ctx, 400, by + 2, d.base.rx * sc, 18, .28);
  body += G(d.svg, `translate(400 ${by}) scale(${f(sc)}) translate(-400 ${f(-d.base.y)})`);
  body += tableLantern(ctx, left ? 690 : 110, 640, 1);
 }
 return wrap(ctx, body);
}
