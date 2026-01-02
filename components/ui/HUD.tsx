
import React from 'react';
import { Heart } from 'lucide-react';
import { ChocolateIcon } from '../Icons';
import { INITIAL_HEALTH } from '../../constants';

interface HUDProps {
    score: number;
    health: number;
    combo: number;
}

export const HUD: React.FC<HUDProps> = ({ score, health, combo }) => {
    const healthPercent = Math.max(0, Math.round((health/INITIAL_HEALTH)*100));
    return (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <Heart className="text-red-500 fill-red-500 w-5 h-5 shrink-0" />
            <div className="w-20 md:w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" style={{width: `${healthPercent}%`}} />
            </div>
            <span className="text-white font-bold text-xs font-mono min-w-[3ch] text-right">{healthPercent}%</span>
            </div>
            <div className="flex items-center gap-2">
                <ChocolateIcon size={24} />
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg font-mono tracking-tighter">
                {score}
                </div>
            </div>
            {combo > 1 && <div className="text-xl font-bold text-amber-400 animate-pulse drop-shadow-[0_0_10px_orange]">COMBO x{combo}</div>}
        </div>
    );
};
