import fs from 'fs';
import path from 'path';

// A tiny valid 1x1 transparent PNG base64
// We will use a slightly larger placeholder or just a valid PNG.
// Actually, let's fetch from placehold.co which guarantees a PNG.
async function downloadImage() {
  try {
    const url = 'https://placehold.co/1200x630/png?text=NanoManga+Pro';
    console.log('Fetching image from:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'og-image.png'), buffer);
    console.log('Successfully downloaded and saved og-image.png. Size:', buffer.length, 'bytes');
  } catch (e) {
    console.error('Failed to download image:', e);
  }
}

downloadImage();
