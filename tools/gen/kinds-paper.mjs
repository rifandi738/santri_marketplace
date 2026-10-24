/* Ilustrasi: buku, kitab, mushaf, buku tulis, pulpen, pensil, kotak pensil, ransel. */
import {f, lighten, darken, R, C, E, P, L, S, PG, G, star8, crescent} from './lib.mjs';

const GOLD = '#D9B45B';

/* garis bergelombang menyerupai goresan kaligrafi (tanpa teks, jadi bebas masalah font) */
const wave = (x0, x1, y, amp, n, stroke, w = 5) => {
 let d = `M${f(x0)} ${f(y)}`;
 const step = (x1 - x0) / n;
 for (let i = 0; i < n; i++) d += ` Q${f(x0 + step * (i + .5))} ${f(y + (i % 2 ? amp : -amp))} ${f(x0 + step * (i + 1))} ${f(y)}`;
 return S(d, stroke, w);
};

/* ---------- buku berdiri (3/4) ---------- */
function decoKitab(ctx, {fx, fy, w, h, c}) {
 const dk = darken(c, .5), cx = fx + w / 2;
 let d = '';
 for (let y = fy + 30; y < fy + h - 20; y += 34) d += L(fx + 11, y, fx + 11, y + 15, dk, 3);
 d += R(fx + 24, fy + 24, w - 48, h - 48, 4, 'none', `stroke="${dk}" stroke-width="3"`);
 d += R(fx + 32, fy + 32, w - 64, h - 64, 2, 'none', `stroke="${dk}" stroke-width="1.5" opacity=".6"`);
 d += star8(cx, fy + 78, 22, dk, 0, 'opacity=".85"') + C(cx, fy + 78, 7, lighten(c, .4));
 const py = fy + h * .33, ph = h * .24;
 d += R(fx + 48, py, w - 96, ph, 8, lighten(c, .42), `stroke="${dk}" stroke-width="3"`);
 d += wave(fx + 66, fx + w - 66, py + ph * .3, 7, 6, dk, 5);
 d += wave(fx + 80, fx + w - 80, py + ph * .55, 6, 5, dk, 5);
 d += wave(fx + 96, fx + w - 96, py + ph * .8, 5, 4, dk, 4);
 d += R(fx + 70, fy + h * .68, w - 140, 38, 6, 'none', `stroke="${dk}" stroke-width="2.5"`);
 d += L(fx + 90, fy + h * .68 + 14, fx + w - 90, fy + h * .68 + 14, dk, 3) + L(fx + 104, fy + h * .68 + 25, fx + w - 104, fy + h * .68 + 25, dk, 3);
 for (let i = -1; i <= 1; i++) d += C(cx + i * 18, fy + h - 52, 4, dk);
 return d;
}
function decoFrame(ctx, {fx, fy, w, h, c}) {
 const cx = fx + w / 2;
 let d = R(fx, fy, w, h * .16, 6, darken(c, .16)) + R(fx, fy + h * .16, w, 4, 0, GOLD);
 d += star8(cx, fy + h * .46, w * .27, 'none', 0, `stroke="${GOLD}" stroke-width="4"`);
 d += star8(cx, fy + h * .46, w * .16, GOLD, 22.5, 'opacity=".95"') + C(cx, fy + h * .46, w * .06, darken(c, .1));
 d += R(fx + w * .2, fy + h * .77, w * .6, 14, 7, '#fff', 'opacity=".92"') + R(fx + w * .3, fy + h * .84, w * .4, 10, 5, GOLD);
 for (const [x, y] of [[fx + 20, fy + h * .16 + 24], [fx + w - 20, fy + h * .16 + 24]]) d += PG([[x, y - 8], [x + 8, y], [x, y + 8], [x - 8, y]], GOLD);
 return d;
}
function decoMushaf(ctx, {fx, fy, w, h, c}) {
 const cx = fx + w / 2, cy = fy + h * .44;
 let d = R(fx + 16, fy + 16, w - 32, h - 32, 6, 'none', `stroke="${GOLD}" stroke-width="4"`);
 d += R(fx + 28, fy + 28, w - 56, h - 56, 4, 'none', `stroke="${GOLD}" stroke-width="1.6"`);
 for (const [x, y, a] of [[fx + 28, fy + 28, 0], [fx + w - 28, fy + 28, 90], [fx + w - 28, fy + h - 28, 180], [fx + 28, fy + h - 28, 270]])
  d += G(P('M0 0 H46 A46 46 0 0 1 0 46Z', GOLD, 'opacity=".9"') + P('M0 0 H26 A26 26 0 0 1 0 26Z', c), `translate(${x} ${y}) rotate(${a})`);
 d += C(cx, cy, w * .3, 'none', `stroke="${GOLD}" stroke-width="4"`);
 for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; d += C(cx + Math.cos(a) * w * .3, cy + Math.sin(a) * w * .3, 4.5, GOLD); }
 d += star8(cx, cy, w * .22, GOLD, 0, 'opacity=".95"') + star8(cx, cy, w * .13, darken(c, .12), 22.5) + C(cx, cy, w * .045, GOLD);
 d += R(fx + w * .3, fy + h * .75, w * .4, 12, 6, GOLD) + R(fx + w * .38, fy + h * .81, w * .24, 9, 4.5, GOLD, 'opacity=".8"');
 return d;
}
function decoKids(ctx, {fx, fy, w, h, c}) {
 const cx = fx + w / 2;
 let d = R(fx + 14, fy + 14, w - 28, h - 28, 14, lighten(c, .55));
 d += C(cx + w * .16, fy + h * .3, w * .17, '#F28C28');
 for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; d += L(cx + w * .16 + Math.cos(a) * w * .2, fy + h * .3 + Math.sin(a) * w * .2, cx + w * .16 + Math.cos(a) * w * .27, fy + h * .3 + Math.sin(a) * w * .27, '#F28C28', 6); }
 d += crescent(ctx, fx + w * .26, fy + h * .24, w * .1, '#fff', .45, .85);
 d += E(fx + w * .32, fy + h * .42, w * .13, w * .06, '#fff') + E(fx + w * .42, fy + h * .4, w * .1, w * .055, '#fff');
 d += P(`M${fx + 14} ${fy + h * .62} Q${fx + w * .3} ${fy + h * .54} ${fx + w * .55} ${fy + h * .62} T${fx + w - 14} ${fy + h * .6} V${fy + h - 14} H${fx + 14}Z`, '#5DB075');
 d += R(fx + w * .14, fy + h * .72, w * .72, h * .12, 12, '#fff') + R(fx + w * .2, fy + h * .75, w * .6, 11, 5.5, '#F28C28') + R(fx + w * .3, fy + h * .81, w * .4, 8, 4, c, 'opacity=".7"');
 return d;
}
function decoDict(ctx, {fx, fy, w, h, c}) {
 const cx = fx + w / 2, dk = darken(c, .3);
 let d = '';
 for (const y of [fy + 34, fy + 46, fy + h - 46, fy + h - 34]) d += R(fx, y, w, 5, 0, GOLD);
 d += R(fx + 36, fy + h * .24, w - 72, h * .34, 8, '#F2E6C8', `stroke="${GOLD}" stroke-width="3"`);
 d += wave(fx + 62, fx + w - 62, fy + h * .34, 9, 6, dk, 6);
 d += wave(fx + 78, fx + w - 78, fy + h * .43, 7, 5, dk, 5);
 d += L(fx + 90, fy + h * .51, fx + w - 90, fy + h * .51, dk, 4);
 d += star8(cx, fy + h * .72, 20, GOLD) + C(cx, fy + h * .72, 6, c);
 for (const [x, y, a] of [[fx, fy, 0], [fx + w, fy, 90], [fx + w, fy + h, 180], [fx, fy + h, 270]]) d += G(PG([[0, 0], [38, 0], [0, 38]], GOLD, 'opacity=".95"'), `translate(${x} ${y}) rotate(${a})`);
 return d;
}
function decoPocket(ctx, {fx, fy, w, h, c}) {
 const cx = fx + w * .46;
 let d = R(fx + w * .78, fy, 16, h, 0, darken(c, .3));
 d += crescent(ctx, cx, fy + h * .36, w * .26, GOLD, .4, .84) + star8(cx + w * .12, fy + h * .33, 14, GOLD);
 d += R(fx + w * .16, fy + h * .62, w * .5, 10, 5, '#fff', 'opacity=".9"') + R(fx + w * .16, fy + h * .69, w * .34, 8, 4, GOLD);
 for (let i = 0; i < 6; i++) d += C(fx + w * .16 + i * 14, fy + h * .88, 3, lighten(c, .4));
 return d;
}
const DECOS = {kitab: decoKitab, frame: decoFrame, mushaf: decoMushaf, kids: decoKids, dict: decoDict, pocket: decoPocket};

