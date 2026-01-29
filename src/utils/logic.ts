
import { BiomeType, BlockType } from '../types';
import { getLevelConfig, CHUNK_SIZE } from '../constants';

// --- MATH HELPERS ---

// Pseudo-random noise generator (Deterministic based on coordinates)
export const pseudoRandom = (x: number, y: number) => {
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

// --- BIOME LOGIC ---

export const getBiome = (x: number, y: number, isTutorial: boolean): BiomeType => {
  if (isTutorial) return BiomeType.GRASSLAND;
  
  const dist = Math.sqrt(x*x + y*y);
  if (dist < 150) return BiomeType.GRASSLAND;
  if (dist < 400) return BiomeType.DESERT;
  if (dist < 800) return BiomeType.TUNDRA;
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

  // --- FORCED FEATURES ---
  // Guaranteed Starter Lava Pool (Custom "Melting Splat" Shape)
  const dx = x - 14;
  const dy = y - 4;

  const inBlob = (dx*dx + dy*dy*0.9 < 16); 
  const isLeftEye = (Math.abs(dx + 1.5) < 0.6 && Math.abs(dy + 1) < 0.6); 
  const isRightEye = (Math.abs(dx - 1.5) < 0.6 && Math.abs(dy + 1) < 0.6); 
  const isMouth = (Math.abs(dx) < 1.5 && Math.abs(dy - 2) < 0.8); 
  const isDrip = (dx*dx*4 + (dy-5.5)*(dy-5.5) < 3); 

  if ((inBlob && !isLeftEye && !isRightEye && !isMouth) || isDrip) {
      const edgeCheck = (dx*dx + dy*dy*0.9);
      if (edgeCheck > 12 && edgeCheck < 16) return BlockType.MAGMA;
      return BlockType.LAVA;
  }

  const biome = getBiome(x, y, isTutorial);
  const rand = pseudoRandom(x, y); 
  const config = getLevelConfig(level);

  // --- A. WALL GENERATION (Sparse Grid Logic) ---
  const isGridPoint = (Math.abs(x) % 2 === 0) && (Math.abs(y) % 2 === 0);

  if (isGridPoint) {
      const adjustedFreq = (config.wallFrequency || 0.05) * 4.0;
      if (rand < adjustedFreq) {
          if (biome === BiomeType.OBSIDIAN_WASTE) {
              return (rand < (adjustedFreq * 0.2)) ? BlockType.BEDROCK : BlockType.STONE;
          }
          return BlockType.STONE;
      }
  }

  // --- B. HAZARD GENERATION (Organic Lava Pools) ---
  // Prevent lava near spawn area (radius ~15 blocks from origin)
  const distanceFromSpawn = Math.sqrt(x * x + y * y);
  const safeZoneRadius = 20;
  
  if (biome === BiomeType.GRASSLAND || biome === BiomeType.OBSIDIAN_WASTE) {
      const scale = 0.08; 
      const organicNoise = Math.sin(x * scale) + Math.cos(y * scale * 0.9) + Math.sin((x * 0.5 + y * 0.5) * scale) * 0.5;
      const magmaPresenceNoise = Math.sin(x * 0.02) + Math.cos(y * 0.02);
      const hasMagmaRing = magmaPresenceNoise > 0.7; 

      let lavaThreshold = 10.0;
      let magmaThreshold = 10.0;

      if (biome === BiomeType.GRASSLAND) {
          lavaThreshold = 2.6;  // Increased from 2.4 to make lava rarer
          magmaThreshold = 2.45; 
      } else if (biome === BiomeType.OBSIDIAN_WASTE) {
          lavaThreshold = 1.0;  // Increased from 0.8
          magmaThreshold = 0.9; 
      }

      // Only spawn lava/magma outside safe zone
      if (distanceFromSpawn > safeZoneRadius) {
          if (organicNoise > lavaThreshold) {
              return BlockType.LAVA;
          } else if (organicNoise > magmaThreshold && hasMagmaRing) {
              return BlockType.MAGMA;
          }
      }
  }

  if (biome === BiomeType.TUNDRA) {
      const iceNoise = Math.cos(x * 0.2) + Math.sin(y * 0.2);
      if (iceNoise > 0.8) return BlockType.ICE;
  }

  // Desert traps (quicksand)
  if (biome === BiomeType.DESERT) {
      const trapNoise = Math.sin(x * 0.15) + Math.cos(y * 0.15);
      if (trapNoise > 1.5 && distanceFromSpawn > safeZoneRadius) {
          return BlockType.TRAP;
      }
  }

  return BlockType.EMPTY;
};

// --- ITEM SPAWNING LOGIC ---

export const getItemToSpawn = (level: number, biome: BiomeType): BlockType => {
    const rand = Math.random();
    
    // Biome affects spawn rates
    let dirtChance = 0.76;
    let goldChance = 0.90;
    
    if (biome === BiomeType.DESERT) {
        // More gold in desert
        goldChance = 0.85;
    } else if (biome === BiomeType.OBSIDIAN_WASTE) {
        // More power-ups in dangerous areas
        goldChance = 0.88;
    }
    
    if (rand < dirtChance) return BlockType.DIRT;
    else if (rand < goldChance) return BlockType.GOLD;
    else return BlockType.POWERUP_BOX;
};

// Get biome environmental effects
export const getBiomeEffect = (biome: BiomeType): { type: string; value: number } | null => {
    switch (biome) {
        case BiomeType.DESERT:
            return { type: 'heat', value: 2 }; // Gradual damage
        case BiomeType.TUNDRA:
            return { type: 'cold', value: 0.8 }; // Slower movement
        case BiomeType.OBSIDIAN_WASTE:
            return { type: 'toxic', value: 3 }; // Higher damage
        default:
            return null;
    }
};
