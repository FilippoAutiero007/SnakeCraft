
import { Boss, Projectile, AoEZone, Direction } from '../types';
import { SKINS, CELL_SIZE_PX } from '../constants';

const drawFlameParticle = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colorStart: string, colorEnd: string) => {
    const grd = ctx.createLinearGradient(x, y + h, x, y); 
    grd.addColorStop(0, colorStart);
    grd.addColorStop(1, colorEnd);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(x - w/2, y + h); 
    ctx.quadraticCurveTo(x + w, y + h/2, x, y); 
    ctx.quadraticCurveTo(x - w, y + h/2, x - w/2, y + h); 
    ctx.fill();
};

export const drawSnakeSegment = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, isHead: boolean, skin: string, isBurning: boolean, frame: number) => {
    const px = x * s;
    const py = y * s;
    let baseColor = SKINS.find(sk => sk.color === skin)?.color || skin || '#4caf50';

    if (isBurning) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff4500';
    }
    
    ctx.fillStyle = baseColor;
    ctx.fillRect(px + 1, py + 1, s - 2, s - 2);

    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 4, py + 4, s - 8, s - 8);

    if (isBurning) {
        const flameOffset = (Math.sin(frame * 0.3 + x + y) + 1) * 0.5; 
        drawFlameParticle(ctx, px + s * 0.5, py - s * 0.1, s * 0.2, s * 0.6, '#ffff00', 'transparent');
        ctx.shadowBlur = 0;
    }

    if (isHead) {
      ctx.fillStyle = 'white';
      ctx.fillRect(px + s/2 + 2, py + s/4, 6, 6); 
      ctx.fillRect(px + s/2 + 2, py + s/2 + 2, 6, 6); 
      ctx.fillStyle = 'black';
      ctx.fillRect(px + s/2 + 4, py + s/4 + 1, 2, 2);
      ctx.fillRect(px + s/2 + 4, py + s/2 + 3, 2, 2);
    }
};

export const drawBossRealistic = (ctx: CanvasRenderingContext2D, boss: Boss, s: number, frame: number) => {
     const bx = boss.visualPosition ? boss.visualPosition.x * s + s/2 : boss.position.x * s + s/2;
     const by = boss.visualPosition ? boss.visualPosition.y * s + s/2 : boss.position.y * s + s/2;
     const r = s * 2;
     const isEnraged = boss.phase === 'ATTACK' || boss.phase === 'CHARGING';
     
     const grad = ctx.createRadialGradient(bx, by, 5, bx, by, r);
     if (isEnraged) {
         grad.addColorStop(0, '#ffff00'); 
         grad.addColorStop(1, '#500000'); 
     } else {
         grad.addColorStop(0, '#ffeb3b'); 
         grad.addColorStop(1, '#212121'); 
     }
     ctx.fillStyle = grad;
     ctx.shadowColor = isEnraged ? 'orange' : 'red';
     ctx.shadowBlur = isEnraged ? 50 : 30;
     ctx.beginPath();
     ctx.arc(bx, by, r, 0, Math.PI*2);
     ctx.fill();
     ctx.shadowBlur = 0;
};

export const drawBeams = (ctx: CanvasRenderingContext2D, beams: any[]) => {
    if (beams.length === 0) return;
    ctx.globalCompositeOperation = 'lighter';
    beams.forEach(beam => {
         const sx = beam.x * CELL_SIZE_PX + CELL_SIZE_PX/2;
         const sy = beam.y * CELL_SIZE_PX + CELL_SIZE_PX/2;
         let dx = 0, dy = 0;
         const len = beam.length * CELL_SIZE_PX;
         if (beam.direction === Direction.RIGHT) dx = len;
         if (beam.direction === Direction.LEFT) dx = -len;
         if (beam.direction === Direction.DOWN) dy = len;
         if (beam.direction === Direction.UP) dy = -len;
         
         ctx.strokeStyle = `rgba(0, 229, 255, ${beam.life})`;
         ctx.lineWidth = 10;
         ctx.shadowColor = '#00e5ff';
         ctx.shadowBlur = 20;
         ctx.lineCap = 'round';
         ctx.beginPath();
         ctx.moveTo(sx, sy);
         ctx.lineTo(sx + dx, sy + dy);
         ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
};

export const drawProjectile = (ctx: CanvasRenderingContext2D, proj: Projectile, s: number) => {
    const px = proj.x * s;
    const py = proj.y * s;
    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = proj.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = proj.color;
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * (s/2), 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
};

export const drawAoE = (ctx: CanvasRenderingContext2D, zone: AoEZone, s: number) => {
    const px = zone.x * s;
    const py = zone.y * s;
    const r = zone.radius * s;
    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = zone.color;
    ctx.globalAlpha = zone.opacity;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

export const drawStunEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, frame: number) => {
    const cx = x * s + s / 2;
    const cy = y * s + s / 2;
    const radius = s * 0.8;
    const speed = frame * 0.15;
    
    ctx.save();
    for(let i=0; i<3; i++) {
        const angle = speed + (i * (Math.PI * 2) / 3);
        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius * 0.4 - s*0.5;
        
        ctx.fillStyle = '#FFD700'; 
        ctx.beginPath();
        ctx.arc(sx, sy, s*0.1, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.restore();
};

export const drawTutorialTarget = (ctx: CanvasRenderingContext2D, target: {x:number, y:number}, s: number, frame: number) => {
    const px = target.x * s + s/2;
    const py = target.y * s + s/2;
    const offset = Math.sin(frame * 0.1) * 10;
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, s * 0.8 + offset/4, 0, Math.PI * 2);
    ctx.stroke();
};
