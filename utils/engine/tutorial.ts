
import { BlockType, Direction, Coordinate, PowerUpType } from '../../types';

interface TutorialUpdate {
  nextStep?: number;
  nextTarget?: Coordinate | null;
  mapUpdates?: { key: string, type: BlockType }[];
}

export const processTutorialStep = (
  step: number,
  head: Coordinate,
  direction: Direction,
  worldMap: Map<string, BlockType>,
  activePowerUp: PowerUpType,
  currentTarget: Coordinate | null
): TutorialUpdate | null => {
  const updates: TutorialUpdate = {};
  let changed = false;

  // Step 0: Move Initial
  if (step === 0) {
    if (head.x !== 0 || head.y !== 0) {
      const tx = head.x + (direction === Direction.LEFT ? -5 : 5);
      updates.nextStep = 1;
      updates.nextTarget = { x: tx, y: head.y };
      updates.mapUpdates = [{ key: `${tx},${head.y}`, type: BlockType.DIRT }];
      changed = true;
    }
  } 
  // Step 1: Eat Dirt
  else if (step === 1) {
    if (currentTarget && !worldMap.has(`${currentTarget.x},${currentTarget.y}`)) {
      updates.nextStep = 2;
      updates.nextTarget = { x: head.x + 5, y: head.y + 2 };
      updates.mapUpdates = [{ key: `${head.x + 5},${head.y + 2}`, type: BlockType.GOLD }];
      changed = true;
    }
  } 
  // Step 2: Eat Gold
  else if (step === 2) {
    if (currentTarget && !worldMap.has(`${currentTarget.x},${currentTarget.y}`)) {
      updates.nextStep = 3;
      updates.nextTarget = { x: head.x + 5, y: head.y - 2 };
      updates.mapUpdates = [{ key: `${head.x + 5},${head.y - 2}`, type: BlockType.POWERUP_BOX }];
      changed = true;
    }
  } 
  // Step 3: Get Powerup
  else if (step === 3) {
    if (activePowerUp !== PowerUpType.NONE) {
      updates.nextStep = 4;
      updates.nextTarget = null;
      
      const dx = direction === Direction.RIGHT ? 1 : direction === Direction.LEFT ? -1 : 0;
      const dy = direction === Direction.DOWN ? 1 : direction === Direction.UP ? -1 : 0;
      const fx = dx === 0 && dy === 0 ? 1 : dx;
      const wallDist = 4;
      
      const newBlocks: { key: string, type: BlockType }[] = [];
      // Build a small wall to destroy
      for(let i=-1; i<=1; i++) {
          const ox = dy === 0 ? 0 : i;
          const oy = fx === 0 ? 0 : i;
          newBlocks.push({ 
            key: `${head.x + (fx * wallDist) + ox},${head.y + (dy * wallDist) + oy}`, 
            type: BlockType.STONE 
          });
      }
      updates.mapUpdates = newBlocks;
      changed = true;
    }
  }

  return changed ? updates : null;
};
