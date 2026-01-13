/**
 * Optimized Chunk Manager
 * 
 * High-performance chunk management system with:
 * - Minimal memory footprint
 * - Efficient block lookups
 * - Smart caching
 * - Optimized for 60 FPS
 */

import { BlockType, BiomeType } from '../../types';
import { CHUNK_SIZE } from '../../constants';

export interface OptimizedChunk {
  x: number;
  z: number;
  biome: BiomeType;
  blocks: Map<string, BlockType>;
  lastAccessed: number;
  generated: boolean;
}

export class OptimizedChunkManager {
  private chunks: Map<string, OptimizedChunk> = new Map();
  private renderDistance: number = 2; // Reduced from 3 for better performance
  private unloadDistance: number = 4; // Reduced from 5
  private blockCache: Map<string, BlockType> = new Map(); // Fast block lookup cache
  private cacheSize: number = 0;
  private maxCacheSize: number = 1000;
  
  constructor(renderDistance: number = 2) {
    this.renderDistance = renderDistance;
    this.unloadDistance = renderDistance + 2;
  }

  private getChunkKey(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`;
  }

  private worldToChunk(worldX: number, worldZ: number): { chunkX: number; chunkZ: number } {
    // Optimized: Use bitwise operations for division
    return {
      chunkX: worldX >> 4, // Equivalent to Math.floor(worldX / 16)
      chunkZ: worldZ >> 4
    };
  }

  private getBiomeForChunk(chunkX: number, chunkZ: number): BiomeType {
    // Fast biome generation using bitwise operations
    const hash = ((chunkX * 374761393) + (chunkZ * 668265263)) >>> 0;
    const biomeValue = hash % 100;
    
    if (biomeValue < 40) return BiomeType.GRASSLAND;
    if (biomeValue < 65) return BiomeType.DESERT;
    if (biomeValue < 85) return BiomeType.TUNDRA;
    return BiomeType.OBSIDIAN_WASTE;
  }

  private generateChunk(chunkX: number, chunkZ: number, level: number): OptimizedChunk {
    const biome = this.getBiomeForChunk(chunkX, chunkZ);
    const blocks = new Map<string, BlockType>();
    
    // Optimized generation: Only store non-empty blocks
    const wallFreq = Math.min(0.15, 0.04 + (level * 0.01));
    const goldFreq = 0.02 + (level * 0.005);
    const powerUpFreq = 0.01;
    const dirtFreq = 0.03;
    
    const chunkWorldX = chunkX << 4; // chunkX * 16
    const chunkWorldZ = chunkZ << 4;
    
    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      for (let localZ = 0; localZ < CHUNK_SIZE; localZ++) {
        const worldX = chunkWorldX + localX;
        const worldZ = chunkWorldZ + localZ;
        
        // Fast seeded random
        const seed = ((worldX * 374761393) + (worldZ * 668265263)) >>> 0;
        const random = (seed % 10000) / 10000;
        
        let blockType: BlockType | null = null;
        
        // Generate blocks based on frequencies
        if (random < wallFreq) {
          blockType = BlockType.STONE;
        } else if (random < wallFreq + goldFreq) {
          blockType = BlockType.GOLD;
        } else if (random < wallFreq + goldFreq + powerUpFreq) {
          blockType = BlockType.POWERUP_BOX;
        } else if (random < wallFreq + goldFreq + powerUpFreq + dirtFreq) {
          blockType = BlockType.DIRT;
        }
        
        // Biome-specific blocks
        if (biome === BiomeType.DESERT && random > 0.95) {
          blockType = BlockType.LAVA;
        } else if (biome === BiomeType.TUNDRA && random > 0.92) {
          blockType = BlockType.ICE;
        } else if (biome === BiomeType.OBSIDIAN_WASTE && random > 0.90) {
          blockType = BlockType.MAGMA;
        }
        
        // Only store non-empty blocks (memory optimization)
        if (blockType !== null) {
          const key = `${worldX},${worldZ}`;
          blocks.set(key, blockType);
        }
      }
    }
    
    return {
      x: chunkX,
      z: chunkZ,
      blocks,
      biome,
      lastAccessed: Date.now(),
      generated: true
    };
  }

  public loadChunksAroundPlayer(playerX: number, playerZ: number, level: number): void {
    const { chunkX: centerChunkX, chunkZ: centerChunkZ } = this.worldToChunk(playerX, playerZ);
    
    // Load only necessary chunks
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const chunkX = centerChunkX + dx;
        const chunkZ = centerChunkZ + dz;
        const key = this.getChunkKey(chunkX, chunkZ);
        
        if (!this.chunks.has(key)) {
          const chunk = this.generateChunk(chunkX, chunkZ, level);
          this.chunks.set(key, chunk);
        } else {
          this.chunks.get(key)!.lastAccessed = Date.now();
        }
      }
    }
    
    // Aggressive chunk unloading for performance
    const toUnload: string[] = [];
    this.chunks.forEach((chunk, key) => {
      const distance = Math.max(
        Math.abs(chunk.x - centerChunkX),
        Math.abs(chunk.z - centerChunkZ)
      );
      
      if (distance > this.unloadDistance) {
        toUnload.push(key);
      }
    });
    
    // Clear block cache when unloading chunks
    if (toUnload.length > 0) {
      this.blockCache.clear();
      this.cacheSize = 0;
    }
    
    toUnload.forEach(key => this.chunks.delete(key));
  }

  public getBlockAt(worldX: number, worldZ: number): BlockType {
    // Fast cache lookup
    const blockKey = `${worldX},${worldZ}`;
    if (this.blockCache.has(blockKey)) {
      return this.blockCache.get(blockKey)!;
    }
    
    const { chunkX, chunkZ } = this.worldToChunk(worldX, worldZ);
    const chunkKey = this.getChunkKey(chunkX, chunkZ);
    const chunk = this.chunks.get(chunkKey);
    
    if (!chunk) return BlockType.EMPTY;
    
    const blockType = chunk.blocks.get(blockKey) || BlockType.EMPTY;
    
    // Cache the result (with size limit)
    if (this.cacheSize < this.maxCacheSize) {
      this.blockCache.set(blockKey, blockType);
      this.cacheSize++;
    }
    
    return blockType;
  }

  public setBlockAt(worldX: number, worldZ: number, blockType: BlockType): void {
    const { chunkX, chunkZ } = this.worldToChunk(worldX, worldZ);
    const chunkKey = this.getChunkKey(chunkX, chunkZ);
    const chunk = this.chunks.get(chunkKey);
    
    if (!chunk) return;
    
    const blockKey = `${worldX},${worldZ}`;
    
    if (blockType === BlockType.EMPTY) {
      chunk.blocks.delete(blockKey);
    } else {
      chunk.blocks.set(blockKey, blockType);
    }
    
    // Update cache
    if (this.blockCache.has(blockKey)) {
      if (blockType === BlockType.EMPTY) {
        this.blockCache.delete(blockKey);
        this.cacheSize--;
      } else {
        this.blockCache.set(blockKey, blockType);
      }
    }
  }

  public removeBlockAt(worldX: number, worldZ: number): void {
    this.setBlockAt(worldX, worldZ, BlockType.EMPTY);
  }

  public getBiomeAt(worldX: number, worldZ: number): BiomeType {
    const { chunkX, chunkZ } = this.worldToChunk(worldX, worldZ);
    return this.getBiomeForChunk(chunkX, chunkZ);
  }

  public getAllLoadedBlocks(): Map<string, BlockType> {
    const allBlocks = new Map<string, BlockType>();
    
    this.chunks.forEach(chunk => {
      chunk.blocks.forEach((blockType, blockKey) => {
        allBlocks.set(blockKey, blockType);
      });
    });
    
    return allBlocks;
  }

  public getLoadedChunksCount(): number {
    return this.chunks.size;
  }

  public clear(): void {
    this.chunks.clear();
    this.blockCache.clear();
    this.cacheSize = 0;
  }

  public getStats(): { chunks: number; cachedBlocks: number } {
    return {
      chunks: this.chunks.size,
      cachedBlocks: this.cacheSize
    };
  }
}
