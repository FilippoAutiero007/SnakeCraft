"use client";

import React from "react";
import type { GameState } from "@/hooks/useGameState";

interface GameUIProps {
  gameState: GameState;
}

export default function GameUI({ gameState }: GameUIProps) {
  return (
    <div className="fixed top-4 left-4 text-white font-bold text-xl">
      <div className="mb-2">Score: {gameState.score}</div>
      <div className="mb-2">Livello: {gameState.level}</div>
      <div className="mb-2">Vite: {gameState.lives}</div>
      <div className="mb-2">Lunghezza: {gameState.playerLength}</div>
      <div className="text-sm text-gray-400">Bioma: {gameState.currentBiome}</div>
    </div>
  );
}
