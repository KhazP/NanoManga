
import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Header } from './components/Header';
import { generateMangaPage } from './services/geminiService';
import { GenerationStatus, CharacterDetail } from './types';
import { 
  Download, RefreshCw, Wand2, PenTool,
  Layout as LayoutIcon, Key,
  Zap, Gem, ChevronLeft, ArrowRight,
  Settings2, X, AlertTriangle, MessageSquare, User,
  ChevronDown, BookOpen, History as HistoryIcon, ArrowLeft,
  Link
} from 'lucide-react';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  
  interface Window {
    aistudio?: AIStudio;
  }
}

const ANIME_STYLES = [
  { label: "Shonen Jump (Modern Action)", value: "Modern Shonen Jump Style. Sharp, angular jawlines; spiky hair; bold thick outlines; high-contrast shading. Action-oriented." },
  { label: "90s Retro / Cel Aesthetic", value: "90s Vintage Anime Style. Muted colors, film grain, hard shadows, realistic proportions, hand-painted cel animation look." },
  { label: "Studio Ghibli (Miyazaki)", value: "Studio Ghibli Style. Soft painterly backgrounds, round natural facial features, fluid movement, nostalgic atmosphere." },
  { label: "Moe / KyoAni (Kyoto Animation)", value: "Kyoto Animation Style. Highly polished, glossy look. Large detailed eyes, soft lighting, bloom effects, cute and emotional." },
  { label: "Studio Trigger (Pop Art)", value: "Studio Trigger Style. Neon and pastel palette, thick jagged lines, flat shading, geometric shapes, exaggerated perspective." },
  { label: "Classic Shojo (Romance)", value: "Classic Shojo Style. Very large vertical sparkly eyes, slender elongated limbs, flowery abstract backgrounds, pastel colors." },
  { label: "Makoto Shinkai (Scenery)", value: "Makoto Shinkai Style. Hyper-realistic backgrounds, intense lighting effects (lens flares), high saturation, cinematic fidelity." },
  { label: "JoJo Style (Araki)", value: "JoJo's Bizarre Adventure Style. Heavy black shading, hatching lines, sculpted muscular anatomy, dramatic high-fashion poses, bold color shifts." },
  { label: "Digital Composite (Ufotable)", value: "Ufotable Digital Style. High-fidelity textures, cinematic lighting, heavy use of particle effects, 2D/3D blending." },
  { label: "Chibi (Super Deformed)", value: "Chibi Style. Super deformed characters, 2-3 heads tall, giant heads, simplified limbs, exaggerated expressions." },
];

const WESTERN_STYLES = [
  { label: "Classic Superhero (Silver Age)", value: "Silver Age Comic Style. Clean simple lines, bright flat primary colors, heroic barrel-chested anatomy, stiff noble posing, Ben-Day dots." },
  { label: "Kirby Style (Cosmic)", value: "Jack Kirby Style. Kirby Krackle energy dots, square fingers, blocky muscles, extreme foreshortening, complex machinery, dynamic explosive action." },
  { label: "Image Comics (90s Extreme)", value: "90s Image Comics Style. Excessive cross-hatching, exaggerated muscular anatomy, grit-teeth expressions, glowing eyes, pouches and straps, jagged panels." },
  { label: "Noir / High-Contrast (Frank Miller)", value: "Sin City Noir Style. Heavy black ink, high contrast black and white, no mid-tones, negative space, gritty textures, angular blocky shapes." },
  { label: "Ligne Claire (Tintin)", value: "Ligne Claire Style. Strong continuous black outlines of uniform width, flat vivid colors, no shading, realistic backgrounds, clear readability." },
  { label: "Vertigo / Painted (Realistic)", value: "Vertigo Comics Painted Style. Fully painted artwork, realistic lighting and texture, dreamlike surreal imagery, soft edges, watercolor or acrylic look." },
  { label: "Animated Style (Bruce Timm)", value: "Bruce Timm Animated Style. Extremely simplified angular shapes, broad shoulders, thin legs, minimal detail, heavy silhouette, retro-modern aesthetic." },
  { label: "Underground Comix (Crumb)", value: "Underground Comix Style. Noodle limbs, excessive wrinkles and grit, grotesque exaggerated features, dense cluttered panels, wobbly hand-drawn lines." },
  { label: "Modern House Style (Cinematic)", value: "Modern Superhero Comic Style. Widescreen cinematic layout, realistic proportional anatomy, complex digital coloring with gradients and lens flares, thin precise lines." },
  { label: "Indie / Graphic Memoir", value: "Indie Graphic Novel Style. Sketchy loose ink wash, simple iconic avatars, handwritten aesthetic, minimalist backgrounds, emotional focus." },
];

