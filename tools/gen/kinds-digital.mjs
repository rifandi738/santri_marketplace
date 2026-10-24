/* Ilustrasi: karya digital (e-book di tablet, kursus di laptop, template poster, paket vektor, planner). */
import {f, lighten, darken, R, C, E, P, L, S, PG, G, star8, crescent, leaf, lantern, mosqueSilhouette} from './lib.mjs';

const GOLD = '#D9B45B';

export function tablet(ctx, o = {}) {
 const c = o.cover || '#1F6B4A';
 let s = R(246, 106, 324, 600, 44, '#000', 'opacity=".12" transform="translate(10 14)"');
 s += R(234, 90, 324, 600, 44, '#1E2530') + R(234, 90, 324, 600, 44, ctx.lin([['0', '#fff', .12], [1, '#000', .1]], 'd')) + R(252, 108, 288, 564, 28, '#F6F8F7');
 s += C(396, 99, 3.2, '#4B5563');
 s += R(300, 150, 196, 268, 10, '#000', 'opacity=".16" transform="translate(6 8)"') + R(300, 150, 196, 268, 10, c) + R(300, 150, 196, 268, 10, ctx.lin([['0', '#fff', .22], [1, '#000', .2]], 'd')) + R(300, 150, 14, 268, 6, darken(c, .3));
 s += star8(404, 250, 54, 'none', 0, `stroke="${GOLD}" stroke-width="4"`) + star8(404, 250, 32, GOLD, 22.5) + C(404, 250, 11, darken(c, .1));
 s += R(340, 340, 120, 12, 6, '#fff', 'opacity=".9"') + R(364, 362, 72, 9, 4.5, GOLD) + R(344, 386, 112, 6, 3, '#fff', 'opacity=".5"');
 for (const [i, w] of [[0, 220], [1, 190], [2, 214], [3, 150]]) s += R(284, 452 + i * 26, w, 10, 5, '#CBD5D0');
 s += R(284, 572, 232, 10, 5, '#DCE5E0') + R(284, 572, 130, 10, 5, c) + C(414, 577, 9, '#fff', `stroke="${c}" stroke-width="3"`);
 s += R(284, 604, 70, 28, 14, c) + R(300, 614, 38, 7, 3.5, '#fff') + R(364, 604, 70, 28, 14, '#E6ECE8') + R(380, 614, 38, 7, 3.5, '#9AA7A0');
 s += G(R(-46, -58, 92, 116, 12, '#fff') + P('M16 -58 L46 -28 H16Z', '#E5E7EB') + R(-46, -58, 92, 116, 12, 'none', 'stroke="#D93F3F" stroke-width="4"') + R(-30, 8, 60, 22, 6, '#D93F3F') + R(-26, -22, 52, 6, 3, '#C7CCD3') + R(-26, -8, 40, 6, 3, '#C7CCD3'), 'translate(548 628) rotate(9)');
 return {svg: s, box: {w: 400, h: 620}, base: {y: 704, rx: 230}, focus: {x: 400, y: 280, z: 1.7}};
}

export function laptop(ctx, o = {}) {
 let s = R(184, 150, 432, 292, 20, '#1E2530') + R(200, 166, 400, 260, 8, ctx.lin(['#17406A', '#0C2340']));
 s += G(mosqueSilhouette(ctx, 400, 360, .52, '#1D5A8C'), '', 'opacity=".9"') + P('M200 360 H600 V426 H200Z', '#0C2340');
 s += C(520, 214, 26, '#F6E7B4') + C(534, 208, 22, '#17406A');
 s += C(400, 276, 40, '#fff', 'opacity=".92"') + PG([[388, 256], [388, 296], [424, 276]], '#17406A');
 s += R(214, 392, 372, 8, 4, '#35506A') + R(214, 392, 200, 8, 4, GOLD) + C(414, 396, 8.5, '#fff') + R(214, 408, 60, 8, 4, '#35506A') + R(530, 408, 56, 8, 4, '#35506A');
 s += P('M150 446 H650 L706 508 Q708 528 688 528 H112 Q92 528 94 508Z', ctx.lin(['#DEE2E8', '#A9B0BA'])) + R(336, 448, 128, 12, 6, '#8D939C') + R(120, 516, 560, 6, 3, '#000', 'opacity=".12"');
 s += R(580, 520, 54, 34, 6, '#F6EFDD', 'opacity="0"');
 return {svg: s, box: {w: 620, h: 400}, base: {y: 540, rx: 340}, focus: {x: 400, y: 290, z: 1.5}};
}

