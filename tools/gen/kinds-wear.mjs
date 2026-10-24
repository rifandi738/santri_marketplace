/* Ilustrasi: busana (koko, kaos, gamis, mukena, hijab, batik) dan perlengkapan ibadah
   (sarung, peci, sajadah, tasbih, rehal). */
import {f, lighten, darken, hex2rgb, R, C, E, P, L, S, PG, G, star8, crescent, leaf, plaid, knit, kawung, parang} from './lib.mjs';
const lum = c => { const [r, g, b] = hex2rgb(c); return (r * .299 + g * .587 + b * .114) / 255; };

const GOLD = '#D9B45B';

/* ---------- baju koko / kaos ---------- */
export function shirt(ctx, o = {}) {
 const style = o.style || 'koko', short = style === 'tee';
 const c = o.color || '#F4F1EA', emb = o.emb || '#C9B27C', btn = o.btn || '#FFFFFF';
 const dk = darken(c, .12), dk2 = darken(c, .26), lt = lighten(c, lum(c) > .6 ? .3 : .13);
 const k = o.scale || 1;
 const slv = short ? [[300, 238], [206, 326], [242, 384], [318, 346]] : [[300, 238], [146, 492], [212, 526], [316, 362]];
 const cuff = short ? null : [[146, 492], [212, 526], [232, 494], [166, 460]];
 const sleeve = () => PG(slv, darken(c, .04)) + PG(slv, ctx.lin([['0', '#fff', .12], [1, '#000', .1]], 'h'))
  + (cuff ? PG(cuff, dk2) + L(160, 478, 226, 512, emb, 3, 'opacity=".9"') + S('M284 290 Q226 390 178 470', dk2, 2, 'opacity=".35"') : S('M290 296 Q256 330 236 366', dk2, 2, 'opacity=".35"'));
 let s = G(sleeve(), 'translate(800 0) scale(-1 1)') + G(sleeve());
 const body = 'M300 238 Q345 224 358 214 L442 214 Q455 224 500 238 L484 364 L496 650 Q400 672 304 650 L316 364 Z';
 s += P(body, c) + P(body, ctx.lin([['0', '#fff', .2], [.5, '#fff', 0], [1, '#000', .16]], 'h'));
 s += S('M318 372 L306 648', dk2, 2, 'opacity=".3"') + S('M482 372 L494 648', dk2, 2, 'opacity=".3"');
 s += S('M308 636 Q400 656 492 636', dk2, 2, 'opacity=".45"');
 if (short) {
  s += P('M352 214 Q400 266 448 214Z', dk2) + S('M350 216 Q400 272 450 216', lighten(c, .12), 15) + S('M350 216 Q400 272 450 216', dk, 3, 'opacity=".5"');
  const pc = o.print || '#1F6B4A';
  s += C(400, 420, 84, 'none', `stroke="${pc}" stroke-width="7"`) + C(400, 420, 70, 'none', `stroke="${pc}" stroke-width="2"`);
  s += star8(400, 420, 52, pc) + C(400, 420, 30, c) + crescent(ctx, 400, 420, 24, pc, .42, .84);
  s += R(334, 530, 132, 13, 6.5, pc) + R(356, 554, 88, 10, 5, pc, 'opacity=".75"');
 } else {
  s += E(400, 220, 46, 16, dk2);
  s += PG([[350, 206], [399, 238], [399, 272], [344, 238]], lt, `stroke="${dk}" stroke-width="2"`) + PG([[450, 206], [401, 238], [401, 272], [456, 238]], lt, `stroke="${dk}" stroke-width="2"`);
  s += R(384, 270, 32, 384, 0, lt, 'opacity=".9"') + L(384, 270, 384, 652, dk, 2, 'opacity=".5"') + L(416, 270, 416, 652, dk, 2, 'opacity=".5"');
  for (const y of [304, 368, 432, 496, 560, 622]) s += C(400, y, 7, btn, `stroke="${dk2}" stroke-width="2"`) + C(397, y - 1.5, 1.4, dk2) + C(403, y - 1.5, 1.4, dk2) + C(397, y + 2, 1.4, dk2) + C(403, y + 2, 1.4, dk2);
  if (o.emb !== false) {
   for (const m of [1, -1]) {
    const gx = x => m === 1 ? x : 800 - x;
    s += S(`M${gx(360)} 296 V470`, emb, 3);
    for (let i = 0; i < 5; i++) s += G(leaf(0, 0, 24, m === 1 ? -55 : 55, emb), `translate(${gx(360)} ${318 + i * 34})`);
    s += S(`M${gx(334)} 250 L${gx(386)} 280`, emb, 2.5, 'stroke-dasharray="4 4"');
   }
  }
 }
 return {svg: k === 1 ? s : G(s, `translate(400 662) scale(${k}) translate(-400 -662)`), box: {w: short ? 400 : 520, h: 470 * k}, base: {y: 668, rx: 260}, focus: short ? {x: 400, y: 410, z: 1.8} : {x: 400, y: 340, z: 1.9}};
}

