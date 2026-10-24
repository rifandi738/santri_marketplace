/* Ilustrasi: makanan & camilan (botol/toples, pouch, kotak, mangkuk kurma). */
import {f, lighten, darken, rng, R, C, E, P, L, S, PG, G, star8, leaf, sprig} from './lib.mjs';

const GOLD = '#D9B45B';

/* ikon label */
function labelIcon(ctx, type, cx, cy, col) {
 if (type === 'drop') return P(`M${cx} ${cy - 30} C${cx - 20} ${cy - 2} ${cx - 28} ${cy + 8} ${cx - 28} ${cy + 18} A28 28 0 0 0 ${cx + 28} ${cy + 18} C${cx + 28} ${cy + 8} ${cx + 20} ${cy - 2} ${cx} ${cy - 30}Z`, col) + C(cx - 9, cy + 12, 6, '#fff', 'opacity=".55"');
 if (type === 'chili') return P(`M${cx - 12} ${cy - 28} C${cx + 30} ${cy - 22} ${cx + 38} ${cy + 18} ${cx + 12} ${cy + 40} C${cx + 4} ${cy + 30} ${cx + 6} ${cy + 20} ${cx + 10} ${cy + 14} C${cx - 6} ${cy + 4} ${cx - 16} ${cy - 12} ${cx - 12} ${cy - 28}Z`, '#C0392B') + R(cx - 18, cy - 38, 12, 14, 4, '#2F7752');
 if (type === 'cookie') return C(cx, cy, 26, '#E7B25C') + C(cx, cy, 10, '#C9611A') + C(cx - 14, cy - 10, 3, '#C9611A') + C(cx + 14, cy - 8, 3, '#C9611A') + C(cx - 10, cy + 14, 3, '#C9611A') + C(cx + 12, cy + 13, 3, '#C9611A');
 if (type === 'bean') return G(E(0, 0, 18, 28, '#4B2E1E') + S('M-2 -24 C10 -8 -10 8 2 24', '#D9B089', 3), `translate(${cx - 16} ${cy}) rotate(-24)`) + G(E(0, 0, 18, 28, '#6B4228') + S('M-2 -24 C10 -8 -10 8 2 24', '#E3C29D', 3), `translate(${cx + 18} ${cy + 6}) rotate(28)`);
 if (type === 'tempeh') return G(R(-34, -24, 62, 46, 11, '#DDAA55') + C(-18, -8, 2.5, '#8A5F17') + C(0, 4, 2.5, '#8A5F17') + C(14, -10, 2.5, '#8A5F17') + C(-6, 12, 2.5, '#8A5F17'), `translate(${cx - 8} ${cy - 6}) rotate(-14)`) + G(R(-34, -24, 62, 46, 11, '#E8B964') + C(-16, -6, 2.5, '#8A5F17') + C(2, 6, 2.5, '#8A5F17') + C(16, -8, 2.5, '#8A5F17') + C(-4, 12, 2.5, '#8A5F17'), `translate(${cx + 12} ${cy + 10}) rotate(10)`);
 if (type === 'ginger') return P(`M${cx - 30} ${cy + 10} C${cx - 34} ${cy - 10} ${cx - 14} ${cy - 24} ${cx} ${cy - 14} C${cx + 10} ${cy - 30} ${cx + 32} ${cy - 20} ${cx + 30} ${cy} C${cx + 40} ${cy + 8} ${cx + 30} ${cy + 26} ${cx + 12} ${cy + 22} C${cx} ${cy + 32} ${cx - 22} ${cy + 28} ${cx - 30} ${cy + 10}Z`, '#D9A55F') + S(`M${cx - 18} ${cy} H${cx + 12}`, '#A9743F', 3);
 if (type === 'leaf') return leaf(cx, cy + 28, 62, -30, '#4C9A6B', '#2F7752') + leaf(cx, cy + 28, 52, 32, '#3E8E62', '#2F7752');
 return star8(cx, cy, 28, col);
}