function poster(ctx, c1, c2, ac) {
 let p = R(-96, -134, 200, 280, 14, '#000', 'opacity=".14" transform="translate(6 8)"') + R(-100, -140, 200, 280, 14, '#fff') + R(-90, -130, 180, 260, 8, c1) + R(-90, -130, 180, 260, 8, ctx.lin([['0', '#fff', .18], [1, '#000', .16]], 'd'));
 p += crescent(ctx, -52, -92, 22, ac, .42, .84) + star8(-24, -104, 8, ac) + R(-6, -102, 78, 10, 5, '#fff', 'opacity=".9"') + R(-6, -84, 56, 8, 4, ac);
 p += R(-72, -58, 144, 104, 10, c2) + G(mosqueSilhouette(ctx, 0, 40, .26, darken(c2, .42)), '', 'opacity=".9"') + C(36, -28, 13, ac, 'opacity=".95"');
 p += R(-72, 62, 110, 10, 5, '#fff', 'opacity=".9"') + R(-72, 80, 86, 8, 4, '#fff', 'opacity=".55"') + R(-72, 102, 144, 18, 9, ac) + R(-52, 108, 60, 6, 3, c1);
 return p;
}
export function posters(ctx, o = {}) {
 const s = G(poster(ctx, '#1B3A5F', '#2F6FA0', '#E8B64A'), 'translate(268 440) rotate(-12)') + G(poster(ctx, '#7A1F2B', '#B5465A', '#F2D07C'), 'translate(532 440) rotate(12)') + G(poster(ctx, '#0E5A3F', '#2F8A63', '#F2D07C'), 'translate(400 410) scale(1.1)');
 return {svg: s, box: {w: 540, h: 480}, base: {y: 620, rx: 280}, focus: {x: 400, y: 380, z: 1.7}};
}

export function vectors(ctx, o = {}) {
 const icon = (k, cx, cy, fg) => {
  if (k === 0) return crescent(ctx, cx - 6, cy, 30, fg, .42, .84) + star8(cx + 16, cy - 12, 10, fg);
  if (k === 1) return mosqueSilhouette(ctx, cx, cy + 36, .26, fg);
  if (k === 2) return lantern(ctx, cx, cy - 36, .42, fg, '#FFF1B8', darken(fg, .2));
  if (k === 3) return star8(cx, cy, 36, fg) + star8(cx, cy, 20, 'none', 22.5, `stroke="#fff" stroke-width="2.5" opacity=".6"`);
  if (k === 4) return P(`M${cx} ${cy - 18} Q${cx - 24} ${cy - 30} ${cx - 42} ${cy - 22} V${cy + 24} Q${cx - 24} ${cy + 16} ${cx} ${cy + 28}Z`, fg) + P(`M${cx} ${cy - 18} Q${cx + 24} ${cy - 30} ${cx + 42} ${cy - 22} V${cy + 24} Q${cx + 24} ${cy + 16} ${cx} ${cy + 28}Z`, lighten(fg, .25));
  if (k === 5) return leaf(cx, cy + 28, 52, -42, fg) + leaf(cx, cy + 28, 52, 42, lighten(fg, .15)) + leaf(cx, cy + 28, 60, 0, darken(fg, .1));
  if (k === 6) { let r = ''; for (let i = 0; i < 14; i++) { const a = i * 2 * Math.PI / 14; r += C(cx + Math.cos(a) * 32, cy - 4 + Math.sin(a) * 32, 7, fg); } return r + C(cx, cy + 40, 8, fg) + R(cx - 3, cy + 46, 6, 14, 3, darken(fg, .2)); }
  if (k === 7) return P(`M${cx - 34} ${cy + 36} V${cy - 6} Q${cx - 34} ${cy - 30} ${cx} ${cy - 44} Q${cx + 34} ${cy - 30} ${cx + 34} ${cy - 6} V${cy + 36}Z`, 'none', `stroke="${fg}" stroke-width="6"`) + star8(cx, cy + 4, 12, fg);
  let r = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; r += G(E(0, -18, 8, 16, i % 2 ? lighten(fg, .2) : fg), `translate(${cx} ${cy}) rotate(${i * 45})`); } return r + C(cx, cy, 8, GOLD);
 };
 const bgs = ['#0E5A3F', '#1B3A5F', '#7A1F2B', '#2F7A7A', '#2E6B4B', '#F4EBD6', '#EBD9B8', '#0E4B36', '#F6E1E4'];
 const fgs = [GOLD, '#F6EFDD', GOLD, '#fff', '#F6EFDD', '#2F7752', '#7A4A24', GOLD, '#C0587A'];
 let s = R(190, 148, 424, 432, 30, '#000', 'opacity=".12" transform="translate(10 14)"') + R(180, 136, 424, 432, 30, '#fff');
 for (let i = 0; i < 9; i++) {
  const x = 208 + (i % 3) * 126, y = 164 + Math.floor(i / 3) * 126;
  s += R(x, y, 112, 112, 20, bgs[i]) + R(x, y, 112, 112, 20, ctx.lin([['0', '#fff', .14], [1, '#000', .14]], 'd')) + icon(i, x + 56, y + 52, fgs[i]);
 }
 s += R(220, 548, 140, 10, 5, '#CBD5D0', 'opacity="0"');
 s += G(R(-34, -40, 68, 80, 10, '#fff') + R(-34, -40, 68, 80, 10, 'none', 'stroke="#1F6B4A" stroke-width="4"') + R(-22, 6, 44, 16, 5, '#1F6B4A') + L(-18, -18, 18, -18, '#9AA7A0', 4) + L(-18, -4, 10, -4, '#9AA7A0', 4), 'translate(596 600) rotate(8)');
 return {svg: s, box: {w: 470, h: 480}, base: {y: 684, rx: 270}, focus: {x: 400, y: 330, z: 1.55}};
}

