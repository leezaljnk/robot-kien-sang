const sharp = require('sharp');
const fs = require('fs');

const exporterContent = fs.readFileSync('src/utils/scratchExporter.ts', 'utf8');

function extractSvg(varName) {
  const marker = 'const ' + varName + ' = `<svg';
  const start = exporterContent.indexOf(marker);
  if (start === -1) throw new Error('Not found: ' + varName);
  const svgStart = exporterContent.indexOf('<svg', start);
  const svgEnd = exporterContent.indexOf('</svg>', svgStart) + 6;
  return exporterContent.slice(svgStart, svgEnd);
}

const idleSvg = extractSvg('KIEN_SANG_IDLE_SVG');
const vuiSvg = extractSvg('KIEN_SANG_VUI_SVG');
const buonSvg = extractSvg('KIEN_SANG_BUON_SVG');

async function render() {
  await sharp(Buffer.from(idleSvg)).resize(512, 672, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/images/kien-sang-main.png');
  await sharp(Buffer.from(vuiSvg)).resize(512, 672, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/images/k-v-2-happy.png');
  await sharp(Buffer.from(buonSvg)).resize(512, 672, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/images/k-v-2-sad.png');
  await sharp(Buffer.from(idleSvg)).resize(320, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/images/k-v-2-scratch-idle.png');
  await sharp(Buffer.from(vuiSvg)).resize(320, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/images/k-v-2-scratch-vui.png');
  await sharp(Buffer.from(buonSvg)).resize(320, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/images/k-v-2-scratch-buon.png');
  fs.copyFileSync('public/images/kien-sang-main.png', 'public/kien-sang-main.png');
  console.log('Restored base mascot files successfully');
}

render().catch(console.error);
