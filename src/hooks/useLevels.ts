"use client";

import { useState, useCallback } from "react";
import { getBiomeByLevel, type BiomeType } from "@/utils/biomes";

export interface BossConfig {
  level: number;
  name: string;
  health: number;
  speed: number;
  damage: number;
  biome: BiomeType;
}

const bosses: BossConfig[] = [
  {
    level: 1,
    name: "Blob Rosso",
    health: 50,
    speed: 1.5,
    damage: 1,
    biome: "grass",
  },
  {
    level: 2,
    name: "Golem Ghiaccio",
    health: 75,
    speed: 1,
    damage: 2,
    biome: "ice",
  },
  {
    level: 3,
    name: "Fenice Lava",
    health: 100,
    speed: 2,
    damage: 3,
    biome: "lava",
  },
  {
    level: 4,
    name: "Cactus Antico",
    health: 80,
    speed: 1.2,
    damage: 4,
    biome: "cactus",
  },
  {
    level: 5,
    name: "Tempesta Sabbia",
    health: 120,
    speed: 1.8,
    damage: 2,
    biome: "sand",
  },
];

export function useLevels() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentBoss, setCurrentBoss] = useState<BossConfig | null>(null);
  const [bossDefeated, setBossDefeated] = useState(false);

  const calculateLevel = useCallback((score: number): number => {
    return Math.floor(score / 1000);
  }, []);

  const getBossForLevel = useCallback((level: number): BossConfig => {
    const bossIndex = (level - 1) % bosses.length;
    const boss = bosses[bossIndex];

    // Scala il boss in base al livello
    return {
      ...boss,
      level,
      health: boss.health + (level - 1) * 20,
      speed: boss.speed + (level - 1) * 0.2,
      damage: boss.damage + Math.floor((level - 1) / 2),
    };
  }, []);

  const spawnBoss = useCallback((level: number) => {
    const boss = getBossForLevel(level);
    setCurrentBoss(boss);
    setBossDefeated(false);
  }, [getBossForLevel]);

  const defeatBoss = useCallback(() => {
    setBossDefeated(true);
  }, []);

  const nextLevel = useCallback(() => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    spawnBoss(newLevel);
  }, [currentLevel, spawnBoss]);

  const getCurrentBiome = useCallback((): BiomeType => {
    return getBiomeByLevel(currentLevel);
  }, [currentLevel]);

  return {
    currentLevel,
    setCurrentLevel,
    currentBoss,
    bossDefeated,
    calculateLevel,
    getBossForLevel,
    spawnBoss,
    defeatBoss,
    nextLevel,
    getCurrentBiome,
  };
}
