import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

async function generate() {
  console.log('Fetching font...');
  const fontRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf');
  if (!fontRes.ok) throw new Error('Failed to fetch font');
  const fontData = await fontRes.arrayBuffer();

  console.log('Generating SVG with Satori...');
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#facc15',
          backgroundImage: 'linear-gradient(135deg, #facc15 50%, #fb7185 50%)',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Bangers',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                border: '12px solid black',
                boxShadow: '24px 24px 0px black',
                padding: '60px 100px',
                transform: 'rotate(-3deg)',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 120,
                      color: 'black',
                      textShadow: '6px 6px 0px #e5e7eb',
                      letterSpacing: '0.05em',
                      marginBottom: '20px',
                      display: 'flex'
                    },
                    children: 'NanoManga Pro'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 40,
                      color: 'white',
                      backgroundColor: 'black',
                      padding: '15px 40px',
                      transform: 'rotate(2deg)',
                      display: 'flex',
                      border: '4px solid black',
                    },
                    children: 'CREATE MANGA WITH AI'
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Bangers',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  console.log('Rendering PNG with Resvg...');
  const resvg = new Resvg(svg, {
    background: 'rgba(255, 255, 255, 1)',
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outPath = path.join(process.cwd(), 'public', 'og-image.png');
  fs.writeFileSync(outPath, pngBuffer);
  console.log('Successfully saved to', outPath);
}

generate().catch(console.error);
