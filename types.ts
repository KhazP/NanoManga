
export interface CharacterDetail {
  description: string;
  dialogue: string;
}

export interface MangaGenerationParams {
  mode: 'manga' | 'edit';
  model: string; // 'gemini-3-pro-image-preview' | 'gemini-2.5-flash-image'
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
