"use client";

import { useState, useCallback, useEffect } from "react";

export interface GameState {
  score: number;
  level: number;
  lives: number;
  isPaused: boolean;
  gameOver: boolean;
  playerPos: { x: number; y: number };
  playerLength: number;
  currentBiome: "grass" | "ice" | "lava" | "cactus" | "sand";
  enemies: Array<{ x: number; y: number; type: string }>;
  powerUps: Array<{ x: number; y: number; type: string }>;
}

const initialState: GameState = {
  score: 0,
  level: 0,
  lives: 3,
  isPaused: false,
  gameOver: false,
  playerPos: { x: 10, y: 10 },
  playerLength: 3,
  currentBiome: "grass",
  enemies: [],
  powerUps: [],
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateScore = useCallback((points: number) => {
    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
      level: Math.floor((prev.score + points) / 1000),
    }));
  }, []);

  const updatePlayerPos = useCallback((x: number, y: number) => {
    setGameState((prev) => ({
      ...prev,
      playerPos: { x, y },
    }));
  }, []);

  const updatePlayerLength = useCallback((length: number) => {
    setGameState((prev) => ({
      ...prev,
      playerLength: length,
    }));
  }, []);

  const setBiome = useCallback((biome: GameState["currentBiome"]) => {
    setGameState((prev) => ({
      ...prev,
      currentBiome: biome,
    }));
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    setGameState((prev) => ({
      ...prev,
      isPaused: paused,
    }));
  }, []);

  const setGameOver = useCallback((gameOver: boolean) => {
    setGameState((prev) => ({
      ...prev,
      gameOver,
    }));
  }, []);

  const reset = useCallback(() => {
    setGameState(initialState);
  }, []);

  return {
    ...gameState,
    updateScore,
    updatePlayerPos,
    updatePlayerLength,
    setBiome,
    setPaused,
    setGameOver,
    reset,
  };
}
