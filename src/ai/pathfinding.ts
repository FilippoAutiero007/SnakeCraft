/**
 * A* Pathfinding Module for Boss AI
 * 
 * Implements efficient A* pathfinding to prevent bosses from getting stuck in walls
 * Optimized for real-time performance at 60 FPS
 */

import { BlockType } from '../../types';

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

/**
 * Manhattan distance heuristic (faster than Euclidean for grid-based movement)
 */
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Check if a position is walkable (not a wall or solid obstacle)
 */
function isWalkable(
  x: number, 
  y: number, 
  worldMap: Map<string, BlockType>
): boolean {
  const key = `${Math.floor(x)},${Math.floor(y)}`;
  const blockType = worldMap.get(key);
  
  // Boss can't walk through solid blocks
  return blockType !== BlockType.STONE && 
         blockType !== BlockType.BEDROCK;
}

/**
 * Find path from start to goal using A* algorithm
 * 
 * @param startX Starting X coordinate
 * @param startY Starting Y coordinate  
 * @param goalX Goal X coordinate
 * @param goalY Goal Y coordinate
 * @param worldMap Current world map
 * @param maxIterations Safety limit to prevent infinite loops (default 200)
 * @returns Array of positions [{x, y}] or null if no path found
 */
export function findPath(
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  worldMap: Map<string, BlockType>,
  maxIterations: number = 200
): { x: number; y: number }[] | null {
  
  // Round coordinates to integers for grid-based pathfinding
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  const gx = Math.floor(goalX);
  const gy = Math.floor(goalY);
  
  // Early exit if start == goal
  if (sx === gx && sy === gy) return [];
  
  // Early exit if goal is unreachable
  if (!isWalkable(gx, gy, worldMap)) return null;
  
  const openSet = new Map<string, PathNode>();
  const closedSet = new Set<string>();
  
  const startNode: PathNode = {
    x: sx,
    y: sy,
    g: 0,
    h: heuristic(sx, sy, gx, gy),
    f: heuristic(sx, sy, gx, gy),
    parent: null
  };
  
  openSet.set(`${sx},${sy}`, startNode);
  
  let iterations = 0;
  
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score
    let currentNode: PathNode | null = null;
    let lowestF = Infinity;
    
    openSet.forEach(node => {
      if (node.f < lowestF) {
        lowestF = node.f;
        currentNode = node;
      }
    });
    
    if (!currentNode) break;
    
    const currentKey = `${currentNode.x},${currentNode.y}`;
    
    // Found goal!
    if (currentNode.x === gx && currentNode.y === gy) {
      return reconstructPath(currentNode);
    }
    
    openSet.delete(currentKey);
    closedSet.add(currentKey);
    
    // Check all 4 neighbors (up, down, left, right)
    const neighbors = [
      { x: currentNode.x, y: currentNode.y - 1 }, // Up
      { x: currentNode.x, y: currentNode.y + 1 }, // Down
      { x: currentNode.x - 1, y: currentNode.y }, // Left
      { x: currentNode.x + 1, y: currentNode.y }, // Right
    ];
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      // Skip if already evaluated
      if (closedSet.has(neighborKey)) continue;
      
      // Skip if not walkable
      if (!isWalkable(neighbor.x, neighbor.y, worldMap)) continue;
      
      const g = currentNode.g + 1;
      const h = heuristic(neighbor.x, neighbor.y, gx, gy);
      const f = g + h;
      
      const existingNode = openSet.get(neighborKey);
      
      if (!existingNode || g < existingNode.g) {
        const newNode: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: currentNode
        };
        openSet.set(neighborKey, newNode);
      }
    }
  }
  
  // No path found
  return null;
}

/**
 * Reconstruct path from goal node to start node
 */
function reconstructPath(goalNode: PathNode): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let current: PathNode | null = goalNode;
  
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  
  return path;
}

/**
 * Simplified pathfinding: just get next step towards goal
 * Much faster for real-time AI (single step instead of full path)
 */
export function getNextStep(
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  worldMap: Map<string, BlockType>
): { x: number; y: number } | null {
  
  const path = findPath(startX, startY, goalX, goalY, worldMap, 50);
  
  if (!path || path.length < 2) return null;
  
  // Return first step (second element, since first is current position)
  return path[1];
}

/**
 * Simple obstacle avoidance: try moving towards goal, if blocked try alternate directions
 * Faster than full A* for simple scenarios
 */
export function getSmartMove(
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  worldMap: Map<string, BlockType>
): { x: number; y: number } {
  
  const dx = targetX - currentX;
  const dy = targetY - targetY;
  
  // Determine primary direction
  const primaryX = Math.abs(dx) > Math.abs(dy);
  
  // Try primary direction first
  if (primaryX) {
    const nextX = currentX + Math.sign(dx);
    if (isWalkable(nextX, currentY, worldMap)) {
      return { x: nextX, y: currentY };
    }
  } else {
    const nextY = currentY + Math.sign(dy);
    if (isWalkable(currentX, nextY, worldMap)) {
      return { x: currentX, y: nextY };
    }
  }
  
  // Try secondary direction
  if (primaryX) {
    const nextY = currentY + Math.sign(dy);
    if (isWalkable(currentX, nextY, worldMap)) {
      return { x: currentX, y: nextY };
    }
  } else {
    const nextX = currentX + Math.sign(dx);
    if (isWalkable(nextX, currentY, worldMap)) {
      return { x: nextX, y: currentY };
    }
  }
  
  // Try all 4 directions as fallback
  const directions = [
    { x: currentX + 1, y: currentY },
    { x: currentX - 1, y: currentY },
    { x: currentX, y: currentY + 1 },
    { x: currentX, y: currentY - 1 }
  ];
  
  for (const dir of directions) {
    if (isWalkable(dir.x, dir.y, worldMap)) {
      return dir;
    }
  }
  
  // Stuck! Stay in place
  return { x: currentX, y: currentY };
}
