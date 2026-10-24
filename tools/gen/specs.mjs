/* Spesifikasi ilustrasi per produk: jenis gambar + palet.
   `v` = daftar variasi palet; tiap variasi menghasilkan satu gambar utama (dipetakan ke varian produk
   lewat `img` di js/data/products.js). Gambar lain: detail dan suasana. */
const KITAB = {cover: '#E7D49A', deco: 'kitab', w: 280, h: 400, thick: 24, pages: '#EFE3BE'};
const SAND = '#F4F1EA';

export const ART = {
 /* kitab & buku */
 'kt-01': {kind: 'book', p: KITAB},
 'kt-02': {kind: 'book', p: {cover: '#1F6B4A', deco: 'frame', w: 290, h: 410, thick: 34}},
 'kt-03': {kind: 'book', p: {deco: 'mushaf', w: 300, h: 410, thick: 52}, v: [{cover: '#0E5A3F'}, {cover: '#7A1F2B'}, {cover: '#1E3A6B'}]},
 'kt-04': {kind: 'book', p: {cover: '#F2B84B', deco: 'kids', w: 270, h: 350, thick: 26}},
 'kt-05': {kind: 'book', p: {cover: '#157A6E', deco: 'pocket', w: 210, h: 330, thick: 18}},
 'kt-06': {kind: 'book', p: {cover: '#7A1F2B', deco: 'dict', w: 300, h: 420, thick: 56}},
 'kt-07': {kind: 'book', p: {cover: '#D9B66A', deco: 'kitab', w: 270, h: 390, thick: 20, pages: '#EBDDB0'}},
 /* busana muslim */
 'bm-01': {kind: 'shirt', p: {style: 'koko', color: SAND, emb: '#C9B27C', btn: '#F7F1E0'}},
 'bm-02': {kind: 'shirt', p: {style: 'koko', color: '#1E2F5A', emb: '#D9B45B', btn: '#D9B45B'}},
 'bm-03': {kind: 'gamis', p: {color: '#7E9C86'}},
 'bm-04': {kind: 'mukena', p: {color: '#FBF8F2', trim: '#F0C9D4'}},
 'bm-05': {kind: 'scarf', v: [{color: '#9DB8A4'}, {color: '#D9A5A5'}, {color: '#2B3F6B'}, {color: '#E6D5B5'}]},
 'bm-06': {kind: 'shirt', p: {style: 'koko', color: '#BFD9EC', emb: '#8FB3D6', btn: '#FFFFFF', scale: .88}},
 /* sarung, peci, ibadah */
 'ib-01': {kind: 'sarung', v: [{base: '#1B1B1F', a: '#C9A24B', b: '#8A8A93'}, {base: '#1F2F5C', a: '#9AA3B5', b: '#C9A24B'}, {base: '#1D5A43', a: '#E7DDBE', b: '#C9A24B'}]},
 'ib-02': {kind: 'sarung', p: {pattern: 'parang'}, v: [{base: '#8A5A33', a: '#3B2414'}, {base: '#2B4E7A', a: '#12263F'}]},
 'ib-03': {kind: 'peci', p: {color: '#1A1A1D'}},
 'ib-04': {kind: 'peci', p: {color: SAND, knit: true}},
 'ib-05': {kind: 'sajadah', v: [{color: '#1F6B4A'}, {color: '#7A1F2B'}, {color: '#1E3A6B'}]},
 'ib-06': {kind: 'tasbih', p: {wood: '#9B5F2E'}},
 'ib-07': {kind: 'rehal', p: {wood: '#B07A44'}},
 /* alat tulis */
 'bl-01': {kind: 'notebook', p: {cover: '#1F6B4A'}},
 'bl-02': {kind: 'notebook', p: {journal: true}, v: [{cover: '#1F6B4A'}, {cover: '#7A4A24'}, {cover: '#1E3A6B'}]},
 'bl-03': {kind: 'penFan', p: {type: 'pen', n: 9, colors: ['#1F7A4D', '#D9A441', '#2F6FB0', '#C0392B', '#6C4BA0']}},
 'bl-04': {kind: 'penFan', p: {type: 'pencil', n: 7}},
 'bl-05': {kind: 'backpack', v: [{cover: '#1F6B4A'}, {cover: '#4B5563'}]},
 'bl-06': {kind: 'pencilCase', p: {cover: '#B9A06A'}},
 /* perlengkapan asrama */
 'as-01': {kind: 'pillow', p: {color: '#9DB8A4', stripe: '#F4EEDD'}},
 'as-02': {kind: 'mattress', p: {color: '#2F4A7A'}},
 'as-03': {kind: 'drawers', p: {color: '#7FB3D9'}},
 'as-04': {kind: 'padlock', p: {}},
 'as-05': {kind: 'lamp', p: {color: '#E8B64A'}},
 'as-06': {kind: 'bucket', p: {color: '#2F7FB5'}},
 'as-07': {kind: 'sandals', p: {sole: '#1F6B4A', strap: '#F4EEDD'}},
 /* makanan & camilan */
 'mk-01': {kind: 'pouch', p: {icon: 'tempeh'}, v: [{color: '#E07A1F'}, {color: '#C0392B'}, {color: '#7A4A24'}]},
 'mk-02': {kind: 'datesBowl', p: {}},
 'mk-03': {kind: 'jar', p: {type: 'honey', lid: '#C98F2E', label: '#B5651D'}},
 'mk-04': {kind: 'pouch', p: {color: '#4B2E1E', icon: 'bean', labelBg: '#F2E4CE'}},
 'mk-05': {kind: 'box', p: {color: '#B5651D', content: 'candy'}},
 'mk-06': {kind: 'jar', p: {type: 'nastar', label: '#B5651D'}},
 'mk-07': {kind: 'jar', p: {type: 'sambal', lid: '#C0392B', label: '#B3261E'}},
 'mk-08': {kind: 'box', p: {color: '#8A5A2B', content: 'tea'}},
 /* kerajinan */
 'kr-01': {kind: 'wallArt', p: {}},
 'kr-02': {kind: 'tote', v: [{color: '#EDE3CC', ink: '#1F6B4A'}, {color: '#2A2D33', ink: '#E8D9A8'}]},
 'kr-03': {kind: 'mug', p: {}},
 'kr-04': {kind: 'basket', p: {}},
 'kr-05': {kind: 'batikCloth', p: {bg: '#E2C48D', fg: '#5A3B1E'}},
 'kr-06': {kind: 'shirt', p: {style: 'tee', color: '#2F4A7A', print: '#F2E3B3'}},
 /* karya digital */
 'dg-01': {kind: 'tablet', p: {cover: '#1F6B4A'}},
 'dg-02': {kind: 'posters', p: {}},
 'dg-03': {kind: 'vectors', p: {}},
 'dg-04': {kind: 'laptop', p: {}},
 'dg-05': {kind: 'planner', p: {cover: '#1F6B4A'}}
};
