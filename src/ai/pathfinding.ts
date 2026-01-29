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

/**
 * A* pathfinding algorithm
 * @param start Starting coordinate
 * @param goal Goal coordinate
 * @param isWalkable Function to check if a cell is walkable
 * @returns Array of coordinates representing the path, or null if no path found
 */
export const findPath = (
  start: { x: number; y: number },
  goal: { x: number; y: number },
  isWalkable: (x: number, y: number) => boolean
): { x: number; y: number }[] | null => {
  const openSet: { x: number; y: number; g: number; h: number; f: number; parent: { x: number; y: number } | null }[] = [];
  const closedSet = new Set<string>();

  const heuristic = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  const startNode = {
    x: Math.floor(start.x),
    y: Math.floor(start.y),
    g: 0,
    h: heuristic(start, goal),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  const maxIterations = 500; // Prevent infinite loops
  let iterations = 0;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    // Check if we reached the goal
    if (Math.abs(current.x - Math.floor(goal.x)) <= 1 && Math.abs(current.y - Math.floor(goal.y)) <= 1) {
      // Reconstruct path
      const path: { x: number; y: number }[] = [];
      let node: typeof current | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent as typeof current | null;
      }
      return path;
    }

    closedSet.add(`${current.x},${current.y}`);

    // Check neighbors (4-directional)
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      
      if (closedSet.has(key)) continue;
      if (!isWalkable(neighbor.x, neighbor.y)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, goal);
      const f = g + h;

      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current
        });
      }
    }
  }

  // No path found
  return null;
};
