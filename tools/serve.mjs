/* Server statis tanpa dependensi untuk menjalankan PDE Marketplace secara lokal.
   Pemakaian:  npm start            (http://localhost:5173)
               PORT=8080 npm start  (port lain)
   Aplikasi juga dapat dibuka langsung lewat index.html, tetapi server membuat WebCrypto dan penyimpanan
   berperilaku seperti produksi (https/localhost). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.env.PORT || 5173;
const TYPES = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
 '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2'};

const server = http.createServer((req, res) => {
 let rel;
 try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
 if (rel.endsWith('/')) rel += 'index.html';
 const file = path.resolve(ROOT, '.' + rel);
 if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }         // cegah path traversal
 const blocked = ['node_modules', '.git', 'tests', 'tools'].some(d => file.startsWith(path.join(ROOT, d) + path.sep));
 fs.stat(file, (err, st) => {
  if (blocked || err || !st.isFile()) { res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}); return res.end('404 Tidak ditemukan'); }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache'});
  fs.createReadStream(file).pipe(res);
 });
});
server.listen(PORT, () => console.log(`PDE Marketplace berjalan di http://localhost:${PORT}  (Ctrl+C untuk berhenti)`));
