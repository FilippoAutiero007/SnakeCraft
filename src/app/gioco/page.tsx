"use client";

import GameCanvas from "@/components/game/GameCanvas";
import JoystickMobile from "@/components/controls/JoystickMobile";
import MobileButtons from "@/components/controls/MobileButtons";
import PauseMenu from "@/components/ui/PauseMenu";
import GameUI from "@/components/ui/GameUI";
import { useGameState } from "@/hooks/useGameState";
import { useGameInput } from "@/hooks/useGameInput";
import { useState } from "react";

export default function GiocoPage() {
  const gameState = useGameState();
  const { input } = useGameInput();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <GameCanvas gameState={gameState} input={input} isPaused={isPaused} />
      
      {/* UI di gioco */}
      <GameUI gameState={gameState} />

      {/* Controlli mobile */}
      <div className="hidden md:flex absolute bottom-4 right-4 gap-4">
        <JoystickMobile onInput={(x: number, y: number) => {}} />
        <MobileButtons />
      </div>

      {/* Menu pausa */}
      {isPaused && (
        <PauseMenu onResume={() => setIsPaused(false)} />
      )}
    </div>
  );
}
