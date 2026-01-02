
import { BlockType, UpgradeType, SnakeSegment } from '../types';
import { getChunkCoords, getChunkKey, generateBlock, getItemToSpawn } from './gameLogic';

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
            let itemType = getItemToSpawn(config.level);
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

    // Item Cleanup
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

    // Chunk Unloading
    if (state.frame.current % 60 === 0) {
        for (const [key, last] of state.chunkLastVisited.current.entries()) {
           if (currentTime - last > 5000) {
              state.activeChunks.current.delete(key);
              state.chunkLastVisited.current.delete(key); 
              // Cleanup blocks logic simplified
           }
        }
    }
};
