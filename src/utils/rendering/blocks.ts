
import { BlockType, BiomeType } from '../../types';
import { BLOCK_COLORS } from '../../constants';
import { getBiome } from '../logic';
import { drawHedge } from './assets';
import { drawOptimizedRock } from '../../src/graphics/rock-renderer';

// Asset Caching for Gold and Chocolate
const assetCache = new Map<string, HTMLCanvasElement>();

const drawGoldIngot = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, goldVar: number, goldPoints: number) => {
    const drawSingleIngot = (ix: number, iy: number, iw: number, ih: number) => {
        const topH = ih * 0.4;
        const inset = iw * 0.15;
         
        const bGrad = ctx.createLinearGradient(ix + iw/2, iy + ih, ix + iw/2, iy + topH);
        bGrad.addColorStop(0, '#B8860B'); 
        bGrad.addColorStop(1, '#F0E68C'); 
         
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.moveTo(ix, iy + ih);
        ctx.lineTo(ix + iw, iy + ih); 
        ctx.lineTo(ix + iw - inset, iy + topH); 
        ctx.lineTo(ix + inset, iy + topH); 
        ctx.closePath();
        ctx.fill();
         
        const tGrad = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
        tGrad.addColorStop(0, '#FFFFE0'); 
        tGrad.addColorStop(1, '#B8860B'); 
         
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.moveTo(ix + inset, iy + topH); 
        ctx.lineTo(ix + iw - inset, iy + topH); 
        ctx.lineTo(ix + iw - inset * 0.5, iy); 
        ctx.lineTo(ix + inset * 0.5, iy); 
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(85, 50, 10, 0.8)';
        ctx.font = `900 ${Math.max(8, iw*0.35)}px "Roboto", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${goldPoints}`, ix + iw/2, iy + topH * 0.8); 
    };

    ctx.save();
    const cx = px + s / 2;
    const cy = py + s / 2;
    ctx.translate(cx, cy);
    ctx.rotate((140 * Math.PI) / 180);
    ctx.translate(-cx, -cy);

    if (goldVar === 0) drawSingleIngot(px + s*0.15, py + s*0.25, s*0.7, s*0.5);
    else if (goldVar === 1) {
       drawSingleIngot(px + s*0.05, py + s*0.3, s*0.45, s*0.5);
       drawSingleIngot(px + s*0.5, py + s*0.3, s*0.45, s*0.5);
    } else {
       drawSingleIngot(px + s*0.05, py + s*0.35, s*0.45, s*0.5); 
       drawSingleIngot(px + s*0.5, py + s*0.35, s*0.45, s*0.5); 
       drawSingleIngot(px + s*0.275, py + s*0.05, s*0.45, s*0.5); 
    }
    ctx.restore();
};

const drawChocolateBar = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number) => {
    ctx.save();
    const cx = px + s / 2;
    const cy = py + s / 2;
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 8); 
    ctx.translate(-cx, -cy);
    
    const w = s * 0.55; 
    const h = s * 0.85;
    const bx = px + (s - w) / 2;
    const by = py + (s - h) / 2;

    const chocoGrad = ctx.createLinearGradient(bx, by, bx+w, by+h);
    chocoGrad.addColorStop(0, '#5D4037');
    chocoGrad.addColorStop(1, '#3E2723');
    ctx.fillStyle = chocoGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 3);
    ctx.fill();

    const wrapH = h * 0.65;
    const wrapY = by + h - wrapH;
    ctx.fillStyle = '#C62828';
    ctx.fillRect(bx, wrapY, w, wrapH);
    
    ctx.fillStyle = '#FFC107'; 
    ctx.font = `900 ${w * 0.25}px sans-serif`; 
    ctx.textAlign = 'center';
    ctx.fillText("SNAKE", bx + w/2, wrapY + wrapH/2);
    ctx.restore();
};

export const drawBlock = (
    ctx: CanvasRenderingContext2D, x: number, y: number, block: BlockType, 
    s: number, frame: number, worldMap: Map<string, BlockType>, 
    level: number, isTutorial: boolean
) => {
    const px = x * s;
    const py = y * s;
    const biome = getBiome(x, y, isTutorial);
    
    if (block === BlockType.GOLD) {
        const goldVar = Math.abs((x * 43 + y * 17) % 3);
        drawGoldIngot(ctx, px, py, s, goldVar, goldVar === 0 ? 25 : goldVar === 1 ? 75 : 100);
        return;
    }
    if (block === BlockType.DIRT) {
        drawChocolateBar(ctx, px, py, s);
        return;
    }
    if (block === BlockType.STONE) {
        drawOptimizedRock(ctx, px, py, s);
        return;
    }
    if (block === BlockType.TRAP) {
       ctx.fillStyle = '#262626'; 
       ctx.fillRect(px + 4, py + 4, s - 8, s - 8);
       ctx.strokeStyle = '#ef4444';
       ctx.lineWidth = 3;
       ctx.strokeRect(px+8, py+8, s-16, s-16);
       return;
    }

    const color = BLOCK_COLORS[block];
    const is3D = block === BlockType.BEDROCK;

    if (is3D) {
      if (biome === BiomeType.GRASSLAND && block === BlockType.BEDROCK) {
          drawHedge(ctx, px, py, s, frame);
          return;
      }
      ctx.fillStyle = '#111';
      ctx.fillRect(px, py + s/2, s, s/2); 
      ctx.fillStyle = color;
      ctx.fillRect(px, py - 5, s, s - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(px, py - 5, s, s/4);
    } else if (block === BlockType.MAGMA) {
        const glowGrad = ctx.createLinearGradient(px, py, px + s, py + s);
        glowGrad.addColorStop(0, '#ffcc00'); 
        glowGrad.addColorStop(1, '#8b0000'); 
        ctx.fillStyle = glowGrad;
        ctx.fillRect(px, py, s, s);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px+4, py+4, s-8, s-8);
    } else if (block === BlockType.LAVA) {
      const pulse = Math.sin(frame * 0.1); 
      const flowOffset = (frame * 0.2) % s;
      const gradient = ctx.createLinearGradient(px, py - flowOffset, px + s, py + s + flowOffset);
      gradient.addColorStop(0, '#ffcc00');
      gradient.addColorStop(1, '#4a0f0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(px, py, s, s);
    } else if (block === BlockType.POWERUP_BOX) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(px + s/2, py + s * 0.1);
      ctx.lineTo(px + s * 0.9, py + s/2);
      ctx.lineTo(px + s/2, py + s * 0.9);
      ctx.lineTo(px + s * 0.1, py + s/2);
      ctx.fill();
    } else {
       ctx.fillStyle = color;
       ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
    }
};
