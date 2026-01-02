
// Helper function for deterministic randomness
const getPseudoRand = (x: number, y: number) => {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
};

// --- GRASSLAND ASSETS ---

export const drawTree = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const rand = getPseudoRand(px, py);
    const cx = px + s/2;
    const cy = py + s*0.85; 
    const sway = Math.sin(frame * 0.05 + px * 0.1) * (1.5 + rand);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, s*0.35 * (0.8 + rand * 0.4), s*0.12, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#78350f'; 
    ctx.beginPath();
    ctx.moveTo(cx - s*0.1, cy);
    ctx.lineTo(cx + s*0.1, cy);
    ctx.lineTo(cx + s*0.08 + sway*0.2, cy - s*0.6); 
    ctx.lineTo(cx - s*0.08 + sway*0.2, cy - s*0.6);
    ctx.fill();

    const drawCluster = (ox: number, oy: number, size: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx + ox + sway, cy - s*0.6 + oy, size, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(cx + ox + sway - size*0.3, cy - s*0.6 + oy - size*0.3, size*0.3, 0, Math.PI*2);
        ctx.fill();
    };

    if (rand > 0.5) {
        drawCluster(-s*0.2, -s*0.1, s*0.25, '#15803d'); 
        drawCluster(s*0.2, -s*0.1, s*0.25, '#166534'); 
        drawCluster(0, -s*0.35, s*0.32, '#22c55e'); 
    } else {
        drawCluster(0, -s*0.1, s*0.28, '#166534'); 
        drawCluster(-s*0.15, -s*0.3, s*0.22, '#15803d'); 
        drawCluster(s*0.15, -s*0.3, s*0.22, '#4ade80'); 
        drawCluster(0, -s*0.45, s*0.25, '#22c55e'); 
    }
};

export const drawHedge = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const cx = px + s/2;
    const cy = py + s/2;

    ctx.fillStyle = '#a1887f'; 
    ctx.beginPath();
    ctx.roundRect(px, cy + s*0.3, s, s*0.2, 8);
    ctx.fill();
    
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.roundRect(px, cy + s*0.35, s, s*0.15, 8);
    ctx.fill();

    const hW = s;
    const hH = s * 0.8;
    const hX = px;
    const hY = py;

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.roundRect(hX + 2, hY + 2, hW - 4, hH, 4);
    ctx.fill();

    const rows = 4;
    const cols = 4;
    const cellW = hW / cols;
    const cellH = hH / rows;

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const lx = hX + c * cellW + cellW/2;
            const ly = hY + r * cellH + cellH/2;
            const sway = Math.sin(frame * 0.05 + c + r) * 1.5;
            const size = cellW * 0.65;
            
            ctx.fillStyle = '#15803d'; 
            ctx.beginPath();
            ctx.ellipse(lx + sway, ly, size, size*0.8, 0, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = '#4ade80';
            for(let i=0; i<4; i++) {
                const angle = (i * Math.PI / 2) + (r % 2 ? Math.PI/4 : 0); 
                ctx.beginPath();
                const px_petal = lx + sway + Math.cos(angle) * size * 0.4;
                const py_petal = ly + Math.sin(angle) * size * 0.4;
                ctx.ellipse(px_petal, py_petal, size*0.5, size*0.3, angle, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.fillStyle = '#86efac';
            ctx.beginPath();
            ctx.arc(lx + sway, ly - 2, size*0.2, 0, Math.PI*2);
            ctx.fill();
        }
    }
};

