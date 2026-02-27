
import React, { useEffect, useState } from 'react';
import { PenTool } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number; // 0 to 100
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message, progress }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);
  const loadingTexts = ["INKING...", "TONING...", "SHADING...", "FINALIZING..."];

  useEffect(() => {
    if (!isVisible) {
      setFakeProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 800);

    // Fake progress that increments slowly
    const progressInterval = setInterval(() => {
      setFakeProgress((prev) => {
        // If real progress is provided, we want to approach it but not exceed it
        // If not provided, we just slowly go up to 95%
        const target = progress !== undefined ? progress : 95;
        
        // If we are far from target, move faster. If close, move slower.
        const diff = target - prev;
        if (diff > 0) {
          return prev + Math.max(0.5, diff * 0.05);
        }
        return prev;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isVisible, progress]);

  if (!isVisible) return null;

  const displayProgress = Math.min(100, Math.max(0, fakeProgress));

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 overflow-hidden">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
         <div className="w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[repeating-linear-gradient(45deg,#000_0px,#000_4px,transparent_4px,transparent_24px)] animate-pan-diagonal"></div>
      </div>

      {/* Central Action Area */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Japanese SFX (Onomatopoeia) - 'Karikari' (Scribble sound) */}
        <div className="absolute -left-32 top-0 text-7xl font-black text-black opacity-10 animate-pulse select-none transform -rotate-12 font-sans" style={{ textShadow: '2px 2px 0 #fff' }}>
          カリ
        </div>
        <div className="absolute -right-24 bottom-10 text-6xl font-black text-black opacity-10 animate-pulse delay-100 select-none transform rotate-12 font-sans" style={{ textShadow: '2px 2px 0 #fff' }}>
           カリ
        </div>

        {/* Main Animation Container */}
        <div className="relative mb-10">
          {/* The Page Being Drawn */}
          <div className="w-40 h-52 bg-white border-[3px] border-black shadow-[8px_8px_0_#000] transform rotate-2 flex items-center justify-center overflow-hidden relative">
             
             {/* Page Texture */}
             <div className="absolute inset-0 bg-dots opacity-10"></div>
             
             {/* Progressively appearing content (simulated) */}
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-24 h-32 border-2 border-dashed border-gray-300 relative overflow-hidden">
                 <div 
                   className="absolute bottom-0 left-0 right-0 bg-black/10 transition-all duration-300 ease-out" 
                   style={{ height: `${displayProgress}%` }}
                 ></div>
               </div>
             </div>
             
             {/* Scribble Effect */}
             <div className="absolute w-full h-full flex items-center justify-center">
                <div className="w-0 h-1 bg-black absolute transform rotate-45 animate-slash-1"></div>
                <div className="w-0 h-1 bg-black absolute transform -rotate-45 animate-slash-2"></div>
             </div>
          </div>

          {/* The Pen Tool - Animated to look like it's drawing */}
          <div className="absolute -bottom-2 -right-8 filter drop-shadow-xl z-20 animate-draw-hand">
             <div className="relative">
                <PenTool className="w-20 h-20 text-black fill-white stroke-[1.5]" />
                {/* Motion Lines on Pen */}
                <div className="absolute -top-4 left-0 w-full flex justify-center gap-1 opacity-0 animate-speed-streaks">
                   <div className="w-0.5 h-4 bg-black rounded-full"></div>
                   <div className="w-0.5 h-6 bg-black rounded-full mt-2"></div>
                   <div className="w-0.5 h-3 bg-black rounded-full"></div>
                </div>
             </div>
          </div>
        </div>

        {/* Status Text Box */}
        <div className="relative">
          <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1"></div>
          <div className="relative bg-yellow-400 px-8 py-3 border-2 border-black flex flex-col items-center">
            <h3 className="text-3xl font-comic text-black italic font-black tracking-wider uppercase">
              {message || loadingTexts[textIndex]}
              {` ${Math.round(displayProgress)}%`}
            </h3>
            <div className="w-full h-1 bg-black mt-1 rounded-full overflow-hidden">
               <div className="h-full bg-white transition-all duration-300 ease-out" style={{ width: `${displayProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped Styles for Animations */}
      <style>{`
        @keyframes draw-hand {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-15px, -10px) rotate(-5deg); }
          50% { transform: translate(-5px, 0px) rotate(5deg); }
          75% { transform: translate(-20px, -5px) rotate(-10deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes slash-1 {
           0% { width: 0; opacity: 0; left: 20%; top: 20%; }
           10% { opacity: 1; }
           40% { width: 60%; left: 20%; top: 20%; }
           80% { opacity: 0; }
           100% { opacity: 0; }
        }

        @keyframes slash-2 {
           0% { width: 0; opacity: 0; right: 20%; bottom: 20%; }
           40% { opacity: 0; }
           50% { opacity: 1; }
           80% { width: 60%; right: 20%; bottom: 20%; }
           100% { opacity: 0; }
        }

        @keyframes pan-diagonal {
          0% { transform: translate(-50%, -50%); }
          100% { transform: translate(-45%, -45%); }
        }
        
        @keyframes speed-streaks {
          0%, 100% { opacity: 0; transform: translateY(5px); }
          50% { opacity: 1; transform: translateY(-5px); }
        }

        @keyframes progress-indeterminate {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(0); transform-origin: right; }
        }

        .animate-draw-hand {
          animation: draw-hand 0.4s infinite ease-in-out alternate;
        }
        .animate-slash-1 {
          animation: slash-1 1.5s infinite ease-out;
        }
        .animate-slash-2 {
          animation: slash-2 1.5s infinite ease-out;
        }
        .animate-pan-diagonal {
          animation: pan-diagonal 3s infinite linear;
        }
        .animate-speed-streaks {
          animation: speed-streaks 0.4s infinite linear;
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
