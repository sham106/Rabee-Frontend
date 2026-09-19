const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const outDir = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

function createIcon(size) {
  const png = new PNG({ width: size, height: size, colorType: 2, bitDepth: 8 });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const nx = x / size;
      const ny = y / size;
      const cx = (x - size / 2) / (size / 2);
      const cy = (y - size / 2) / (size / 2);

      let r = 15;
      let g = 23;
      let b = 42;

      const inset = Math.abs(cx) < 0.78 && Math.abs(cy) < 0.78;
      const border = Math.abs(cx) < 0.9 && Math.abs(cy) < 0.9;
      if (border && !inset) {
        r = 245; g = 158; b = 11;
      } else if (inset) {
        r = 30; g = 41; b = 59;
      }

      const stem = nx > 0.28 && nx < 0.38 && ny > 0.18 && ny < 0.82;
      const bowl = nx > 0.38 && nx < 0.72 && ny > 0.18 && ny < 0.38;
      const cutout = nx > 0.47 && nx < 0.62 && ny > 0.24 && ny < 0.32;
      const diagonal = nx > 0.39 && nx < 0.7 && ny > 0.42 && ny < 0.5 && (x + y) > size * 0.7 && (x + y) < size * 1.25;
      const leg = nx > 0.42 && nx < 0.62 && ny > 0.48 && ny < 0.8;
      const rightLeg = nx > 0.58 && nx < 0.72 && ny > 0.44 && ny < 0.68;

      if (stem || bowl || diagonal || leg || rightLeg) {
        if (cutout) {
          r = 15; g = 23; b = 42;
        } else {
          r = 245; g = 158; b = 11;
        }
      }

      if (nx > 0.32 && nx < 0.38 && ny > 0.22 && ny < 0.28) {
        r = 255; g = 255; b = 255;
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  const targetPath = path.join(outDir, `rabee-icon-${size}.png`);
  fs.writeFileSync(targetPath, PNG.sync.write(png));
  console.log(`Created ${targetPath}`);
}

for (const size of [192, 512]) {
  createIcon(size);
}
