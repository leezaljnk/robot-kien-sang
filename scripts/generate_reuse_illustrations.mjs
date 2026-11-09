import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const directory = new URL('../public/images/thu-tai-phan-loai/rac-chinh/', import.meta.url);
const ink = '#294b4c';
const colors = ['#f58b91', '#70c8bb', '#f6cf67', '#80b5e6', '#b7a0d5', '#9bd383'];
const rect = (x, y, width, height, fill, radius = 8) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>`;
const circle = (x, y, radius, fill) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}"/>`;
const ellipse = (x, y, radiusX, radiusY, fill) => `<ellipse cx="${x}" cy="${y}" rx="${radiusX}" ry="${radiusY}" fill="${fill}"/>`;
const path = (drawing, fill = 'none') => `<path d="${drawing}" fill="${fill}"/>`;
const group = (drawing, transform) => `<g transform="${transform}">${drawing}</g>`;
const leaf = (x, y, direction = 1) => path(`M${x} ${y} Q${x + direction * 38} ${y - 42} ${x + direction * 34} ${y - 7} Q${x + direction * 18} ${y + 3} ${x} ${y}`, '#8bcc7d');
const sprout = (x, y) => path(`M${x} ${y} V${y - 54}`) + leaf(x, y - 34) + leaf(x, y - 12, -1);
const pencils = (x = 78, y = 40) => colors.slice(0, 4).map((color, index) => group(rect(x + index * 22, y, 14, 115, color, 2) + path(`M${x + index * 22} ${y} l7 -17 l7 17`, '#fbe6bb') + path(`M${x + index * 22 + 3} ${y + 18} V${y + 104}`, '#ffffff55'), `rotate(${(index - 1.5) * 8} 120 145)`)).join('');
const shirt = path('M76 48 L98 40 Q120 60 142 40 L164 48 L201 85 L176 113 L157 96 L157 198 L83 198 L83 96 L64 113 L39 85 Z', '#f58b91') + path('M99 41 Q120 81 141 41 M83 96 Q120 112 157 96 M87 179 H153') + path('M76 51 L95 75 M164 51 L145 75 M96 45 Q120 72 144 45', '#ffffff66') + path('M119 112 V182', '#d54e76');
const jeans = path('M70 38 H170 L179 109 L163 207 H127 L120 122 L113 207 H77 L61 109 Z', '#5d94c8') + path('M69 64 H171 M120 64 V106 M76 74 Q102 103 112 74 M128 74 Q141 103 166 74 M82 116 L109 110 M131 110 L159 116 M89 196 H107 M133 196 H151', '#d1e5f2') + circle(120, 51, 3, '#f6cf67');
const bag = (color = '#f58b91') => path('M88 84 V62 Q120 17 152 62 V84', 'none') + rect(62, 79, 116, 124, color, 14) + path('M74 92 V188 H166 V92 M82 105 H158 M82 174 H158') + rect(109, 116, 22, 31, '#ffffff66', 3);
const cup = (color = '#f6cf67', x = 78, y = 88, scale = 1) => group(path('M0 0 H84 L73 108 H11 Z', color) + ellipse(42, 0, 43, 10, '#fff8ec') + path('M8 25 H77 M13 82 H72 M20 15 V94', '#ffffff88'), `translate(${x} ${y}) scale(${scale})`);
const tray = (color = '#80b5e6') => rect(36, 104, 168, 90, color, 18) + rect(48, 116, 144, 62, '#dff3f1', 12) + path('M63 128 H177 M63 146 H177 M63 164 H177', '#9dc4dc');
const cap = (x, y, color, radius = 24) => circle(x, y + 5, radius, color) + circle(x, y, radius, color) + circle(x, y, radius - 6, '#ffffff44') + circle(x, y, radius - 12, color) + path(`M${x - radius + 6} ${y + 2} H${x + radius - 6}`, '#ffffff77');
const stick = (x, y, angle = 0) => group(rect(x, y, 20, 152, '#e9c28c', 10) + path(`M${x + 7} ${y + 15} V${y + 128} M${x + 13} ${y + 23} V${y + 119}`, '#bd8c59'), `rotate(${angle} ${x + 10} ${y + 76})`);
const spoon = (x, y, color = '#80b5e6', angle = 0) => group(rect(x - 6, y + 15, 12, 108, color, 6) + ellipse(x, y, 22, 34, color) + ellipse(x, y - 3, 13, 22, '#ffffff55') + path(`M${x - 2} ${y + 50} V${y + 112}`, '#ffffff77'), `rotate(${angle} ${x} ${y + 60})`);
const newspaper = rect(49, 46, 142, 153, '#f6f5e9', 4) + rect(62, 61, 115, 19, '#305d78', 2) + rect(62, 94, 44, 43, '#8ba45b', 2) + path('M67 130 L82 106 L97 130 Z', '#e5d28a') + [101, 117, 133, 153, 169, 185].map(y => path(`M120 ${y} H177`)).join('') + [153, 169, 185].map(y => path(`M62 ${y} H105`)).join('');
const flower = (petal = '#f58b91', useSpoons = false) => path('M120 128 V211') + leaf(120, 186) + leaf(120, 166, -1) + Array.from({length: 6}, (_, index) => group(useSpoons ? ellipse(120, 68, 15, 32, petal) : ellipse(120, 70, 19, 31, petal), `rotate(${index * 60} 120 104)`)).join('') + circle(120, 104, 22, '#f6cf67') + circle(120, 104, 9, '#a46c2a');
const eggTray = rect(31, 100, 178, 86, '#c8b794', 15) + Array.from({length: 6}, (_, index) => ellipse(64 + index % 3 * 56, 124 + Math.floor(index / 3) * 35, 23, 14, '#eee2c8') + ellipse(64 + index % 3 * 56, 122 + Math.floor(index / 3) * 35, 15, 7, '#ffffff66')).join('');
const stitched = path('M80 102 H160 V184 H80 Z') + path('M86 108 H154 V177 H86 Z');
const illustrations = {
  ao_cu: [shirt,
    bag(),
    ellipse(120, 145, 91, 57, '#f58b91') + ellipse(120, 145, 73, 43, '#f6cf67') + ellipse(120, 145, 54, 29, '#70c8bb') + ellipse(120, 145, 29, 15, '#f58b91'),
    rect(55, 84, 132, 103, '#f58b91', 3) + path('M56 86 L160 58 L186 84 M75 85 V185 M55 164 H186') + circle(149, 114, 7, '#fff5ee'),
  ],
  quan_jean: [jeans,
    path('M67 92 Q120 -10 173 92') + rect(60, 89, 120, 112, '#80b5e6') + stitched + circle(120, 125, 5, '#f6cf67'),
    rect(38, 102, 164, 71, '#80b5e6', 15) + path('M48 116 H192') + rect(169, 110, 12, 20, '#f6cf67', 2) + path('M49 158 H190'),
    circle(120, 129, 74, '#80b5e6') + circle(120, 129, 62, '#bfddf4') + path('M83 90 H157 V165 H83 Z') + path('M90 98 H150 V157 H90 Z'),
  ],
  que_kem: [stick(73, 48, -22) + stick(111, 45) + stick(149, 48, 22),
    rect(63, 64, 115, 116, '#d9edf8', 2) + path('M73 157 L105 119 L127 145 L150 112 L170 157', '#8bcc7d') + circle(148, 91, 12, '#f6cf67') + stick(53, 41) + stick(169, 41) + group(stick(110, -9), 'rotate(90 120 67)') + group(stick(110, 104), 'rotate(90 120 180)'),
    rect(58, 105, 124, 103, '#e9c28c', 3) + [68, 90, 112, 134, 156].map(x => path(`M${x} 111 V203`)).join('') + path('M31 112 L120 35 L209 112 Z', '#f58b91') + rect(100, 145, 40, 63, '#80b5e6', 2),
    pencils() + rect(61, 118, 118, 85, '#e9c28c', 3) + [70, 90, 110, 130, 150, 170].map(x => path(`M${x} 121 V198`)).join('') + path('M62 140 H178 M62 183 H178'),
  ],
  hop_trung: [eggTray,
    [66, 120, 174].map(x => sprout(x, 130)).join('') + eggTray,
    [51, 88, 125, 162].map((x, index) => circle(x, 145 - index * 5, 27, colors[index + 1])).join('') + circle(187, 113, 31, '#f58b91') + path('M175 85 L167 66 M197 85 L205 66'),
    flower('#b7a0d5'),
  ],
  nap_chai: [cap(78, 94, colors[0]) + cap(145, 72, colors[1]) + cap(168, 144, colors[2]) + cap(94, 163, colors[3]),
    rect(36, 36, 168, 168, '#f4fbf6', 8) + path('M120 132 V187') + leaf(120, 169) + Array.from({length: 5}, (_, index) => group(cap(120, 75, colors[index], 18), `rotate(${index * 72} 120 108)`)).join('') + cap(120, 108, '#f6cf67', 19),
    ellipse(120, 153, 68, 24, '#80b5e6') + path('M120 172 L120 204') + rect(111, 64, 18, 99, '#f6cf67', 5) + ellipse(120, 139, 68, 24, '#f58b91') + path('M69 104 Q45 122 47 144 M171 102 Q197 118 195 143'),
    rect(28, 56, 184, 142, '#f4fbf6', 8) + [1, 2, 3].map((count, row) => Array.from({length: count}, (_, index) => cap(65 + index * 54, 84 + row * 42, colors[row], 14)).join('')).join(''),
  ],
  khay_nhua: [tray(),
    [72, 121, 170].map(x => sprout(x, 132)).join('') + tray('#70c8bb') + path('M51 144 H190', '#806447'),
    tray() + group(pencils(76, 66), 'rotate(60 120 132) scale(.76) translate(36 31)'),
    tray('#b7a0d5') + colors.slice(0, 5).map((color, index) => ellipse(64 + index * 27, 143 + index % 2 * 16, 13, 10, color)).join('') + path('M163 51 L112 158', '#e9c28c') + path('M114 151 Q92 162 96 180 Q119 181 123 156 Z', '#f58b91'),
  ],
  thia_nhua: [spoon(73, 78, '#80b5e6', -19) + spoon(120, 69, '#f58b91') + spoon(167, 78, '#f6cf67', 19),
    flower('#f58b91', true),
    path('M173 122 L218 89 V157 Z', '#f6cf67') + ellipse(111, 124, 76, 48, '#80b5e6') + [83, 109, 135, 161].map((x, index) => ellipse(x, 122, 12, 29, colors[index])).join('') + circle(60, 113, 6, ink),
    ellipse(82, 91, 42, 17, '#80b5e6') + ellipse(158, 91, 42, 17, '#80b5e6') + ellipse(82, 129, 42, 17, '#b7a0d5') + ellipse(158, 129, 42, 17, '#b7a0d5') + rect(109, 74, 22, 124, '#f6cf67', 10) + circle(120, 68, 21, '#9bd383'),
  ],
  coc_giay: [cup(),
    pencils() + cup('#f58b91'),
    sprout(120, 111) + cup('#f6cf67'),
    path('M61 140 Q111 230 178 135') + cup('#f58b91', 26, 65, .7) + cup('#80b5e6', 154, 65, .7),
  ],
  giay_bao: [newspaper,
    path('M61 108 Q120 10 179 108') + path('M44 103 H196 L174 199 H66 Z', '#ece6d1') + [72, 96, 120, 144, 168].map(x => path(`M${x} 105 V196`)).join('') + [124, 146, 168, 188].map(y => path(`M57 ${y} H183`)).join(''),
    path('M32 160 L120 53 L208 160 Z', '#ece6d1') + path('M120 53 L115 160 M66 127 H106 M135 127 H172') + rect(27, 157, 186, 35, '#f6f5e9', 3) + path('M43 174 H102 M137 174 H193'),
    bag('#ece6d1') + path('M82 108 H158 M82 123 H158 M82 140 H109 M127 140 H158 M82 159 H109 M127 159 H158 M82 177 H158'),
  ],
  tui_vai: [bag('#70c8bb'),
    sprout(120, 105) + path('M66 102 H174 L161 204 H79 Z', '#70c8bb') + path('M79 121 Q120 103 161 121'),
    rect(43, 73, 154, 118, '#70c8bb', 20) + rect(55, 85, 130, 94, '#d2eee5', 15) + path('M47 78 L57 88 M193 78 L183 88 M47 186 L57 176 M193 186 L183 176'),
    path('M120 48 V32 Q147 20 144 45 L120 65') + bag('#70c8bb') + rect(81, 114, 78, 68, '#d2eee5', 3) + pencils(87, 91),
  ],
};

