import fs from 'fs';
import path from 'path';
import https from 'https';

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const url = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop';

https.get(url, (res) => {
  const file = fs.createWriteStream(path.join(publicDir, 'og-image.png'));
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded placeholder OG image');
  });
});
