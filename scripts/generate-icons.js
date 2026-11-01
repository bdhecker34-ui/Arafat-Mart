import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/assets/images/easy_mart_logo.svg');
const maskableSvgPath = path.resolve('public/assets/images/easy_mart_maskable_logo.svg');

const svgBuffer = fs.readFileSync(svgPath);
const maskableSvgBuffer = fs.readFileSync(maskableSvgPath);

async function generate() {
  console.log('Rendering 512x512 standard icon...');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/assets/images/easy_mart_logo.png');

  console.log('Rendering 192x192 standard icon...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/assets/images/easy_mart_logo_192.png');

  console.log('Rendering 180x180 Apple touch icon...');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/assets/images/apple_touch_icon.png');

  console.log('Rendering 512x512 maskable icon...');
  await sharp(maskableSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/assets/images/easy_mart_maskable_logo.png');

  console.log('Rendering 192x192 maskable icon...');
  await sharp(maskableSvgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/assets/images/easy_mart_maskable_logo_192.png');

  console.log('Rendering 64x64 favicon...');
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');

  console.log('All mobile app icons rendered successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