export function book(ctx, o = {}) {
 const w = o.w || 290, h = o.h || 410, t = o.thick || 42;
 const sx = t * .8, sy = t * .3;
 const fx = 400 - (w - sx) / 2, fy = 385 - (h - sy) / 2;
 const c = o.cover || '#1F6B4A', pages = o.pages || '#F4ECD6';
 let s = PG([[fx, fy], [fx - sx, fy - sy], [fx - sx, fy + h - sy], [fx, fy + h]], darken(c, .26));
 s += PG([[fx, fy], [fx - sx, fy - sy], [fx - sx, fy + h - sy], [fx, fy + h]], ctx.lin([['0', '#fff', .18], [1, '#000', .12]], 'h'));
 for (const k of [.28, .72]) s += L(fx - sx * k - 1, fy - sy * k + 6, fx - sx * k - 1, fy + h - sy * k - 6, GOLD, 3, 'opacity=".8"');
 s += PG([[fx, fy], [fx + w, fy], [fx + w - sx, fy - sy], [fx - sx, fy - sy]], pages);
 for (const k of [.18, .36, .54, .72, .9]) s += L(fx - sx * k, fy - sy * k, fx + w - sx * k, fy - sy * k, darken(pages, .12), 1.6, 'opacity=".7"');
 s += PG([[fx, fy], [fx + w, fy], [fx + w - sx, fy - sy], [fx - sx, fy - sy]], '#000', 'opacity=".04"');
 s += R(fx, fy, w, h, 7, c);
 s += R(fx, fy, w, h, 7, ctx.lin([['0', '#fff', .22], [.45, '#fff', 0], [1, '#000', .18]], 'd'));
 s += (DECOS[o.deco || 'frame'])(ctx, {fx, fy, w, h, c});
 s += L(fx + 15, fy + 4, fx + 15, fy + h - 4, '#000', 2, 'opacity=".18"') + L(fx + 18, fy + 4, fx + 18, fy + h - 4, '#fff', 2, 'opacity=".22"');
 s += R(fx, fy + h - 7, w, 7, 4, '#000', 'opacity=".12"');
 return {svg: s, box: {w: w + sx, h: h + sy + 10}, base: {y: fy + h + 6, rx: w * .62}, focus: {x: fx + w * .5, y: fy + h * .42, z: 1.85}};
}

