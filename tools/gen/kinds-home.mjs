/* Ilustrasi: perlengkapan asrama dan kerajinan (ember, bantal, kasur, lemari, gembok, lampu,
   sandal, hiasan dinding, tote bag, mug, keranjang). */
import {f, lighten, darken, R, C, E, P, L, S, PG, G, star8, star8pts, crescent, sprig, quilt, weave, mosqueSilhouette} from './lib.mjs';

const GOLD = '#D9B45B';

export function bucket(ctx, o = {}) {
 const c = o.color || '#2F7FB5', dk = darken(c, .28), cx = 336;
 let s = '';
 s += S(`M${cx - 146} 310 Q${cx} 64 ${cx + 146} 310`, '#8D939C', 11) + R(cx - 36, 174, 72, 22, 11, '#E8B64A');
 const body = `M${cx - 152} 306 L${cx - 112} 646 A112 30 0 0 0 ${cx + 112} 646 L${cx + 152} 306Z`;
 s += P(body, c) + P(body, ctx.lin([['0', '#fff', .26], [.5, '#fff', 0], [1, '#000', .3]], 'h'));
 s += E(cx, 306, 152, 38, lighten(c, .12)) + E(cx, 310, 134, 29, darken(c, .55)) + E(cx, 306, 152, 38, 'none', `stroke="${lighten(c, .3)}" stroke-width="3" opacity=".8"`);
 s += S(`M${cx - 140} 392 Q${cx} 430 ${cx + 140} 392`, dk, 4, 'opacity=".45"') + S(`M${cx - 130} 540 Q${cx} 574 ${cx + 130} 540`, dk, 4, 'opacity=".45"');
 s += R(cx - 112, 346, 18, 250, 9, '#fff', 'opacity=".22"');
 s += R(cx - 50, 436, 100, 66, 12, '#fff', 'opacity=".92"') + crescent(ctx, cx - 14, 468, 20, c, .42, .84) + star8(cx + 22, 458, 9, c) + R(cx - 28, 486, 56, 6, 3, '#BFB59B');
 const gx = 606, gy = 580;
 s += E(gx, gy + 56, 96, 14, '#000', 'opacity=".16"');
 s += S(`M${gx + 40} ${gy - 6} Q${gx + 118} ${gy - 66} ${gx + 142} ${gy - 168}`, lighten(c, .15), 20) + C(gx + 142, gy - 170, 13, lighten(c, .15)) + C(gx + 142, gy - 170, 5, darken(c, .5));
 const cup = `M${gx - 64} ${gy - 16} L${gx - 50} ${gy + 44} A50 14 0 0 0 ${gx + 50} ${gy + 44} L${gx + 64} ${gy - 16}Z`;
 s += P(cup, lighten(c, .18)) + P(cup, ctx.lin([['0', '#fff', .2], [1, '#000', .25]], 'h')) + E(gx, gy - 16, 64, 17, lighten(c, .3)) + E(gx, gy - 14, 54, 12, darken(c, .5));
 return {svg: s, box: {w: 600, h: 590}, base: {y: 676, rx: 330}, focus: {x: 400, y: 400, z: 1.5}};
}

