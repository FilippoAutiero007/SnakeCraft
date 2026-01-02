
import React from 'react';

interface TutorialOverlayProps {
    step: number;
    showPressKey: boolean;
    onExit: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, showPressKey, onExit }) => {
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/85 p-6 rounded-2xl border border-white/20 text-center z-40 backdrop-blur-md shadow-2xl w-[90%] max-w-md transition-all">
          {showPressKey && (
             <div className="animate-pulse mb-4 bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/50">
                <h3 className="text-xl md:text-2xl font-black text-yellow-400">TOUCH OR PRESS KEY TO START</h3>
             </div>
          )}
          {step === 0 && (
              <div className="animate-fade-in">
                  <h2 className="text-2xl md:text-3xl font-black text-white italic mb-2">WELCOME</h2>
                  <p className="text-gray-300">Use <span className="text-yellow-400 font-bold">D-PAD</span> or <span className="text-yellow-400 font-bold">SWIPE</span> to move.</p>
              </div>
          )}
          {step === 1 && (
              <div className="animate-bounce">
                  <h2 className="text-2xl md:text-3xl font-black text-amber-500 mb-2">EAT</h2>
                  <p className="text-white">Collect the <span className="text-amber-400 font-bold">Chocolate</span>.</p>
              </div>
          )}
          {step === 2 && (
              <div className="animate-pulse">
                  <h2 className="text-2xl md:text-3xl font-black text-yellow-400 mb-2">GOLD</h2>
                  <p className="text-white">Gold ingots give bonus points!</p>
              </div>
          )}
          {step === 3 && (
              <div className="animate-bounce">
                  <h2 className="text-2xl md:text-3xl font-black text-fuchsia-400 mb-2">POWER UP</h2>
                  <p className="text-white">Get the <span className="text-fuchsia-300 font-bold">Mystery Box</span>.</p>
              </div>
          )}
          {step === 4 && (
              <div className="animate-pulse">
                  <h2 className="text-2xl md:text-3xl font-black text-red-500 mb-2">ATTACK!</h2>
                  <p className="text-white mb-2">Destroy the wall!</p>
                  <div className="flex justify-center gap-2 text-sm">
                     <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full animate-pulse">PRESS ACTION BUTTON</span>
                  </div>
              </div>
          )}
           {step === 5 && (
              <div className="animate-fade-in pointer-events-auto">
                  <h2 className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">READY!</h2>
                  <button onClick={onExit} className="mt-4 bg-emerald-500 text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-lg">
                     START GAME
                  </button>
              </div>
          )}
        </div>
    );
};
