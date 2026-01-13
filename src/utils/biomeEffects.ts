import { BiomeType } from '../types';

export interface BiomeEffect {
  particles: ParticleEmitter[];
  backgroundColor: string;
  overlayColor?: string;
  blurAmount?: number;
  glowColor?: string;
}

export interface ParticleEmitter {
  type: 'snow' | 'lava' | 'sand' | 'dust' | 'spark';
  color: string;
  speed: number;
  density: number;
  size: { min: number; max: number };
}

export const BIOME_EFFECTS: Record<BiomeType, BiomeEffect> = {
  [BiomeType.GRASSLAND]: {
    particles: [
      {
        type: 'dust',
        color: '#90ee90',
        speed: 0.5,
        density: 5,
        size: { min: 2, max: 4 }
      }
    ],
    backgroundColor: '#1b261b',
    overlayColor: 'rgba(34, 139, 34, 0.05)'
  },
  
  [BiomeType.DESERT]: {
    particles: [
      {
        type: 'sand',
        color: '#f4a460',
        speed: 1.5,
        density: 15,
        size: { min: 1, max: 3 }
      },
      {
        type: 'lava',
        color: '#ff6b35',
        speed: 0.8,
        density: 8,
        size: { min: 3, max: 6 }
      }
    ],
    backgroundColor: '#2b2015',
    overlayColor: 'rgba(255, 69, 0, 0.1)',
    glowColor: '#ff4500'
  },
  
  [BiomeType.TUNDRA]: {
    particles: [
      {
        type: 'snow',
        color: '#e0f7ff',
        speed: 1.2,
        density: 20,
        size: { min: 2, max: 5 }
      }
    ],
    backgroundColor: '#151b26',
    overlayColor: 'rgba(135, 206, 250, 0.15)',
    blurAmount: 0.5
  },
  
  [BiomeType.OBSIDIAN_WASTE]: {
    particles: [
      {
        type: 'spark',
        color: '#8b00ff',
        speed: 2,
        density: 12,
        size: { min: 1, max: 4 }
      },
      {
        type: 'dust',
        color: '#4b0082',
        speed: 0.6,
        density: 8,
        size: { min: 2, max: 3 }
      }
    ],
    backgroundColor: '#0a0a0a',
    overlayColor: 'rgba(75, 0, 130, 0.2)',
    glowColor: '#8b00ff'
  }
};

export class BiomeParticleSystem {
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    type: string;
  }> = [];

  private emitters: ParticleEmitter[];
  private width: number;
  private height: number;
  private maxParticles: number;

  constructor(biome: BiomeType, width: number, height: number, maxParticles = 100) {
    this.emitters = BIOME_EFFECTS[biome].particles;
    this.width = width;
    this.height = height;
    this.maxParticles = maxParticles;
    this.initializeParticles();
  }

  private initializeParticles() {
    this.particles = [];
    
    this.emitters.forEach(emitter => {
      const count = Math.floor((emitter.density / 100) * this.maxParticles);
      
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(emitter));
      }
    });
  }

  private createParticle(emitter: ParticleEmitter) {
    const size = emitter.size.min + Math.random() * (emitter.size.max - emitter.size.min);
    
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * emitter.speed * 0.5,
      vy: emitter.speed * (emitter.type === 'snow' ? 1 : Math.random()),
      size,
      color: emitter.color,
      life: 1,
      type: emitter.type
    };
  }

  update(deltaTime: number) {
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx * deltaTime * 60;
      particle.y += particle.vy * deltaTime * 60;

      // Special behaviors
      switch (particle.type) {
        case 'snow':
          particle.vx = Math.sin(particle.y * 0.01) * 0.5; // Drift
          break;
        case 'lava':
          particle.vy -= 0.1; // Float upward
          particle.life -= 0.01;
          break;
        case 'spark':
          particle.life -= 0.02;
          break;
      }

      // Wrap around screen
      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;

      // Respawn if dead
      if (particle.life <= 0) {
        const emitter = this.emitters.find(e => e.color === particle.color);
        if (emitter) {
          Object.assign(particle, this.createParticle(emitter));
        }
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(particle => {
      ctx.save();
      
      // Glow effect for special particles
      if (particle.type === 'lava' || particle.type === 'spark') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
      }

      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      
      // Different shapes for different types
      if (particle.type === 'spark') {
        // Star shape
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y - particle.size);
        ctx.lineTo(particle.x + particle.size * 0.3, particle.y);
        ctx.lineTo(particle.x, particle.y + particle.size);
        ctx.lineTo(particle.x - particle.size * 0.3, particle.y);
        ctx.closePath();
        ctx.fill();
      } else {
        // Circle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeParticles();
  }
}
