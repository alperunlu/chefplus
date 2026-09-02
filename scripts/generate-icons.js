// One-off branded icon/splash generator — pure JS (pngjs), no native build step.
// Draws a simple on-brand "medallion with a plus notch" monogram: lime accent,
// dark slate ink, matching the app's design tokens. Not final illustrator
// artwork — a deliberate placeholder that's better than the default Expo icon.
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const LIME = { r: 0xd6, g: 0xff, b: 0x3f };
const INK = { r: 0x1b, g: 0x23, b: 0x20 };
const PAPER = { r: 0xf3, g: 0xf4, b: 0xef };

function setPixel(png, x, y, color, alpha = 255) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = color.r;
  png.data[idx + 1] = color.g;
  png.data[idx + 2] = color.b;
  png.data[idx + 3] = alpha;
}

function fill(png, color, alpha = 255) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) setPixel(png, x, y, color, alpha);
  }
}

/**
 * Draws the medallion mark: a filled circle in `mark` color with a plus-shaped
 * notch cut out in `cutout` color (or made transparent if cutout is null).
 */
function drawMonogram(png, { markColor, cutoutColor, radiusRatio = 0.34, barRatio = 0.11 }) {
  const cx = png.width / 2;
  const cy = png.height / 2;
  const R = png.width * radiusRatio;
  const bar = png.width * barRatio;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const inCircle = dx * dx + dy * dy <= R * R;
      if (!inCircle) continue;
      const inPlus = Math.abs(dx) <= bar / 2 || Math.abs(dy) <= bar / 2;
      if (inPlus) {
        if (cutoutColor) setPixel(png, x, y, cutoutColor, 255);
        else setPixel(png, x, y, markColor, 0); // transparent cutout
      } else {
        setPixel(png, x, y, markColor, 255);
      }
    }
  }
}

function write(png, outPath) {
  const buf = PNG.sync.write(png);
  fs.writeFileSync(outPath, buf);
  console.log('wrote', outPath);
}

const assetsDir = path.join(__dirname, '..', 'assets');

// 1. Main app icon — lime background, ink medallion (iOS applies its own mask).
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, LIME);
  drawMonogram(png, { markColor: INK, cutoutColor: LIME, radiusRatio: 0.34, barRatio: 0.1 });
  write(png, path.join(assetsDir, 'icon.png'));
}

// 2. Splash image — mark only, transparent, centered by the splash plugin
//    over the app's paper background (see app.json).
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, INK, 0); // fully transparent canvas
  drawMonogram(png, { markColor: INK, cutoutColor: null, radiusRatio: 0.32, barRatio: 0.1 });
  write(png, path.join(assetsDir, 'splash-icon.png'));
}

// 3. Android adaptive icon — background layer (solid lime, full bleed).
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, LIME);
  write(png, path.join(assetsDir, 'android-icon-background.png'));
}

// 4. Android adaptive icon — foreground layer (mark within the safe zone,
//    transparent elsewhere; Android masks/crops this layer itself).
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, INK, 0);
  drawMonogram(png, { markColor: INK, cutoutColor: LIME, radiusRatio: 0.24, barRatio: 0.075 });
  write(png, path.join(assetsDir, 'android-icon-foreground.png'));
}

// 5. Android monochrome icon (themed icons) — ink mark, transparent bg.
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, INK, 0);
  drawMonogram(png, { markColor: INK, cutoutColor: null, radiusRatio: 0.24, barRatio: 0.075 });
  write(png, path.join(assetsDir, 'android-icon-monochrome.png'));
}

// 6. Web favicon — small, so keep the mark simple and bold.
{
  const size = 96;
  const png = new PNG({ width: size, height: size });
  fill(png, LIME);
  drawMonogram(png, { markColor: INK, cutoutColor: LIME, radiusRatio: 0.36, barRatio: 0.12 });
  write(png, path.join(assetsDir, 'favicon.png'));
}

console.log('Done. This is a placeholder brand mark — commission real icon artwork before App Store submission.');
