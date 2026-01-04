/**
 * UI Icon Rendering Module
 * 
 * Provides clear, recognizable icons for consumables and power-ups
 */

/**
 * Draw Head Start icon (snake with extra segments)
 */
export const drawHeadStartIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void => {
  const segmentSize = size / 4;
  
  // Background circle
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Snake segments (3 segments to show "head start")
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i++) {
    const sx = x + size/2 + (i - 1) * segmentSize * 0.7;
    const sy = y + size/2;
    ctx.fillRect(sx - segmentSize/2, sy - segmentSize/2, segmentSize, segmentSize);
  }
  
  // Head indicator (eyes)
  ctx.fillStyle = '#000000';
  const headX = x + size/2 + segmentSize * 0.7;
  ctx.beginPath();
  ctx.arc(headX - 2, y + size/2 - 2, 1.5, 0, Math.PI * 2);
  ctx.arc(headX + 2, y + size/2 - 2, 1.5, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Draw Score Booster icon (2x multiplier)
 */
export const drawScoreBoosterIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void => {
  // Background circle
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // "2x" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2×', x + size/2, y + size/2);
  
  // Sparkles
  ctx.fillStyle = '#fef3c7';
  const sparklePositions = [
    { x: x + size * 0.2, y: y + size * 0.2 },
    { x: x + size * 0.8, y: y + size * 0.2 },
    { x: x + size * 0.8, y: y + size * 0.8 },
  ];
  
  sparklePositions.forEach(pos => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

/**
 * Draw Shield icon
 */
export const drawShieldIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void => {
  const cx = x + size/2;
  const cy = y + size/2;
  
  // Shield outline
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.4);
  ctx.quadraticCurveTo(cx + size * 0.35, cy - size * 0.3, cx + size * 0.35, cy);
  ctx.quadraticCurveTo(cx + size * 0.35, cy + size * 0.3, cx, cy + size * 0.45);
  ctx.quadraticCurveTo(cx - size * 0.35, cy + size * 0.3, cx - size * 0.35, cy);
  ctx.quadraticCurveTo(cx - size * 0.35, cy - size * 0.3, cx, cy - size * 0.4);
  ctx.fill();
  
  // Inner shield
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.3);
  ctx.quadraticCurveTo(cx + size * 0.25, cy - size * 0.2, cx + size * 0.25, cy);
  ctx.quadraticCurveTo(cx + size * 0.25, cy + size * 0.2, cx, cy + size * 0.35);
  ctx.quadraticCurveTo(cx - size * 0.25, cy + size * 0.2, cx - size * 0.25, cy);
  ctx.quadraticCurveTo(cx - size * 0.25, cy - size * 0.2, cx, cy - size * 0.3);
  ctx.fill();
  
  // Cross detail
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.2);
  ctx.lineTo(cx, cy + size * 0.2);
  ctx.moveTo(cx - size * 0.15, cy);
  ctx.lineTo(cx + size * 0.15, cy);
  ctx.stroke();
};

/**
 * Draw Speed Boost icon
 */
export const drawSpeedIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void => {
  const cx = x + size/2;
  const cy = y + size/2;
  
  // Background
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy, size/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Lightning bolt
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.1, cy - size * 0.3);
  ctx.lineTo(cx - size * 0.15, cy);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx - size * 0.1, cy + size * 0.3);
  ctx.lineTo(cx + size * 0.15, cy);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
};

/**
 * Draw Laser icon
 */
export const drawLaserIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void => {
  const cx = x + size/2;
  const cy = y + size/2;
  
  // Background
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(cx, cy, size/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Laser beam
  const gradient = ctx.createLinearGradient(cx - size * 0.3, cy, cx + size * 0.3, cy);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(cx - size * 0.3, cy - size * 0.08, size * 0.6, size * 0.16);
  
  // Laser source (circle)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - size * 0.25, cy, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Helper to draw an icon with a count badge
 */
export const drawIconWithCount = (
  ctx: CanvasRenderingContext2D,
  iconRenderer: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void,
  x: number,
  y: number,
  size: number,
  count: number
): void => {
  // Draw icon
  iconRenderer(ctx, x, y, size);
  
  // Draw count badge if count > 1
  if (count > 1) {
    const badgeSize = size * 0.4;
    const badgeX = x + size - badgeSize/2;
    const badgeY = y - badgeSize/2;
    
    // Badge background
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${badgeSize * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(count.toString(), badgeX, badgeY);
  }
};