export function planner(ctx, o = {}) {
 const c = o.cover || '#1F6B4A';
 let s = R(262, 112, 320, 600, 16, darken('#F4EEDD', .08), 'transform="rotate(5 420 412)"') + R(240, 100, 320, 600, 16, '#000', 'opacity=".1" transform="translate(8 12)"');
 s += R(240, 100, 320, 600, 16, '#fff') + R(240, 100, 320, 118, 16, c) + R(240, 170, 320, 48, 0, c);
 s += crescent(ctx, 292, 156, 30, GOLD, .42, .84) + star8(318, 138, 10, GOLD) + R(344, 130, 150, 14, 7, '#fff') + R(344, 154, 100, 10, 5, GOLD) + G(lantern(ctx, 0, -10, .36, GOLD, '#FFF1B8', darken(GOLD, .2)), 'translate(520 150)');
 for (let i = 0; i <= 7; i++) s += L(262 + i * 39.4, 242, 262 + i * 39.4, 502, '#D5DBD7', 1.6);
 for (let j = 0; j <= 5; j++) s += L(262, 242 + j * 52, 538, 242 + j * 52, '#D5DBD7', 1.6);
 for (let i = 0; i < 7; i++) s += R(264 + i * 39.4, 244, 36, 14, 3, '#E7EFEA');
 const marks = [[0, 1], [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [1, 3], [6, 2], [2, 4], [4, 4]];
 for (const [i, j] of marks) s += C(280 + i * 39.4, 292 + (j - 1) * 52, 9, 'none', `stroke="${GOLD}" stroke-width="3"`) + (j < 3 ? S(`M${f(275 + i * 39.4)} ${292 + (j - 1) * 52} l4 4 l8 -10`, c, 2.5) : '');
 for (let r = 0; r < 4; r++) s += R(264, 530 + r * 40, 18, 18, 4, 'none', `stroke="${c}" stroke-width="3"`) + R(294, 536 + r * 40, 190 - r * 18, 8, 4, '#CBD5D0') + (r < 2 ? S(`M268 ${541 + r * 40} l5 6 l9 -12`, GOLD, 3) : '');
 return {svg: s, box: {w: 360, h: 620}, base: {y: 716, rx: 230}, focus: {x: 400, y: 190, z: 1.9}};
}
