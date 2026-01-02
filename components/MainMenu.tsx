
import React, { useState } from 'react';
import { PlayerStats, UpgradeType, ConsumableType } from '../types';
import { getLevelConfig } from '../constants';
import { Play, ShoppingBag, ArrowLeft, Crown, BookOpen } from 'lucide-react';
import { audio } from '../utils/audio';
import { Shop } from './Shop';
import { ChocolateIcon } from './Icons';

interface MainMenuProps {
  stats: PlayerStats;
  onStart: (level: number) => void;
  onTutorial: () => void;
  onBuySkin: (id: string, price: number) => void;
  onEquipSkin: (id: string) => void;
  onBuyBg: (id: string, price: number) => void;
  onEquipBg: (id: string) => void;
  onBuyUpgrade: (id: UpgradeType) => void;
  onBuyConsumable: (id: ConsumableType) => void;
}

const MOCK_LEADERBOARD = [
  { id: '1', name: 'SnakeMaster99', score: 154000, avatar: 'bg-green-500' },
  { id: '2', name: 'BlockBreaker', score: 120500, avatar: 'bg-red-500' },
  { id: '3', name: 'NeonViper', score: 98000, avatar: 'bg-cyan-500' },
  { id: '4', name: 'ShadowHunter', score: 85000, avatar: 'bg-purple-500' },
  { id: '5', name: 'RetroKing', score: 72000, avatar: 'bg-gray-500' },
];