mkdirSync(directory, { recursive: true });
for (const [id, drawings] of Object.entries(illustrations)) {
  drawings.forEach((drawing, index) => {
    const filename = index === 0 ? `${id}_chinh.svg` : `${id}_taisudung_0${index}.svg`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><g stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${drawing}</g></svg>\n`;
    writeFileSync(new URL(filename, directory), svg);
  });
}
console.log(`Generated ${Object.keys(illustrations).length * 4} reuse illustrations.`);

const rasterDirectory = new URL('../public/images/thu-tai-phan-loai/rac-chinh/', import.meta.url);
const sourceDirectory = new URL('../public/', import.meta.url);
const sourceSheets = {
  first: 'phan_loai-1.png',
  second: 'phan_loai-2.png',
};

// Coordinates isolate the source object and its three reuse ideas in the two
// supplied 2752 x 1536 artwork sheets. The dark sheet background becomes alpha.
const sheetAssets = [
  { id: 'but_chi', sheet: 'second', crops: [[145, 25, 290, 250], [1040, 15, 470, 270], [1770, 15, 470, 275], [2260, 10, 480, 280]] },
  { id: 'ao_cu', sheet: 'second', crops: [[145, 270, 300, 315], [1060, 270, 440, 310], [1775, 270, 420, 310], [2260, 270, 480, 310]] },
  { id: 'quan_jean', sheet: 'second', crops: [[145, 555, 300, 350], [1060, 555, 440, 350], [1775, 555, 420, 350], [2260, 555, 480, 350]] },
  { id: 'coc_giay', sheet: 'second', crops: [[145, 860, 300, 320], [1060, 860, 440, 320], [1775, 860, 420, 320], [2260, 860, 480, 320]] },
  { id: 'mu_cu', sheet: 'second', crops: [[145, 1135, 320, 395], [1060, 1135, 440, 395], [1775, 1135, 420, 395], [2260, 1135, 480, 395]] },
  { id: 'khay_go', sheet: 'first', crops: [[80, 10, 460, 300], [1080, 5, 480, 315], [1680, 5, 500, 315], [2260, 5, 480, 315]] },
  { id: 'canh_cay', sheet: 'first', crops: [[80, 290, 460, 385], [1080, 290, 480, 385], [1680, 290, 500, 385], [2260, 290, 480, 385]] },
  { id: 'thia_nhua', sheet: 'first', crops: [[80, 630, 460, 390], [1080, 630, 480, 390], [1680, 630, 500, 390], [2260, 630, 480, 390]] },
  { id: 'giay_bao', sheet: 'first', crops: [[80, 980, 460, 350], [1080, 980, 480, 350], [1680, 980, 500, 350], [2260, 980, 480, 350]] },
  { id: 'hop_trung', sheet: 'first', crops: [[80, 1250, 460, 286], [1080, 1250, 480, 286], [1680, 1250, 500, 286], [2260, 1250, 480, 286]] },
];

const transparentBackground = async (sheet, [left, top, width, height], output) => {
  const { data, info } = await sharp(fileURLToPath(new URL(sourceSheets[sheet], sourceDirectory)))
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const isSheetBackground = red >= 24 && red <= 54 && green >= 24 && green <= 54 && blue >= 24 && blue <= 54;
      if (isSheetBackground) {
        data[offset + 3] = 0;
        continue;
      }
      if (data[offset + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const padding = 8;
  const bounds = {
    left: Math.max(0, minX - padding),
    top: Math.max(0, minY - padding),
    width: Math.min(info.width, maxX + padding + 1) - Math.max(0, minX - padding),
    height: Math.min(info.height, maxY + padding + 1) - Math.max(0, minY - padding),
  };
  await sharp(data, { raw: info })
    .extract(bounds)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(fileURLToPath(new URL(output, rasterDirectory)));
};

await Promise.all(sheetAssets.flatMap(({ id, sheet, crops }) => crops.map((crop, index) =>
  transparentBackground(sheet, crop, index === 0 ? `${id}_chinh.png` : `${id}_taisudung_0${index}.png`)
)));
console.log(`Cropped ${sheetAssets.length * 4} supplied PNG assets with transparent backgrounds.`);