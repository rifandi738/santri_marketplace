/* Primitif UI: ikon, toast, modal (dengan focus-trap), konfirmasi, validasi form, dan komponen bersama. */

/* ---------- ikon (SVG inline, stroke) ---------- */
const ICONS = {
 search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 heart: '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
 cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6"/>',
 user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
 menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
 x: '<path d="M6 6l12 12M18 6L6 18"/>',
 down: '<path d="M6 9l6 6 6-6"/>', right: '<path d="M9 6l6 6-6 6"/>', left: '<path d="M15 6l-6 6 6 6"/>',
 star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 truck: '<path d="M2 6h11v10H2zM13 10h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
 shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
 tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
 book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/>',
 shirt: '<path d="M8 3l-5 3 2.5 4L8 9v11h8V9l2.5 1L21 6l-5-3a4 4 0 0 1-8 0z"/>',
 rug: '<rect x="6" y="2.5" width="12" height="19" rx="1.5"/><path d="M9 18v-6a3 3 0 0 1 6 0v6"/>',
 pencil: '<path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
 bed: '<path d="M3 18V6M3 12h18v6M21 12V9a2 2 0 0 0-2-2h-8v5"/><circle cx="7" cy="9.5" r="1.8"/>',
 jar: '<path d="M8 3h8v3H8z"/><path d="M7 6h10l1 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z"/><path d="M9 12h6v4H9z"/>',
 craft: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10" cy="7.5" r="1.1"/><circle cx="14.5" cy="7.5" r="1.1"/>',
 tablet: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M11 18.5h2"/>',
 check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18.5v.1"/>',
 info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/>',
 trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
 plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
 copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
 logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
 box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
 bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 filter: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
 grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
 list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
 eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff: '<path d="M3 3l18 18M10.6 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.5 9.5 0 0 0 4-.9"/>',
 pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 share: '<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l8-4M8 13l8 4"/>',
 chat: '<path d="M4 5h16v11H9l-5 4z"/>',
 download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
 chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"/>',
 users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.3 2.2 3.8 5"/>',
 gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1-3-5-4-5-1.5S10 8 12 8zM12 8c1-3 5-4 5-1.5S14 8 12 8z"/>'
};
const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const starsHtml = avg => {
 const full = Math.round(avg);
 return `<span class="stars" role="img" aria-label="Rating ${dec1(avg)} dari 5">${[1, 2, 3, 4, 5].map(i => `<svg class="ic ${i <= full ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${/d="([^"]+)"/.exec(ICONS.star)[1]}"/></svg>`).join('')}</span>`;
};

/* state UI sementara (tidak disimpan) */
const ui = {filtersOpen: false};

/* ---------- toast ---------- */
function toast(m, k = 'ok') {
 const box = $('#toasts'); if (!box) return;
 const t = document.createElement('div');
 t.className = 'toast ' + k; t.setAttribute('role', k === 'bad' ? 'alert' : 'status'); t.textContent = m;
 box.append(t); setTimeout(() => t.remove(), k === 'bad' ? 5200 : 3200);
}

/* ---------- modal dengan focus-trap ---------- */
let modalReturn = null;
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function modal(html, cls = '') {
 modalReturn = document.activeElement; closeModal(true);
 const bg = document.createElement('div');
 bg.className = 'modal-bg'; bg.id = 'modal';
 bg.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><button class="x" data-act="closeModal" aria-label="Tutup dialog">${icon('x')}</button>${html}</div>`;
 bg.addEventListener('mousedown', e => { if (e.target === bg) closeModal(); });
 document.body.append(bg); document.body.classList.add('modal-open');
 setTimeout(() => { const d = bg.querySelector('.modal'); const f = bg.querySelector('input:not([type=hidden]),select,textarea,.modal-primary') || bg.querySelector(FOCUSABLE.replace('a[href],', '')); (f || d).focus(); }, 30);
}
function closeModal(silent) {
 const m = $('#modal'); if (m) m.remove();
 document.body.classList.remove('modal-open');
 if (!silent && modalReturn && modalReturn.isConnected && modalReturn.focus) modalReturn.focus();
}
function trapTab(e) {
 const m = $('#modal'); if (!m || e.key !== 'Tab') return;
 const f = $$(FOCUSABLE, m).filter(x => x.offsetParent !== null);
 if (!f.length) { e.preventDefault(); return; }
 const first = f[0], last = f[f.length - 1];
 if (e.shiftKey && (document.activeElement === first || !m.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
 else if (!e.shiftKey && (document.activeElement === last || !m.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
}
function confirmBox(title, msg, yes, fn, danger = true) {
 modal(`<h3 id="modal-title">${esc(title)}</h3><p class="muted">${esc(msg)}</p><div class="modal-foot"><button class="btn ghost" data-act="closeModal">Batal</button><button class="btn ${danger ? 'danger' : ''} modal-primary" id="cfYes">${esc(yes)}</button></div>`);
 $('#cfYes').onclick = () => { closeModal(true); fn(); };
}
/* cegah kirim ganda: tombol dinonaktifkan sementara aksi berjalan */
const busy = (btn, ms = 700) => new Promise(r => {
 if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = '<span class="spin" aria-hidden="true"></span> Memproses…'; btn.setAttribute('aria-busy', 'true'); }
 setTimeout(() => { if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = btn.dataset.t; btn.removeAttribute('aria-busy'); } r(); }, ms);
});

/* ---------- validasi & field ---------- */
function validate(form, rules) {
 let ok = true;
 $$('.err', form).forEach(e => e.textContent = '');
 $$('[aria-invalid]', form).forEach(e => e.removeAttribute('aria-invalid'));
 for (const [name, checks] of Object.entries(rules)) {
  const group = form.elements[name]; if (!group) continue;
  const el = group.tagName ? group : group[0];                     // grup radio = RadioNodeList; atribut dipasang pada elemen pertama
  const v = (el.type === 'checkbox' ? (el.checked ? '1' : '') : (group.value || '')).trim();
  let msg = '';
  for (const c of checks) {
   if (c === 'req' && !v) msg = 'Wajib diisi.';
   else if (c === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) msg = 'Masukkan email yang valid, contoh: nama@contoh.com.';
   else if (typeof c === 'number' && v && v.length < c) msg = `Minimal ${c} karakter.`;
   else if (typeof c === 'function') { const r = c(v, form); if (r) msg = r; }
   if (msg) break;
  }
  if (msg) {
   ok = false; el.setAttribute('aria-invalid', 'true');
   const er = form.querySelector(`[data-err="${name}"]`); if (er) er.textContent = msg;
  }
 }
 if (!ok) { const f = form.querySelector('[aria-invalid=true]'); f && f.focus(); }
 return ok;
}
const F = (name, label, o = {}) => {
 const id = 'f-' + name, hint = o.hint ? `<span class="hint" id="h-${name}">${o.hint}</span>` : '';
 const dby = `aria-describedby="${o.hint ? `h-${name} ` : ''}err-${name}"`;
 let ctl;
 if (o.type === 'textarea') ctl = `<textarea class="inp" id="${id}" name="${name}" ${dby} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.attr || ''}>${esc(o.v || '')}</textarea>`;
 else if (o.type === 'select') ctl = `<select class="inp" id="${id}" name="${name}" ${dby} ${o.attr || ''}>${(o.placeholder ? `<option value="">${esc(o.placeholder)}</option>` : '') + o.opts.map(x => { const [val, txt] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(val)}" ${val == o.v ? 'selected' : ''}>${esc(txt)}</option>`; }).join('')}</select>`;
 else if (o.type === 'password') ctl = `<div class="pw"><input class="inp" type="password" id="${id}" name="${name}" ${dby} autocomplete="${o.ac || 'current-password'}" value="${esc(o.v || '')}"><button type="button" data-act="pwToggle" aria-label="Tampilkan kata sandi">${icon('eye')}</button></div>`;
 else ctl = `<input class="inp" id="${id}" name="${name}" type="${o.type || 'text'}" ${dby} value="${esc(o.v ?? '')}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.ac ? `autocomplete="${o.ac}"` : ''} ${o.attr || ''}>`;
 return `<div class="field"><label for="${id}">${label}${o.req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>${ctl}${hint}<span class="err" id="err-${name}" data-err="${name}" aria-live="polite"></span></div>`;
};
const chk = (name, label, checked = false, extra = '') => `<label class="chk"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''} ${extra}> <span>${label}</span></label>`;

/* ---------- komponen bersama ---------- */
const crumbs = a => `<nav class="crumbs" aria-label="Jejak halaman"><ol><li><a href="#/">Beranda</a></li>${a.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;
const empty = (ic, t, m, cta = '') => `<div class="empty">${icon(ic || 'box')}<h2 class="h3">${t}</h2><p class="muted">${m}</p>${cta}</div>`;
const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
const avatar = (name, color = '#0F6B4B', cls = '') => `<span class="avatar ${cls}" style="background:${color};color:${textOn(color)}" aria-hidden="true">${esc(initials(name))}</span>`;
const imgTag = (src, alt, cls = '', dim = 'width="600" height="600"') => `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" ${dim} loading="lazy" decoding="async">`;
const priceHtml = (p, vid, withPct = true) => {
 const price = unitPrice(p, vid), pct = discountPct(p), disc = pct && !variantOf(p, vid)?.delta;
 return `<span class="price"><b>${rp(price)}</b>${disc ? ` <s>${rp(p.was)}</s>${withPct ? ` <span class="pct" title="Hemat ${rp(p.was - p.price)}">-${pct}%</span>` : ''}` : ''}</span>`;
};
const fromPrice = p => hasVariants(p) && p.variants.items.some(v => v.delta) ? `<span class="muted small">mulai</span> ` : '';
const stockBadge = p => { const s = stockState(p); return s === 'out' ? '<span class="stk out">Stok habis</span>' : s === 'low' ? `<span class="stk low">Sisa ${totalStock(p)}</span>` : ''; };
const soldText = n => n >= 1 ? `Terjual ${compact(n)}` : '';

function productCard(p) {
 const w = S.wish.includes(p.id), sh = shop(p.shop), r = ratingOf(p.id), out = stockState(p) === 'out', pct = discountPct(p);
 const addBtn = out ? '<button class="btn sm" disabled>Stok habis</button>' : `<button class="btn sm" data-act="quickAdd" data-id="${p.id}" aria-label="Tambah ${esc(p.name)} ke keranjang">${icon('plus')}<span>Keranjang</span></button>`;
 return `<article class="pcard ${out ? 'is-out' : ''}">
 <a class="pc-img" href="#/produk/${p.id}" tabindex="-1" aria-hidden="true">${imgTag(mainImage(p), '', '', 'width="480" height="480"')}
  <span class="pc-badges">${pct ? `<span class="badge gold">-${pct}%</span>` : ''}${p.po ? `<span class="badge info">PO ${p.po} hari</span>` : ''}${p.digital ? '<span class="badge dark">Digital</span>' : ''}</span>${out ? '<span class="pc-out">Stok habis</span>' : ''}</a>
 <button class="pc-heart ${w ? 'on' : ''}" data-act="wish" data-id="${p.id}" aria-pressed="${w}" aria-label="${w ? 'Hapus dari' : 'Tambah ke'} favorit: ${esc(p.name)}">${icon('heart')}</button>
 <div class="pc-body">
  <span class="pc-cat">${esc((catOf(p.cat) || {}).short || '')}</span>
  <a class="pc-name" href="#/produk/${p.id}">${esc(p.name)}</a>
  <div class="pc-price">${fromPrice(p)}${priceHtml(p, undefined, false)}</div>
  <a class="pc-shop" href="#/toko/${sh.id}">${icon('store')}<span>${esc(sh.name)}</span></a>
  <div class="pc-stat">${r ? `<span class="rate">${icon('star')} ${dec1(r.avg)} <span class="muted">(${r.n})</span></span>` : ''}${p.sold ? `<span class="muted">${soldText(p.sold)}</span>` : ''}${stockBadge(p)}</div>
  <div class="pc-actions"><a class="btn sm ghost" href="#/produk/${p.id}" aria-label="Lihat detail ${esc(p.name)}">Detail</a>${addBtn}</div>
 </div></article>`;
}
const productGrid = (list, cls = '') => `<div class="pgrid ${cls}">${list.map(productCard).join('')}</div>`;

/* ---------- pager ---------- */
function pager(pg, pages, act = 'page') {
 if (pages <= 1) return '';
 const nums = []; for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - pg) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
 return `<nav class="pager" aria-label="Halaman"><button data-act="${act}" data-p="${pg - 1}" ${pg === 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${icon('left')}</button>${nums.map(n => n === '…' ? '<span class="gap" aria-hidden="true">…</span>' : `<button data-act="${act}" data-p="${n}" class="${n === pg ? 'on' : ''}" ${n === pg ? 'aria-current="page"' : ''} aria-label="Halaman ${n}">${n}</button>`).join('')}<button data-act="${act}" data-p="${pg + 1}" ${pg === pages ? 'disabled' : ''} aria-label="Halaman berikutnya">${icon('right')}</button></nav>`;
}
