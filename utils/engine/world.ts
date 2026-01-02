import { BlockType, UpgradeType, SnakeSegment, BiomeType } from '../../types';
import { getChunkCoords, getChunkKey, generateBlock, getItemToSpawn, getBiome } from '../logic';
import { CHUNK_SIZE } from '../../constants';

export const spawnItemNearPlayer = (state: any, config: any) => {
    const head = state.snake.current[0];
    const range = 18;
    const map = state.worldMap.current;

    for(let attempts = 0; attempts < 15; attempts++) {
        const rx = Math.floor(head.x + (Math.random() * range * 2) - range);
        const ry = Math.floor(head.y + (Math.random() * range * 2) - range);
        if (Math.abs(rx - head.x) < 5 && Math.abs(ry - head.y) < 5) continue;
        if (map.has(`${rx},${ry}`)) continue;

        const terrain = generateBlock(rx, ry, config.level, config.isTutorial, map);
        if (terrain === BlockType.EMPTY) {
            const biome = getBiome(rx, ry, config.isTutorial);
            let itemType = getItemToSpawn(config.level, biome);
            if ((config.upgrades[UpgradeType.LUCKY_FIND] || 0) > 0 && itemType === BlockType.DIRT && Math.random() < 0.1) {
                   itemType = BlockType.GOLD;
            }
            map.set(`${rx},${ry}`, itemType);
            state.itemCount.current++;
            return;
        }
    }
};

export const manageWorld = (state: any, config: any, head: SnakeSegment) => {
    const { cx, cy } = getChunkCoords(head.x, head.y);
    const currentTime = Date.now();
    
    // Chunk Loading
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
         const key = getChunkKey(cx + dx, cy + dy);
         state.chunkLastVisited.current.set(key, currentTime);
         state.activeChunks.current.add(key);
      }
    }

    if (config.isTutorial) return;

    // Item Cleanup (Cleanup items that are very far, fallback)
    if (state.frame.current % 15 === 0) {
        for (const [key, type] of state.worldMap.current.entries()) {
            if ([BlockType.DIRT, BlockType.GOLD].includes(type as any)) {
                 const [ix, iy] = key.split(',').map(Number);
                 if (Math.sqrt((ix - head.x)**2 + (iy - head.y)**2) > 24) {
                     state.worldMap.current.delete(key);
                     state.itemCount.current--;
                 }
            }
        }
    }

    // Chunk Unloading & Garbage Collection
    if (state.frame.current % 60 === 0) {
        for (const [key, last] of state.chunkLastVisited.current.entries()) {
           if (currentTime - last > 10000) { // 10 seconds of inactivity
              state.activeChunks.current.delete(key);
              state.chunkLastVisited.current.delete(key); 
              
              const [chunkX, chunkY] = key.split(',').map(Number);
              const startX = chunkX * CHUNK_SIZE;
              const startY = chunkY * CHUNK_SIZE;

              let clearedCount = 0;
              // Clean up blocks within this chunk to free memory
              for(let y = 0; y < CHUNK_SIZE; y++) {
                  for(let x = 0; x < CHUNK_SIZE; x++) {
                      const blockKey = `${startX + x},${startY + y}`;
                      const type = state.worldMap.current.get(blockKey);
                      
                      if (type) {
                          // Clean up stats if removing an active item
                          if ([BlockType.DIRT, BlockType.GOLD, BlockType.POWERUP_BOX].includes(type)) {
                              state.itemCount.current = Math.max(0, state.itemCount.current - 1);
                          }
                          state.worldMap.current.delete(blockKey);
                          clearedCount++;
                      }
                  }
              }
              if (clearedCount > 0) {
                  // console.debug(`[GC] Cleaned chunk ${key}: ${clearedCount} blocks removed.`);
              }
           }
        }
    }
};