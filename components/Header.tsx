
import React from 'react';
import { Zap, Gem, DollarSign, BookOpen, ArrowRight } from 'lucide-react';

interface HeaderProps {
  modelName: string | null;
  sessionCost?: number;
  onModelClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ modelName, sessionCost, onModelClick }) => {
  const isPro = modelName === 'gemini-3-pro-image-preview';

  return (
    <header className="h-20 flex-shrink-0 bg-white border-b-4 border-black flex items-center justify-between px-6 relative z-20">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none"></div>

      {/* Logo Area */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-black text-white flex items-center justify-center transform -rotate-3 shadow-comic border-2 border-black">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-4xl font-comic text-black tracking-wide drop-shadow-[2px_2px_0_rgba(255,255,255,1)]" style={{ textShadow: '2px 2px 0 #fff, 4px 4px 0 #000' }}>
            NANO<span className="text-black">MANGA</span>
          </h1>
          <span className="text-xs font-bold bg-black text-white px-2 py-0.5 self-start -mt-1 transform rotate-2">
            PRO EDITION
          </span>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="flex items-center gap-4 relative z-10">
        
        {modelName && (
          <div className="flex items-center gap-3">
            {/* Session Cost Badge - Grouped with Model Selector */}
            {isPro && sessionCost !== undefined && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white border-2 border-black shadow-comic-sm transform rotate-1">
                <DollarSign className="w-4 h-4 text-black" />
                <span className="text-sm font-black font-mono">{sessionCost.toFixed(2)}</span>
              </div>
            )}

            {/* Visual Cue: Model Selector Arrow */}
            <div className="hidden lg:flex items-center gap-2 opacity-100 pointer-events-none animate-pulse">
              <span className="font-comic text-sm uppercase bg-white border-2 border-black px-2 py-0.5 transform -rotate-2 whitespace-nowrap shadow-[2px_2px_0_#000]">
                Model Selector
              </span>
              <ArrowRight className="w-6 h-6 text-black stroke-[3]" />
            </div>

            <button 
              onClick={onModelClick}
              className={`
                flex items-center gap-2 px-4 py-2 border-2 border-black shadow-comic transform rotate-1 transition-all hover:scale-105 hover:rotate-2 hover:shadow-comic-hover cursor-pointer
                ${isPro ? 'bg-pink-300 hover:bg-pink-400' : 'bg-yellow-300 hover:bg-yellow-400'}
              `}
            >
              <div className="flex items-center gap-2">
                {isPro ? <Gem className="w-4 h-4 text-black" /> : <Zap className="w-4 h-4 text-black" />}
                <span className="font-comic text-lg leading-none text-black mt-1">
                  {isPro ? 'GEMINI PRO' : 'GEMINI FLASH'}
                </span>
              </div>
            </button>
          </div>
        )}
        
        <a 
          href="https://ai.google.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden md:block px-3 py-1 text-xs font-black border-2 border-black bg-gray-100 hover:bg-black hover:text-white transition-colors uppercase"
        >
          Docs
        </a>
      </div>
    </header>
  );
};
