import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    console.log('Generating image...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'A dynamic, high-quality anime manga style promotional banner for a web application called Nano Manga Pro. It features a split screen showing a blank manga page on one side and a fully illustrated, action-packed manga page on the other, with a glowing digital pen. Vibrant colors, cinematic lighting, professional.',
      config: {
        imageConfig: {
          aspectRatio: '16:9'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const buffer = Buffer.from(base64Data, 'base64');
        fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
        fs.writeFileSync(path.join(process.cwd(), 'public', 'og-image.png'), buffer);
        console.log('Successfully saved to public/og-image.png');
        break;
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

generate();
