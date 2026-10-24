/* Pembantu uji E2E: menjalankan server statis di port acak, mencari Chromium, dan membuat halaman uji
   yang otomatis merekam error konsol / halaman / permintaan gagal / dialog. */
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
export async function startServer() {
 const port = await freePort();
 const child = spawn(process.execPath, [path.join(ROOT, 'tools/serve.mjs')], {env: {...process.env, PORT: String(port)}, stdio: ['ignore', 'pipe', 'inherit']});
 await new Promise((res, rej) => { child.stdout.on('data', d => String(d).includes('berjalan') && res()); child.on('exit', c => rej(new Error('server berhenti: ' + c))); setTimeout(() => rej(new Error('server tidak siap')), 8000); });
 return {url: `http://localhost:${port}`, stop: () => child.kill()};
}

/* Chromium: CHROMIUM_PATH > bawaan playwright-core > build apa pun di cache ms-playwright */
export function findChromium() {
 if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
 try { const p = chromium.executablePath(); if (p && fs.existsSync(p)) return p; } catch (e) { /* lanjut */ }
 const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright'), path.join(os.homedir(), 'AppData/Local/ms-playwright')].filter(Boolean);
 const cands = [];
 for (const r of roots) {
  if (!fs.existsSync(r)) continue;
  for (const d of fs.readdirSync(r).filter(x => /^chromium(_headless_shell)?-\d+$/.test(x)).sort().reverse()) {
   const base = path.join(r, d);
   for (const sub of fs.readdirSync(base)) {
    for (const rel of ['chrome-headless-shell', 'chrome', 'Chromium.app/Contents/MacOS/Chromium', 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome.exe', 'headless_shell.exe'])
     cands.push(path.join(base, sub, rel));
   }
  }
 }
 const hit = cands.find(p => fs.existsSync(p));
 if (!hit) throw new Error('Chromium tidak ditemukan. Jalankan "npx playwright-core install chromium" atau set CHROMIUM_PATH.');
 return hit;
}

export async function launch() { return chromium.launch({executablePath: findChromium()}); }

const IGNORE = /fonts\.(googleapis|gstatic)\.com/;
/* membuat konteks + halaman baru (penyimpanan bersih). `issues` berisi semua masalah yang tertangkap */
export async function newPage(browser, base, {width = 1366, height = 900, mobile = false, hash = '', ctxOpts = {}} = {}) {
 const ctx = await browser.newContext({viewport: {width, height}, isMobile: mobile, hasTouch: mobile, acceptDownloads: true, ...ctxOpts});
 const page = await ctx.newPage();
 const issues = [];
 page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !IGNORE.test(m.location().url || '')) issues.push(`[console.${m.type()}] ${m.text()}`); });
 page.on('pageerror', e => issues.push('[pageerror] ' + e.message));
 page.on('requestfailed', r => { if (!IGNORE.test(r.url())) issues.push('[requestfailed] ' + r.url()); });
 page.on('dialog', d => { issues.push(`[dialog ${d.type()}] ${d.message()}`); d.dismiss(); });
 await page.goto(base + '/' + (hash ? '#' + hash : ''));
 await page.waitForSelector('#app > *');
 return {page, ctx, issues, base, close: async () => { await ctx.close(); }};
}
export const go = async (page, hash) => { await page.evaluate(h => { location.hash = h; }, hash); await hashOf(page); };
/* menunggu render selesai untuk hash terkini (mencegah membaca DOM lama), lalu mengembalikan hash */
export const hashOf = async page => {
 await page.waitForFunction(() => document.documentElement.dataset.rendered === location.hash, null, {timeout: 6000});
 return page.evaluate(() => location.hash.slice(1));
};
export const toast = page => page.locator('#toasts .toast').last();
export const DEMO = {buyer: ['santri@example.com', '/akun'], seller: ['penjual@example.com', '/penjual'], admin: ['admin@example.com', '/admin']};
export async function login(page, who = 'buyer', {remember = false} = {}) {
 const [email] = DEMO[who];
 await go(page, '/masuk');
 await page.locator(`[data-act=demoLogin][data-email="${email}"]`).click();
 await page.waitForFunction(() => !location.hash.startsWith('#/masuk'), null, {timeout: 8000});
 await page.waitForSelector('#app > *');
}
export const logout = async page => { await page.evaluate(() => A.logout()); await page.waitForTimeout(150); };
export const cartCount = page => page.evaluate(() => cartCount());
export const state = (page, expr) => page.evaluate(e => JSON.parse(JSON.stringify(Function('return (' + e + ')')())), expr);