/* ---------- botol/toples ---------- */
export function jar(ctx, o = {}) {
 const type = o.type || 'honey';
 const lc = o.label || '#B5651D', lidC = o.lid || '#C98F2E';
 const r = rng(o.seed || 7);
 let s = '';
 if (type === 'nastar') {
  const body = 'M262 312 H538 Q556 312 556 332 V610 Q556 650 516 650 H284 Q244 650 244 610 V332 Q244 312 262 312Z';
  const clip = ctx.clip(P(body, '#000'));
  let cookies = '';
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
   const x = 286 + col * 57 + (row % 2 ? 28 : 0), y = 360 + row * 58;
   if (x > 530) continue;
   cookies += C(x + 2, y + 4, 30, '#7A4A10', 'opacity=".3"') + C(x, y, 30, ctx.rad(['#F6D27E', '#E1A33B', '#B9741A'], {cx: .4, cy: .35, r: .8})) + C(x, y, 10, '#C9611A') + C(x - 3, y - 3, 3.2, '#F3A55A') + S(`M${x - 22} ${y - 8} Q${x - 14} ${y - 22} ${x} ${y - 24}`, '#fff', 3, 'opacity=".3"');
  }
  s += P(body, '#fff', 'opacity=".22"') + G(R(244, 320, 312, 340, 0, '#7A4A10', 'opacity=".12"') + cookies, '', `clip-path="${clip}"`);
  s += P(body, 'none', 'stroke="#fff" stroke-width="3" opacity=".6"') + R(262, 336, 14, 270, 7, '#fff', 'opacity=".38"') + R(530, 340, 8, 250, 4, '#fff', 'opacity=".22"');
  const red = '#B3282D';
  s += R(236, 256, 328, 62, 14, ctx.lin([lighten(red, .25), red, darken(red, .25)], 'h'));
  for (let x = 252; x < 552; x += 14) s += L(x, 266, x, 308, darken(red, .35), 2, 'opacity=".5"');
  s += R(236, 304, 328, 14, 5, darken(red, .3)) + R(250, 262, 300, 8, 4, '#fff', 'opacity=".2"');
  s += R(322, 470, 156, 98, 14, '#FBF3E0') + R(322, 496, 156, 28, 0, lc) + R(344, 504, 112, 9, 4.5, '#fff') + C(400, 544, 17, '#E7B25C') + C(400, 544, 6.5, '#C9611A') + C(388, 536, 2.2, '#C9611A') + C(412, 536, 2.2, '#C9611A') + C(390, 553, 2.2, '#C9611A') + C(411, 554, 2.2, '#C9611A');
  return {svg: s, box: {w: 340, h: 420}, base: {y: 656, rx: 250}, focus: {x: 400, y: 450, z: 1.7}};
 }
 const body = 'M300 250 L500 250 Q535 256 535 300 L535 620 Q535 655 500 655 L300 655 Q265 655 265 620 L265 300 Q265 256 300 250 Z';
 const clip = ctx.clip(P(body, '#000'));
 const fillC = type === 'honey' ? ctx.lin(['#F6C453', '#E39A1A', '#B9700A']) : ctx.lin(['#D8412F', '#B3261E', '#7F1710']);
 let inner = R(265, 322, 270, 340, 0, fillC);
 if (type === 'honey') {
  inner += E(400, 324, 136, 13, '#FBE08B', 'opacity=".85"');
  for (let i = 0; i < 16; i++) inner += C(280 + r() * 240, 350 + r() * 290, 3 + r() * 6, '#FFF2B8', 'opacity=".4"');
  inner += R(270, 330, 70, 320, 0, '#fff', 'opacity=".12"');
 } else {
  inner += E(400, 324, 136, 12, '#E0604B', 'opacity=".9"');
  for (let i = 0; i < 46; i++) { const x = 275 + r() * 250, y = 340 + r() * 300; inner += E(x, y, 6 + r() * 9, 4 + r() * 6, r() > .5 ? '#E8664A' : '#8E1F17', `opacity=".75" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"`); }
  for (let i = 0; i < 30; i++) inner += C(275 + r() * 250, 340 + r() * 300, 1.8, '#F4E7C5', 'opacity=".7"');
 }
 s += P(body, '#fff', 'opacity=".3"') + G(inner, '', `clip-path="${clip}"`);
 s += P(body, 'none', 'stroke="#fff" stroke-width="3" opacity=".65"') + R(280, 290, 14, 340, 7, '#fff', 'opacity=".4"') + R(512, 300, 8, 300, 4, '#fff', 'opacity=".22"');
 s += R(286, 208, 228, 50, 11, ctx.lin([lighten(lidC, .32), lidC, darken(lidC, .26)], 'h'));
 for (let x = 298; x < 508; x += 12) s += L(x, 216, x, 250, darken(lidC, .3), 2, 'opacity=".45"');
 s += R(286, 242, 228, 14, 5, darken(lidC, .3)) + R(298, 214, 204, 7, 3.5, '#fff', 'opacity=".25"');
 s += R(296, 392, 208, 200, 16, '#FBF3E0') + R(296, 392, 208, 200, 16, 'none', `stroke="${lc}" stroke-width="3"`);
 s += star8(400, 414, 12, lc) + R(296, 436, 208, 42, 0, lc) + R(330, 452, 140, 11, 5.5, '#fff') + R(358, 470, 84, 5, 2.5, '#fff', 'opacity=".7"');
 s += labelIcon(ctx, type === 'honey' ? 'drop' : 'chili', 400, 530, lc) + R(344, 568, 112, 8, 4, '#BFB59B');
 return {svg: s, box: {w: 300, h: 460}, base: {y: 660, rx: 210}, focus: {x: 400, y: 460, z: 1.7}};
}

