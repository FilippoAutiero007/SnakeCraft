import React from 'react';
import { Zap, Package, Pause, ShoppingBag } from 'lucide-react';

interface MobileButtonsProps {
  onPowerPress: () => void;
  onGadgetPress: () => void;
  onPausePress: () => void;
  onShopPress?: () => void;
  powerAvailable?: boolean;
  gadgetAvailable?: boolean;
  buttonSize?: number;
}

export const MobileButtons: React.FC<MobileButtonsProps> = ({
  onPowerPress,
  onGadgetPress,
  onPausePress,
  onShopPress,
  powerAvailable = true,
  gadgetAvailable = true,
  buttonSize = 60
}) => {
  const baseButtonClass = `
    fixed z-50 rounded-full shadow-2xl transition-all duration-150 
    active:scale-90 flex items-center justify-center font-bold text-white
    border-2 touch-none select-none
  `;

  return (
    <>
      {/* Power-Up Button (bottom-left) */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onPowerPress();
        }}
        disabled={!powerAvailable}
        className={`
          ${baseButtonClass} left-8 bottom-8
          ${powerAvailable 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 active:from-yellow-500 active:to-orange-600 hover:scale-105' 
            : 'bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed'}
        `}
        style={{ width: buttonSize, height: buttonSize }}
        aria-label="Power-Up"
      >
        <Zap className="w-8 h-8" />
      </button>

      {/* Gadget Button (above power-up) */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onGadgetPress();
        }}
        disabled={!gadgetAvailable}
        className={`
          ${baseButtonClass} left-8
          ${gadgetAvailable 
            ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 active:from-blue-500 active:to-purple-600 hover:scale-105' 
            : 'bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed'}
        `}
        style={{ 
          width: buttonSize * 0.8, 
          height: buttonSize * 0.8,
          bottom: buttonSize + 48 
        }}
        aria-label="Gadget"
      >
        <Package className="w-6 h-6" />
      </button>

      {/* Pause Button (top-left) */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onPausePress();
        }}
        className={`
          ${baseButtonClass} left-8 top-8
          bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400
          active:from-gray-700 active:to-gray-900 hover:scale-105
        `}
        style={{ width: buttonSize * 0.7, height: buttonSize * 0.7 }}
        aria-label="Pause"
      >
        <Pause className="w-5 h-5" />
      </button>

      {/* Shop Button (top-left, below pause) - optional */}
      {onShopPress && (
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onShopPress();
          }}
          className={`
            ${baseButtonClass} left-8
            bg-gradient-to-br from-green-500 to-emerald-600 border-green-400
            active:from-green-600 active:to-emerald-700 hover:scale-105
          `}
          style={{ 
            width: buttonSize * 0.6, 
            height: buttonSize * 0.6,
            top: buttonSize * 0.7 + 48
          }}
          aria-label="Shop"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
