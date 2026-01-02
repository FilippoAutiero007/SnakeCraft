
import { Particle } from '../types';

export const createExplosion = (x: number, y: number, color: string, count: number, particles: Particle[]) => {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + 0.5,
      y: y + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 1.0,
      color: color,
      size: Math.random() * 0.4 + 0.1
    });
  }
};

export const updateParticles = (particles: Particle[]) => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
};

export const triggerHaptic = (duration: number) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};
