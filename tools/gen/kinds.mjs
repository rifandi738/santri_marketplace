/* Daftar semua jenis gambar. Tiap fungsi: (ctx, params) => {svg, box:{w,h}, base:{y,rx}, focus:{x,y,z}} */
import * as paper from './kinds-paper.mjs';
import * as wear from './kinds-wear.mjs';
import * as food from './kinds-food.mjs';
import * as home from './kinds-home.mjs';
import * as digital from './kinds-digital.mjs';

export const KINDS = {
 book: paper.book, notebook: paper.notebook, penFan: paper.penFan, pencilCase: paper.pencilCase, backpack: paper.backpack,
 shirt: wear.shirt, gamis: wear.gamis, mukena: wear.mukena, scarf: wear.scarf, batikCloth: wear.batikCloth,
 sarung: wear.sarung, peci: wear.peci, sajadah: wear.sajadah, tasbih: wear.tasbih, rehal: wear.rehal,
 jar: food.jar, pouch: food.pouch, box: food.box, datesBowl: food.datesBowl,
 bucket: home.bucket, pillow: home.pillow, mattress: home.mattress, drawers: home.drawers, padlock: home.padlock,
 lamp: home.lamp, sandals: home.sandals, wallArt: home.wallArt, tote: home.tote, mug: home.mug, basket: home.basket,
 tablet: digital.tablet, laptop: digital.laptop, posters: digital.posters, vectors: digital.vectors, planner: digital.planner
};
