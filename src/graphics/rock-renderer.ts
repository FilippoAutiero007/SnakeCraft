/**
 * Optimized Rock Rendering Module
 * 
 * This module provides high-performance rock rendering with:
 * - Clear visual boundaries for gameplay
 * - Proper 2.5D perspective
 * - Aggressive caching for 60 FPS performance
 * - Distinct visual style that doesn't blend with background
 */

// Global cache for pre-rendered rocks
const rockCache = new Map<string, HTMLCanvasElement>();

/**
 * Draws a highly visible, stylized rock with clear boundaries
 * 
 * Design goals:
 * - Clear hitbox visualization (player knows exactly where it is)
 * - High contrast with background
 * - 2.5D appearance without confusing perspective
 * - Distinct from other game elements
 */
export const drawOptimizedRock = (
  ctx: CanvasRenderingContext2D, 
  px: number, 
  py: number, 
  s: number
): void => {
  const key = `rock_${s}`;
  
  // Use cached version if available
  if (rockCache.has(key)) {
    ctx.drawImage(rockCache.get(key)!, px, py);
    return;
  }
  
  // Create new cached rock
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const cacheCtx = canvas.getContext('2d');
  
  if (!cacheCtx) return;
  
  renderRockToContext(cacheCtx, s);
  rockCache.set(key, canvas);
  
  // Draw to main canvas
  ctx.drawImage(canvas, px, py);
};

/**
 * Renders rock to a given context (for caching)
 */
function renderRockToContext(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s / 2;
  const cy = s / 2;
  
  // CRITICAL FIX: Constrain rock to 85% of cell to prevent visual overflow
  const rockSize = s * 0.42; // Even smaller for clearer boundaries
  
  // 1. Ground shadow (for 2.5D depth)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.3, rockSize * 0.9, rockSize * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 2. Dark base (bottom of rock)
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.ellipse(cx, cy + rockSize * 0.2, rockSize, rockSize * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 3. Main rock body with clear gradient
  const rockGrad = ctx.createRadialGradient(
    cx - rockSize * 0.3, cy - rockSize * 0.3, rockSize * 0.2,
    cx, cy, rockSize
  );
  rockGrad.addColorStop(0, '#c0c0c0'); // Bright highlight
  rockGrad.addColorStop(0.4, '#888888'); // Mid gray
  rockGrad.addColorStop(1, '#555555'); // Dark edge
  
  ctx.fillStyle = rockGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rockSize, rockSize * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 4. Strong outline for clarity (CRITICAL FOR GAMEPLAY)
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rockSize, rockSize * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // 5. Top highlight for 3D effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(
    cx - rockSize * 0.25, cy - rockSize * 0.25, 
    rockSize * 0.4, rockSize * 0.3, 
    0, 0, Math.PI * 2
  );
  ctx.fill();
  
  // 6. Surface cracks for detail
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - rockSize * 0.3, cy - rockSize * 0.1);
  ctx.quadraticCurveTo(cx, cy + rockSize * 0.1, cx + rockSize * 0.3, cy);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(cx - rockSize * 0.2, cy + rockSize * 0.2);
  ctx.quadraticCurveTo(cx + rockSize * 0.1, cy + rockSize * 0.3, cx + rockSize * 0.3, cy + rockSize * 0.1);
  ctx.stroke();
}

/**
 * Pre-generates rocks at common sizes for instant rendering
 */
export const preloadRockAssets = (sizes: number[]): void => {
  sizes.forEach(size => {
    const key = `rock_${size}`;
    if (!rockCache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderRockToContext(ctx, size);
        rockCache.set(key, canvas);
      }
    }
  });
};

/**
 * Clears rock cache (useful for hot-reloading)
 */
export const clearRockCache = (): void => {
  rockCache.clear();
};
