import { BiomeType, BlockType, UpgradeType, ConsumableType } from "./types";

export const CELL_SIZE_PX = 40; // Increased for better detail
export const VIEWPORT_WIDTH_CELLS = 16;
export const GROWTH_THRESHOLD = 3;
export const CHUNK_SIZE = 16; // 16x16 blocks per chunk
export const MAX_ITEMS_ON_SCREEN = 40;

export const INITIAL_SNAKE_LENGTH = 3;
export const INITIAL_HEALTH = 100;
export const BOSS_SPAWN_SCORE = 500;

// Colors for Canvas Rendering (Base Tones)
export const BIOME_COLORS: Record<BiomeType, string> = {
  [BiomeType.GRASSLAND]: '#1b261b', // Deep organic dark green
  [BiomeType.DESERT]: '#2b2015', // Dark scorched sand
  [BiomeType.TUNDRA]: '#151b26', // Deep frozen blue
  [BiomeType.OBSIDIAN_WASTE]: '#0a0a0a', // Void black
};

// Richer palettes for 2.5D rendering
export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.EMPTY]: 'transparent',
  [BlockType.DIRT]: '#5d4037', // Deep Brown
  [BlockType.GOLD]: '#ffd700', // Gold
  [BlockType.STONE]: '#546e7a', // Blue-Grey Stone
  [BlockType.BEDROCK]: '#263238', // Dark Slate
  [BlockType.LAVA]: '#d32f2f', // Magma Red
  [BlockType.MAGMA]: '#e65100', // Magma Orange (Crusty)
  [BlockType.ICE]: '#81d4fa', // Ice Blue
  [BlockType.TRAP]: '#424242', // Dark Metal
  [BlockType.POWERUP_BOX]: '#ab47bc', // Purple Magic
  [BlockType.EVENT]: '#ffffff',
};

// Skins
export const SKINS = [
  { id: 'classic', name: 'Classic Green', color: '#4caf50', price: 0 },
  { id: 'neon', name: 'Futuristic Neon', color: '#00e5ff', price: 500 },
  { id: 'fantasy', name: 'Magic Dragon', color: '#d500f9', price: 1000 },
  { id: 'retro', name: 'Pixel Retro', color: '#bdbdbd', price: 1500 },
  { id: 'horror', name: 'Cartoon Horror', color: '#ff1744', price: 2000 },
  { id: 'scifi_nature', name: 'Eco Mech', color: '#00e676', price: 2500 },
];

export const BACKGROUNDS = [
  { id: 'default', name: 'Dark Grid', class: 'bg-gray-950', price: 0 },
  { id: 'neon_world', name: 'Neon City', class: 'bg-slate-900', price: 500 },
  { id: 'fantasy_world', name: 'Magic Forest', class: 'bg-indigo-950', price: 1000 },
  { id: 'retro_world', name: 'Retro CRT', class: 'bg-stone-800', price: 1500 },
  { id: 'horror_world', name: 'Haunted Manor', class: 'bg-red-950', price: 2000 },
  { id: 'scifi_nature_world', name: 'Crystal Planet', class: 'bg-teal-950', price: 2500 },
];

// --- RPG UPGRADES ---
export const UPGRADES = [
  { 
    id: UpgradeType.MAGNET, 
    name: 'Void Magnet', 
    desc: 'Increases item pickup range.', 
    maxLevel: 5, 
    basePrice: 200, 
    priceMult: 1.5 
  },
  { 
    id: UpgradeType.GREED, 
    name: 'Choco Greed', 
    desc: 'Bonus score per chocolate eaten.', 
    maxLevel: 5, 
    basePrice: 300, 
    priceMult: 1.8 
  },
  { 
    id: UpgradeType.IRON_SCALE, 
    name: 'Iron Scales', 
    desc: 'Reduces damage from traps & walls.', 
    maxLevel: 3, 
    basePrice: 500, 
    priceMult: 2.0 
  },
  { 
    id: UpgradeType.LUCKY_FIND, 
    name: 'Treasure Hunter', 
    desc: 'Gold spawns more frequently.', 
    maxLevel: 3, 
    basePrice: 400, 
    priceMult: 1.6 
  },
  { 
    id: UpgradeType.EXTENDED_POWER, 
    name: 'Battery Pack', 
    desc: 'Power-ups last 20% longer per level.', 
    maxLevel: 5, 
    basePrice: 250, 
    priceMult: 1.5 
  },
];

export const CONSUMABLES = [
  {
    id: ConsumableType.HEAD_START,
    name: 'Head Start',
    desc: 'Start the game with length 10.',
    price: 100
  },
  {
    id: ConsumableType.SCORE_BOOSTER,
    name: 'Score Booster',
    desc: '2x Points for the first 60 seconds.',
    price: 150
  }
];

export const BLOCK_STYLES: Record<BlockType, string> = {
  [BlockType.EMPTY]: 'bg-transparent',
  [BlockType.DIRT]: 'bg-amber-800',
  [BlockType.GOLD]: 'bg-yellow-400',
  [BlockType.STONE]: 'bg-stone-500',
  [BlockType.BEDROCK]: 'bg-slate-900',
  [BlockType.LAVA]: 'bg-red-500',
  [BlockType.MAGMA]: 'bg-orange-700',
  [BlockType.ICE]: 'bg-cyan-200',
  [BlockType.TRAP]: 'bg-zinc-800',
  [BlockType.POWERUP_BOX]: 'bg-fuchsia-500',
  [BlockType.EVENT]: 'bg-white',
};

export const getLevelConfig = (level: number) => {
  const baseTypes = ['GOLEM', 'CYBER_WORM', 'PUMPKIN_KING', 'SHADOW', 'PHOENIX'];
  const baseNames = ["Grasslands", "Neon City", "Haunted Manor", "Crystal Planet", "Nether Core"];
  
  const index = (level - 1) % baseTypes.length;
  const cycle = Math.floor((level - 1) / baseTypes.length);

  const wallFreq = Math.min(0.20, 0.04 + (cycle * 0.015) + (index * 0.01));
  const lavaFreq = Math.min(0.08, (cycle * 0.008) + (index * 0.005));
  
  // Boss scaling: HP and damage increase with level
  const bossHpBase = 200;
  const bossHp = Math.floor(bossHpBase + (level * 50) + (cycle * 100));
  const bossDamageMultiplier = 1 + (cycle * 0.2);

  return {
    level: level,
    name: `${baseNames[index]} ${cycle > 0 ? `(Tier ${cycle + 1})` : ''}`,
    wallFrequency: wallFreq,
    lavaFrequency: lavaFreq,
    bossType: baseTypes[index],
    bossHp: bossHp,
    bossDamageMultiplier: bossDamageMultiplier
  };
};