
import { BiomeType, BlockType } from '../types';
import { getLevelConfig, CHUNK_SIZE } from '../constants';

// --- MATH HELPERS ---

// Pseudo-random noise generator (Deterministic based on coordinates)
const pseudoRandom = (x: number, y: number) => {
  let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
};

// Helper to get Chunk Coordinates
export const getChunkCoords = (x: number, y: number) => {
  return {
    cx: Math.floor(x / CHUNK_SIZE),
    cy: Math.floor(y / CHUNK_SIZE)
  };
};

export const getChunkKey = (cx: number, cy: number) => `${cx},${cy}`;

// --- BIOME LOGIC (Improved for infinite world) ---

export const getBiome = (x: number, y: number, isTutorial: boolean): BiomeType => {
  if (isTutorial) return BiomeType.GRASSLAND;
  
  // Use chunk-based biome generation for consistency
  const { cx, cy } = getChunkCoords(x, y);
  const hash = (cx * 374761393 + cy * 668265263) & 0x7fffffff;
  const biomeValue = hash % 100;
  
  if (biomeValue < 40) return BiomeType.GRASSLAND;
  if (biomeValue < 65) return BiomeType.DESERT;
  if (biomeValue < 85) return BiomeType.TUNDRA;
  return BiomeType.OBSIDIAN_WASTE;
};

// --- TERRAIN GENERATION ---

export const generateBlock = (
  x: number, 
  y: number, 
  level: number, 
  isTutorial: boolean, 
  worldMap: Map<string, BlockType>
): BlockType => {
  const key = `${x},${y}`;
  
  if (worldMap.has(key)) return worldMap.get(key)!;
  if (isTutorial) return BlockType.EMPTY; 
  
  // Spawn Safety: Clear area around (0,0)
  if (Math.abs(x) < 8 && Math.abs(y) < 8) return BlockType.EMPTY;

  const biome = getBiome(x, y, isTutorial);
  const rand = pseudoRandom(x, y); 
  const config = getLevelConfig(level);

  // --- A. WALL GENERATION (Sparse Grid Logic) ---
  const isGridPoint = (Math.abs(x) % 3 === 0) && (Math.abs(y) % 3 === 0);

  if (isGridPoint) {
      const adjustedFreq = (config.wallFrequency || 0.05) * 3.5;
      if (rand < adjustedFreq) {
          if (biome === BiomeType.OBSIDIAN_WASTE) {
              return (rand < (adjustedFreq * 0.15)) ? BlockType.BEDROCK : BlockType.STONE;
          }
          return BlockType.STONE;
      }
  }

  // --- B. HAZARD GENERATION (Biome-specific) ---
  
  // LAVA - Only in DESERT biome
  if (biome === BiomeType.DESERT) {
      const scale = 0.08; 
      const organicNoise = Math.sin(x * scale) + Math.cos(y * scale * 0.9) + Math.sin((x * 0.5 + y * 0.5) * scale) * 0.5;
      const lavaThreshold = 2.3;
      const magmaThreshold = 2.15;
      
      if (organicNoise > lavaThreshold) {
          return BlockType.LAVA;
      } else if (organicNoise > magmaThreshold) {
          return BlockType.MAGMA;
      }
  }

  // ICE - Only in TUNDRA biome
  if (biome === BiomeType.TUNDRA) {
      const iceNoise = Math.cos(x * 0.15) + Math.sin(y * 0.15);
      if (iceNoise > 1.2) return BlockType.ICE;
  }
  
  // MAGMA - Only in OBSIDIAN_WASTE biome
  if (biome === BiomeType.OBSIDIAN_WASTE) {
      const magmaNoise = Math.sin(x * 0.1) + Math.cos(y * 0.1);
      if (magmaNoise > 1.5) return BlockType.MAGMA;
  }

  return BlockType.EMPTY;
};

// --- ITEM SPAWNING LOGIC ---

export const getItemToSpawn = (level: number, biome: BiomeType): BlockType => {
    const rand = Math.random();
    
    // Lava power-ups can only spawn in DESERT biome
    // Ice blocks can only spawn in TUNDRA biome
    
    // 70% Chocolate, 15% Gold, 15% PowerUp
    if (rand < 0.70) return BlockType.DIRT;
    else if (rand < 0.85) return BlockType.GOLD;
    else return BlockType.POWERUP_BOX;
};
