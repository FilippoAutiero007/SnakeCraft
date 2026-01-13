import { BlockType, BiomeType } from '../types';
import { CHUNK_SIZE } from '../constants';

export interface Chunk {
  x: number; // Chunk coordinate (not world coordinate)
  z: number;
  blocks: Map<string, BlockType>;
  biome: BiomeType;
  lastAccessed: number;
}

export class ChunkManager {
  private chunks: Map<string, Chunk> = new Map();
  private readonly renderDistance: number = 3; // Chunks in each direction
  private readonly unloadDistance: number = 5; // Chunks to keep before unloading
  
  constructor() {}

  private getChunkKey(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`;
  }

  private worldToChunk(worldX: number, worldZ: number): { chunkX: number; chunkZ: number } {
    return {
      chunkX: Math.floor(worldX / CHUNK_SIZE),
      chunkZ: Math.floor(worldZ / CHUNK_SIZE)
    };
  }

  private getBiomeForChunk(chunkX: number, chunkZ: number): BiomeType {
    // Simple biome generation based on chunk coordinates
    const hash = (chunkX * 374761393 + chunkZ * 668265263) & 0x7fffffff;
    const biomeValue = hash % 100;
    
    if (biomeValue < 40) return BiomeType.GRASSLAND;
    if (biomeValue < 65) return BiomeType.DESERT;
    if (biomeValue < 85) return BiomeType.TUNDRA;
    return BiomeType.OBSIDIAN_WASTE;
  }

  private generateChunk(chunkX: number, chunkZ: number, level: number): Chunk {
    const biome = this.getBiomeForChunk(chunkX, chunkZ);
    const blocks = new Map<string, BlockType>();
    
    // Generate blocks for this chunk based on biome and level
    const wallFreq = Math.min(0.15, 0.04 + (level * 0.01));
    const goldFreq = 0.02 + (level * 0.005);
    const powerUpFreq = 0.01;
    
    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      for (let localZ = 0; localZ < CHUNK_SIZE; localZ++) {
        const worldX = chunkX * CHUNK_SIZE + localX;
        const worldZ = chunkZ * CHUNK_SIZE + localZ;
        const key = `${worldX},${worldZ}`;
        
        // Seeded random based on world position
        const seed = (worldX * 374761393 + worldZ * 668265263) & 0x7fffffff;
        const random = (seed % 10000) / 10000;
        
        // Generate blocks based on biome
        if (random < wallFreq) {
          blocks.set(key, BlockType.STONE);
        } else if (random < wallFreq + goldFreq) {
          blocks.set(key, BlockType.GOLD);
        } else if (random < wallFreq + goldFreq + powerUpFreq) {
          blocks.set(key, BlockType.POWERUP_BOX);
        } else if (random < wallFreq + goldFreq + powerUpFreq + 0.03) {
          blocks.set(key, BlockType.DIRT);
        }
        
        // Biome-specific blocks
        if (biome === BiomeType.DESERT && random > 0.95) {
          blocks.set(key, BlockType.LAVA);
        } else if (biome === BiomeType.TUNDRA && random > 0.92) {
          blocks.set(key, BlockType.ICE);
        } else if (biome === BiomeType.OBSIDIAN_WASTE && random > 0.90) {
          blocks.set(key, BlockType.MAGMA);
        }
      }
    }
    
    return {
      x: chunkX,
      z: chunkZ,
      blocks,
      biome,
      lastAccessed: Date.now()
    };
  }

  public loadChunksAroundPlayer(playerX: number, playerZ: number, level: number): void {
    const { chunkX: centerChunkX, chunkZ: centerChunkZ } = this.worldToChunk(playerX, playerZ);
    
    // Load chunks within render distance
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const chunkX = centerChunkX + dx;
        const chunkZ = centerChunkZ + dz;
        const key = this.getChunkKey(chunkX, chunkZ);
        
        if (!this.chunks.has(key)) {
          const chunk = this.generateChunk(chunkX, chunkZ, level);
          this.chunks.set(key, chunk);
        } else {
          // Update last accessed time
          const chunk = this.chunks.get(key)!;
          chunk.lastAccessed = Date.now();
        }
      }
    }
    
    // Unload distant chunks
    const chunksToUnload: string[] = [];
    this.chunks.forEach((chunk, key) => {
      const distance = Math.max(
        Math.abs(chunk.x - centerChunkX),
        Math.abs(chunk.z - centerChunkZ)
      );
      
      if (distance > this.unloadDistance) {
        chunksToUnload.push(key);
      }
    });
    
    chunksToUnload.forEach(key => this.chunks.delete(key));
  }

  public getBlockAt(worldX: number, worldZ: number): BlockType | null {
    const { chunkX, chunkZ } = this.worldToChunk(worldX, worldZ);
    const key = this.getChunkKey(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    
    if (!chunk) return null;
    
    const blockKey = `${worldX},${worldZ}`;
    return chunk.blocks.get(blockKey) || BlockType.EMPTY;
  }

  public setBlockAt(worldX: number, worldZ: number, blockType: BlockType): void {
    const { chunkX, chunkZ } = this.worldToChunk(worldX, worldZ);
    const key = this.getChunkKey(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    
    if (!chunk) return;
    
    const blockKey = `${worldX},${worldZ}`;
    if (blockType === BlockType.EMPTY) {
      chunk.blocks.delete(blockKey);
    } else {
      chunk.blocks.set(blockKey, blockType);
    }
  }

  public removeBlockAt(worldX: number, worldZ: number): void {
    this.setBlockAt(worldX, worldZ, BlockType.EMPTY);
  }

  public getBiomeAt(worldX: number, worldZ: number): BiomeType {
    const { chunkX, chunkZ } = this.worldToChunk(worldX, worldZ);
    const key = this.getChunkKey(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    
    return chunk ? chunk.biome : this.getBiomeForChunk(chunkX, chunkZ);
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
  }
}
