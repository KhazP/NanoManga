
export interface CharacterDetail {
  description: string;
  dialogue: string;
}

export interface FullMangaCharacter {
  name: string;
  image: string; // Base64
  traits: string;
}

export interface FullMangaPageConfig {
  action: string;
  layout: 'Auto' | 'Splash' | 'Grid' | 'Dynamic';
  colorOverride: 'Auto' | 'B&W' | 'Color';
  speechBubbles: 'Auto' | 'Empty' | 'With Text' | 'None' | 'One Text Bubble';
  consistency: 'Continue' | 'Same Scene' | 'New Scene';
}

export interface FullMangaParams {
  storyIntro: string;
  storyBody: string;
  storyConclusion: string;
  characters: FullMangaCharacter[];
  
  // Continuity / World
  setting: string;
  tone: string;
  colorScheme: 'B&W' | 'Color';
  artType: string;
  
  // Pages
  pages: FullMangaPageConfig[];
  
  // Settings
  resolution: '1K' | '2K' | '4K';
  pageCount: number;
}

export interface MangaGenerationParams {
  mode: 'manga' | 'edit';
  model: string; // 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview'
  userImages: string[]; // Array of Base64 strings
  characterDetails?: CharacterDetail[];
  referenceImage?: string; // Base64
  
  // Manual API Key (for non-AI Studio environments)
  apiKey?: string;

  // Manga Mode Specifics
  styleName?: string;
  dialogue?: string;
  layoutType?: 'single-page' | 'single-box' | 'two-page';
  
  // Edit Mode Specifics
  editPrompt?: string;
  
  // Consistency
  previousPageImage?: string; // Base64 of the last generated page for consistency
}

export interface FullMangaBook {
  id: string;
  title: string;
  pages: string[];
  timestamp: number;
}

export interface GenerationResult {
  imageUrl?: string;
  text?: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