/* ---------- buku tulis / jurnal ---------- */
function nb(ctx, {c, w, h, journal, accent}) {
 const pages = '#F6F0E0';
 let s = R(-w / 2 + 12, -h / 2 + 12, w, h, 10, darken(pages, .06));
 for (let i = 0; i < 4; i++) s += L(-w / 2 + 16, h / 2 + 4 + i * 2.4, w / 2 + 8, h / 2 + 4 + i * 2.4, darken(pages, .2), 1, 'opacity=".5"');
 s += R(-w / 2, -h / 2, w, h, 12, c);
 s += R(-w / 2, -h / 2, w, h, 12, ctx.lin([['0', '#fff', .2], [.5, '#fff', 0], [1, '#000', .2]], 'd'));
 s += R(-w / 2, -h / 2, 36, h, 12, darken(c, .22)) + R(-w / 2 + 22, -h / 2, 14, h, 0, darken(c, .22));
 for (let y = -h / 2 + 24; y < h / 2 - 16; y += 30) s += L(-w / 2 + 18, y, -w / 2 + 18, y + 14, lighten(c, .55), 3);
 const lx = -w / 2 + 64, lw = w - 100;
 if (journal) {
  s += star8(lx + lw / 2, -h / 2 + 130, 44, 'none', 0, `stroke="${accent}" stroke-width="4"`) + star8(lx + lw / 2, -h / 2 + 130, 24, accent, 22.5);
  s += R(w / 2 - 44, -h / 2, 16, h, 0, darken(c, .35));
  s += P(`M${w / 2 - 80} ${h / 2 - 2} V${h / 2 + 70} L${w / 2 - 66} ${h / 2 + 52} L${w / 2 - 52} ${h / 2 + 70} V${h / 2 - 2}Z`, accent);
  s += R(lx, h / 2 - 96, lw - 34, 12, 6, accent, 'opacity=".9"');
 } else {
  s += R(lx, -h / 2 + 66, lw, 118, 12, '#FBF6E8');
  s += R(lx + 14, -h / 2 + 84, lw * .5, 12, 6, darken(c, .1)) + R(lx + 14, -h / 2 + 110, lw - 28, 9, 4.5, '#BFB59B') + R(lx + 14, -h / 2 + 130, lw - 28, 9, 4.5, '#BFB59B') + R(lx + 14, -h / 2 + 150, lw * .6, 9, 4.5, '#BFB59B');
  s += crescent(ctx, lx + lw - 22, -h / 2 + 96, 14, darken(c, .1), .42, .84);
 }
 return s;
}
export function notebook(ctx, o = {}) {
 const c = o.cover || '#1F6B4A';
 if (o.journal) {
  const s = G(nb(ctx, {c, w: 290, h: 410, journal: true, accent: o.accent || GOLD}), 'translate(400 385) rotate(-4)');
  return {svg: s, box: {w: 320, h: 500}, base: {y: 645, rx: 190}, focus: {x: 400, y: 330, z: 1.8}};
 }
 const s = G(nb(ctx, {c: lighten(c, .2), w: 250, h: 350}), 'translate(450 372) rotate(9)') + G(nb(ctx, {c, w: 270, h: 370}), 'translate(380 395) rotate(-6)');
 return {svg: s, box: {w: 380, h: 440}, base: {y: 655, rx: 230}, focus: {x: 380, y: 340, z: 1.7}};
}

