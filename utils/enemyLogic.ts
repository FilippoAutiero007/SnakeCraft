
import { Boss, Projectile, AoEZone, SnakeSegment, BlockType } from '../types';
import { generateBlock } from './gameLogic';

type SoundPlayer = (name: 'MOVE' | 'BREAK' | 'EAT' | 'DAMAGE' | 'POWERUP' | 'BOSS_HIT' | 'LASER') => void;

export const manageProjectiles = (
  projectiles: Projectile[], 
  head: SnakeSegment, 
  onHitPlayer: (damage: number) => void
): Projectile[] => {
    return projectiles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Collision with snake head
        const dist = Math.sqrt((p.x - head.x)**2 + (p.y - head.y)**2);
        if (dist < 0.8) {
            onHitPlayer(p.damage);
            return false;
        }

        // Out of bounds cleanup (approximate relative to head for performance)
        if (Math.abs(p.x - head.x) > 30 || Math.abs(p.y - head.y) > 30) return false;
        
        return true;
    });
};

export const manageAoE = (
  zones: AoEZone[], 
  head: SnakeSegment, 
  onDamagePlayer: (damage: number) => void
): AoEZone[] => {
     return zones.filter(zone => {
         zone.radius += zone.growthRate;
         zone.opacity -= 0.015;
         
         const dist = Math.sqrt((zone.x - head.x)**2 + (zone.y - head.y)**2);
         if (dist < zone.radius && zone.opacity > 0.2) {
             onDamagePlayer(zone.damage);
         }

         return zone.radius < zone.maxRadius && zone.opacity > 0;
     });
};

export const updateBossBehavior = (
  boss: Boss, 
  head: SnakeSegment, 
  tick: number,
  worldMap: Map<string, BlockType>,
  level: number,
  isTutorial: boolean,
  projectiles: Projectile[],
  aoeZones: AoEZone[],
  playSound: SoundPlayer,
  onDamagePlayer: (amount: number) => void
) => {
    boss.attackTimer--;

    const isEnraged = boss.hp < boss.maxHp * 0.5;
    const distToPlayer = Math.sqrt((boss.position.x - head.x)**2 + (boss.position.y - head.y)**2);

    // --- Phase Management ---
    if (boss.phase === 'CHARGING') {
        if (boss.attackTimer <= 0) {
            boss.phase = 'ATTACK';
            // Execute the charged attack (Magma Stomp)
            aoeZones.push({
                x: boss.position.x, 
                y: boss.position.y,
                radius: 1, 
                maxRadius: isEnraged ? 10 : 7, 
                growthRate: 0.3,
                damage: 2, 
                color: '#ff0000', 
                opacity: 0.8
            });
            playSound('BREAK');
            boss.attackTimer = 80; // Cooldown
        }
        return; // Don't move while charging
    }

    // --- Attack Selection ---
    if (boss.attackTimer <= 0) {
        const rand = Math.random();
        
        if (rand < 0.4) {
            // Attack 1: Pyroblast (Projectile)
            const angle = Math.atan2(head.y - boss.position.y, head.x - boss.position.x);
            const speed = isEnraged ? 0.7 : 0.4;
            projectiles.push({
                x: boss.position.x, 
                y: boss.position.y,
                vx: Math.cos(angle) * speed, 
                vy: Math.sin(angle) * speed,
                size: 1, 
                damage: 20, 
                color: isEnraged ? '#ff00ff' : '#ff4400'
            });
            playSound('LASER');
            boss.attackTimer = isEnraged ? 40 : 60;
            
        } else if (rand < 0.7 && isEnraged) {
            // Attack 2: Charge Up for Magma Stomp
            boss.phase = 'CHARGING';
            boss.attackTimer = 30; // Charge time
            
        } else {
            // Attack 3: Summon Traps/Minions
            const count = isEnraged ? 4 : 2;
            for(let i=0; i<count; i++) {
                const ox = head.x + Math.floor(Math.random()*8 - 4);
                const oy = head.y + Math.floor(Math.random()*8 - 4);
                // Don't spawn on top of player
                if (Math.abs(ox - head.x) > 1 || Math.abs(oy - head.y) > 1) {
                    if (generateBlock(ox, oy, level, isTutorial, worldMap) === BlockType.EMPTY) {
                        worldMap.set(`${ox},${oy}`, BlockType.TRAP);
                    }
                }
            }
            boss.attackTimer = 50;
        }
    }

    // --- Movement Logic ---
    const moveInterval = isEnraged ? 8 : 15;
    if (tick % moveInterval === 0 && boss.phase !== 'CHARGING') {
       if (distToPlayer > 18) {
           // Teleport if too far
           boss.position.x = head.x + (Math.random() > 0.5 ? 8 : -8);
           boss.position.y = head.y + (Math.random() > 0.5 ? 8 : -8);
       } else {
           // Chase
           const dx = head.x - boss.position.x;
           const dy = head.y - boss.position.y;
           
           // Simple pathfinding (move in largest delta direction)
           if (Math.abs(dx) > Math.abs(dy)) boss.position.x += Math.sign(dx);
           else boss.position.y += Math.sign(dy);
       }
    }

    // --- Contact Damage ---
    if (Math.abs(boss.position.x - head.x) < 1.5 && Math.abs(boss.position.y - head.y) < 1.5) {
       onDamagePlayer(5);
       if (tick % 20 === 0) playSound('DAMAGE');
    }
};