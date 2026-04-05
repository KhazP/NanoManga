import fs from 'fs';
import path from 'path';

async function downloadImage() {
  try {
    const url = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop';
    console.log('Fetching image...');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'og-image.png'), buffer);
    console.log('Successfully downloaded and saved og-image.png');
  } catch (e) {
    console.error('Failed to download image:', e);
  }
}

downloadImage();