/* ---------- pulpen & pensil ---------- */
function pencil(ctx, L_, body, ferrule = '#C9CFD6') {
 const wood = '#F0CFA0';
 let s = P(`M-19 -42 H19 V-8 Q19 0 11 0 H-11 Q-19 0 -19 -8Z`, '#F1A3A8');
 s += R(-19, -74, 38, 32, 0, ferrule) + L(-19, -66, 19, -66, darken(ferrule, .2), 2) + L(-19, -58, 19, -58, darken(ferrule, .2), 2) + L(-19, -50, 19, -50, darken(ferrule, .2), 2);
 s += R(-19, -L_ + 110, 38, L_ - 184, 0, body);
 s += R(-19, -L_ + 110, 13, L_ - 184, 0, lighten(body, .28)) + R(6, -L_ + 110, 13, L_ - 184, 0, darken(body, .22));
 s += PG([[-19, -L_ + 110], [19, -L_ + 110], [0, -L_]], wood);
 s += PG([[-8, -L_ + 110], [-19, -L_ + 110], [0, -L_]], '#000', 'opacity=".05"');
 s += PG([[-5.9, -L_ + 34], [5.9, -L_ + 34], [0, -L_]], '#3B3B42');
 return s;
}
function pen(ctx, L_, body, accent) {
 let s = R(-17, -L_ + 70, 34, L_ - 70, 8, body);
 s += R(-11, -L_ + 90, 6, L_ - 190, 3, '#fff', 'opacity=".28"');
 s += R(-17, -L_ + 70, 34, 80, 6, accent) + R(-17, -L_ + 150, 34, 8, 0, darken(accent, .25));
 s += PG([[-17, -L_ + 70], [17, -L_ + 70], [5, -L_ + 22], [-5, -L_ + 22]], '#2A2A2E');
 s += PG([[-5, -L_ + 22], [5, -L_ + 22], [0, -L_]], '#B8BCC4');
 s += R(-17, -52, 34, 52, 10, accent) + R(14, -150, 8, 130, 4, '#D5D9DF');
 return s;
}
export function penFan(ctx, o = {}) {
 const type = o.type || 'pencil', N = o.n || 8, L_ = 500;
 const cols = o.colors || ['#1F7A4D', '#D9A441', '#2F6FB0', '#C0392B', '#6C4BA0', '#1F7A4D', '#D9A441', '#2F6FB0'];
 let s = '';
 const idx = [...Array(N).keys()].sort((a, b) => Math.abs(b - (N - 1) / 2) - Math.abs(a - (N - 1) / 2));
 for (const i of idx) {
  const a = -25 + 50 * i / (N - 1), col = cols[i % cols.length];
  s += G(type === 'pen' ? pen(ctx, L_, '#23262B', col) : pencil(ctx, L_, col), `translate(400 690) rotate(${f(a)})`);
 }
 if (type === 'pencil') {
  s += G(R(-62, -26, 124, 54, 10, '#fff') + R(-62, -26, 54, 54, 10, '#2F6FB0') + R(-8, -26, 12, 54, 0, '#2F6FB0') + R(-62, 20, 124, 8, 4, '#000', 'opacity=".08"'), 'translate(250 668) rotate(-8)');
  s += G(PG([[-46, 20], [46, 20], [30, -18], [-30, -18]], '#E8B64A') + R(-12, -10, 24, 12, 4, '#3B3B42') + PG([[-46, 20], [46, 20], [46, 28], [-46, 28]], darken('#E8B64A', .2)), 'translate(570 660) rotate(7)');
 } else {
  s += G(R(-96, -30, 192, 60, 26, '#1F6B4A') + R(-96, -30, 192, 60, 26, ctx.lin([['0', '#fff', .25], [1, '#000', .2]], 'v')) + S('M-78 0 H78', '#fff', 3, 'stroke-dasharray="6 7" opacity=".8"') + R(-14, -34, 28, 68, 8, '#D9B45B'), 'translate(400 700)');
 }
 return {svg: s, box: {w: 500, h: 560}, base: {y: 718, rx: 250}, focus: {x: 400, y: 330, z: 1.7}};
}