export const drawMossyRock = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number) => {
    // FIX: Optimized footprint to stay strictly inside the grid cell
    const cx = px + s/2;
    const cy = py + s/2;
    
    // Width is constrained to 90% of cell to clearly define boundaries
    const radius = s * 0.45; 

    // Height offset (Y-axis) creates 2.5D look without affecting X-axis hitbox perception
    const bodyY = cy - s * 0.2; 

    // 1. Sandy Base (Strictly contained in cell width)
    ctx.fillStyle = '#C2A175'; 
    ctx.beginPath();
    ctx.ellipse(cx, cy + s*0.35, s*0.45, s*0.2, 0, 0, Math.PI*2); 
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s*0.35, s*0.45, s*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    
    // 2. Main Rock Body
    const rockGrad = ctx.createRadialGradient(cx - s*0.2, bodyY - s*0.2, s*0.1, cx, bodyY, radius);
    rockGrad.addColorStop(0, '#9ca3af'); 
    rockGrad.addColorStop(0.5, '#6b7280'); 
    rockGrad.addColorStop(1, '#374151'); 

    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    // Use the constrained radius
    ctx.ellipse(cx, bodyY, radius, radius * 0.9, 0, 0, Math.PI*2);
    ctx.fill();

    // 3. Moss Cap
    ctx.fillStyle = '#65a30d'; 
    ctx.beginPath();
    ctx.arc(cx, bodyY - radius * 0.2, radius * 0.7, Math.PI, 0);
    ctx.bezierCurveTo(cx + radius*0.7, bodyY + radius*0.2, cx, bodyY + radius*0.6, cx - radius*0.7, bodyY + radius*0.2);
    ctx.fill();

    // 4. Details (Pebbles)
    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.arc(cx - s*0.2, bodyY + s*0.1, s*0.05, 0, Math.PI*2);
    ctx.fill();
    
    // Base Vegetation (Constrained)
    const drawBush = (ox: number, oy: number, r: number) => {
        const bx = cx + s*ox;
        const by = cy + s*oy;
        ctx.fillStyle = '#3f6212'; 
        ctx.beginPath();
        ctx.arc(bx, by, s*r, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#65a30d'; 
        ctx.beginPath();
        ctx.arc(bx, by - s*r*0.2, s*r*0.6, 0, Math.PI*2);
        ctx.fill();
    };

    drawBush(-0.35, 0.35, 0.15); 
    drawBush(0.35, 0.35, 0.15);  
};

export const drawFlowerPatch = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const wind = Math.sin(frame * 0.05 + px) * 2;
    const d1x = px + s*0.3 + wind*0.5;
    const d1y = py + s*0.4;
    
    ctx.fillStyle = '#f8fafc';
    for(let i=0; i<6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(d1x + Math.cos(ang)*6, d1y + Math.sin(ang)*6, 3, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(d1x, d1y, 3, 0, Math.PI*2);
    ctx.fill();

    const d2x = px + s*0.7 + wind;
    const d2y = py + s*0.7;
    ctx.fillStyle = '#f8fafc';
    for(let i=0; i<5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(d2x + Math.cos(ang)*4, d2y + Math.sin(ang)*4, 2.5, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(d2x, d2y, 2.5, 0, Math.PI*2);
    ctx.fill();
};

export const drawGrassClump = (ctx: CanvasRenderingContext2D, px: number, py: number, s: number, frame: number) => {
    const cx = px + s/2;
    const cy = py + s*0.8;
    const wind = Math.sin(frame * 0.1 + px) * 4;

    ctx.fillStyle = '#4ade80';
    for(let i=-2; i<=2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i*3, cy);
        ctx.quadraticCurveTo(cx + i*6, cy - s*0.3, cx + i*8 + wind, cy - s*0.6); 
        ctx.quadraticCurveTo(cx + i*4, cy - s*0.3, cx + i*2, cy); 
        ctx.fill();
    }
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

    const rx = px + s*0.7;
    const ry = py + s*0.4;
    const wind = Math.sin(frame * 0.05 + py) * 2;

    ctx.strokeStyle = '#3f6212';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx, ry + 10);
    ctx.lineTo(rx + wind, ry - 10);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#713f12';
    ctx.beginPath();
    ctx.moveTo(rx + wind, ry - 10);
    ctx.lineTo(rx + wind, ry - 18);
    ctx.stroke();
};