/* ---------- pouch standing ---------- */
export function pouch(ctx, o = {}) {
 const c = o.color || '#E07A1F', lc = o.labelBg || '#FFF7E6', icon = o.icon || 'tempeh', dk = darken(c, .22);
 const body = 'M268 218 L532 218 C548 332 556 520 540 642 Q400 704 260 642 C244 520 252 332 268 218 Z';
 let s = P(body, c) + P(body, ctx.lin([['0', '#fff', .2], [.5, '#fff', 0], [1, '#000', .22]], 'h'));
 let zig = 'M266 170'; for (let x = 266; x <= 534; x += 12) zig += ` L${x + 6} 160 L${x + 12} 170`;
 s += P(zig + ' V220 H266Z', darken(c, .1));
 for (let x = 272; x < 530; x += 9) s += L(x, 176, x, 214, '#000', 1.6, 'opacity=".16"');
 s += L(262, 246, 538, 246, darken(c, .4), 3) + L(262, 252, 538, 252, lighten(c, .2), 2, 'opacity=".7"') + PG([[262, 238], [262, 256], [250, 247]], darken(c, .3));
 s += R(296, 300, 208, 280, 22, lc) + R(296, 300, 208, 280, 22, 'none', `stroke="${dk}" stroke-width="3"`);
 s += P('M296 322 Q296 300 318 300 H482 Q504 300 504 322 V352 H296Z', dk) + R(336, 318, 128, 12, 6, '#fff') + R(364, 336, 72, 6, 3, '#fff', 'opacity=".75"');
 s += labelIcon(ctx, icon, 400, 440, c);
 s += R(336, 506, 128, 11, 5.5, dk, 'opacity=".85"') + R(352, 528, 96, 8, 4, '#BFB59B') + R(364, 546, 72, 8, 4, '#BFB59B');
 s += P('M262 642 Q400 704 538 642 Q400 676 262 642Z', darken(c, .3)) + R(276, 250, 13, 370, 6.5, '#fff', 'opacity=".2"');
 return {svg: s, box: {w: 300, h: 560}, base: {y: 688, rx: 220}, focus: {x: 400, y: 430, z: 1.7}};
}