/* ---------- gamis ---------- */
export function gamis(ctx, o = {}) {
 const c = o.color || '#7E9C86', lace = o.lace || '#F6F1E7';
 const dk = darken(c, .14), dk2 = darken(c, .3);
 const slv = [[336, 208], [208, 528], [272, 554], [348, 336]], cuff = [[208, 528], [272, 554], [284, 520], [220, 494]];
 const sleeve = () => PG(slv, dk) + PG(slv, ctx.lin([['0', '#fff', .08], [1, '#000', .12]], 'h')) + PG(cuff, dk2) + S('M214 524 L276 550', lace, 4);
 let s = G(sleeve(), 'translate(800 0) scale(-1 1)') + G(sleeve());
 const body = 'M336 210 Q400 242 464 210 L452 336 L448 412 L552 704 Q400 736 248 704 L352 412 L348 336 Z';
 s += P(body, c) + P(body, ctx.lin([['0', '#fff', .2], [.5, '#fff', 0], [1, '#000', .2]], 'h'));
 for (let i = 1; i <= 7; i++) s += S(`M${f(352 + i * 12)} 430 Q${f(300 + i * 28)} 570 ${f(252 + i * 37)} 716`, dk2, 2, 'opacity=".22"');
 s += P('M372 214 L400 278 L428 214Z', dk2) + S('M366 212 L400 286 L434 212', lace, 7) + S('M366 212 L400 286 L434 212', c, 2, 'stroke-dasharray="1 9"');
 for (const y of [300, 338, 376]) s += C(400, y, 4.5, lace);
 s += R(346, 404, 108, 28, 6, dk) + PG([[400, 418], [350, 394], [350, 442]], dk2) + PG([[400, 418], [450, 394], [450, 442]], dk2) + R(388, 404, 24, 28, 7, darken(c, .36));
 s += S('M252 700 Q400 732 548 700', lace, 20) + S('M252 700 Q400 732 548 700', c, 3, 'stroke-dasharray="1 10" opacity=".8"');
 return {svg: s, box: {w: 400, h: 540}, base: {y: 728, rx: 230}, focus: {x: 400, y: 318, z: 2}};
}

/* ---------- mukena ---------- */
export function mukena(ctx, o = {}) {
 const c = o.color || '#FBF8F2', trim = o.trim || '#F0C9D4', dk = darken(c, .1);
 const body = 'M400 108 C308 108 264 190 264 294 C264 412 222 552 192 700 L608 700 C578 552 536 412 536 294 C536 190 492 108 400 108 Z';
 let s = P(body, ctx.lin([lighten(c, .3), c, dk], 'h')) + P(body, ctx.lin([['0', '#fff', .25], [1, '#000', .1]], 'v'));
 const n = 12, x0 = 192, w = (608 - 192) / n;
 for (let i = 0; i < n; i++) s += P(`M${f(x0 + i * w)} 700 a${f(w / 2)} ${f(w / 2)} 0 0 0 ${f(w)} 0Z`, trim);
 s += S('M192 700 L608 700', darken(trim, .12), 2);
 s += E(400, 298, 96, 122, ctx.lin(['#CFC6D3', '#E9E2EA'])) + E(400, 298, 96, 122, 'none', `stroke="${trim}" stroke-width="13"`) + E(400, 298, 82, 108, 'none', `stroke="${darken(trim, .15)}" stroke-width="2.5" stroke-dasharray="2 7"`);
 const flower = (x, y, r) => { let o2 = ''; for (let k = 0; k < 5; k++) { const a = k * 2 * Math.PI / 5 - Math.PI / 2; o2 += C(x + Math.cos(a) * r * .85, y + Math.sin(a) * r * .85, r * .62, trim); } return o2 + C(x, y, r * .5, GOLD); };
 for (let x = 236; x <= 564; x += 41) s += flower(x, 650, 14);
 for (let x = 256; x <= 544; x += 48) s += flower(x, 590, 9);
 s += S('M232 520 Q400 548 568 520', trim, 4, 'opacity=".9"');
 s += S('M300 430 C290 520 262 620 244 690', dk, 2, 'opacity=".5"') + S('M500 430 C510 520 538 620 556 690', dk, 2, 'opacity=".5"');
 return {svg: s, box: {w: 430, h: 620}, base: {y: 724, rx: 270}, focus: {x: 400, y: 330, z: 1.7}};
}