export function pillow(ctx, o = {}) {
 const c = o.color || '#9DB8A4', st = o.stripe || '#F4EEDD';
 const pil = 'M178 372 Q166 306 232 286 Q400 254 568 286 Q634 306 622 372 Q636 444 622 514 Q632 572 568 592 Q400 620 232 592 Q168 572 178 514 Q164 444 178 372Z';
 let s = P(pil, c) + P(pil, ctx.lin([['0', '#fff', .3], [.5, '#fff', 0], [1, '#000', .2]], 'd'));
 s += P('M206 372 Q198 326 244 312 Q400 284 556 312 Q602 326 594 372 Q606 440 594 510 Q602 556 556 570 Q400 594 244 570 Q198 556 206 510 Q194 440 206 372Z', 'none', `stroke="${lighten(c, .5)}" stroke-width="2.5" stroke-dasharray="7 6" opacity=".9"`);
 for (const [a, b, d2, e] of [[236, 302, 252, 336], [564, 302, 548, 336], [236, 576, 252, 548], [564, 576, 548, 548]]) s += S(`M${a} ${b} Q${(a + d2) / 2 + (a < 400 ? 10 : -10)} ${(b + e) / 2} ${d2} ${e}`, darken(c, .3), 3, 'opacity=".4"');
 s += S('M300 340 Q400 322 500 340', '#fff', 5, 'opacity=".25"');
 const stripes = ctx.pat(54, 10, `${R(0, 0, 54, 10, 0, st)}${R(0, 0, 27, 10, 0, c)}`);
 s += E(400, 724, 240, 16, '#000', 'opacity=".12"');
 s += R(190, 562, 420, 120, 0, stripes) + R(190, 562, 420, 120, 0, ctx.lin([['0', '#fff', .3], [.5, '#fff', 0], [1, '#000', .28]], 'v'));
 s += E(190, 622, 28, 60, darken(st, .12)) + E(610, 622, 28, 60, lighten(st, .2)) + E(610, 622, 28, 60, ctx.lin([['0', '#fff', .2], [1, '#000', .15]], 'd'));
 for (const x of [610, 190]) for (let k = 0; k < 8; k++) s += L(x, 622, x + Math.cos(k * Math.PI / 4) * 24, 622 + Math.sin(k * Math.PI / 4) * 52, darken(st, .25), 1.6, 'opacity=".5"');
 s += C(610, 622, 6, darken(c, .15));
 return {svg: s, box: {w: 480, h: 440}, base: {y: 692, rx: 280}, focus: {x: 400, y: 440, z: 1.6}};
}

export function mattress(ctx, o = {}) {
 const c = o.color || '#2F4A7A', q = quilt(ctx, c, lighten(c, .32)), dx = 56, dy = -40;
 let s = '';
 for (let i = 0; i < 3; i++) {
  const y = 560 - i * 100, x = 180 + (i === 1 ? 8 : i === 2 ? -4 : 0);
  s += PG([[x + 420, y], [x + 420 + dx, y + dy], [x + 420 + dx, y + 60], [x + 420, y + 100]], darken(c, .32));
  s += R(x, y, 420, 100, 24, c) + R(x, y, 420, 100, 24, q, 'opacity=".9"') + R(x, y, 420, 100, 24, ctx.lin([['0', '#fff', .22], [.5, '#fff', 0], [1, '#000', .3]], 'v'));
  s += R(x + 8, y + 7, 404, 7, 3.5, lighten(c, .5), 'opacity=".75"') + R(x + 8, y + 86, 404, 7, 3.5, darken(c, .4), 'opacity=".5"');
  if (i === 2) {
   const top = [[x, y], [x + 420, y], [x + 420 + dx, y + dy], [x + dx, y + dy]];
   s += PG(top, c) + PG(top, q) + PG(top, ctx.lin([['0', '#fff', .3], [1, '#000', .1]], 'v')) + L(x, y, x + 420, y, lighten(c, .55), 4, 'opacity=".8"');
   s += S(`M${x + 420 + dx - 6} ${y + dy + 24} q26 6 18 34`, darken(c, .45), 8);
  }
 }
 return {svg: s, box: {w: 500, h: 370}, base: {y: 668, rx: 300}, focus: {x: 420, y: 400, z: 1.6}};
}

