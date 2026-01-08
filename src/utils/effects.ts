export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSystem {
  particles: Particle[] = [];

  addParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number = 2,
    life: number = 30
  ): void {
    this.particles.push({
      x,
      y,
      vx,
      vy,
      life,
      maxLife: life,
      color,
      size,
    });
  }

  addBurst(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = 2
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.addParticle(x, y, vx, vy, color);
    }
  }

  update(): void {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravità
      p.life--;
      return p.life > 0;
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach((p) => {
      const opacity = p.life / p.maxLife;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.particles = [];
  }
}

export function createLavaGlowEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, "rgba(255, 102, 0, 0.8)");
  gradient.addColorStop(0.5, "rgba(255, 51, 0, 0.4)");
  gradient.addColorStop(1, "rgba(255, 51, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function createIceBlurEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  ctx.fillStyle = "rgba(0, 204, 255, 0.3)";
  ctx.fillRect(x - size / 2, y - size / 2, size, size);

  ctx.strokeStyle = "rgba(0, 204, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
}

export function createCactusEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const spikeLength = size / 3;

  ctx.fillStyle = "#00aa00";
  ctx.fillRect(x - size / 2, y - size / 2, size, size);

  ctx.strokeStyle = "#00dd00";
  ctx.lineWidth = 2;

  // Spine
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    const sx = x + Math.cos(angle) * (size / 2 + spikeLength);
    const sy = y + Math.sin(angle) * (size / 2 + spikeLength);

    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (size / 2), y + Math.sin(angle) * (size / 2));
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
}

export function createTrailEffect(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  width: number = 2
): void {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}
