import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { LoadingOverlay } from './LoadingOverlay';
import { GenerationStatus, FullMangaCharacter, FullMangaParams, FullMangaPageConfig, FullMangaBook } from '../types';
import { ImageUploader } from './ImageUploader';
import { 
  BookOpen, Plus, Trash2, Wand2, Download, RefreshCw, 
  ChevronRight, ChevronLeft, Image as ImageIcon, Settings2,
  DollarSign, Globe, FileText, History as HistoryIcon
} from 'lucide-react';

interface FullMangaEditorProps {
  selectedModel: string;
  sessionCost: number;
  onExit: () => void;
  onGenerate: (params: FullMangaParams) => void;
  status: GenerationStatus;
  generatedPages: string[];
  errorMsg: string | null;
  history: FullMangaBook[];
  progress?: number;
}

export const FullMangaEditor: React.FC<FullMangaEditorProps> = ({
  selectedModel,
  sessionCost,
  onExit,
  onGenerate,
  status,
  generatedPages,
  errorMsg,
  history,
  progress
}) => {
  const isPro = selectedModel === 'gemini-3-pro-image-preview';
  const accentColor = isPro ? 'bg-pink-400' : 'bg-blue-400';
  const accentHover = isPro ? 'hover:bg-pink-300' : 'hover:bg-blue-300';
  const isGenerating = status === GenerationStatus.GENERATING;

  const [storyIntro, setStoryIntro] = useState('');
  const [storyBody, setStoryBody] = useState('');
  const [storyConclusion, setStoryConclusion] = useState('');
  const [characters, setCharacters] = useState<FullMangaCharacter[]>([]);
  
  // Continuity / World
  const [setting, setSetting] = useState('');
  const [tone, setTone] = useState('');
  const [colorScheme, setColorScheme] = useState<'B&W' | 'Color'>('B&W');
  const [artType, setArtType] = useState('');
  
  // Settings
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [pageCount, setPageCount] = useState(4);

  // Pages
  const [pages, setPages] = useState<FullMangaPageConfig[]>(Array(4).fill(null).map(() => ({
    action: '', layout: 'Auto', colorOverride: 'Auto', speechBubbles: 'Auto', consistency: 'Continue'
  })));

  useEffect(() => {
    if (pageCount > pages.length) {
      const newPages = [...pages];
      for (let i = pages.length; i < pageCount; i++) {
        newPages.push({ action: '', layout: 'Auto', colorOverride: 'Auto', speechBubbles: 'Auto', consistency: 'Continue' });
      }
      setPages(newPages);
    } else if (pageCount < pages.length) {
      setPages(pages.slice(0, pageCount));
    }
  }, [pageCount]);

  const [activeTab, setActiveTab] = useState<'story' | 'characters' | 'world' | 'pages' | 'settings' | 'history'>('story');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [viewingHistoryBook, setViewingHistoryBook] = useState<FullMangaBook | null>(null);

  const displayPages = viewingHistoryBook ? viewingHistoryBook.pages : generatedPages;

  const handleAddCharacter = () => {
    setCharacters([...characters, { name: '', image: '', traits: '' }]);
  };

  const handleUpdateCharacter = (index: number, field: keyof FullMangaCharacter, value: string) => {
    const newChars = [...characters];
    newChars[index] = { ...newChars[index], [field]: value };
    setCharacters(newChars);
  };

  const handleRemoveCharacter = (index: number) => {
    const newChars = [...characters];
    newChars.splice(index, 1);
    setCharacters(newChars);
  };

  const handleUpdatePage = (index: number, field: keyof FullMangaPageConfig, value: string) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], [field]: value as any };
    setPages(newPages);
  };

  const calculateCost = () => {
    const baseImageCost = isPro ? 0.134 : 0.0672;
    const textInputCostPer1M = isPro ? 2.00 : 0.50;
    
    // Resolution multiplier (hypothetical, as Gemini Pro Image pricing might vary by resolution)
    // Let's assume 1K = 1x, 2K = 2x, 4K = 4x for estimation purposes.
    let multiplier = 1;
    if (resolution === '2K') multiplier = 2;
    if (resolution === '4K') multiplier = 4;
    
    const imageCost = baseImageCost * multiplier * pageCount;

    // Estimate text length
    let totalText = storyIntro + storyBody + storyConclusion + setting + tone + artType;
    characters.forEach(c => totalText += c.name + c.traits);
    pages.forEach(p => totalText += p.action);

    const textTokens = totalText.length / 4;
    const imageTokens = characters.length * 258; // Characters are sent as images
    const totalTokensPerPrompt = textTokens + imageTokens;
    
    // We send this prompt `pageCount` times
    const inputCost = (totalTokensPerPrompt / 1000000) * textInputCostPer1M * pageCount;

    return (imageCost + inputCost).toFixed(4);
  };

  const handleGenerateClick = () => {
    setViewingHistoryBook(null);
    setCurrentPageIndex(0);
    onGenerate({
      storyIntro,
      storyBody,
      storyConclusion,
      characters,
      setting,
      tone,
      colorScheme,
      artType,
      pages,
      resolution,
      pageCount
    });
    setActiveTab('preview');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden text-black font-sans">
      <Header 
        modelName={selectedModel} 
        sessionCost={sessionCost} 
        onModelClick={onExit}
      />
      <LoadingOverlay isVisible={isGenerating} message="Generating Full Manga..." progress={progress} />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Configuration */}
        <aside className="w-full md:w-[450px] bg-white border-r-4 border-black flex flex-col h-full z-10">
          <div className="p-4 border-b-4 border-black bg-white flex gap-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('story')}
              className={`px-4 py-2 font-comic border-2 border-black shadow-comic transition-all whitespace-nowrap ${activeTab === 'story' ? accentColor : 'bg-white hover:bg-gray-50'}`}
            >
              1. STORY
            </button>
            <button 
              onClick={() => setActiveTab('characters')}
              className={`px-4 py-2 font-comic border-2 border-black shadow-comic transition-all whitespace-nowrap ${activeTab === 'characters' ? accentColor : 'bg-white hover:bg-gray-50'}`}
            >
              2. CAST
            </button>
            <button 
              onClick={() => setActiveTab('world')}
              className={`px-4 py-2 font-comic border-2 border-black shadow-comic transition-all whitespace-nowrap ${activeTab === 'world' ? accentColor : 'bg-white hover:bg-gray-50'}`}
            >
              3. WORLD
            </button>
            <button 
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 font-comic border-2 border-black shadow-comic transition-all whitespace-nowrap ${activeTab === 'pages' ? accentColor : 'bg-white hover:bg-gray-50'}`}
            >
              4. PAGES
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-comic border-2 border-black shadow-comic transition-all whitespace-nowrap ${activeTab === 'settings' ? accentColor : 'bg-white hover:bg-gray-50'}`}
            >
              5. SETTINGS
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-comic border-2 border-black shadow-comic transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? accentColor : 'bg-white hover:bg-gray-50'}`}
            >
              <HistoryIcon className="w-4 h-4" /> HISTORY
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {activeTab === 'story' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="font-comic text-xl block mb-2">Introduction</label>
                  <textarea 
                    value={storyIntro}
                    onChange={e => setStoryIntro(e.target.value)}
                    placeholder="How does the story begin? Set the scene..."
                    className="w-full p-3 border-2 border-black shadow-[4px_4px_0_#000] focus:shadow-[6px_6px_0_#000] outline-none transition-all resize-none h-32"
                  />
                </div>
                <div>
                  <label className="font-comic text-xl block mb-2">Body / Conflict</label>
                  <textarea 
                    value={storyBody}
                    onChange={e => setStoryBody(e.target.value)}
                    placeholder="What happens next? The main action..."
                    className="w-full p-3 border-2 border-black shadow-[4px_4px_0_#000] focus:shadow-[6px_6px_0_#000] outline-none transition-all resize-none h-40"
                  />
                </div>
                <div>
                  <label className="font-comic text-xl block mb-2">Conclusion</label>
                  <textarea 
                    value={storyConclusion}
                    onChange={e => setStoryConclusion(e.target.value)}
                    placeholder="How does it end? The resolution..."
                    className="w-full p-3 border-2 border-black shadow-[4px_4px_0_#000] focus:shadow-[6px_6px_0_#000] outline-none transition-all resize-none h-32"
                  />
                </div>
              </div>
            )}

            {activeTab === 'characters' && (
              <div className="space-y-6 animate-fade-in">
                {characters.map((char, idx) => (
                  <div key={idx} className="border-2 border-black p-4 bg-gray-50 relative shadow-comic">
                    <button 
                      onClick={() => handleRemoveCharacter(idx)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white border-2 border-black p-1 rounded-full hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-4">
                      <ImageUploader 
                        label="Character Image"
                        image={char.image || null}
                        onImageChange={(img) => handleUpdateCharacter(idx, 'image', img || '')}
                        compact
                      />
                      <input 
                        type="text"
                        value={char.name}
                        onChange={e => handleUpdateCharacter(idx, 'name', e.target.value)}
                        placeholder="Character Name"
                        className="w-full p-2 border-2 border-black outline-none font-bold"
                      />
                      <textarea 
                        value={char.traits}
                        onChange={e => handleUpdateCharacter(idx, 'traits', e.target.value)}
                        placeholder="Visual traits, clothing, personality..."
                        className="w-full p-2 border-2 border-black outline-none resize-none h-20 text-sm"
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={handleAddCharacter}
                  className="w-full py-3 border-2 border-dashed border-black font-comic hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> ADD CHARACTER
                </button>
              </div>
            )}

            {activeTab === 'world' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="font-comic text-xl block mb-2">Setting / Era</label>
                  <input 
                    type="text"
                    value={setting}
                    onChange={e => setSetting(e.target.value)}
                    placeholder="e.g. Cyberpunk Tokyo, Medieval Fantasy..."
                    className="w-full p-3 border-2 border-black shadow-[4px_4px_0_#000] outline-none"
                  />
                </div>
                <div>
                  <label className="font-comic text-xl block mb-2">Tone / Vibe</label>
                  <input 
                    type="text"
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    placeholder="e.g. Dark and gritty, Lighthearted comedy..."
                    className="w-full p-3 border-2 border-black shadow-[4px_4px_0_#000] outline-none"
                  />
                </div>
                <div>
                  <label className="font-comic text-xl block mb-2">Art Style</label>
                  <input 
                    type="text"
                    value={artType}
                    onChange={e => setArtType(e.target.value)}
                    placeholder="e.g. Shonen Jump, 90s Retro, Studio Ghibli..."
                    className="w-full p-3 border-2 border-black shadow-[4px_4px_0_#000] outline-none"
                  />
                </div>
                <div>
                  <label className="font-comic text-xl block mb-2">Color Scheme</label>
                  <div className="flex gap-2">
                    {['B&W', 'Color'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setColorScheme(c as any)}
                        className={`flex-1 py-2 border-2 border-black font-bold shadow-comic transition-all ${colorScheme === c ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-sm font-bold text-gray-600 mb-4">
                  Configure specific overrides for each page. The total number of pages is controlled in Settings.
                </p>
                {pages.map((page, idx) => (
                  <div key={idx} className="border-2 border-black p-4 bg-white relative shadow-comic space-y-4">
                    <h3 className="font-comic text-lg bg-black text-white inline-block px-2 py-1 transform -rotate-1">PAGE {idx + 1}</h3>
                    
                    <div>
                      <label className="text-xs font-bold block mb-1">Specific Action (Optional)</label>
                      <textarea 
                        value={page.action}
                        onChange={e => handleUpdatePage(idx, 'action', e.target.value)}
                        placeholder="What exactly happens on this page?"
                        className="w-full p-2 border-2 border-black outline-none resize-none h-16 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold block mb-1">Layout</label>
                        <select 
                          value={page.layout}
                          onChange={e => handleUpdatePage(idx, 'layout', e.target.value)}
                          className="w-full p-2 border-2 border-black outline-none text-sm font-bold"
                        >
                          <option value="Auto">Auto</option>
                          <option value="Splash">Splash (1 Panel)</option>
                          <option value="Grid">Grid</option>
                          <option value="Dynamic">Dynamic</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Speech Bubbles</label>
                        <select 
                          value={page.speechBubbles}
                          onChange={e => handleUpdatePage(idx, 'speechBubbles', e.target.value)}
                          className="w-full p-2 border-2 border-black outline-none text-sm font-bold"
                        >
                          <option value="Auto">Auto</option>
                          <option value="Empty">Empty</option>
                          <option value="With Text">With Text</option>
                          <option value="One Text Bubble">One Text Bubble</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Color Override</label>
                        <select 
                          value={page.colorOverride}
                          onChange={e => handleUpdatePage(idx, 'colorOverride', e.target.value)}
                          className="w-full p-2 border-2 border-black outline-none text-sm font-bold"
                        >
                          <option value="Auto">Auto (Use Global)</option>
                          <option value="B&W">Force B&W</option>
                          <option value="Color">Force Color</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Consistency</label>
                        <select 
                          value={page.consistency}
                          onChange={e => handleUpdatePage(idx, 'consistency', e.target.value)}
                          className="w-full p-2 border-2 border-black outline-none text-sm font-bold"
                        >
                          <option value="Continue">Continue</option>
                          <option value="Same Scene">Same Scene</option>
                          <option value="New Scene">New Scene</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <label className="font-comic text-xl block mb-2">Resolution</label>
                  <div className="flex gap-2">
                    {['1K', '2K', '4K'].map(res => (
                      <button 
                        key={res}
                        onClick={() => setResolution(res as any)}
                        className={`flex-1 py-2 border-2 border-black font-bold shadow-comic transition-all ${resolution === res ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-bold">* Higher resolutions may cost more and take longer.</p>
                </div>

                <div>
                  <label className="font-comic text-xl block mb-2">Number of Pages</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={pageCount}
                      onChange={e => setPageCount(parseInt(e.target.value))}
                      className="flex-1 accent-black"
                    />
                    <span className="font-comic text-2xl w-8 text-center">{pageCount}</span>
                  </div>
                </div>

                <div className="bg-yellow-100 border-2 border-black p-4 shadow-comic">
                  <h3 className="font-comic text-xl mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> ESTIMATED COST
                  </h3>
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>{pageCount} Pages @ {resolution}</span>
                    <span className="text-red-600">
                      ${calculateCost()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Theoretical cost based on image generation pricing.</p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                {history.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 font-bold">
                    No generated mangas yet.
                  </div>
                ) : (
                  history.map((book, idx) => (
                    <div key={book.id} className={`border-2 border-black p-4 bg-white shadow-comic cursor-pointer hover:bg-gray-50 transition-colors ${viewingHistoryBook?.id === book.id ? 'ring-4 ring-black' : ''}`}
                         onClick={() => {
                           setViewingHistoryBook(book);
                           setCurrentPageIndex(0);
                         }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-comic text-lg line-clamp-1">{book.title}</h3>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 border border-gray-300">
                          {new Date(book.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-600 mb-4">{book.pages.length} Pages</p>
                      
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {book.pages.map((page, pIdx) => (
                          <img 
                            key={pIdx} 
                            src={page} 
                            alt={`Thumb ${pIdx}`} 
                            className="h-24 w-auto border border-black object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t-4 border-black bg-white">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm">
                {errorMsg}
              </div>
            )}
            <button 
              onClick={handleGenerateClick}
              disabled={isGenerating || !storyIntro || !storyBody || !storyConclusion}
              className={`w-full py-4 font-comic text-2xl border-2 border-black shadow-comic transition-all flex items-center justify-center gap-2
                ${isGenerating || !storyIntro || !storyBody || !storyConclusion 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : `${accentColor} ${accentHover} text-black hover:shadow-comic-hover active:shadow-comic-active`
                }
              `}
            >
              <Wand2 className="w-6 h-6" /> 
              {isGenerating ? 'GENERATING...' : 'CREATE MANGA'}
            </button>
          </div>
        </aside>

        {/* Right Area - Preview */}
        <section className="flex-1 bg-gray-200 relative flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none"></div>
          
          <div className="flex-1 flex items-center justify-center p-8 relative z-10">
            {displayPages.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center">
                
                {viewingHistoryBook && (
                  <div className="w-full max-w-4xl flex justify-between items-center mb-4 bg-white border-2 border-black p-3 shadow-comic">
                    <div className="font-bold">
                      <span className="text-gray-500 mr-2">VIEWING HISTORY:</span>
                      <span className="font-comic text-lg">{viewingHistoryBook.title}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setViewingHistoryBook(null);
                        setCurrentPageIndex(0);
                      }}
                      className="text-xs font-bold bg-black text-white px-3 py-1 hover:bg-gray-800"
                    >
                      RETURN TO CURRENT
                    </button>
                  </div>
                )}

                <div className="flex-1 w-full max-w-4xl bg-white border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,0.3)] relative flex items-center justify-center overflow-hidden">
                  <img 
                    src={displayPages[currentPageIndex]} 
                    alt={`Page ${currentPageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Navigation */}
                  {currentPageIndex > 0 && (
                    <button 
                      onClick={() => setCurrentPageIndex(prev => prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-3 rounded-full shadow-comic hover:scale-110 transition-transform"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  {currentPageIndex < displayPages.length - 1 && (
                    <button 
                      onClick={() => setCurrentPageIndex(prev => prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-3 rounded-full shadow-comic hover:scale-110 transition-transform"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </div>
                
                <div className="mt-6 flex items-center gap-4">
                  <span className="font-comic text-xl bg-black text-white px-4 py-1">
                    PAGE {currentPageIndex + 1} / {displayPages.length}
                  </span>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = displayPages[currentPageIndex];
                      link.download = `manga-page-${currentPageIndex + 1}.png`;
                      link.click();
                    }}
                    className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 font-bold shadow-comic hover:shadow-comic-hover transition-all"
                  >
                    <Download className="w-4 h-4" /> DOWNLOAD PAGE
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <div className="w-32 h-32 bg-white border-4 border-black shadow-comic rounded-full mx-auto mb-8 flex items-center justify-center transform -rotate-6">
                   <BookOpen className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-4xl font-comic text-black mb-4 transform rotate-2">YOUR STORY AWAITS</h2>
                <p className="font-bold text-gray-600 text-lg">
                  Fill out the story, cast, and settings on the left to generate a complete multi-page manga.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
