/* Autentikasi DEMO: masuk, daftar + OTP, lupa sandi. Kata sandi disimpan sebagai hash bergaram (js/lib/password.js).
   Ini BUKAN autentikasi produksi: semua berjalan di browser tanpa server. */
const authWrap = inner => `<div class="auth"><div class="auth-art" aria-hidden="true"><img src="${SITE_IMG.authArt}" alt="" width="800" height="1000"><p>${BRAND.name}<br><small>${BRAND.tagline}</small></p></div><div class="auth-f"><div class="auth-box">${inner}</div></div></div>`;
const demoNote = '<p class="note warn small">' + '<span><b>Prototipe.</b> Jangan memakai kata sandi sungguhan. Data hanya tersimpan di browser ini.</span></p>';

function loginPage() {
 if (me()) { setTimeout(() => go(me().role === 'admin' ? '/admin' : '/akun'), 0); return authWrap('<p class="muted">Anda sudah masuk. Mengalihkan…</p>'); }
 return authWrap(`<h1>Masuk</h1><p class="muted">Masuk untuk checkout, melacak pesanan, atau mengelola toko.</p>
 <div class="demo-box" role="group" aria-label="Akun demo"><b>Coba dengan akun demo</b><span class="small muted">Klik untuk mengisi dan masuk otomatis.</span><div class="demo-btns">${DEMO_ACCOUNTS.map(a => `<button type="button" data-act="demoLogin" data-email="${a.email}" data-pass="${a.pass}" data-to="${a.to}"><b>${a.role}</b><small>${a.email}</small></button>`).join('')}</div></div>
 <form data-form="login" novalidate>${F('email', 'Email', {type: 'email', ac: 'email', req: true})}${F('pass', 'Kata sandi', {type: 'password', req: true})}
  <div class="row-between">${chk('rem', 'Ingat saya di perangkat ini')}<a class="small" href="#/lupa-sandi">Lupa kata sandi?</a></div>
  <span class="err block" data-err="form" id="err-form" role="alert"></span>
  <button class="btn block lg">Masuk</button></form>
 <p class="small center">Belum punya akun? <a href="#/daftar">Daftar sekarang</a></p>${demoNote}`);
}
function registerPage() {
 return authWrap(`<h1>Buat akun</h1><p class="muted">Kami akan meminta kode 6 digit untuk mengonfirmasi email (demo).</p>
 <form data-form="register" novalidate>${F('name', 'Nama lengkap', {req: true, ac: 'name'})}${F('email', 'Email', {type: 'email', req: true, ac: 'email'})}${F('phone', 'Nomor telepon', {type: 'tel', req: true, ac: 'tel', ph: '08xxxxxxxxxx'})}
  ${F('pass', 'Kata sandi', {type: 'password', req: true, ac: 'new-password', hint: 'Minimal 8 karakter.'})}${F('pass2', 'Ulangi kata sandi', {type: 'password', req: true, ac: 'new-password'})}
  <div class="field">${chk('terms', 'Saya menyetujui <a href="#/syarat">syarat & ketentuan</a> dan <a href="#/privasi">kebijakan privasi</a>')}<span class="err" data-err="terms" id="err-terms" role="alert"></span></div>
  <button class="btn block lg">Buat akun</button></form>
 <p class="small center">Sudah punya akun? <a href="#/masuk">Masuk</a></p>${demoNote}`);
}
function forgotPage() {
 return authWrap(`<h1>Atur ulang kata sandi</h1><p class="muted">Masukkan email akun Anda. Kami akan meminta kode 6 digit (demo).</p>
 <form data-form="forgot" novalidate>${F('email', 'Email', {type: 'email', req: true, ac: 'email'})}<button class="btn block lg">Kirim kode</button></form><p class="small center"><a href="#/masuk">Kembali ke halaman masuk</a></p>`);
}
function otpPage() {
 const p = S.pending;
 if (!p) return authWrap(`<h1>Tidak ada kode yang diminta</h1><p class="muted">Mulai dari membuat akun atau mengatur ulang kata sandi.</p><div class="btn-row"><a class="btn" href="#/daftar">Buat akun</a><a class="btn ghost" href="#/lupa-sandi">Lupa kata sandi</a></div>`);
 after.push(startOtpTimer);
 return authWrap(`<h1>Masukkan kode</h1><p class="muted">Kode 6 digit dikirim ke <b>${esc(p.email)}</b>. Pada demo ini tidak ada email sungguhan; kodenya adalah <b class="mono">${CFG.otpDemoCode}</b>.</p>
 <form data-form="otp" novalidate><fieldset class="otp-set"><legend class="sr">Kode 6 digit</legend><div class="otp">${[0, 1, 2, 3, 4, 5].map(i => `<input inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" data-otp="${i}" autocomplete="${i === 0 ? 'one-time-code' : 'off'}">`).join('')}</div></fieldset>
 <span class="err block" data-err="otp" id="err-otp" role="alert"></span><button class="btn block lg">Verifikasi</button></form>
 <p class="small center" id="otpT" aria-live="polite">Kirim ulang kode dalam 30 detik</p>`);
}
function resetPage() {
 if (!S.pending || S.pending.type !== 'reset' || !S.pending.ok) return authWrap(`<h1>Verifikasi email dulu</h1><p class="muted">Minta kode terlebih dahulu sebelum membuat kata sandi baru.</p><a class="btn" href="#/lupa-sandi">Minta kode</a>`);
 return authWrap(`<h1>Buat kata sandi baru</h1><form data-form="reset" novalidate>${F('pass', 'Kata sandi baru', {type: 'password', req: true, ac: 'new-password', hint: 'Minimal 8 karakter.'})}${F('pass2', 'Ulangi kata sandi baru', {type: 'password', req: true, ac: 'new-password'})}<button class="btn block lg">Simpan kata sandi</button></form>`);
}
let otpTimer;
function startOtpTimer() {
 clearInterval(otpTimer); let s = 30;
 otpTimer = setInterval(() => {
  const e = $('#otpT'); if (!e) { clearInterval(otpTimer); return; }
  s--; if (s <= 0) { clearInterval(otpTimer); e.innerHTML = '<button class="link" data-act="resendOtp">Kirim ulang kode</button>'; } else e.textContent = `Kirim ulang kode dalam ${s} detik`;
 }, 1000);
 $('[data-otp="0"]')?.focus();
}
function doLogin(u, msg, remember = true, to = '') {
 setSession(u.id, remember);
 const red = S.redirect; S.redirect = null; S.pending = null; save();
 toast(msg || `Selamat datang, ${u.name.split(' ')[0]}!`);
 go(red ? red.slice(1) : (to || (u.role === 'admin' ? '/admin' : '/akun')));
}
