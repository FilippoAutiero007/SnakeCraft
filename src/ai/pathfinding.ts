import { BlockType } from '../types';

/**
 * Simple pathfinding that moves the entity towards the target while avoiding obstacles
 * @param currentX Current X position
 * @param currentY Current Y position
 * @param targetX Target X position
 * @param targetY Target Y position
 * @param worldMap Map of the world blocks
 * @returns Next position {x, y}
 */
export const getSmartMove = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  worldMap: Map<string, BlockType>
): { x: number; y: number } => {
  const speed = 0.08; // Movement speed
  
  // Calculate direction to target
  const dx = targetX - currentX;
  const dy = targetY - currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) {
    return { x: currentX, y: currentY };
  }
  
  // Normalize direction
  const ndx = dx / distance;
  const ndy = dy / distance;
  
  // Try to move directly towards target
  let nextX = currentX + ndx * speed;
  let nextY = currentY + ndy * speed;
  
  // Check if the next position would collide with bedrock
  const checkKey = `${Math.floor(nextX)},${Math.floor(nextY)}`;
  const blockAtNext = worldMap.get(checkKey);
  
  // If we hit bedrock, try alternative paths
  if (blockAtNext === BlockType.BEDROCK) {
    // Try moving only in X direction
    const tryX = currentX + ndx * speed;
    const keyX = `${Math.floor(tryX)},${Math.floor(currentY)}`;
    const blockX = worldMap.get(keyX);
    
    if (blockX !== BlockType.BEDROCK) {
      nextX = tryX;
      nextY = currentY;
    } else {
      // Try moving only in Y direction
      const tryY = currentY + ndy * speed;
      const keyY = `${Math.floor(currentX)},${Math.floor(tryY)}`;
      const blockY = worldMap.get(keyY);
      
      if (blockY !== BlockType.BEDROCK) {
        nextX = currentX;
        nextY = tryY;
      } else {
        // If both fail, try perpendicular movement
        const perpX = currentX + ndy * speed; // Use y direction for x
        const perpY = currentY + ndx * speed; // Use x direction for y
        const keyPerp = `${Math.floor(perpX)},${Math.floor(perpY)}`;
        const blockPerp = worldMap.get(keyPerp);
        
        if (blockPerp !== BlockType.BEDROCK) {
          nextX = perpX;
          nextY = perpY;
        } else {
          // Stay in place if all directions blocked
          nextX = currentX;
          nextY = currentY;
        }
      }
    }
  }
  
  return { x: nextX, y: nextY };
};
