
import { Boss, Projectile, AoEZone, SnakeSegment, BlockType, Direction } from '../../types';
import { getLevelConfig, BLOCK_COLORS } from '../../constants';
import { generateBlock } from '../logic';
import { createExplosion } from '../effects';
import { getSmartMove } from '../../src/ai/pathfinding';

type SoundPlayer = (name: 'MOVE' | 'BREAK' | 'EAT' | 'DAMAGE' | 'POWERUP' | 'BOSS_HIT' | 'LASER') => void;

// Helper for Point-Segment Distance squared
// Calculates the squared distance from point (px,py) to the line segment (x1,y1)-(x2,y2)
const distToSegmentSquared = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return (px - x1) ** 2 + (py - y1) ** 2;
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2;
};

export const manageProjectiles = (
  projectiles: Projectile[], 
  head: SnakeSegment, 
  onHitPlayer: (damage: number) => void
): Projectile[] => {
    return projectiles.filter(p => {
        const startX = p.x;
        const startY = p.y;
        
        p.x += p.vx;
        p.y += p.vy;
        
        const endX = p.x;
        const endY = p.y;
        
        // Target Center (Snake Head is approx 1x1 tile, top-left is x,y. Center is +0.5)
        const targetX = head.x + 0.5;
        const targetY = head.y + 0.5;
        
        // Hit radius squared (0.8 radius => ~0.64 squared)
        const hitRadiusSq = 0.64;

        // Check distance from Snake Head Center to the movement path of the projectile
        const distSq = distToSegmentSquared(targetX, targetY, startX, startY, endX, endY);
        
        if (distSq < hitRadiusSq) {
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
    const config = getLevelConfig(level);
    const damageMult = config.bossDamageMultiplier || 1;
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
                damage: Math.floor(2 * damageMult), 
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
                damage: Math.floor(20 * damageMult), 
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

    // --- Movement Logic with A* Pathfinding ---
    const moveInterval = isEnraged ? 8 : 15;
    if (tick % moveInterval === 0 && boss.phase !== 'CHARGING') {
       if (distToPlayer > 18) {
           // Teleport if too far
           boss.position.x = head.x + (Math.random() > 0.5 ? 8 : -8);
           boss.position.y = head.y + (Math.random() > 0.5 ? 8 : -8);
       } else {
           // Smart pathfinding to avoid walls
           const nextPos = getSmartMove(
               boss.position.x, 
               boss.position.y, 
               head.x, 
               head.y, 
               worldMap
           );
           boss.position.x = nextPos.x;
           boss.position.y = nextPos.y;
       }
    }

    // --- Contact Damage ---
    if (Math.abs(boss.position.x - head.x) < 1.5 && Math.abs(boss.position.y - head.y) < 1.5) {
       onDamagePlayer(Math.floor(5 * damageMult));
       if (tick % 20 === 0) playSound('DAMAGE');
    }
};

export const handleLaserAbility = (
    state: any,
    head: SnakeSegment,
    direction: Direction,
    level: number,
    isTutorial: boolean,
    playSound: SoundPlayer
): number => {
    playSound('LASER');
    let beamLen = 0;
    let cx = head.x, cy = head.y;
    const maxLen = 15;

    for (let i = 0; i < maxLen; i++) {
        if (direction === Direction.UP) cy--;
        else if (direction === Direction.DOWN) cy++;
        else if (direction === Direction.LEFT) cx--;
        else if (direction === Direction.RIGHT) cx++;

        const key = `${cx},${cy}`;
        const block = generateBlock(cx, cy, level, isTutorial, state.worldMap.current);

        if (block === BlockType.BEDROCK) break;

        const isMapItem = [BlockType.DIRT, BlockType.GOLD, BlockType.POWERUP_BOX, BlockType.TRAP].includes(block);
        const isWall = block === BlockType.STONE;

        if (isMapItem || isWall) {
            if (isWall) {
                state.worldMap.current.set(key, BlockType.EMPTY);
                playSound('BREAK');
                createExplosion(cx, cy, BLOCK_COLORS[BlockType.STONE], 8, state.particles.current);
            } else {
                state.worldMap.current.delete(key);
                createExplosion(cx, cy, BLOCK_COLORS[block], 6, state.particles.current);
                if (!isTutorial) {
                    state.itemCount.current = Math.max(0, state.itemCount.current - 1);
                }
            }
            state.score.current += 5;
        }

        // Improved Boss Hit Detection using Raycasting-like logic
        if (state.boss.current) {
            const boss = state.boss.current;
            const bossSize = 1.8; // Boss hit box size
            const distSq = distToSegmentSquared(
                boss.position.x, boss.position.y, 
                cx - 0.5, cy - 0.5, cx + 0.5, cy + 0.5
            );

            if (distSq < (bossSize * bossSize)) {
                boss.hp -= 20;
                playSound('BOSS_HIT');
                createExplosion(cx, cy, 'orange', 5, state.particles.current);
                
                if (boss.hp <= 0) {
                    state.score.current += 1000;
                    state.boss.current = null;
                    playSound('POWERUP');
                    state.projectiles.current = [];
                    state.aoeZones.current = [];
                    createExplosion(cx, cy, 'red', 50, state.particles.current);
                }
                beamLen++;
                break; // Laser stops at boss
            }
        }
        beamLen++;
    }
    return beamLen;
};