/* ---------- kotak pensil ---------- */
export function pencilCase(ctx, o = {}) {
 const c = o.cover || '#B9A06A';
 let s = '';
 const tips = [['#D9A441', -14, 300], ['#2F6FB0', 0, 390], ['#C0392B', 12, 480]];
 for (const [col, a, x] of tips) s += G(pencil(ctx, 250, col), `translate(${x} 380) rotate(${a})`);
 s += R(160, 360, 480, 230, 74, c);
 s += R(160, 360, 480, 230, 74, ctx.lin([['0', '#fff', .25], [.5, '#fff', 0], [1, '#000', .22]], 'v'));
 s += R(160, 560, 480, 30, 30, '#000', 'opacity=".1"');
 s += S('M200 410 Q400 392 600 410', darken(c, .45), 3, 'stroke-dasharray="3 5"');
 s += S('M200 400 Q400 382 600 400', darken(c, .3), 6);
 s += R(588, 388, 38, 34, 10, '#D5D9DF') + C(607, 405, 7, '#8D939C');
 s += R(222, 470, 150, 72, 14, '#F7F0DC') + R(238, 486, 88, 11, 5.5, darken(c, .35)) + R(238, 506, 112, 8, 4, '#BFB59B') + R(238, 522, 70, 8, 4, '#BFB59B');
 s += crescent(ctx, 540, 500, 38, darken(c, .35), .42, .84) + star8(554, 484, 12, darken(c, .35));
 return {svg: s, box: {w: 500, h: 470}, base: {y: 596, rx: 280}, focus: {x: 400, y: 440, z: 1.6}};
}

/* ---------- ransel ---------- */
export function backpack(ctx, o = {}) {
 const c = o.cover || '#1F6B4A', dk = darken(c, .28), lt = lighten(c, .16);
 let s = '';
 s += P('M262 380 C232 400 232 560 262 620 L278 612 C256 566 256 410 278 388Z', dk);
 s += P('M538 380 C568 400 568 560 538 620 L522 612 C544 566 544 410 522 388Z', dk);
 s += S('M356 160 C356 98 444 98 444 160', dk, 16);
 const body = 'M268 340 C268 190 330 142 400 142 C470 142 532 190 532 340 L542 640 Q542 696 490 696 L310 696 Q258 696 258 640 Z';
 s += P(body, c);
 s += P(body, ctx.lin([['0', '#fff', .24], [.5, '#fff', 0], [1, '#000', .22]], 'h'));
 s += S('M278 330 C278 205 336 160 400 160 C464 160 522 205 522 330', dk, 3, 'stroke-dasharray="7 6"');
 s += R(318, 150, 20, 34, 8, '#D5D9DF') + R(462, 150, 20, 34, 8, '#D5D9DF');
 s += P('M262 500 L262 640 Q262 668 290 668 L306 668 L306 500Z', darken(c, .16));
 for (let y = 516; y < 650; y += 14) s += L(266, y, 302, y, darken(c, .3), 1.5, 'opacity=".5"');
 s += P('M296 462 Q296 442 318 442 L482 442 Q504 442 504 462 L512 650 Q512 678 484 678 L316 678 Q288 678 288 650Z', lt);
 s += P('M296 462 Q296 442 318 442 L482 442 Q504 442 504 462 L512 650 Q512 678 484 678 L316 678 Q288 678 288 650Z', ctx.lin([['0', '#fff', .16], [1, '#000', .18]], 'v'));
 s += S('M300 478 H500', dk, 3, 'stroke-dasharray="4 5"') + R(446, 470, 30, 14, 5, '#D5D9DF') + C(466, 492, 6, 'none', 'stroke="#D5D9DF" stroke-width="3"');
 s += R(364, 530, 72, 36, 8, '#F7F0DC') + crescent(ctx, 388, 548, 11, dk, .42, .84) + R(404, 543, 22, 5, 2.5, '#BFB59B') + R(404, 553, 16, 5, 2.5, '#BFB59B');
 s += S('M286 318 C286 215 340 178 400 178', '#fff', 5, 'opacity=".22"');
 return {svg: s, box: {w: 340, h: 570}, base: {y: 700, rx: 230}, focus: {x: 400, y: 440, z: 1.55}};
}