export function drawers(ctx, o = {}) {
 const c = o.color || '#7FB3D9', body = '#E6ECF1';
 const front = [[250, 190], [550, 190], [550, 660], [250, 660]], top = [[250, 190], [550, 190], [596, 150], [296, 150]], right = [[550, 190], [596, 150], [596, 620], [550, 660]];
 let s = PG(right, darken(body, .22)) + PG(top, lighten(body, .3)) + PG(top, ctx.lin([['0', '#fff', .2], [1, '#000', .1]], 'v'));
 s += PG(front, body) + PG(front, ctx.lin([['0', '#fff', .2], [1, '#000', .16]], 'd'));
 for (let i = 0; i < 3; i++) {
  const y = 206 + i * 148;
  s += R(264, y, 272, 136, 12, darken(c, .12)) + R(264, y, 272, 134, 12, c) + R(264, y, 272, 134, 12, ctx.lin([['0', '#fff', .28], [1, '#000', .18]], 'v'));
  s += R(364, y + 20, 72, 15, 7.5, darken(c, .34)) + R(364, y + 20, 72, 6, 3, '#fff', 'opacity=".3"');
  s += R(352, y + 66, 96, 44, 8, '#fff', 'opacity=".86"') + star8(400, y + 88, 13, c) + R(272, y + 120, 256, 6, 3, '#000', 'opacity=".1"');
 }
 s += R(262, 658, 30, 16, 5, '#4B5563') + R(508, 658, 30, 16, 5, '#4B5563') + PG(right, '#000', 'opacity=".06"');
 return {svg: s, box: {w: 350, h: 530}, base: {y: 676, rx: 270}, focus: {x: 400, y: 380, z: 1.6}};
}

export function padlock(ctx, o = {}) {
 const gold = ctx.lin(['#F0D078', '#D4A23A', '#9C6E1B']);
 let s = S('M332 340 V236 Q332 128 400 128 Q468 128 468 236 V340', '#9AA1AB', 36) + S('M332 340 V236 Q332 128 400 128 Q468 128 468 236 V340', '#D7DBE1', 14, 'opacity=".85"') + S('M386 140 Q340 150 345 236', '#fff', 5, 'opacity=".5"');
 s += R(282, 322, 236, 250, 30, gold) + R(282, 322, 236, 250, 30, ctx.lin([['0', '#fff', .3], [.4, '#fff', 0], [1, '#000', .26]], 'd'));
 s += R(302, 342, 196, 210, 20, 'none', 'stroke="#fff" stroke-width="3" opacity=".35"') + R(282, 340, 236, 8, 0, '#fff', 'opacity=".4"');
 s += C(400, 430, 30, '#3A2B12') + PG([[386, 440], [414, 440], [424, 506], [376, 506]], '#3A2B12') + C(394, 424, 8, '#fff', 'opacity=".18"');
 for (const [x, y] of [[308, 348], [492, 348], [308, 546], [492, 546]]) s += C(x, y, 6, '#8A5F17') + L(x - 3, y - 3, x + 3, y + 3, '#D9B45B', 1.5);
 const key = (x, y, rot, col) => G(C(0, 0, 30, 'none', `stroke="${col}" stroke-width="12"`) + R(28, -6, 118, 12, 4, col) + R(112, 6, 12, 26, 2, col) + R(130, 6, 10, 20, 2, col) + C(0, 0, 14, 'none', `stroke="#fff" stroke-width="2" opacity=".35"`), `translate(${x} ${y}) rotate(${rot})`);
 s += E(580, 676, 130, 12, '#000', 'opacity=".14"') + key(560, 640, -20, '#C9CED6') + key(584, 612, -48, '#D4A23A');
 return {svg: s, box: {w: 520, h: 520}, base: {y: 690, rx: 240}, focus: {x: 400, y: 430, z: 1.7}};
}

