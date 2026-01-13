
// Helper function for deterministic randomness
const getPseudoRand = (x: number, y: number) => {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
};

// --- ASSET DRAWERS ---

export const drawHedge = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const hW = s;
    const hH = s * 0.8;
    const hX = px;
    const hY = py;

    // Optimized: Simplified base
    ctx.fillStyle = '#14532d';
    ctx.fillRect(hX + 2, hY + 2, hW - 4, hH);

    // Optimized: Reduced leaf count (2x2 grid instead of 4x4)
    const rows = 2;
    const cols = 2;
    const cellW = hW / cols;
    const cellH = hH / rows;

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const lx = hX + c * cellW + cellW/2;
            const ly = hY + r * cellH + cellH/2;
            const sway = Math.sin(frame * 0.05 + c + r) * 1.5;
            const size = cellW * 0.8; // Slightly larger to cover gaps
            
            ctx.fillStyle = '#15803d'; 
            ctx.beginPath();
            ctx.ellipse(lx + sway, ly, size, size*0.8, 0, 0, Math.PI*2);
            ctx.fill();

            // Simplified Detail (Single lighter circle instead of multiple petals)
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(lx + sway - 2, ly - 2, size*0.3, 0, Math.PI*2);
            ctx.fill();
        }
    }
};

export const drawMossyRock = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number) => {
    const cx = px + s/2;
    const cy = py + s/2;
    const radius = s * 0.45; 
    const bodyY = cy - s * 0.2; 

    // 1. Shadow/Base (Simplified to single pass)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s*0.35, s*0.45, s*0.2, 0, 0, Math.PI*2); 
    ctx.fill();
    
    // 2. Main Rock Body
    const rockGrad = ctx.createRadialGradient(cx - s*0.2, bodyY - s*0.2, s*0.1, cx, bodyY, radius);
    rockGrad.addColorStop(0, '#9ca3af'); 
    rockGrad.addColorStop(1, '#374151'); 

    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.ellipse(cx, bodyY, radius, radius * 0.9, 0, 0, Math.PI*2);
    ctx.fill();

    // 3. Moss Cap
    ctx.fillStyle = '#65a30d'; 
    ctx.beginPath();
    ctx.arc(cx, bodyY - radius * 0.2, radius * 0.7, Math.PI, 0);
    ctx.fill();
};

export const drawFlowerPatch = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    // Optimized: Reduced flower count to 1 per patch, with simple sway
    const wind = Math.sin(frame * 0.05 + px) * 2;
    const d1x = px + s*0.5 + wind;
    const d1y = py + s*0.5;
    
    // Simple Flower
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(d1x, d1y, s*0.15, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(d1x, d1y, s*0.06, 0, Math.PI*2);
    ctx.fill();
};

export const drawGrassClump = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const cx = px + s/2;
    const cy = py + s*0.8;
    const wind = Math.sin(frame * 0.1 + px) * 3;

    // Optimized: Single shape instead of loop
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + wind, cy - s*0.5);
    ctx.lineTo(cx + 4, cy);
    ctx.fill();
    
    // Second blade
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy);
    ctx.lineTo(cx + 6 + wind, cy - s*0.3);
    ctx.lineTo(cx + 8, cy);
    ctx.fill();
};

export const drawPond = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const cx = px + s/2;
    const cy = py + s/2;

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(cx, cy, s*0.4, s*0.3, 0, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#4ade80'; 
    ctx.beginPath();
    ctx.ellipse(cx, cy, s*0.3, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
};
