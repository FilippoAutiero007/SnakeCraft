
import { BlockType, Boss, Projectile, AoEZone } from '../types';
import { BIOME_COLORS, CELL_SIZE_PX } from '../constants';
import { getBiome, generateBlock } from './gameLogic';
import { drawGrassClump, drawFlowerPatch, drawPond } from './assetDrawer';
import { drawBlock } from './renderBlocks';
import { 
  drawSnakeSegment, drawBossRealistic, drawProjectile, 
  drawAoE, drawBeams, drawStunEffect, drawTutorialTarget 
} from './renderEntities';

// --- HELPER: PSEUDO RANDOM FOR VISUALS ---
const getPseudoRand = (x: number, y: number) => {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
};

interface SceneData {
    width: number;
    height: number;
    headVisual: {x: number, y: number};
    zoom: number;
    worldMap: Map<string, BlockType>;
    level: number;
    isTutorial: boolean;
    frame: number;
    tutorialTarget: {x: number, y: number} | null;
    boss: Boss | null;
    snakeVisual: {x: number, y: number}[];
    currentSkin: string;
    beams: any[];
    projectiles: Projectile[];
    aoeZones: AoEZone[];
    isBurning: boolean;
    isStunned?: boolean;
}

export const renderScene = (ctx: CanvasRenderingContext2D, data: SceneData) => {
    const { width, height, headVisual, zoom, worldMap, level, isTutorial, frame, tutorialTarget, boss, snakeVisual, currentSkin, beams, projectiles, aoeZones, isBurning, isStunned } = data;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-headVisual.x * CELL_SIZE_PX, -headVisual.y * CELL_SIZE_PX);

    const visibleCellsX = Math.ceil((width / zoom) / CELL_SIZE_PX / 2) + 2;
    const visibleCellsY = Math.ceil((height / zoom) / CELL_SIZE_PX / 2) + 2;
    const startX = Math.floor(headVisual.x - visibleCellsX);
    const endX = Math.floor(headVisual.x + visibleCellsX);
    const startY = Math.floor(headVisual.y - visibleCellsY);
    const endY = Math.floor(headVisual.y + visibleCellsY);

    // 1. Terrain & Decor
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const biome = getBiome(x, y, isTutorial);
        ctx.fillStyle = BIOME_COLORS[biome];
        ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX + 1, CELL_SIZE_PX + 1); 

        if (biome === 'GRASSLAND' && !worldMap.has(`${x},${y}`)) {
            const rand = getPseudoRand(x, y);
            if (rand < 0.2) {
                if (rand < 0.08) drawGrassClump(ctx, x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, frame);
                else if (rand < 0.14) drawFlowerPatch(ctx, x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, frame);
                else drawPond(ctx, x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, frame);
            }
        }
      }
    }

    // 2. AoE Zones (Under blocks)
    aoeZones.forEach(zone => drawAoE(ctx, zone, CELL_SIZE_PX));

    // 3. Blocks
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const block = generateBlock(x, y, level, isTutorial, worldMap);
        if (block !== BlockType.EMPTY) {
          drawBlock(ctx, x, y, block, CELL_SIZE_PX, frame, worldMap, level, isTutorial);
        }
      }
    }

    // 4. Entities
    if (isTutorial && tutorialTarget) drawTutorialTarget(ctx, tutorialTarget, CELL_SIZE_PX, frame);
    if (boss) drawBossRealistic(ctx, boss, CELL_SIZE_PX, frame);

    snakeVisual.forEach((seg, i) => {
       drawSnakeSegment(ctx, seg.x, seg.y, CELL_SIZE_PX, i === 0, currentSkin, isBurning, frame);
    });

    if (isStunned && snakeVisual[0]) drawStunEffect(ctx, snakeVisual[0].x, snakeVisual[0].y, CELL_SIZE_PX, frame);
    
    projectiles.forEach(proj => drawProjectile(ctx, proj, CELL_SIZE_PX));
    drawBeams(ctx, beams);

    ctx.restore();

    // 5. Post-Processing Overlays
    const rad = ctx.createRadialGradient(width/2, height/2, height/3, width/2, height/2, height);
    rad.addColorStop(0, 'transparent');
    rad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = rad;
    ctx.fillRect(0,0,width,height);

    if (isBurning) {
        ctx.fillStyle = `rgba(255, 50, 0, ${0.1 + Math.sin(frame*0.1)*0.05})`;
        ctx.fillRect(0,0,width,height);
    }
};
