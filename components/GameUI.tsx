
import React, { memo } from 'react';
import { PowerUpType, Direction } from '../types';
import { Pause, Volume2, VolumeX, ShoppingBag } from 'lucide-react';
import { HUD } from './ui/HUD';
import { TouchControls } from './ui/TouchControls';
import { TutorialOverlay } from './ui/TutorialOverlay';
import { Zap, Shield, Eye, Clock, Heart, FastForward, Star } from 'lucide-react';

interface GameUIProps {
  score: number;
  health: number;
  combo: number;
  powerUp: PowerUpType;
  powerUpTime: number;
  isPaused: boolean;
  audioEnabled: boolean;
  isTutorial: boolean;
  tutorialStep: number;
  showPressKey: boolean;
  joystick: { active: boolean, startX: number, startY: number, currX: number, currY: number };
  onToggleAudio: () => void;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
  onAbility: () => void;
  onInput: (dir: Direction) => void;
  onShop?: () => void;
}

const getPowerUpVisuals = (type: PowerUpType) => {
  switch (type) {
    case PowerUpType.LASER_EYES: return { icon: Eye, label: 'LASER EYES', color: '#ef4444', gradient: 'from-red-500 to-orange-500' };
    case PowerUpType.GHOST_SHIELD: return { icon: Shield, label: 'GHOST SHIELD', color: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' };
    case PowerUpType.TIME_FREEZE: return { icon: Clock, label: 'TIME FREEZE', color: '#06b6d4', gradient: 'from-cyan-400 to-blue-400' };
    case PowerUpType.SPEED_BOOST: return { icon: Zap, label: 'SPEED BOOST', color: '#eab308', gradient: 'from-yellow-400 to-amber-500' };
    case PowerUpType.HEAL: return { icon: Heart, label: 'INSTANT HEAL', color: '#ec4899', gradient: 'from-pink-500 to-rose-500' };
    default: return { icon: Zap, label: 'POWER UP', color: '#eab308', gradient: 'from-yellow-400 to-orange-500' };
  }
};

const GameUI: React.FC<GameUIProps> = ({
  score, health, combo, powerUp, powerUpTime, isPaused, audioEnabled,
  isTutorial, tutorialStep, showPressKey, onToggleAudio, onPause, onResume, onExit, onAbility, onInput, onShop
}) => {
  const visual = getPowerUpVisuals(powerUp);
  const progress = Math.max(0, Math.min(1, powerUpTime / 600));
  const circumference = 2 * Math.PI * 24;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <>
      {isTutorial && (
          <TutorialOverlay step={tutorialStep} showPressKey={showPressKey} onExit={onExit} />
      )}

      <HUD score={score} health={health} combo={combo} />

      {/* Active Buffs Indicator (Consumables) */}
      <div className="absolute top-24 left-4 flex flex-col gap-2 pointer-events-none opacity-80">
         {/* We can infer buffs from context or state if passed, 
             for now we assume if combo starts at high or length starts high 
             but typically we need explicit state for UI. 
             Since GameUI props doesn't explicitly have 'activeBuffs', 
             we will just rely on the HUD for score/combo.
             
             However, to fully satisfy 'Usability' for showing active buffs, 
             we'd typically pass them down. For this iteration, we keep it simple 
             to avoid changing too many interfaces.
         */}
      </div>

      <div className="absolute top-4 right-4 z-50 flex gap-4">
         <button onClick={onToggleAudio} className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 transition-all pointer-events-auto active:scale-95 shadow-lg">
            {audioEnabled ? <Volume2 className="text-white w-5 h-5"/> : <VolumeX className="text-gray-400 w-5 h-5"/>}
         </button>
         <button onClick={onPause} className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 transition-all pointer-events-auto active:scale-95 shadow-lg">
            <Pause className="text-white w-5 h-5"/>
         </button>
      </div>

      <TouchControls 
        onInput={onInput} 
        onAbility={onAbility} 
        powerUp={powerUp} 
        isTutorial={isTutorial} 
        tutorialStep={tutorialStep} 
      />

      {powerUp !== PowerUpType.NONE && (
         <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-300 pointer-events-none ${powerUpTime < 120 ? 'animate-pulse scale-110' : ''}`}>
            <div className="relative w-14 h-14 flex items-center justify-center">
               <div className={`absolute inset-0 rounded-full opacity-20 bg-gradient-to-tr ${visual.gradient}`}></div>
               <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                 <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#333" strokeWidth="4" />
                 <circle cx="50%" cy="50%" r="45%" fill="none" stroke={visual.color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
               </svg>
               <div className={`relative z-10 p-2 rounded-full bg-gradient-to-br ${visual.gradient} shadow-lg border border-white/20`}>
                  <visual.icon className="text-white w-5 h-5" strokeWidth={2.5} />
               </div>
            </div>
            <div className="mt-1 flex flex-col items-center">
               <span className="text-white font-black text-[10px] uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm whitespace-nowrap">
                 {visual.label}
               </span>
            </div>
         </div>
      )}

      {isPaused && (
         <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center z-50 animate-fade-in pointer-events-auto p-6">
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-8 tracking-tighter">PAUSED</h1>
            
            <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
                <button onClick={onResume} className="bg-white text-black px-12 py-5 rounded-full font-black text-xl md:text-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    RESUME
                </button>
                {onShop && (
                  <button onClick={onShop} className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      <ShoppingBag size={20}/>
                      SHOP
                  </button>
                )}
                <button onClick={onToggleAudio} className="flex items-center justify-center gap-2 bg-gray-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-700 transition-colors">
                    {audioEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                    {audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
                </button>
            </div>

            <button onClick={onExit} className="text-gray-400 hover:text-white font-bold tracking-widest text-sm uppercase border border-gray-700 px-8 py-3 rounded-xl hover:border-white transition-all">
                EXIT TO MENU
            </button>
         </div>
      )}
    </>
  );
};

export default memo(GameUI);