export function lamp(ctx, o = {}) {
 const c = o.color || '#E8B64A';
 let s = '';
 s += E(520, 668, 190, 26, '#FFE9A0', 'opacity=".35"');
 s += PG([[466, 246], [572, 246], [706, 668], [332, 668]], ctx.lin([['0', '#FFF1B8', .7], [1, '#FFF1B8', 0]], 'v'));
 s += R(228, 652, 190, 30, 12, '#3A3F4A') + R(228, 652, 190, 10, 5, '#fff', 'opacity=".12"') + R(298, 584, 54, 70, 8, '#2E323B');
 s += R(310, 386, 28, 268, 10, '#4A505C') + R(316, 392, 7, 256, 3.5, '#fff', 'opacity=".18"');
 s += C(324, 386, 26, '#2E323B') + C(324, 386, 10, '#8D939C');
 s += G(R(0, -10, 250, 20, 10, '#4A505C') + R(8, -7, 234, 5, 2.5, '#fff', 'opacity=".18"'), 'translate(324 386) rotate(-54)');
 const ex = 324 + 250 * Math.cos(-54 * Math.PI / 180), ey = 386 + 250 * Math.sin(-54 * Math.PI / 180);
 s += C(ex, ey, 22, '#2E323B') + C(ex, ey, 8, '#8D939C');
 s += G(P('M-16 -24 H132 Q154 -24 154 -2 V14 Q154 32 132 32 H-16 Q-38 32 -38 14 V-6 Q-38 -24 -16 -24Z', c) + P('M-16 -24 H132 Q154 -24 154 -2 V14 Q154 32 132 32 H-16 Q-38 32 -38 14 V-6 Q-38 -24 -16 -24Z', ctx.lin([['0', '#fff', .35], [1, '#000', .22]], 'v')) + R(-4, 28, 124, 9, 4.5, '#FFF3B0') + R(0, -16, 110, 6, 3, '#fff', 'opacity=".4"'), `translate(${f(ex)} ${f(ey)}) rotate(24)`);
 return {svg: s, box: {w: 480, h: 540}, base: {y: 690, rx: 250}, focus: {x: 500, y: 330, z: 1.6}};
}

export function sandals(ctx, o = {}) {
 const sole = o.sole || '#1F6B4A', strap = o.strap || '#F4EEDD';
 const path = 'M0 -148 C38 -148 56 -112 53 -62 C50 -14 66 20 58 76 C52 124 38 148 0 148 C-38 148 -52 124 -58 76 C-66 20 -50 -14 -53 -62 C-56 -112 -38 -148 0 -148Z';
 const one = flip => G(
  P(path, darken(sole, .3), 'transform="translate(3 8)" opacity=".5"') + P(path, darken(sole, .15)) + P(path, lighten(sole, .12), 'transform="scale(.92)"')
  + P(path, ctx.lin([['0', '#fff', .25], [1, '#000', .2]], 'd'), 'transform="scale(.92)"')
  + [...Array(18)].map((_, i) => C(-26 + (i % 6) * 10.4, 40 + Math.floor(i / 6) * 24, 2.4, darken(sole, .25), 'opacity=".55"')).join('')
  + S('M-47 -8 Q-24 -52 0 -80', strap, 17) + S('M47 -8 Q24 -52 0 -80', strap, 17) + S('M-47 -8 Q-24 -52 0 -80', '#fff', 4, 'opacity=".35"')
  + C(0, -80, 9, darken(strap, .25)), flip ? 'scale(-1 1)' : '');
 const s = G(one(false), 'translate(298 416) rotate(-8) scale(1.3)') + G(one(true), 'translate(506 424) rotate(7) scale(1.3)');
 return {svg: s, box: {w: 440, h: 470}, base: {y: 650, rx: 290}, focus: {x: 400, y: 420, z: 1.6}};
}

