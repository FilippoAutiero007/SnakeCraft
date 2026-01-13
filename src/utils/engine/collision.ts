
import { BlockType, PowerUpType, UpgradeType, SnakeSegment, BiomeType } from '../../types';
import { INITIAL_SNAKE_LENGTH, INITIAL_HEALTH, GROWTH_THRESHOLD, BLOCK_COLORS } from '../../constants';
import { audio } from '../audio';
import { getBiome } from '../logic';
import { createExplosion, triggerHaptic } from '../effects';

export const handleCollisions = (
    state: any, 
    config: any, 
    head: SnakeSegment, 
    block: BlockType, 
    key: string
): boolean => {
    // Self Collision
    const isGrowing = state.growthBucket.current >= GROWTH_THRESHOLD;
    const bodyToCheck = isGrowing ? state.snake.current : state.snake.current.slice(0, -1);
    const hitSelf = bodyToCheck.some((s: any) => s.x === head.x && s.y === head.y);

    if (hitSelf && state.activePowerUp.current !== PowerUpType.GHOST_SHIELD) {
       if (!config.isTutorial) state.health.current -= 20; 
       audio.playSound('DAMAGE');
       triggerHaptic(200);
    }

    if (block === BlockType.EMPTY) return true;

    // Scoring & Multipliers
    let scoreMult = 1;
    if (state.scoreBoosterTime.current > 0) scoreMult *= 2;
    const greedLvl = config.upgrades[UpgradeType.GREED] || 0;
    const greedBonus = greedLvl * 0.5;

    let itemConsumed = false;

    switch(block) {
        case BlockType.DIRT:
          state.score.current += Math.floor((1 + state.combo.current + greedBonus) * scoreMult);
          state.combo.current++;
          state.comboTimer.current = 60;
          state.growthBucket.current++;
          audio.playSound('EAT');
          createExplosion(head.x, head.y, BLOCK_COLORS[BlockType.DIRT], 5, state.particles.current);
          itemConsumed = true;
          break;

        case BlockType.GOLD:
          const goldPoints = 25; // simplified
          state.score.current += Math.floor(goldPoints * scoreMult);
          state.growthBucket.current += 2;
          audio.playSound('EAT');
          createExplosion(head.x, head.y, BLOCK_COLORS[BlockType.GOLD], 8, state.particles.current);
          itemConsumed = true;
          break;

        case BlockType.STONE:
        case BlockType.BEDROCK:
          const isShielded = state.activePowerUp.current === PowerUpType.GHOST_SHIELD;
          const isFlying = state.activePowerUp.current === PowerUpType.MIST_WINGS;
          if (isShielded || isFlying) {
             if (!isFlying && block === BlockType.STONE) {
                 state.worldMap.current.set(key, BlockType.EMPTY);
                 audio.playSound('BREAK');
                 createExplosion(head.x, head.y, BLOCK_COLORS[BlockType.STONE], 8, state.particles.current);
                 itemConsumed = true;
             }
          } else {
              const armorLvl = config.upgrades[UpgradeType.IRON_SCALE] || 0;
              const dmg = 20; 
              if (!config.isTutorial) state.health.current -= Math.max(1, dmg - (armorLvl * 2));
              
              audio.playSound('DAMAGE'); 
              triggerHaptic(100);
              state.isStunned.current = true;
              config.inputQueueRef.current = []; // Clear input queue on stun to prevent ghost moves
              head.x = state.snake.current[0].x; 
              head.y = state.snake.current[0].y;
              return false; 
          }
          break;

        case BlockType.LAVA:
          if (state.activePowerUp.current === PowerUpType.MIST_WINGS) break;
          if (config.isTutorial) break;
          state.burnTimer.current = 200; 
          state.health.current -= 30; // Instant damage from lava
          audio.playSound('DAMAGE');
          triggerHaptic(150);
          break;

        case BlockType.MAGMA:
          if (state.activePowerUp.current === PowerUpType.MIST_WINGS) break;
          if (config.isTutorial) break;
          state.health.current -= 3; // Reduced damage from magma
          audio.playSound('DAMAGE');
          break;

        case BlockType.ICE:
          // Ice slows down the snake (handled in game loop via biome check)
          // No damage, just pass through
          break;

        case BlockType.TRAP:
          if (!config.isTutorial) state.health.current -= 15;
          audio.playSound('DAMAGE');
          triggerHaptic(100);
          if (state.snake.current.length > INITIAL_SNAKE_LENGTH) state.snake.current.pop(); 
          itemConsumed = true;
          break;

        case BlockType.POWERUP_BOX:
           const possible = [PowerUpType.LASER_EYES, PowerUpType.SPEED_BOOST, PowerUpType.HEAL, PowerUpType.GHOST_SHIELD];
           const chosen = possible[Math.floor(Math.random() * possible.length)];
           if (chosen === PowerUpType.HEAL) {
             state.health.current = Math.min(INITIAL_HEALTH, state.health.current + 50);
           } else {
             state.activePowerUp.current = chosen;
             const extLvl = config.upgrades[UpgradeType.EXTENDED_POWER] || 0;
             state.powerUpTimer.current = 600 * (1 + (extLvl * 0.2));
           }
           audio.playSound('POWERUP');
           createExplosion(head.x, head.y, BLOCK_COLORS[BlockType.POWERUP_BOX], 10, state.particles.current);
           itemConsumed = true;
           break;
    }

    if (itemConsumed) {
        state.worldMap.current.delete(key);
        if (!config.isTutorial) state.itemCount.current = Math.max(0, state.itemCount.current - 1);
    }
    return true;
};