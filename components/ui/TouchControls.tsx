
import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, Zap } from 'lucide-react';
import { Direction, PowerUpType } from '../../types';
import { audio } from '../../utils/audio';

interface TouchControlsProps {
    onInput: (dir: Direction) => void;
    onAbility: () => void;
    powerUp: PowerUpType;
    isTutorial: boolean;
    tutorialStep: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onInput, onAbility, powerUp, isTutorial, tutorialStep }) => {
    const DPadButton = ({ dir, icon: Icon }: { dir: Direction, icon: any }) => (
        <button 
          className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center active:bg-white/30 transition-colors shadow-lg touch-none select-none"
          onPointerDown={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              audio.init(); 
              onInput(dir); 
          }}
        >
          <Icon className="text-white w-10 h-10" />
        </button>
    );

    const showAbility = powerUp !== PowerUpType.NONE || isTutorial;

    return (
        <>
            <div className="absolute bottom-6 left-6 z-50 flex flex-col items-center gap-2 pointer-events-auto md:hidden opacity-90">
                <DPadButton dir={Direction.UP} icon={ArrowUp} />
                <div className="flex gap-2">
                    <DPadButton dir={Direction.LEFT} icon={ArrowLeft} />
                    <DPadButton dir={Direction.DOWN} icon={ArrowDown} />
                    <DPadButton dir={Direction.RIGHT} icon={ArrowRight} />
                </div>
            </div>

            <div className={`absolute bottom-8 right-8 z-50 transition-all duration-300 ${showAbility ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <button 
                    onClick={(e) => { 
                        e.preventDefault(); 
                        audio.init(); 
                        onAbility(); 
                    }}
                    className={`w-24 h-24 rounded-full shadow-2xl border-4 border-white/20 flex items-center justify-center transition-transform active:scale-90 touch-none select-none ${isTutorial && tutorialStep === 4 ? 'animate-bounce bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-gray-800/80 backdrop-blur'}`}
                >
                    {powerUp === PowerUpType.LASER_EYES || (isTutorial && tutorialStep === 4) ? (
                    <Eye className="text-white w-10 h-10" />
                    ) : (
                    <Zap className="text-white w-10 h-10" />
                    )}
                </button>
            </div>
        </>
    );
};