export function wallArt(ctx, o = {}) {
 const wood = o.wood || '#9A6A3A', field = o.field || '#0F5A40';
 let s = S('M400 112 L300 190 M400 112 L500 190', '#6B5A38', 2.5) + C(400, 112, 7, '#6B5A38');
 s += R(186, 186, 428, 428, 10, ctx.lin([lighten(wood, .18), wood, darken(wood, .22)], 'd')) + R(194, 194, 412, 412, 6, 'none', `stroke="${lighten(wood, .35)}" stroke-width="2.5" opacity=".7"`);
 s += R(222, 222, 356, 356, 4, field) + R(222, 222, 356, 356, 4, 'none', 'stroke="#000" stroke-width="5" opacity=".25"');
 const cx = 400, cy = 400;
 s += star8(cx, cy, 158, 'none', 0, `stroke="${GOLD}" stroke-width="4"`) + star8(cx, cy, 158, GOLD, 0, 'opacity=".12"');
 s += star8(cx, cy, 118, lighten(field, .12), 22.5, `stroke="${GOLD}" stroke-width="3"`) + star8(cx, cy, 84, 'none', 0, `stroke="${GOLD}" stroke-width="2.5"`);
 for (const p of star8pts(cx, cy, 158)) s += L(cx, cy, p[0], p[1], GOLD, 1.5, 'opacity=".5"');
 s += C(cx, cy, 40, field, `stroke="${GOLD}" stroke-width="4"`) + star8(cx, cy, 26, GOLD, 22.5) + C(cx, cy, 8, field);
 for (const [x, y, a] of [[222, 222, 0], [578, 222, 90], [578, 578, 180], [222, 578, 270]]) s += G(P('M0 0 H58 A58 58 0 0 1 0 58Z', GOLD, 'opacity=".92"') + P('M0 0 H34 A34 34 0 0 1 0 34Z', field), `translate(${x} ${y}) rotate(${a})`);
 s += PG([[186, 186], [614, 186], [606, 194], [194, 194]], '#fff', 'opacity=".25"');
 return {svg: s, box: {w: 440, h: 520}, base: {y: 650, rx: 250}, focus: {x: 400, y: 400, z: 1.7}};
}

export function tote(ctx, o = {}) {
 const c = o.color || '#EDE3CC', ink = o.ink || '#1F6B4A';
 const wv = weave(ctx, c, darken(c, .08), 14);
 let s = S('M312 342 V210 Q312 140 400 140 Q488 140 488 210 V342', darken(c, .16), 22) + S('M312 342 V210 Q312 140 400 140 Q488 140 488 210 V342', lighten(c, .12), 8, 'opacity=".8"');
 const body = 'M236 336 L564 336 L588 696 L212 696Z';
 s += P(body, c) + P(body, wv, 'opacity=".9"') + P(body, ctx.lin([['0', '#fff', .25], [.5, '#fff', 0], [1, '#000', .22]], 'h'));
 s += R(236, 336, 328, 30, 0, darken(c, .1), 'opacity=".7"') + S('M240 366 H560', darken(c, .3), 2, 'stroke-dasharray="6 5"');
 s += S('M215 690 H585', darken(c, .3), 2, 'stroke-dasharray="6 5"');
 s += C(400, 510, 112, 'none', `stroke="${ink}" stroke-width="7"`) + C(400, 510, 98, 'none', `stroke="${ink}" stroke-width="2"`);
 s += star8(400, 510, 76, ink, 0, 'opacity=".95"') + C(400, 510, 52, c) + crescent(ctx, 396, 510, 36, ink, .42, .84) + star8(414, 494, 11, ink);
 s += R(330, 640, 140, 12, 6, ink) + R(354, 660, 92, 9, 4.5, ink, 'opacity=".7"');
 return {svg: s, box: {w: 400, h: 560}, base: {y: 700, rx: 230}, focus: {x: 400, y: 500, z: 1.7}};
}