/* ---------- hijab segi empat ---------- */
export function scarf(ctx, o = {}) {
 const c = o.color || '#9DB8A4', bd = darken(c, .2), lt = lighten(c, .45);
 const d = [[400, 112], [694, 400], [400, 688], [106, 400]];
 const inset = k => [[400, 112 + k], [694 - k, 400], [400, 688 - k], [106 + k, 400]];
 const motif = ctx.pat(46, 46, `${C(23, 23, 3.4, lt, 'opacity=".75"')}${C(0, 0, 2.2, lt, 'opacity=".5"')}${C(46, 0, 2.2, lt, 'opacity=".5"')}${C(0, 46, 2.2, lt, 'opacity=".5"')}${C(46, 46, 2.2, lt, 'opacity=".5"')}`);
 let s = PG(d.map(p => [p[0] + 12, p[1] + 16]), '#000', 'opacity=".12"');
 s += PG(d, c) + PG(inset(50), motif) + PG(inset(50), 'none', `stroke="${bd}" stroke-width="5"`) + PG(inset(74), 'none', `stroke="${lt}" stroke-width="2.5" opacity=".9"`);
 s += PG(d, ctx.lin([['0', '#fff', .22], [.5, '#fff', 0], [1, '#000', .16]], 'd'));
 s += PG([[400, 112], [400, 688], [106, 400]], '#fff', 'opacity=".05"') + L(400, 118, 400, 682, '#000', 2, 'opacity=".07"');
 s += S('M214 300 Q300 330 332 420', '#000', 3, 'opacity=".07"') + S('M560 470 Q500 520 470 590', '#000', 3, 'opacity=".07"');
 s += C(400, 150, 13, GOLD) + C(396, 146, 4, '#fff', 'opacity=".7"');
 return {svg: s, box: {w: 600, h: 590}, base: {y: 704, rx: 260}, focus: {x: 400, y: 360, z: 1.7}};
}

/* ---------- kain batik ---------- */
export function batikCloth(ctx, o = {}) {
 const bg = o.bg || '#E2C48D', fg = o.fg || '#5A3B1E';
 const pat = kawung(ctx, bg, fg);
 let s = G(R(-250 + 14, -190 + 20, 500, 380, 6, '#000', 'opacity=".14"'), 'translate(400 400) rotate(-5)');
 s += G(R(-250, -190, 500, 380, 6, pat) + R(-250, -190, 500, 380, 6, ctx.lin([['0', '#fff', .16], [1, '#000', .14]], 'd'))
  + R(-250, -190, 500, 36, 0, darken(bg, .52)) + R(-250, 154, 500, 36, 0, darken(bg, .52))
  + S('M-240 -172 H240', bg, 3, 'stroke-dasharray="2 8"') + S('M-240 172 H240', bg, 3, 'stroke-dasharray="2 8"')
  + PG([[250, 190], [250, 60], [120, 190]], lighten(bg, .28)) + PG([[250, 190], [120, 190], [250, 60]], ctx.lin([['0', '#000', .0], [1, '#000', .2]], 'd2')) + L(120, 190, 250, 60, '#000', 2, 'opacity=".25"'), 'translate(400 400) rotate(-5)');
 return {svg: s, box: {w: 520, h: 430}, base: {y: 640, rx: 270}, focus: {x: 360, y: 380, z: 1.8}};
}