const MainMenu: React.FC<MainMenuProps> = ({ 
  stats, onStart, onTutorial,
  onBuySkin, onEquipSkin, 
  onBuyBg, onEquipBg, 
  onBuyUpgrade, onBuyConsumable 
}) => {
  const [view, setView] = useState<'MAIN' | 'SHOP' | 'LEVELS' | 'LEADERBOARD'>('MAIN');

  const handleStart = (lvl: number) => {
    audio.init().catch(err => console.error("Audio init failed", err));
    onStart(lvl);
  };

  const handleTutorial = () => {
    audio.init().catch(err => console.error("Audio init failed", err));
    onTutorial();
  };

  if (view === 'SHOP') {
    return <Shop 
      stats={stats} 
      onBack={() => setView('MAIN')} 
      onBuySkin={onBuySkin} onEquipSkin={onEquipSkin}
      onBuyBg={onBuyBg} onEquipBg={onEquipBg}
      onBuyUpgrade={onBuyUpgrade} onBuyConsumable={onBuyConsumable}
    />;
  }

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000000_100%)]"></div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
         backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
         backgroundSize: '40px 40px',
         transform: 'perspective(500px) rotateX(20deg) scale(1.5) translateY(-50px)',
         animation: 'scrollGrid 20s linear infinite'
      }}></div>

      {view === 'MAIN' && (
        <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center p-4 relative z-20">
          <div className="flex flex-col items-center justify-center gap-6 md:gap-10 animate-fade-in w-full max-w-md my-auto py-10">
            {/* Title Section */}
            <div className="text-center relative shrink-0 mt-8 md:mt-0">
              <div className="absolute -inset-10 bg-emerald-500/20 blur-3xl rounded-full"></div>
              <h1 className="relative text-5xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] transform -skew-x-6">
                SNAKE
              </h1>
              <h2 className="relative text-3xl md:text-6xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 -mt-1 md:-mt-2 transform -skew-x-6 drop-shadow-lg">
                CRAFT
              </h2>
            </div>
            
            {/* Stats Bar */}
            <div className="flex items-center gap-4 bg-gray-900/80 p-3 px-6 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl transform hover:scale-105 transition-transform shrink-0">
              <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                <div className="w-8 h-8 flex items-center justify-center relative drop-shadow-md">
                  <ChocolateIcon size={32} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white leading-none">{stats.points.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Chocolates</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-2">
                <div className="bg-blue-500/20 p-2 rounded-full"><Crown className="text-blue-400 w-5 h-5" /></div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white leading-none">{stats.highScore.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">High Score</span>
                </div>
              </div>
            </div>

            {/* Main Buttons */}
            <div className="flex flex-col gap-4 w-full px-4 md:px-0 shrink-0">
              <button 
                onClick={() => setView('LEVELS')} 
                className="group relative bg-white min-h-[6rem] md:h-24 rounded-2xl flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-8 py-4 md:py-0 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] gap-2 md:gap-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 text-2xl md:text-3xl font-black italic tracking-tighter text-black flex items-center gap-3">
                  <div className="bg-black text-white p-2 rounded-full hidden md:block"><Play fill="currentColor" size={24} /></div>
                  <div className="bg-black text-white p-2 rounded-full md:hidden"><Play fill="currentColor" size={18} /></div>
                  PLAY GAME
                </span>
                <span className="relative z-10 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-black/70 bg-gray-100/50 md:bg-transparent px-3 py-1 rounded-full md:px-0 md:py-0">
                  Level {stats.levelsUnlocked} Unlocked
                </span>
              </button>

              <button 
                onClick={() => setView('SHOP')} 
                className="group relative bg-gray-800/80 hover:bg-gray-700/80 border border-white/5 h-20 rounded-2xl flex items-center justify-center gap-3 backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:shadow-lg hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ShoppingBag size={24} className="text-yellow-400 group-hover:scale-110 transition-transform" /> 
                <span className="font-bold text-lg tracking-wide text-gray-200">SHOP</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleTutorial} 
                  className="group relative bg-gray-900/50 border border-white/5 hover:bg-gray-900/80 h-14 rounded-xl flex items-center justify-center gap-3 font-bold backdrop-blur-sm transition-all text-gray-400 hover:text-white"
                >
                  <BookOpen size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" /> TUTORIAL
                </button>
                <button 
                  onClick={() => setView('LEADERBOARD')}
                  className="group bg-gray-900/50 border border-white/5 hover:bg-gray-900/80 h-14 rounded-xl flex items-center justify-center gap-3 font-bold backdrop-blur-sm transition-all text-gray-400 hover:text-white"
                >
                  <Crown size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors" /> RANKS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'LEVELS' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative z-20">
            <div className="w-full max-w-5xl h-full md:h-[85vh] bg-[#1a1a1a] md:rounded-3xl border border-white/10 overflow-hidden flex flex-col animate-slide-up shadow-2xl">
              <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-md shrink-0">
                  <button onClick={() => setView('MAIN')} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all">
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">SELECT WORLD</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#1a1a1a] to-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                      {Array.from({ length: stats.levelsUnlocked + 3 }, (_, i) => i + 1).map(lvl => {
                        const config = getLevelConfig(lvl);
                        const locked = lvl > stats.levelsUnlocked + 1;
                        return (
                          <button key={lvl} disabled={locked} onClick={() => handleStart(lvl)} className={`relative h-60 rounded-3xl overflow-hidden text-left transition-all group bg-gray-800 ${locked ? 'opacity-40 grayscale' : 'hover:scale-[1.02] ring-1 ring-white/10'}`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <div className="absolute bottom-0 w-full p-6 z-20">
                                <h3 className="text-2xl font-black text-white italic tracking-tight">{config.name}</h3>
                                <div className="text-xs text-emerald-400 font-bold uppercase">{locked ? 'LOCKED' : 'PLAY'}</div>
                            </div>
                          </button>
                        )
                      })}
                  </div>
              </div>
            </div>
          </div>
      )}

      {view === 'LEADERBOARD' && (
         <div className="w-full h-full flex flex-col items-center justify-center p-4 relative z-20">
            <div className="w-full max-w-4xl h-full md:h-[85vh] bg-[#1a1a1a] md:rounded-3xl border border-white/10 overflow-hidden flex flex-col animate-slide-up shadow-2xl">
              <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-md shrink-0">
                <button onClick={() => setView('MAIN')} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all">
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-black italic tracking-tighter text-white">LEADERBOARD</h2>
              </div>
              <div className="p-4 md:p-8 space-y-4 overflow-y-auto flex-1">
                {MOCK_LEADERBOARD.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                      <span className="text-white font-bold text-xl">#{idx+1} {entry.name}</span>
                      <span className="text-yellow-400 font-mono">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
         </div>
      )}

      <style>{`
        @keyframes scrollGrid {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MainMenu;