// -- Manga Reader Component --
const MangaReader = ({ 
  pages, 
  currentPage, 
  onPageChange 
}: { 
  pages: string[], 
  currentPage: number, 
  onPageChange: (idx: number) => void 
}) => {
  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50">
        <BookOpen className="w-16 h-16 mb-4" />
        <p className="font-comic text-xl">NO PAGES YET</p>
      </div>
    );
  }

  const hasNext = currentPage < pages.length - 1;
  const hasPrev = currentPage > 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 md:p-8 relative">
      
      {/* Reader Container */}
      <div className="relative w-full max-w-5xl aspect-[3/2] bg-white border-[3px] border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex overflow-hidden">
        
        {/* Page Indicator */}
        <div className="absolute top-4 right-4 z-20 bg-black text-white font-mono text-xs px-2 py-1 font-bold">
           PAGE {currentPage + 1} / {pages.length}
        </div>

        {/* Navigation Controls (Left/Right Areas) */}
        {hasPrev && (
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            className="absolute left-0 top-0 bottom-0 w-16 z-10 hover:bg-black/10 flex items-center justify-center group transition-colors"
          >
             <div className="bg-white border-2 border-black p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-4 transition-all shadow-comic">
               <ArrowLeft className="w-6 h-6" />
             </div>
          </button>
        )}
        
        {hasNext && (
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            className="absolute right-0 top-0 bottom-0 w-16 z-10 hover:bg-black/10 flex items-center justify-center group transition-colors"
          >
             <div className="bg-white border-2 border-black p-2 rounded-full opacity-0 group-hover:opacity-100 transform -translate-x-4 transition-all shadow-comic">
               <ArrowRight className="w-6 h-6" />
             </div>
          </button>
        )}

        {/* The Page(s) */}
        {/* Note: Simple single page view for now to accommodate varying aspect ratios */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-5 pointer-events-none"></div>
            <img 
              src={pages[currentPage]} 
              className="max-w-full max-h-full object-contain shadow-md border border-gray-200 bg-white"
              alt={`Page ${currentPage + 1}`} 
            />
            
            {/* Spine effect */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
      
      <div className="mt-6 flex gap-4">
         <p className="font-comic text-gray-500">READING MODE</p>
      </div>
    </div>
  );
};

