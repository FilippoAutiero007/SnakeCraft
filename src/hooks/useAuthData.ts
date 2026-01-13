"use client";

import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export interface UserGameData {
  userId: string;
  maxScore: number;
  maxLevel: number;
  totalGamesPlayed: number;
  inventory: Record<string, number>;
  settings: Record<string, unknown>;
}

export function useAuthData() {
  const { user, isLoaded } = useUser();
  const [gameData, setGameData] = useState<UserGameData | null>(null);
  const [loading, setLoading] = useState(true);

  // Carica dati utente da localStorage e Clerk metadata
  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      const userId = user.id;
      const maxScore = parseInt(localStorage.getItem(`maxScore_${userId}`) || "0");
      const maxLevel = parseInt(localStorage.getItem(`maxLevel_${userId}`) || "0");
      const totalGamesPlayed = parseInt(
        localStorage.getItem(`totalGames_${userId}`) || "0"
      );
      const inventoryStr = localStorage.getItem(`inventory_${userId}`);
      const settingsStr = localStorage.getItem(`gameSettings`);

      setGameData({
        userId,
        maxScore,
        maxLevel,
        totalGamesPlayed,
        inventory: inventoryStr ? JSON.parse(inventoryStr) : {},
        settings: settingsStr ? JSON.parse(settingsStr) : {},
      });
    }

    setLoading(false);
  }, [user, isLoaded]);

  const updateMaxScore = (score: number) => {
    if (!user) return;

    const userId = user.id;
    const currentMax = parseInt(localStorage.getItem(`maxScore_${userId}`) || "0");

    if (score > currentMax) {
      localStorage.setItem(`maxScore_${userId}`, String(score));
      setGameData((prev) =>
        prev ? { ...prev, maxScore: score } : null
      );
    }
  };

  const updateMaxLevel = (level: number) => {
    if (!user) return;

    const userId = user.id;
    const currentMax = parseInt(localStorage.getItem(`maxLevel_${userId}`) || "0");

    if (level > currentMax) {
      localStorage.setItem(`maxLevel_${userId}`, String(level));
      setGameData((prev) =>
        prev ? { ...prev, maxLevel: level } : null
      );
    }
  };

  const incrementGamesPlayed = () => {
    if (!user) return;

    const userId = user.id;
    const current = parseInt(localStorage.getItem(`totalGames_${userId}`) || "0");
    const newValue = current + 1;

    localStorage.setItem(`totalGames_${userId}`, String(newValue));
    setGameData((prev) =>
      prev ? { ...prev, totalGamesPlayed: newValue } : null
    );
  };

  const updateInventory = (inventory: Record<string, number>) => {
    if (!user) return;

    const userId = user.id;
    localStorage.setItem(`inventory_${userId}`, JSON.stringify(inventory));
    setGameData((prev) =>
      prev ? { ...prev, inventory } : null
    );
  };

  const updateSettings = (settings: Record<string, unknown>) => {
    localStorage.setItem(`gameSettings`, JSON.stringify(settings));
    setGameData((prev) =>
      prev ? { ...prev, settings } : null
    );
  };

  return {
    user,
    gameData,
    loading,
    updateMaxScore,
    updateMaxLevel,
    incrementGamesPlayed,
    updateInventory,
    updateSettings,
  };
}