/* ---------- sarung terlipat (tumpukan tiga lipatan + kepala sarung) ---------- */
export function sarung(ctx, o = {}) {
 const base = o.base || '#1B1B1F', a = o.a || '#C9A24B', b = o.b || '#8A8A93';
 const fill = o.pattern === 'parang' ? parang(ctx, base, a, .7) : plaid(ctx, base, a, b, .55);
 const dx = 52, dy = -36, H = 94;
 const slabs = [{x: 190, y: 566, w: 412}, {x: 202, y: 472, w: 392}, {x: 188, y: 378, w: 416}];
 const topY = slabs[2].y, botY = slabs[0].y;
 const side = [[592, topY + 4], [592 + dx, topY + dy + 4], [592 + dx, botY + dy + H - 14], [592, botY + H]];
 let s = PG(side, fill) + PG(side, '#000', 'opacity=".34"');
 for (const sl of slabs.slice(0, 2)) s += PG([[592, sl.y + 2], [592 + dx, sl.y + dy + 2], [592 + dx, sl.y + dy + 8], [592, sl.y + 8]], '#000', 'opacity=".28"');
 slabs.forEach((sl, i) => {
  const {x, y, w} = sl, top = i === 2;
  const clip = ctx.clip(R(x, y, w, H, 22, '#000'));
  s += R(x, y, w, H, 22, fill) + R(x, y, w, H, 22, ctx.lin([['0', '#fff', .2], [.25, '#fff', 0], [1, '#000', .3]], 'v'));
  if (top) {
   s += G(R(x + w - 92, y, 92, H, 0, darken(base, .08)) + R(x + w - 92, y, 6, H, 0, a) + R(x + w - 78, y, 3, H, 0, a, 'opacity=".8"') + R(x + w - 22, y, 6, H, 0, a) + R(x + w - 36, y, 3, H, 0, a, 'opacity=".8"') + R(x + w - 92, y, 92, H, 0, ctx.lin([['0', '#fff', .15], [1, '#000', .25]], 'v')), '', `clip-path="${clip}"`);
  }
  s += R(x + 14, y + 7, w - 28, 6, 3, '#fff', 'opacity=".22"') + R(x + 10, y + H - 12, w - 20, 5, 2.5, '#000', 'opacity=".18"');
 });
 const t = slabs[2], top = [[t.x + 10, t.y + 4], [t.x + t.w - 10, t.y + 4], [t.x + t.w + dx, t.y + dy + 4], [t.x + dx + 12, t.y + dy + 4]];
 s += PG(top, darken(base, .1)) + PG(top, fill, 'opacity=".7"') + PG(top, ctx.lin([['0', '#fff', .28], [1, '#000', .15]], 'v')) + L(t.x + 14, t.y + 4, t.x + t.w - 10, t.y + 4, '#fff', 3, 'opacity=".3"');
 const m = slabs[1];
 s += R(m.x + m.w - 84, m.y + 34, 64, 40, 5, '#F4EAD0') + R(m.x + m.w - 84, m.y + 34, 64, 6, 0, darken('#F4EAD0', .15)) + S(`M${m.x + m.w - 76} ${m.y + 52} H${m.x + m.w - 30}`, '#9A8A63', 2, 'stroke-dasharray="3 3"') + crescent(ctx, m.x + m.w - 64, m.y + 62, 8, '#7A6A44', .42, .84);
 return {svg: s, box: {w: 480, h: 360}, base: {y: 670, rx: 300}, focus: {x: 420, y: 450, z: 1.6}};
}