function App() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [manualApiKey, setManualApiKey] = useState<string>('');
  const [isCheckingKey, setIsCheckingKey] = useState(false);

  const [mode, setMode] = useState<'manga' | 'history'>('manga');
  
  // Image and Character State
  const [userImages, setUserImages] = useState<string[]>([]);
  const [characterDetails, setCharacterDetails] = useState<CharacterDetail[]>([]);
  
  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [readerPageIndex, setReaderPageIndex] = useState(0);
  
  // UI State for Character Editor
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  
  const [refImage, setRefImage] = useState<string | null>(null);
  const [styleCategory, setStyleCategory] = useState<'anime' | 'western'>('anime');
  const [styleName, setStyleName] = useState('');
  const [dialogue, setDialogue] = useState('');
  const [consistencyMode, setConsistencyMode] = useState(false);
  
  const [layoutType, setLayoutType] = useState<'single-page' | 'single-box' | 'two-page'>('single-page');
  
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionCost, setSessionCost] = useState(0);
  const PRO_IMAGE_COST = 0.134;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const maxUserImages = selectedModel === 'gemini-3-pro-image-preview' ? 14 : 3;

  const currentPresetStyles = styleCategory === 'anime' ? ANIME_STYLES : WESTERN_STYLES;

  useEffect(() => {
    if (selectedModel === 'gemini-2.5-flash-image' && userImages.length > 3) {
      const sliced = userImages.slice(0, 3);
      setUserImages(sliced);
      setCharacterDetails(prev => prev.slice(0, 3));
    }
    
    // Check API key for ANY selected model
    if (selectedModel) {
      checkApiKey();
    }
  }, [selectedModel]);

  const checkApiKey = async () => {
    setIsCheckingKey(true);
    try {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // In non-AI Studio environments, check if we have a manual key
        if (manualApiKey.length > 10) {
          setHasApiKey(true);
        }
      }
    } catch (e) {
      console.error("Error checking API key status", e);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } else {
        // If manual key is valid, we just set state
        if (manualApiKey.length > 10) {
           setHasApiKey(true);
        } else {
          alert("Please enter a valid Gemini API Key.");
        }
      }
    } catch (e) {
      console.error("Error selecting key", e);
    }
  };
  
  const handleManualKeySubmit = () => {
    if (manualApiKey && manualApiKey.startsWith('AIza')) {
      setHasApiKey(true);
    } else {
      alert("Please enter a valid Gemini API Key (starts with AIza)");
    }
  };

  const handleExit = () => {
    setSelectedModel(null);
    setHasApiKey(false);
    setResultImage(null);
    setUserImages([]);
    setHistory([]);
    setSessionCost(0);
    setCharacterDetails([]);
    setConsistencyMode(false);
    setManualApiKey('');
  };

  const handleImagesChange = (newImages: string[]) => {
    setUserImages(newImages);
    
    // If new images added, pad the details array
    if (newImages.length > characterDetails.length) {
       const diff = newImages.length - characterDetails.length;
       const emptyDetails = Array(diff).fill({ description: '', dialogue: '' });
       setCharacterDetails(prev => [...prev, ...emptyDetails]);
    }
  };

  const handleImageRemove = (index: number) => {
    setCharacterDetails(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const updateCharacterDetail = (index: number, field: keyof CharacterDetail, value: string) => {
    setCharacterDetails(prev => {
      const next = [...prev];
      if (!next[index]) next[index] = { description: '', dialogue: '' };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleGenerate = async () => {
    // Force API key selection for any model if not already selected
    if (selectedModel && !hasApiKey) {
      if (window.aistudio) handleSelectKey();
      return;
    }

    if (userImages.length === 0) {
      setErrorMsg("Missing source images!");
      return;
    }

    setIsMobileMenuOpen(false);
    setStatus(GenerationStatus.GENERATING);
    setErrorMsg(null);
    setResultImage(null);

    // Determine previous page image for consistency
    let previousPageImage: string | undefined = undefined;
    if (consistencyMode && history.length > 0) {
      previousPageImage = history[history.length - 1];
    }

    try {
      const result = await generateMangaPage({
        mode: 'manga', 
        model: selectedModel!,
        userImages,
        characterDetails,
        referenceImage: refImage || undefined,
        styleName: styleName || "Manga",
        dialogue: dialogue || undefined,
        layoutType,
        previousPageImage,
        apiKey: manualApiKey || undefined, // Pass manual key if present
      });

      if (result.imageUrl) {
        setResultImage(result.imageUrl);
        setHistory(prev => [...prev, result.imageUrl!]);
        setReaderPageIndex(history.length); // Set to the new page index (current length is index of next item)
        setStatus(GenerationStatus.SUCCESS);
        if (selectedModel === 'gemini-3-pro-image-preview') {
          setSessionCost(prev => prev + PRO_IMAGE_COST);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Generation failed.");
      setStatus(GenerationStatus.ERROR);
      setIsMobileMenuOpen(true);
      if (err.message.includes("API Key") && selectedModel) {
        setHasApiKey(false);
      }
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `nano-manga-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // -- Render 1: Model Selector --
  if (!selectedModel) {
    return (
      <div className="h-screen w-full bg-white flex flex-col md:flex-row relative overflow-hidden">
        {/* Left: Flash Model */}
        <button 
          onClick={() => setSelectedModel('gemini-2.5-flash-image')}
          className="relative flex-1 h-1/2 md:h-full group overflow-hidden hover:flex-[1.3] transition-all duration-500 border-b-4 md:border-b-0 md:border-r-4 border-black bg-white"
        >
          <div className="absolute inset-0 bg-dots opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 bg-yellow-300/10 group-hover:bg-yellow-300/40 transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
            <div className="bg-black text-white p-4 rounded-full mb-6 group-hover:scale-110 transition-transform border-4 border-white shadow-comic">
               <Zap className="w-12 h-12" />
            </div>
            <h2 className="text-6xl md:text-8xl font-comic text-black uppercase transform -rotate-3" style={{ textShadow: '4px 4px 0 #fff, 8px 8px 0 #000' }}>
              Flash
            </h2>
            <div className="mt-8 bg-white border-2 border-black p-4 shadow-comic transform rotate-2 max-w-xs">
              <p className="font-comic text-xl text-black mb-2">THE SPEEDSTER!</p>
              <ul className="text-sm font-bold space-y-1 font-mono">
                <li>• Fast Generation</li>
                <li>• Free Tier Avail.</li>
                <li>• 3 Image Limit</li>
              </ul>
            </div>
          </div>
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-red-600 text-white font-comic text-6xl px-6 py-4 border-4 border-black shadow-[8px_8px_0_#000] transform rotate-12">
            VS
          </div>
        </div>

        {/* Right: Pro Model */}
        <button 
          onClick={() => setSelectedModel('gemini-3-pro-image-preview')}
          className="relative flex-1 h-1/2 md:h-full group overflow-hidden hover:flex-[1.3] transition-all duration-500 bg-white"
        >
          <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity" 
               style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
          <div className="absolute inset-0 bg-pink-300/10 group-hover:bg-pink-300/40 transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
            <div className="bg-black text-white p-4 rounded-full mb-6 group-hover:scale-110 transition-transform border-4 border-white shadow-comic">
               <Gem className="w-12 h-12" />
            </div>
            <h2 className="text-6xl md:text-8xl font-comic text-black uppercase transform rotate-3" style={{ textShadow: '4px 4px 0 #fff, 8px 8px 0 #000' }}>
              Pro
            </h2>
            <div className="mt-8 bg-white border-2 border-black p-4 shadow-comic transform -rotate-2 max-w-xs">
              <p className="font-comic text-xl text-black mb-2">THE ARTIST!</p>
              <ul className="text-sm font-bold space-y-1 font-mono">
                <li>• Max Quality</li>
                <li>• Paid API Key</li>
                <li>• 14 Image Limit</li>
              </ul>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // -- Render 2: API Key Auth --
  if (selectedModel && !isCheckingKey && !hasApiKey) {
    const isPro = selectedModel === 'gemini-3-pro-image-preview';
    const isAIStudio = !!window.aistudio;

    return (
      <div className="min-h-screen flex items-center justify-center bg-dots p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[12px_12px_0_#000] p-8 relative">
          <button 
            onClick={() => setSelectedModel(null)}
            className="absolute -top-4 -left-4 bg-white border-2 border-black p-2 shadow-comic hover:translate-y-1 transition-transform flex items-center gap-1 text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>

          <div className="text-center mb-8">
             <h2 className="text-5xl font-comic text-black mb-2 transform -rotate-2">API SETUP</h2>
             <p className="font-bold text-gray-600 max-w-xs mx-auto">
               {isPro ? 'High-quality generation requires your API Key.' : 'Please enter your Gemini API Key to continue.'}
             </p>
          </div>
          
          <div className="bg-gray-100 border-2 border-black p-4 mb-8 font-mono text-sm relative">
             <div className="absolute -top-3 left-4 bg-black text-white px-2 text-xs font-bold">COST INFO</div>
             <div className="flex justify-between items-center font-bold">
                <span>PER IMAGE:</span>
                <span className="text-red-500">
                  {isPro ? `$${PRO_IMAGE_COST}` : 'FREE TIER AVAIL.'}
                </span>
             </div>
          </div>
          
          {isAIStudio ? (
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-comic text-2xl border-2 border-black shadow-comic hover:shadow-comic-hover active:shadow-comic-active transition-all"
            >
              SELECT API KEY
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={manualApiKey}
                  onChange={(e) => setManualApiKey(e.target.value)}
                  placeholder="Enter Gemini API Key (AIza...)"
                  className="w-full pl-10 pr-3 py-3 border-2 border-black font-mono focus:shadow-[4px_4px_0_#000] outline-none transition-all"
                />
              </div>
              
              <button 
                onClick={handleManualKeySubmit}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-comic text-2xl border-2 border-black shadow-comic hover:shadow-comic-hover active:shadow-comic-active transition-all"
              >
                START SESSION
              </button>
              
              <div className="text-center mt-4">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                    GET A FREE API KEY HERE &rarr;
                 </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -- Render 3: Main Editor --
  const isGenerating = status === GenerationStatus.GENERATING;
  const isPro = selectedModel === 'gemini-3-pro-image-preview';
  const accentColor = isPro ? 'bg-pink-400' : 'bg-yellow-400';
  const accentHover = isPro ? 'hover:bg-pink-300' : 'hover:bg-yellow-300';

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden text-black font-sans">
      <Header 
        modelName={selectedModel} 
        sessionCost={isPro ? sessionCost : undefined} 
        onModelClick={handleExit}
      />

      <main className="relative flex-1 flex overflow-hidden">
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar (Tools Panel) */}
        <aside 
          className={`
            fixed inset-x-0 bottom-0 z-40 
            bg-white border-t-4 border-black
            transition-transform duration-300
            h-[85vh] flex flex-col
            md:relative md:inset-auto md:transform-none md:w-[420px] md:h-full md:border-t-0 md:border-r-4
            ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          `}
        >
          <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsMobileMenuOpen(false)}>
             <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="p-6 border-b-4 border-black bg-white relative">
             <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none"></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
               <h2 className="font-comic text-2xl text-black transform -rotate-1">STUDIO TOOLS</h2>
               <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden">
                 <X className="w-6 h-6" />
               </button>
             </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 relative z-10">
              <button
                onClick={() => setMode('manga')}
                disabled={isGenerating}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-comic text-xl border-2 border-black shadow-comic transition-all
                  ${mode === 'manga' 
                    ? `${accentColor} text-black` 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <PenTool className="w-5 h-5" /> MANGA
              </button>
              <button
                onClick={() => {
                  setMode('history');
                  // Auto-select last page when entering history
                  if (history.length > 0) setReaderPageIndex(history.length - 1);
                }}
                disabled={isGenerating}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-comic text-xl border-2 border-black shadow-comic transition-all
                  ${mode === 'history' 
                    ? `${accentColor} text-black` 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <BookOpen className="w-5 h-5" /> HISTORY
              </button>
            </div>
          </div>

          {/* Tools Scroll Area */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white transition-opacity ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {mode === 'manga' ? (
              <>
                <section className="space-y-6">
                  <div className="relative">
                    <ImageUploader 
                      label="Characters" 
                      subLabel={`${userImages.length}/${maxUserImages}`}
                      images={userImages}
                      onImagesChange={handleImagesChange}
                      onImageRemove={handleImageRemove}
                      onImageClick={(idx) => setEditingCharIndex(idx)}
                      getOverlay={(idx) => {
                        const details = characterDetails[idx];
                        if (details && (details.dialogue || details.description)) {
                          return (
                            <div className="absolute top-1 left-1 bg-blue-500 border border-black text-white p-0.5 shadow-sm z-10 rounded-sm">
                               <MessageSquare className="w-3 h-3" />
                            </div>
                          );
                        }
                        return null;
                      }}
                      multiple={true}
                      maxImages={maxUserImages}
                    />
                    {userImages.length > 0 && (
                      <div className="text-[10px] font-bold text-blue-600 mt-1 flex items-center gap-1 animate-pulse">
                        <User className="w-3 h-3" /> Tap a character to add dialogue!
                      </div>
                    )}
                  </div>
                  
                  <ImageUploader 
                    label="Style Ref" 
                    subLabel="OPTIONAL"
                    image={refImage} 
                    onImageChange={setRefImage}
                    compact
                    multiple={false}
                  />
                </section>

                <section className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-6">
                    {/* Style Input */}
                    <div>
                      <label className="text-xs font-black text-black uppercase mb-2 block bg-white inline-block px-1 border border-black shadow-[2px_2px_0_#000]">
                        Art Style
                      </label>
                      
                      {/* Style Category Toggle */}
                      <div className="flex gap-2 mb-3">
                        <button 
                           onClick={() => setStyleCategory('western')}
                           className={`flex-1 py-1.5 text-xs font-bold border-2 border-black transition-all uppercase ${styleCategory === 'western' ? 'bg-black text-white shadow-comic-sm' : 'bg-white hover:bg-gray-100'}`}
                        >
                          Western
                        </button>
                        <button 
                           onClick={() => setStyleCategory('anime')}
                           className={`flex-1 py-1.5 text-xs font-bold border-2 border-black transition-all uppercase ${styleCategory === 'anime' ? 'bg-black text-white shadow-comic-sm' : 'bg-white hover:bg-gray-100'}`}
                        >
                          Anime
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            value={currentPresetStyles.some(s => s.value === styleName) ? styleName : ""}
                            onChange={(e) => setStyleName(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-gray-50 border-2 border-black font-mono text-xs font-bold cursor-pointer hover:bg-gray-100 appearance-none transition-colors"
                          >
                            <option value="" disabled>✨ {styleCategory === 'anime' ? 'ANIME' : 'WESTERN'} PRESETS...</option>
                            {currentPresetStyles.map((s, i) => (
                              <option key={i} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-black pointer-events-none" />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. Custom Style..."
                            value={styleName}
                            onChange={(e) => setStyleName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0_#000] transition-all outline-none font-mono text-sm"
                          />
                          <Wand2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Layout Type */}
                    <div>
                      <label className="text-xs font-black text-black uppercase mb-1 block bg-white inline-block px-1 border border-black shadow-[2px_2px_0_#000]">
                        Panel Layout
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLayoutType('single-page')}
                          className={`
                            flex-1 py-2 border-2 border-black text-[10px] font-bold uppercase transition-all
                            ${layoutType === 'single-page' 
                              ? 'bg-black text-white shadow-[2px_2px_0_#aaa]' 
                              : 'bg-white text-black hover:bg-gray-100'
                            }
                          `}
                        >
                          Single Page
                        </button>
                        <button
                          onClick={() => setLayoutType('single-box')}
                          className={`
                            flex-1 py-2 border-2 border-black text-[10px] font-bold uppercase transition-all
                            ${layoutType === 'single-box' 
                              ? 'bg-black text-white shadow-[2px_2px_0_#aaa]' 
                              : 'bg-white text-black hover:bg-gray-100'
                            }
                          `}
                        >
                          Single Box
                        </button>
                        <button
                          onClick={() => setLayoutType('two-page')}
                          className={`
                            flex-1 py-2 border-2 border-black text-[10px] font-bold uppercase transition-all
                            ${layoutType === 'two-page' 
                              ? 'bg-black text-white shadow-[2px_2px_0_#aaa]' 
                              : 'bg-white text-black hover:bg-gray-100'
                            }
                          `}
                        >
                          Two Page
                        </button>
                      </div>
                    </div>

                    {/* Dialogue */}
                    <div>
                      <label className="text-xs font-black text-black uppercase mb-1 block bg-white inline-block px-1 border border-black shadow-[2px_2px_0_#000]">
                        Narrator / Caption
                      </label>
                      <textarea
                        rows={3}
                        placeholder="General scene text..."
                        value={dialogue}
                        onChange={(e) => setDialogue(e.target.value)}
                        className="w-full p-3 bg-white border-2 border-black focus:shadow-[4px_4px_0_#000] transition-all outline-none resize-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* History Mode Sidebar Content */
              <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-comic text-xl uppercase">Chapters ({history.length})</h3>
                 </div>
                 
                 {history.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 font-mono text-xs">
                       No pages generated yet.
                    </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                      {history.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setReaderPageIndex(idx)}
                          className={`
                            relative aspect-[3/4] border-2 cursor-pointer group overflow-hidden transition-all
                            ${readerPageIndex === idx 
                              ? 'border-black shadow-comic scale-[1.02]' 
                              : 'border-gray-200 hover:border-black'
                            }
                          `}
                        >
                           <img src={img} className="w-full h-full object-cover" alt={`Page ${idx+1}`} />
                           <div className="absolute bottom-0 left-0 bg-black text-white text-[10px] px-1 font-bold">
                              PG {idx + 1}
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </section>
            )}
          </div>

          {/* Action Button - Only show in Manga Mode */}
          {mode === 'manga' && (
            <div className="p-6 border-t-4 border-black bg-white relative z-20">
              
              {/* Consistency Toggle */}
              <div className="mb-3 flex items-center justify-between bg-gray-100 border border-black p-2 rounded-sm">
                 <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-black" />
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-bold uppercase">Consistency Mode</span>
                      <span className="text-[10px] text-gray-500">Use prev. page as reference</span>
                    </div>
                 </div>
                 <button 
                    onClick={() => setConsistencyMode(!consistencyMode)}
                    disabled={history.length === 0}
                    className={`
                       w-12 h-6 rounded-full border-2 border-black relative transition-colors
                       ${consistencyMode ? 'bg-green-400' : 'bg-gray-300'}
                       ${history.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                 >
                    <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white border border-black rounded-full transition-all ${consistencyMode ? 'left-[22px]' : 'left-1'}`}></div>
                 </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4" /> {errorMsg}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={userImages.length === 0 || isGenerating}
                className={`
                  w-full py-4 font-comic text-3xl uppercase border-2 border-black shadow-comic-lg transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none
                  ${userImages.length === 0 || isGenerating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-400 shadow-none' 
                    : `${accentColor} ${accentHover} text-black`
                  }
                `}
              >
                {isGenerating ? 'INKING...' : 'GENERATE!'}
              </button>
            </div>
          )}
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 bg-gray-200 relative flex flex-col overflow-hidden">
           <div className="absolute inset-0 bg-dots-sm opacity-30 pointer-events-none" />
          
          {!isMobileMenuOpen && !isGenerating && (
             <div className="md:hidden absolute bottom-6 right-6 z-30 animate-pop">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={`p-4 ${accentColor} border-2 border-black rounded-full shadow-comic`}
                >
                   <Settings2 className="w-6 h-6 text-black" />
                </button>
             </div>
          )}

          {/* Output Stage */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative">
            <LoadingOverlay isVisible={isGenerating} />

            {mode === 'history' ? (
               <MangaReader 
                 pages={history} 
                 currentPage={readerPageIndex} 
                 onPageChange={setReaderPageIndex} 
               />
            ) : (
              resultImage ? (
                <div className="relative max-w-full max-h-full animate-pop group">
                  <div className="bg-white p-2 border-4 border-black shadow-[10px_10px_0_rgba(0,0,0,0.2)] relative">
                    <img 
                      src={resultImage} 
                      alt="Manga Page" 
                      className="max-w-full max-h-[calc(100vh-12rem)] object-contain border border-black"
                    />
                    
                    <div className="absolute -bottom-6 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <button 
                        onClick={() => setResultImage(null)}
                        className="p-2 bg-white border-2 border-black hover:bg-gray-100 shadow-comic-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 shadow-comic-sm font-comic tracking-wide"
                      >
                        <Download className="w-4 h-4" /> SAVE
                      </button>
                    </div>
                  </div>

                  <div className="absolute -top-6 -left-6 bg-white border-2 border-black px-4 py-2 rounded-[50%] shadow-comic transform -rotate-6 hidden md:block">
                     <span className="font-comic text-xl">WOW!</span>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-md opacity-60 transform rotate-1">
                   <div className="w-32 h-32 bg-white border-4 border-black rounded-full mx-auto mb-6 flex items-center justify-center shadow-comic">
                      <PenTool className="w-12 h-12 text-black" />
                   </div>
                   <h2 className="text-5xl font-comic text-black mb-2 drop-shadow-sm">START DRAWING!</h2>
                   <p className="font-mono text-sm bg-white inline-block px-2 border border-black">
                      Load your images on the left to begin.
                   </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Character Editor Modal */}
        {editingCharIndex !== null && userImages[editingCharIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border-4 border-black shadow-[16px_16px_0_#000] w-full max-w-md transform -rotate-1 animate-pop">
              
              {/* Header */}
              <div className="bg-black text-white p-4 flex justify-between items-center">
                 <h3 className="font-comic text-2xl uppercase tracking-wider">
                   Character {editingCharIndex + 1}
                 </h3>
                 <button onClick={() => setEditingCharIndex(null)} className="hover:scale-110 transition-transform">
                   <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none"></div>
                 
                 {/* Thumbnail */}
                 <div className="flex gap-4 relative z-10">
                    <div className="w-20 h-20 border-2 border-black shadow-comic bg-white flex-shrink-0">
                      <img 
                        src={userImages[editingCharIndex]} 
                        className="w-full h-full object-cover" 
                        alt="Char" 
                      />
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-gray-500 font-mono mb-1">ACTION / CONTEXT</p>
                       <textarea
                         className="w-full h-20 p-2 border-2 border-black font-mono text-sm focus:shadow-[4px_4px_0_#000] outline-none resize-none"
                         placeholder="What are they doing? (e.g. Running fast, Looking shocked...)"
                         value={characterDetails[editingCharIndex]?.description || ''}
                         onChange={(e) => updateCharacterDetail(editingCharIndex, 'description', e.target.value)}
                       />
                    </div>
                 </div>

                 {/* Dialogue Input */}
                 <div className="relative z-10">
                   <div className="flex items-center justify-between mb-1">
                     <p className="text-xs font-bold text-gray-500 font-mono">DIALOGUE</p>
                     <div className="bg-yellow-300 text-[10px] font-black px-1 border border-black">SPEECH BUBBLE</div>
                   </div>
                   <div className="relative">
                     <div className="absolute -left-1 -top-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black transform -rotate-45"></div>
                     <input
                        type="text"
                        className="w-full p-3 border-2 border-black font-comic text-lg focus:shadow-[4px_4px_0_#000] outline-none"
                        placeholder="What do they say?"
                        value={characterDetails[editingCharIndex]?.dialogue || ''}
                        onChange={(e) => updateCharacterDetail(editingCharIndex, 'dialogue', e.target.value)}
                     />
                   </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t-4 border-black bg-gray-50 flex justify-end">
                 <button 
                   onClick={() => setEditingCharIndex(null)}
                   className="px-6 py-2 bg-black text-white font-comic text-xl border-2 border-black shadow-comic hover:translate-y-[-2px] hover:shadow-comic-hover transition-all"
                 >
                   DONE
                 </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
