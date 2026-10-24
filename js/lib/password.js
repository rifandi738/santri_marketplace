/* Penyimpanan password demo: PBKDF2-SHA256 dengan salt acak per pengguna (tidak pernah plaintext).
   PENTING: ini hanya agar data demo tidak menyimpan password mentah. Hashing di sisi klien BUKAN
   pengganti autentikasi server; pada produksi verifikasi harus dilakukan di backend.
   WebCrypto dipakai bila tersedia (https/localhost/file). Pada http biasa (mis. IP LAN) dipakai
   implementasi JavaScript murni dengan hasil identik. */
const PW_ITER = 100000;

const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = s => new Uint8Array((s.match(/../g) || []).map(h => parseInt(h, 16)));
const utf8 = s => new TextEncoder().encode(s);

/* ---- SHA-256 + HMAC + PBKDF2 murni JS (cadangan) ---- */
const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
const W256 = new Uint32Array(64);
function sha256Block(H, b, o) {
 for (let i = 0; i < 16; i++) W256[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
 for (let i = 16; i < 64; i++) {
  const a = W256[i - 15], c = W256[i - 2];
  const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
  const s1 = ((c >>> 17) | (c << 15)) ^ ((c >>> 19) | (c << 13)) ^ (c >>> 10);
  W256[i] = (W256[i - 16] + s0 + W256[i - 7] + s1) | 0;
 }
 let [a, b2, c, d, e, f, g, h] = H;
 for (let i = 0; i < 64; i++) {
  const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
  const ch = (e & f) ^ (~e & g);
  const t1 = (h + S1 + ch + K256[i] + W256[i]) | 0;
  const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
  const mj = (a & b2) ^ (a & c) ^ (b2 & c);
  const t2 = (S0 + mj) | 0;
  h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
 }
 H[0] = (H[0] + a) | 0; H[1] = (H[1] + b2) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
 H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
}
function sha256(msg) {
 const H = new Int32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
 const len = msg.length, padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
 padded.set(msg); padded[len] = 0x80;
 const bits = len * 8, n = padded.length;
 padded[n - 4] = bits >>> 24; padded[n - 3] = bits >>> 16; padded[n - 2] = bits >>> 8; padded[n - 1] = bits;
 for (let o = 0; o < n; o += 64) sha256Block(H, padded, o);
 const out = new Uint8Array(32);
 for (let i = 0; i < 8; i++) { out[i * 4] = H[i] >>> 24; out[i * 4 + 1] = H[i] >>> 16; out[i * 4 + 2] = H[i] >>> 8; out[i * 4 + 3] = H[i]; }
 return out;
}
function hmac256(key, msg) {
 if (key.length > 64) key = sha256(key);
 const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(96);
 for (let i = 0; i < 64; i++) { const k = key[i] || 0; ip[i] = k ^ 0x36; op[i] = k ^ 0x5c; }
 ip.set(msg, 64); op.set(sha256(ip), 64);
 return sha256(op);
}
const IV256 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
function pbkdf2Js(pass, salt, iter) {
 let key = utf8(pass); if (key.length > 64) key = sha256(key);
 const ipad = new Uint8Array(64), opad = new Uint8Array(64);
 for (let i = 0; i < 64; i++) { ipad[i] = (key[i] || 0) ^ 0x36; opad[i] = (key[i] || 0) ^ 0x5c; }
 const iH = new Int32Array(IV256), oH = new Int32Array(IV256);       // status setelah blok pad (dihitung sekali)
 sha256Block(iH, ipad, 0); sha256Block(oH, opad, 0);
 const blk = new Uint8Array(64);                                     // pesan 32 byte + padding, total (64+32)*8 = 768 bit
 blk[32] = 0x80; blk[62] = 0x03; blk[63] = 0x00;
 const H = new Int32Array(8);
 const toBytes = (st, dst) => { for (let i = 0; i < 8; i++) { dst[i * 4] = st[i] >>> 24; dst[i * 4 + 1] = st[i] >>> 16; dst[i * 4 + 2] = st[i] >>> 8; dst[i * 4 + 3] = st[i]; } };
 const blk0 = new Uint8Array(salt.length + 4); blk0.set(salt); blk0[blk0.length - 1] = 1;
 let u = hmac256(key, blk0);                                         // U1 (pesan sepanjang salt+4)
 const t = u.slice();
 for (let n = 1; n < iter; n++) {
  blk.set(u, 0);
  H.set(iH); sha256Block(H, blk, 0); toBytes(H, blk);                // hash dalam
  H.set(oH); sha256Block(H, blk, 0); toBytes(H, u);                  // hash luar -> U berikutnya
  for (let j = 0; j < 32; j++) t[j] ^= u[j];
 }
 return t;
}
async function pbkdf2(pass, salt, iter) {
 const sub = typeof crypto !== 'undefined' && crypto.subtle;
 if (sub) {
  try {
   const key = await crypto.subtle.importKey('raw', utf8(pass), 'PBKDF2', false, ['deriveBits']);
   return new Uint8Array(await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter}, key, 256));
  } catch (e) { /* jatuh ke implementasi JS */ }
 }
 return pbkdf2Js(pass, salt, iter);
}
const randomBytes = n => { const b = new Uint8Array(n); (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto.getRandomValues(b) : b.forEach((_, i) => b[i] = Math.floor(Math.random() * 256)); return b; };

async function hashPassword(pass) {
 const salt = randomBytes(16);
 return {salt: hex(salt), hash: hex(await pbkdf2(pass, salt, PW_ITER)), iter: PW_ITER};
}
async function verifyPassword(pass, rec) {
 if (!rec || !rec.salt || !rec.hash) return false;
 const h = hex(await pbkdf2(pass, unhex(rec.salt), rec.iter || PW_ITER));
 let diff = h.length ^ rec.hash.length;                      // perbandingan waktu-konstan
 for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ (rec.hash.charCodeAt(i) || 0);
 return diff === 0;
}