/* ---------- kotak makanan dengan jendela ---------- */
export function box(ctx, o = {}) {
 const c = o.color || '#B5651D', content = o.content || 'candy', lc = '#FBF3E0';
 const r = rng(o.seed || 3);
 const front = [[230, 330], [570, 330], [570, 640], [230, 640]], top = [[230, 330], [570, 330], [612, 286], [272, 286]], right = [[570, 330], [612, 286], [612, 596], [570, 640]];
 let s = PG(right, darken(c, .26)) + PG(top, lighten(c, .2)) + PG(top, ctx.lin([['0', '#fff', .2], [1, '#000', .12]], 'v'));
 s += PG(front, c) + PG(front, ctx.lin([['0', '#fff', .18], [.5, '#fff', 0], [1, '#000', .2]], 'd'));
 s += R(230, 330, 340, 42, 0, lighten(c, .1)) + L(230, 372, 570, 372, darken(c, .3), 3) + R(246, 342, 200, 10, 5, '#fff', 'opacity=".5"');
 const win = ctx.clip(R(262, 392, 276, 128, 16, '#000'));
 let ins = R(262, 392, 276, 128, 0, '#2A1A10');
 if (content === 'candy') {
  const cols = ['#C0392B', '#E8B64A', '#2F7752', '#7A4A9A'];
  for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
   const x = 300 + i * 52 + (row ? 24 : 0), y = 428 + row * 56, col = cols[(i + row * 2) % 4];
   ins += G(E(0, 0, 21, 14, col) + PG([[-20, 0], [-36, -12], [-36, 12]], lighten(col, .15)) + PG([[20, 0], [36, -12], [36, 12]], lighten(col, .15)) + E(-4, -5, 9, 3.4, '#fff', 'opacity=".35"'), `translate(${x} ${y}) rotate(${f((r() - .5) * 30)})`);
  }
 } else {
  const cols = ['#E8B64A', '#C98F2E', '#D9A55F', '#B5651D'];
  for (let i = 0; i < 6; i++) { const x = 288 + i * 44; ins += G(R(-17, -50, 34, 100, 4, cols[i % 4]) + R(-17, -50, 34, 14, 3, lighten(cols[i % 4], .3)) + L(0, -50, 4, -66, '#EDE6D0', 2) + R(-5, -80, 12, 18, 2, '#fff') + L(-17, -20, 17, -20, '#fff', 2, 'opacity=".4"'), `translate(${x} ${470 + (i % 2) * 6}) rotate(${f((r() - .5) * 12)})`); }
 }
 s += G(ins, '', `clip-path="${win}"`) + R(262, 392, 276, 128, 16, 'none', 'stroke="#fff" stroke-width="3" opacity=".55"');
 s += PG([[270, 400], [330, 400], [290, 516], [270, 516]], '#fff', 'opacity=".12"');
 s += R(230, 540, 340, 100, 0, lc) + R(230, 540, 340, 10, 0, darken(c, .25)) + R(230, 630, 340, 10, 0, darken(c, .25));
 s += labelIcon(ctx, content === 'candy' ? 'star' : 'ginger', 292, 590, c) + R(336, 570, 190, 14, 7, darken(c, .1)) + R(336, 596, 140, 9, 4.5, '#BFB59B') + R(336, 614, 100, 9, 4.5, '#BFB59B');
 s += PG(right, '#000', 'opacity=".08"');
 return {svg: s, box: {w: 400, h: 370}, base: {y: 650, rx: 260}, focus: {x: 400, y: 460, z: 1.6}};
}

/* ---------- mangkuk kurma ---------- */
export function datesBowl(ctx, o = {}) {
 const r = rng(o.seed || 11), wood = o.wood || '#A9743F';
 let s = sprig(214, 500, 210, -26, '#3E8E62', '#2F7752') + sprig(588, 500, 170, 24, '#4C9A6B', '#2F7752');
 s += E(400, 440, 232, 62, darken(wood, .45));
 const rows = [[3, 292], [5, 322], [7, 352], [8, 382], [9, 410], [10, 436]];
 for (const [n, y] of rows) for (let i = 0; i < n; i++) {
  const x = 400 + (i - (n - 1) / 2) * 52 + (r() - .5) * 14, yy = y + (r() - .5) * 10, a = (r() - .5) * 70;
  s += G(E(0, 4, 42, 24, '#000', 'opacity=".22"') + E(0, 0, 42, 24, ctx.rad(['#8B4A22', '#5A2E14', '#3A1C0B'], {cx: .4, cy: .3, r: .8})) + S('M-28 -8 Q0 -18 28 -8', '#fff', 3, 'opacity=".26"') + S('M-22 6 Q-6 12 10 6', '#2A1408', 1.6, 'opacity=".6"') + S('M6 -4 Q16 0 24 -2', '#2A1408', 1.6, 'opacity=".5"'), `translate(${f(x)} ${f(yy)}) rotate(${f(a)})`);
 }
 const front = 'M168 440 A232 62 0 0 0 632 440 Q628 604 502 654 L298 654 Q172 604 168 440Z';
 s += P(front, ctx.lin([lighten(wood, .14), wood, darken(wood, .25)], 'h')) + P(front, ctx.lin([['0', '#fff', .1], [1, '#000', .18]], 'v'));
 for (let i = 0; i < 6; i++) s += S(`M${200 + i * 70} 470 Q${210 + i * 66} 560 ${250 + i * 50} 640`, darken(wood, .3), 2, 'opacity=".3"');
 s += S('M168 440 A232 62 0 0 0 632 440', lighten(wood, .3), 5, 'opacity=".7"') + R(300, 650, 200, 16, 8, darken(wood, .35));
 return {svg: s, box: {w: 620, h: 420}, base: {y: 668, rx: 270}, focus: {x: 400, y: 380, z: 1.7}};
}
