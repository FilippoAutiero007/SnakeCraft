/**
 * Draws an optimized rock/bedrock block
 * @param ctx Canvas rendering context
 * @param px Pixel X position
 * @param py Pixel Y position
 * @param s Size of the block
 */
export const drawOptimizedRock = (
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  s: number
): void => {
  // Base rock color - dark gray
  const baseColor = '#2a2a2a';
  const highlightColor = '#3a3a3a';
  const shadowColor = '#1a1a1a';
  
  // Fill base
  ctx.fillStyle = baseColor;
  ctx.fillRect(px, py, s, s);
  
  // Add some texture with random spots
  const seed = Math.floor(px / s) * 1000 + Math.floor(py / s);
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Draw highlights
  ctx.fillStyle = highlightColor;
  for (let i = 0; i < 3; i++) {
    const r = random(seed + i);
    const spotX = px + r * s * 0.8;
    const spotY = py + random(seed + i + 10) * s * 0.8;
    const spotSize = s * 0.15 * (0.5 + random(seed + i + 20) * 0.5);
    
    ctx.beginPath();
    ctx.arc(spotX + s * 0.1, spotY + s * 0.1, spotSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw shadows for depth
  ctx.fillStyle = shadowColor;
  for (let i = 0; i < 2; i++) {
    const r = random(seed + i + 30);
    const spotX = px + r * s * 0.7;
    const spotY = py + random(seed + i + 40) * s * 0.7;
    const spotSize = s * 0.1 * (0.5 + random(seed + i + 50) * 0.5);
    
    ctx.beginPath();
    ctx.arc(spotX + s * 0.15, spotY + s * 0.15, spotSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add border for definition
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, s, s);
};