/* ---------- peci / kopiah ---------- */
export function peci(ctx, o = {}) {
 const c = o.color || '#1A1A1D', knitted = !!o.knit;
 const tcy = 392, bcy = 574, trx = 138, brx = 172, try_ = 46, bry = 52;
 const body = `M${400 - trx} ${tcy} L${400 - brx} ${bcy} A${brx} ${bry} 0 0 0 ${400 + brx} ${bcy} L${400 + trx} ${tcy} Z`;
 const fill = knitted ? knit(ctx, c) : ctx.lin([lighten(c, .18), c, darken(c, .1)], 'h');
 let s = P(body, fill);
 s += P(body, ctx.lin([['0', '#fff', .2], [.45, '#fff', 0], [1, '#000', .28]], 'h'));
 s += P(`M${400 - brx} ${bcy} A${brx} ${bry} 0 0 0 ${400 + brx} ${bcy} L${400 + brx - 3} ${bcy - 38} A${brx - 3} ${bry - 3} 0 0 1 ${400 - brx + 3} ${bcy - 38}Z`, knitted ? lighten(c, .0) : darken(c, .14), knitted ? 'opacity=".75"' : '');
 s += S(`M${400 - brx + 4} ${bcy - 38} A${brx - 4} ${bry - 4} 0 0 0 ${400 + brx - 4} ${bcy - 38}`, knitted ? darken(c, .22) : GOLD, 3, knitted ? 'opacity=".5"' : 'opacity=".9"');
 s += S(`M${400 - brx + 8} ${bcy - 10} A${brx - 8} ${bry - 8} 0 0 0 ${400 + brx - 8} ${bcy - 10}`, knitted ? darken(c, .15) : lighten(c, .25), 2, 'stroke-dasharray="5 5" opacity=".5"');
 s += E(400, tcy, trx, try_, knitted ? knit(ctx, c) : lighten(c, .12)) + E(400, tcy, trx, try_, ctx.lin([['0', '#fff', .22], [1, '#000', .24]], 'd'));
 s += E(400, tcy + 2, trx - 34, try_ - 14, 'none', `stroke="${darken(c, .3)}" stroke-width="2" opacity="${knitted ? .45 : .6}"`) + L(400, tcy - try_ + 6, 400, tcy + try_ - 6, darken(c, .3), 1.6, 'opacity=".25"');
 s += E(312, 488, 16, 70, '#fff', 'opacity=".1" transform="rotate(8 312 488)"');
 return {svg: s, box: {w: 360, h: 280}, base: {y: 628, rx: 220}, focus: {x: 400, y: 470, z: 1.9}};
}

/* ---------- sajadah ---------- */
export function sajadah(ctx, o = {}) {
 const c = o.color || '#1F6B4A', bd = o.border || darken(c, .25), arch = lighten(c, .22);
 let s = '';
 for (let x = 256; x < 546; x += 9) s += L(x, 90, x, 62 + (x % 18 ? 4 : 0), '#EFE5CC', 3) + L(x, 710, x, 738 - (x % 18 ? 4 : 0), '#EFE5CC', 3);
 s += R(245, 90, 310, 620, 16, bd) + R(245, 90, 310, 620, 16, ctx.lin([['0', '#fff', .16], [1, '#000', .2]], 'd'));
 for (let x = 266; x <= 534; x += 28) for (const y of [108, 692]) s += PG([[x, y - 9], [x + 9, y], [x, y + 9], [x - 9, y]], GOLD, 'opacity=".9"');
 for (let y = 140; y <= 660; y += 28) for (const x of [264, 536]) s += PG([[x, y - 9], [x + 9, y], [x, y + 9], [x - 9, y]], GOLD, 'opacity=".9"');
 s += R(281, 126, 238, 548, 8, c);
 const A = 'M305 654 V364 Q305 252 400 192 Q495 252 495 364 V654Z';
 s += P(A, arch) + P(A, ctx.lin([['0', '#fff', .22], [1, '#000', .1]], 'v')) + P(A, 'none', `stroke="${GOLD}" stroke-width="5"`);
 s += P('M325 654 V372 Q325 270 400 220 Q475 270 475 372 V654Z', 'none', `stroke="${GOLD}" stroke-width="2" opacity=".8"`);
 s += L(400, 192, 400, 262, GOLD, 3) + PG([[400, 262], [418, 288], [400, 314], [382, 288]], GOLD) + C(400, 288, 6, c);
 for (let i = 0; i < 5; i++) s += star8(400, 364 + i * 56 + 40, 11, GOLD, 0, 'opacity=".85"');
 s += R(298, 640, 204, 10, 0, darken(arch, .12), 'opacity=".5"');
 s += S('M281 150 H519', GOLD, 2, 'stroke-dasharray="2 6"') + S('M281 650 H519', GOLD, 2, 'stroke-dasharray="2 6"');
 return {svg: s, box: {w: 320, h: 680}, base: {y: 748, rx: 190}, focus: {x: 400, y: 320, z: 1.9}};
}

