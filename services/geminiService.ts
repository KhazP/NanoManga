
import { GoogleGenAI } from "@google/genai";
import { MangaGenerationParams, GenerationResult } from "../types";

/**
 * Helper to convert base64 string to the format expected by Gemini (raw base64 without prefix)
 */
const cleanBase64 = (base64Data: string): string => {
  return base64Data.split(',')[1] || base64Data;
};

/**
 * Returns the specific prompt instructions for the selected layout
 */
const getLayoutInstruction = (layout: string): string => {
  switch (layout) {
    case 'two-page':
      return `LAYOUT MODE: DOUBLE PAGE SPREAD (2-PAGE MANGA SPREAD).
      - Structure: VISUALIZE AN OPEN BOOK. The image must represent TWO standard manga pages side-by-side.
      - Composition: You can either use a "Wide Scene" that spans across both pages, OR a "Split Sequence" with distinct panels on the Left Page and Right Page.
      - Aspect Ratio: WIDE (Landscape).`;
    case 'single-box':
      return `LAYOUT MODE: SINGLE ILLUSTRATION (PIN-UP / COVER ART).
      - Structure: ONE SINGLE, MASSIVE IMAGE.
      - NO PANELS. NO GUTTERS.
      - This is NOT a comic page. It is a full-canvas dramatic illustration.
      - Composition: Highly detailed, cinematic composition filling the entire frame.`;
    case 'single-page':
    default:
      return `LAYOUT MODE: STANDARD MANGA PAGE.
      - Structure: TRADITIONAL MULTI-PANEL LAYOUT (5 to 7 Panels).
      - Composition:
        1. Top: Wide establishing shot.
        2. Middle: 2-3 smaller action/reaction panels.
        3. Bottom: Large impact panel or conclusion.
      - Gutters: Clean white spaces separating all panels.`;
  }
};

/**
 * Generates a manga page or edits an image using the selected Gemini model
 */