export function mug(ctx, o = {}) {
 const c = o.color || '#FBF8F2', ink = o.ink || '#0F5A40', cx = 380;
 let s = E(cx + 20, 662, 200, 34, '#000', 'opacity=".12"') + E(cx + 10, 650, 190, 32, ctx.lin(['#F1EDE4', '#D3CEC2'])) + E(cx + 10, 646, 160, 24, '#fff', 'opacity=".7"');
 s += S(`M${cx + 128} 330 C${cx + 232} 316 ${cx + 242} 506 ${cx + 122} 524`, '#CFC8B8', 40) + S(`M${cx + 128} 330 C${cx + 232} 316 ${cx + 242} 506 ${cx + 122} 524`, c, 34) + S(`M${cx + 128} 330 C${cx + 232} 316 ${cx + 242} 506 ${cx + 122} 524`, darken(c, .1), 34, 'opacity=".25"') + S(`M${cx + 128} 346 C${cx + 206} 338 ${cx + 214} 494 ${cx + 122} 508`, '#fff', 5, 'opacity=".5"');
 const body = `M${cx - 126} 280 L${cx - 120} 612 A120 30 0 0 0 ${cx + 120} 612 L${cx + 126} 280Z`;
 s += P(body, c) + P(body, ctx.lin([['0', '#000', .1], [.18, '#fff', .35], [.5, '#fff', 0], [1, '#000', .22]], 'h'));
 s += E(cx, 280, 126, 28, '#fff') + E(cx, 282, 112, 22, '#4B2E1E') + E(cx, 284, 112, 20, ctx.lin(['#6B4228', '#3A2314'])) + E(cx, 280, 126, 28, 'none', 'stroke="#D9D4C8" stroke-width="2"');
 s += P(`M${cx - 120} 470 Q${cx} 500 ${cx + 120} 470 L${cx + 119} 560 Q${cx} 590 ${cx - 121} 560Z`, ink, 'opacity=".96"');
 s += C(cx, 520, 36, '#D9B45B', 'opacity=".95"') + mosqueSilhouette(ctx, cx, 560, .2, '#F6EFDD');
 s += S(`M${cx - 30} 240 C${cx - 50} 200 ${cx - 10} 190 ${cx - 30} 150`, '#fff', 7, 'opacity=".75"') + S(`M${cx + 24} 244 C${cx + 4} 204 ${cx + 44} 190 ${cx + 24} 146`, '#fff', 7, 'opacity=".6"');
 return {svg: s, box: {w: 440, h: 520}, base: {y: 684, rx: 250}, focus: {x: cx, y: 500, z: 1.7}};
}

export function basket(ctx, o = {}) {
 const c = o.color || '#C99A5B', dk = darken(c, .25);
 const wv = ctx.pat(30, 20, `${R(0, 0, 30, 20, 0, c)}${R(0, 0, 30, 9, 0, lighten(c, .12))}${R(0, 10, 30, 9, 0, darken(c, .06))}${L(15, 0, 15, 10, dk, 2, 'opacity=".5"')}${L(0, 10, 0, 20, dk, 2, 'opacity=".5"')}${L(30, 10, 30, 20, dk, 2, 'opacity=".5"')}${L(0, 10, 30, 10, dk, 1.5, 'opacity=".4"')}`);
 let s = sprig(330, 360, 190, -22, '#3E8E62', '#2F7752') + sprig(470, 360, 160, 24, '#4C9A6B', '#2F7752');
 s += S('M216 392 C140 392 140 492 236 492', dk, 15) + S('M584 392 C660 392 660 492 564 492', dk, 15);
 const body = 'M212 372 L588 372 L546 646 Q544 674 516 674 L284 674 Q256 674 254 646Z';
 s += P(body, wv) + P(body, ctx.lin([['0', '#fff', .22], [.5, '#fff', 0], [1, '#000', .26]], 'h'));
 s += R(204, 352, 392, 40, 20, ctx.lin([lighten(c, .15), darken(c, .1)])) + R(204, 352, 392, 40, 20, 'none', `stroke="${dk}" stroke-width="2.5" opacity=".6"`);
 for (let x = 220; x < 590; x += 20) s += L(x, 360, x + 6, 384, dk, 2.2, 'opacity=".5"');
 s += R(214, 656, 372, 14, 7, darken(c, .3), 'opacity=".7"');
 return {svg: s, box: {w: 500, h: 480}, base: {y: 680, rx: 290}, focus: {x: 400, y: 500, z: 1.7}};
}
