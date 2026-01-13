
import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { ChocolateIcon } from './Icons';

interface GameOverProps {
  score: number;
  bossDefeated: boolean;
  onRestart: () => void;
  onHome: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, bossDefeated, onRestart, onHome }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in p-6">
      <div className="text-center mb-8">
        <h2 className={`text-5xl md:text-7xl pixel-font mb-4 ${bossDefeated ? 'text-yellow-400' : 'text-red-500'}`}>
          {bossDefeated ? 'VICTORY!' : 'GAME OVER'}
        </h2>
        {bossDefeated && <p className="text-green-400 text-xl font-bold">Boss Defeated!</p>}
      </div>

      <div className="bg-gray-800 p-8 rounded-2xl border-2 border-gray-600 w-full max-w-md mb-8 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 uppercase text-sm font-bold">Total Score</span>
          <span className="text-4xl font-bold text-white">{score}</span>
        </div>
        <div className="flex items-center gap-2 text-[#8D6E63] mt-2">
           <ChocolateIcon size={24} />
           <span className="font-bold text-xl">+ {Math.floor(score / 10)} Choco Earned</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onRestart} className="flex items-center gap-2 bg-blue-600 px-8 py-4 rounded-xl hover:bg-blue-500 font-bold text-xl shadow-[0_4px_0_#1e3a8a] active:shadow-none active:translate-y-1">
          <RotateCcw /> Retry
        </button>
        <button onClick={onHome} className="flex items-center gap-2 bg-gray-600 px-8 py-4 rounded-xl hover:bg-gray-500 font-bold text-xl shadow-[0_4px_0_#374151] active:shadow-none active:translate-y-1">
          <Home /> Menu
        </button>
      </div>
    </div>
  );
};

export default GameOver;