export const generateMangaPage = async (params: MangaGenerationParams): Promise<GenerationResult> => {
  try {
    // Initialize the Gemini client.
    // Priority: 1. Manual Key (passed in params), 2. Env Key (AI Studio injection)
    const apiKey = params.apiKey || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key is missing. Please select or enter a valid API Key.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [];

    // 1. Add the User Images (The Subjects / Sources)
    const numImages = params.userImages?.length || 0;
    if (params.userImages && params.userImages.length > 0) {
      params.userImages.forEach((img) => {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg', // Assuming JPEG/PNG from input
            data: cleanBase64(img),
          },
        });
      });
    }

    // 2. Add Reference Image if provided (Style reference)
    if (params.referenceImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64(params.referenceImage),
        },
      });
    }

    // 3. Add Previous Page Image (Consistency Context)
    // We add this last so we can refer to it easily in the prompt as "The last image" or specific context
    if (params.previousPageImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64(params.previousPageImage),
        },
      });
    }

    // 4. Construct the text prompt based on mode
    let prompt = '';

    if (params.mode === 'edit') {
      if (!params.editPrompt) {
        throw new Error("Please provide instructions for the image edit.");
      }
      
      prompt = `Act as a professional manga editor and artist.
      
      User Request: "${params.editPrompt}"
      
      Instructions:
      - The initial images provided are the SOURCE(S).
      ${params.referenceImage ? '- The image following the sources is a STYLE REFERENCE.' : ''}
      - Modify the source image(s) according to the user request.
      - Maintain the manga aesthetic (ink lines, screentones).
      `;
    } else {
      // Default: Manga Mode
      const layoutPrompt = getLayoutInstruction(params.layoutType || 'single-page');
      
      // Construct Character Specific Prompts
      let characterPrompts = '';
      if (params.userImages && params.userImages.length > 0) {
        params.userImages.forEach((_, idx) => {
            const details = params.characterDetails?.[idx];
            const charNum = idx + 1;
            characterPrompts += `\n   - CHARACTER ${charNum} (Source Image ${charNum}): `;
            
            const hasDesc = details?.description && details.description.trim().length > 0;
            const hasDial = details?.dialogue && details.dialogue.trim().length > 0;
            
            if (hasDesc || hasDial) {
                if (hasDesc) characterPrompts += `ACTION/CONTEXT: ${details!.description}. `;
                if (hasDial) characterPrompts += `DIALOGUE: Says "${details!.dialogue}". `;
            } else {
                characterPrompts += `Interact naturally in the scene.`;
            }
        });
      }

      // Dynamic Subject Prompt based on image count
      let subjectInstruction = "";
      if (numImages > 1) {
        subjectInstruction = `CRITICAL SUBJECT INSTRUCTION:
        - There are ${numImages} distinct source images provided.
        - These represent ${numImages} DIFFERENT CHARACTERS.
        - You MUST include ALL ${numImages} characters in the final composition.
        ${characterPrompts}
        - Do NOT blend them into a single person.
        - Maintain the unique facial features and hairstyles of EACH source character.
        - INTERACTION: Depict them interacting in the scene.`;
      } else {
        subjectInstruction = `CRITICAL SUBJECT INSTRUCTION:
        - The source image defines the MAIN CHARACTER.
        - Maintain their facial features, hair, and likeness strictly.
        ${characterPrompts}
        - Render them in the requested manga style.`;
      }

      // Consistency Instruction
      let consistencyInstruction = "";
      if (params.previousPageImage) {
        consistencyInstruction = `
        CONTINUITY & CONSISTENCY MODE ACTIVE:
        - The FINAL image provided in the input list is the PREVIOUS PAGE of this manga.
        - USE IT AS A GROUND TRUTH REFERENCE.
        - STRICTLY MATCH the character designs (clothing, hair, accessories) seen in that previous page.
        - STRICTLY MATCH the art style (line weight, shading, screentone density) of that previous page.
        - IGNORE the layout/composition of the previous page (create a NEW layout based on the 'Layout Mode').
        `;
      }

      prompt = `You are a professional manga artist (Mangaka). Create a high-fidelity manga page.
      
      ${layoutPrompt}
      
      ${subjectInstruction}
      
      ${consistencyInstruction}
      
      ARTISTIC STYLE: ${params.styleName || 'Seinen Manga (High Detail)'}.
      - Medium: Traditional Ink and Screen Tones.
      - Line Work: G-Pen / Maru-Pen style (variable line weight).
      - Shading: Ben-Day dots (screentones) and heavy blacks.
      - Aesthetics: High contrast, professional publication quality.
      
      ${params.referenceImage ? 'STYLE REFERENCE: An explicit Art Style Reference image was provided. Mimic its line weight and shading technique exactly.' : ''}
      ${params.dialogue ? `ADDITIONAL SCENE DIALOGUE/CAPTION: "${params.dialogue}".` : ''}
      
      Generate the image now.
      `;
    }

    parts.push({ text: prompt });

    // 5. Configure based on model
    const modelName = params.model;
    let config: any = {};

    // Only Pro model supports detailed imageConfig (like size) and tools (like search)
    // Flash Image (Nano Banana) is more limited
    if (modelName === 'gemini-3-pro-image-preview') {
      
      // Determine Aspect Ratio based on Layout Type
      let aspectRatio = "3:4"; // Default Portrait (Standard Page / Single Box)
      
      if (params.layoutType === 'two-page') {
        aspectRatio = "4:3"; // Wide for Spreads
      } else if (params.layoutType === 'single-box') {
        aspectRatio = "3:4"; // Pin-ups are usually portrait
      }

      config = {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      };
    }

    // 6. Call the model
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config
    });

    // 7. Parse the response
    let generatedImageUrl: string | undefined;
    let generatedText: string | undefined;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          generatedText = part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("No image was generated. The model might have refused the request due to safety guidelines.");
    }

    return {
      imageUrl: generatedImageUrl,
      text: generatedText
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Enhanced Error Handling
    let errorMessage = "An unexpected error occurred. Please try again.";
    const message = (error.message || "").toLowerCase();
    const errorStr = error.toString().toLowerCase();

    if (message.includes('400') || errorStr.includes('400')) {
      errorMessage = "Bad Request: The image might be too large or in an unsupported format.";
    } else if (message.includes('401') || errorStr.includes('401')) {
      errorMessage = "Authorization Error: Invalid API Key.";
    } else if (message.includes('403') || errorStr.includes('403')) {
      errorMessage = "Permission Denied: Your API key doesn't have access to this model.";
    } else if (message.includes('429') || errorStr.includes('429')) {
      errorMessage = "Quota Exceeded: You're generating too fast. Take a breather.";
    } else if (message.includes('500') || errorStr.includes('500')) {
      errorMessage = "Server Error: The Gemini service is temporarily unavailable.";
    } else if (message.includes('safety') || message.includes('blocked')) {
      errorMessage = "Safety Block: The request was flagged by safety filters.";
    } else if (message.includes('key')) {
       errorMessage = "API Key Error: " + message;
    }

    throw new Error(errorMessage);
  }
};
