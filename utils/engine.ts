
import { BlockType, Direction, GameState, PowerUpType } from '../types';
import { BOSS_SPAWN_SCORE, GROWTH_THRESHOLD } from '../constants';
import { generateBlock } from './gameLogic';
import { audio } from './audio';
import { processTutorialStep } from './tutorialLogic';
import { updateBossBehavior, manageProjectiles, manageAoE } from './enemyLogic';
import { handleCollisions } from './engineCollision';
import { manageWorld, spawnItemNearPlayer } from './engineWorld';

export const updateGame = (state: any, config: any) => {
    if (state.gameState.current !== GameState.PLAYING || state.isStunned.current) return;

    state.frame.current++;

    if (!state.hasStarted.current) {
        if (config.inputQueueRef.current.length > 0) {
            state.hasStarted.current = true;
            config.setShowPressKey(false);
        } else return;
    }

    if (state.burnTimer.current > 0) {
      if (!config.isTutorial && state.frame.current % 5 === 0) state.health.current -= 1; 
      state.burnTimer.current--;
    }
    
    const head = { ...state.snake.current[0] };
    if (config.inputQueueRef.current.length > 0) {
       config.directionRef.current = config.inputQueueRef.current.shift()!;
    }

    switch(config.directionRef.current) {
      case Direction.UP: head.y--; break;
      case Direction.DOWN: head.y++; break;
      case Direction.LEFT: head.x--; break;
      case Direction.RIGHT: head.x++; break;
    }

    if (state.frame.current % 15 === 0) manageWorld(state, config, head);

    if (state.itemCount.current < 40 && !config.isTutorial) {
        if (state.spawnTimer.current > 0) state.spawnTimer.current--;
        else {
            spawnItemNearPlayer(state, config);
            state.spawnTimer.current = 4;
        }
    }

    if (config.isTutorial) {
       const updates = processTutorialStep(
         state.tutorialStep.current, head, config.directionRef.current, state.worldMap.current, 
         state.activePowerUp.current, state.tutorialTarget.current
       );
       if (updates) {
         if (updates.nextStep !== undefined) {
             state.tutorialStep.current = updates.nextStep;
             config.setTutorialStepUI(updates.nextStep);
         }
         if (updates.nextTarget !== undefined) state.tutorialTarget.current = updates.nextTarget;
         if (updates.mapUpdates) updates.mapUpdates.forEach((u: any) => state.worldMap.current.set(u.key, u.type));
       }
    }

    const key = `${head.x},${head.y}`;
    let block = state.worldMap.current.get(key) || generateBlock(head.x, head.y, config.level, config.isTutorial, state.worldMap.current);
    
    const canMove = handleCollisions(state, config, head, block, key);

    if (canMove) {
        let shouldGrow = false;
        if (state.growthBucket.current >= GROWTH_THRESHOLD) {
            shouldGrow = true;
            state.growthBucket.current -= GROWTH_THRESHOLD;
        }
        const newSnake = [ { ...head, isHead: true }, ...state.snake.current.map((s:any) => ({...s, isHead: false})) ];
        if (!shouldGrow) newSnake.pop();
        state.snake.current = newSnake;

        if (shouldGrow) state.snakeVisual.current.push({...state.snakeVisual.current[state.snakeVisual.current.length - 1]});
        while (state.snakeVisual.current.length > newSnake.length) state.snakeVisual.current.pop();
    }

    if (!config.isTutorial && state.score.current > BOSS_SPAWN_SCORE && !state.boss.current) {
        state.boss.current = {
            position: { x: head.x + 10, y: head.y + 10 },
            visualPosition: { x: head.x + 10, y: head.y + 10 },
            hp: 200, maxHp: 200, isActive: true, type: 'GOLEM', phase: 'IDLE', attackTimer: 50
        };
        state.bossTick.current = 0;
        audio.playSound('POWERUP');
    }

    if (state.boss.current) {
        state.bossTick.current++;
        updateBossBehavior(
            state.boss.current, head, state.bossTick.current, state.worldMap.current, config.level, config.isTutorial,
            state.projectiles.current, state.aoeZones.current, 
            (name) => audio.playSound(name),
            (amt) => { if(!config.isTutorial) state.health.current -= amt; }
        );
        if (state.boss.current.hp <= 0) {
            state.score.current += 1000;
            state.boss.current = null;
            audio.playSound('POWERUP');
        }
    }

    state.projectiles.current = manageProjectiles(state.projectiles.current, head, (d) => { if(!config.isTutorial) state.health.current -= d; });
    state.aoeZones.current = manageAoE(state.aoeZones.current, head, (d) => { if(!config.isTutorial) state.health.current -= d; });

    if (state.comboTimer.current > 0) state.comboTimer.current--; else state.combo.current = 0;
    if (state.powerUpTimer.current > 0 && !config.isTutorial) state.powerUpTimer.current--; 
    else if (state.powerUpTimer.current <= 0) state.activePowerUp.current = PowerUpType.NONE;
    if (state.scoreBoosterTime.current > 0) state.scoreBoosterTime.current--;

    if (state.health.current <= 0) {
      state.gameState.current = GameState.GAME_OVER;
      config.onGameOver(state.score.current, false);
    }
};

export const recoverFromStun = (state: any, config: any) => {
    const currentDir = config.directionRef.current;
    const head = state.snake.current[0];
    const map = state.worldMap.current;

    const checkDir = (dir: Direction) => {
        let tx = head.x, ty = head.y;
        if (dir === Direction.UP) ty--; else if (dir === Direction.DOWN) ty++;
        else if (dir === Direction.LEFT) tx--; else if (dir === Direction.RIGHT) tx++;
        
        const type = map.get(`${tx},${ty}`) || generateBlock(tx, ty, config.level, config.isTutorial, map);
        return type !== BlockType.STONE && type !== BlockType.BEDROCK;
    };

    let candidates: Direction[] = (currentDir === Direction.UP || currentDir === Direction.DOWN) ? [Direction.RIGHT, Direction.LEFT] : [Direction.DOWN, Direction.UP];
    for (const dir of candidates) {
        if (checkDir(dir)) {
            config.directionRef.current = dir;
            state.isStunned.current = false;
            audio.playSound('MOVE');
            return;
        }
    }
    config.directionRef.current = (currentDir === Direction.UP) ? Direction.DOWN : (currentDir === Direction.DOWN) ? Direction.UP : (currentDir === Direction.LEFT) ? Direction.RIGHT : Direction.LEFT;
    state.isStunned.current = false;
    audio.playSound('MOVE');
};