/* ---------- tasbih ---------- */
export function tasbih(ctx, o = {}) {
 const wood = o.wood || '#9B5F2E';
 const bead = ctx.rad([lighten(wood, .4), wood, darken(wood, .45)], {cx: .38, cy: .32, r: .85});
 const cx = 400, cy = 292, rx = 168, ry = 178, N = 33;
 let s = E(cx, cy, rx, ry, 'none', 'stroke="#33220f" stroke-width="3"');
 for (let i = 0; i < N; i++) {
  const a = (90 + 11 + i * (338 / (N - 1))) * Math.PI / 180;
  const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
  s += C(x + 2, y + 3, 17, '#000', 'opacity=".18"') + C(x, y, 17, bead) + C(x - 5, y - 6, 4.2, '#fff', 'opacity=".42"');
 }
 s += L(cx, cy + ry - 4, cx, 598, '#33220f', 3);
 s += C(cx + 2, 506, 29, '#000', 'opacity=".18"') + E(cx, 504, 24, 30, bead) + C(cx - 8, 492, 6, '#fff', 'opacity=".4"');
 for (const y of [550, 584]) s += C(cx, y, 15, bead) + C(cx - 4, y - 5, 3.4, '#fff', 'opacity=".4"');
 s += R(cx - 10, 596, 20, 26, 6, GOLD) + E(cx, 628, 17, 10, '#8A2B2B');
 for (let k = -7; k <= 7; k++) s += S(`M${cx + k * 1.8} 630 Q${cx + k * 3.4} 676 ${cx + k * 5.6} 724`, k % 2 ? '#8A2B2B' : '#A83A3A', 3.4);
 s += S(`M${cx - 30} 724 Q${cx} 734 ${cx + 30} 724`, '#8A2B2B', 3);
 return {svg: s, box: {w: 370, h: 640}, base: {y: 742, rx: 150}, focus: {x: 400, y: 200, z: 1.9}};
}

/* ---------- rehal (penyangga kitab) ---------- */
export function rehal(ctx, o = {}) {
 const w0 = o.wood || '#B07A44';
 const board = (rot, c) => {
  let b = R(-92, -245, 184, 500, 14, ctx.lin([lighten(c, .14), c, darken(c, .16)], 'h')) + R(-92, -245, 184, 500, 14, 'none', `stroke="${darken(c, .32)}" stroke-width="3"`);
  for (const [i, x] of [-48, -14, 22, 58].entries()) b += S(`M${x} -230 Q${x + 10} 0 ${x - 4} 240`, darken(c, .22), 1.6, 'opacity=".4"');
  for (const y of [-150, -40, 70, 180]) b += star8(0, y, 36, darken(c, .5)) + star8(0, y, 24, lighten(c, .06), 22.5) + C(0, y, 7, darken(c, .5));
  b += R(-92, 224, 184, 22, 8, darken(c, .18));
  return G(b, `translate(400 468) rotate(${rot})`);
 };
 let s = board(11, darken(w0, .12)) + board(-11, w0) + C(400, 468, 12, GOLD) + C(397, 465, 4, '#fff', 'opacity=".5"');
 const cover = PG([[246, 216], [398, 238], [402, 238], [554, 216], [548, 370], [402, 396], [398, 396], [252, 370]], '#1F6B4A');
 s += cover + PG([[246, 216], [398, 238], [402, 238], [554, 216], [548, 370], [402, 396], [398, 396], [252, 370]], ctx.lin([['0', '#fff', .14], [1, '#000', .16]], 'v'));
 s += PG([[262, 226], [398, 248], [398, 372], [266, 350]], '#F6EFD9') + PG([[402, 248], [538, 226], [534, 350], [402, 372]], '#FAF4E2');
 s += PG([[266, 350], [398, 372], [402, 372], [534, 350], [534, 360], [402, 384], [398, 384], [266, 360]], darken('#F6EFD9', .12));
 for (let i = 0; i < 8; i++) { const y = 262 + i * 13; s += L(282, y - 4 + i * 1.2, 384, y + 14, '#6B5A38', 2.6, 'opacity=".55"') + L(416, y + 14, 520, y - 4 + i * 1.2, '#6B5A38', 2.6, 'opacity=".55"'); }
 s += L(400, 246, 400, 384, '#000', 3, 'opacity=".22"');
 s += star8(310, 252, 8, GOLD) + star8(490, 252, 8, GOLD);
 return {svg: s, box: {w: 340, h: 560}, base: {y: 724, rx: 220}, focus: {x: 400, y: 330, z: 1.8}};
}
