
import React, { useEffect, useCallback, useRef } from 'react';
import { GameState, Direction, BlockType, PowerUpType, UpgradeType, ConsumableType, PlayerStats } from '../types';
import { audio } from '../utils/audio';
import { generateBlock } from '../utils/logic';
import { renderScene } from '../utils/rendering/scene';
import GameUI from './GameUI';
import { Shop } from './Shop';
import { useGameInput } from '../hooks/useGameInput';
import { useGameState } from '../hooks/useGameState';
import { updateGame, recoverFromStun } from '../utils/engine/core';
import { handleLaserAbility } from '../utils/engine/entities';

interface GameProps {
  onGameOver: (score: number, bossDefeated: boolean) => void;
  onExit: () => void;
  currentSkin: string; 
  currentBg: string;
  level: number;
  isTutorial?: boolean;
  upgrades?: Record<UpgradeType, number>;
  inventory?: Record<ConsumableType, number>;
  stats?: PlayerStats;
  onBuyUpgrade?: (id: UpgradeType) => void;
  onBuyConsumable?: (id: ConsumableType) => void;
  onBuySkin?: (id: string, price: number) => void;
  onEquipSkin?: (color: string) => void;
  onBuyBg?: (id: string, price: number) => void;
  onEquipBg?: (className: string) => void;
  settings?: any; // GameSettings from SettingsModal
}

const Game: React.FC<GameProps> = ({ 
  onGameOver, onExit, currentSkin, level, isTutorial = false,
  upgrades = {} as Record<UpgradeType, number>, 
  inventory = {} as Record<ConsumableType, number>,
  stats, onBuyUpgrade, onBuyConsumable, onBuySkin, onEquipSkin, onBuyBg, onEquipBg,
  settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShopInPause, setShowShopInPause] = React.useState(false);

  // --- State Management ---
  const { 
    refs, uiState, setUiState, 
    tutorialStepUI, setTutorialStepUI,
    showPressKey, setShowPressKey,
    resetGameState, syncUI 
  } = useGameState(level, isTutorial, inventory);

  // --- Input Management ---
  const triggerAbility = () => {
    if (refs.activePowerUp.current === PowerUpType.NONE && !isTutorial) return;
    
    const beamLen = handleLaserAbility(
        refs, 
        refs.snake.current[0], 
        directionRef.current, 
        level, 
        isTutorial, 
        (name) => audio.playSound(name)
    );

    refs.beams.current.push({ 
        x: refs.snake.current[0].x, 
        y: refs.snake.current[0].y, 
        life: 1.0, 
        direction: directionRef.current, 
        length: beamLen 
    });
    
    if (isTutorial && refs.tutorialStep.current === 4) {
      setTimeout(() => {
          refs.tutorialStep.current = 5;
          setTutorialStepUI(5);
      }, 500);
    }
  };

  const { 
    directionRef, inputQueueRef, hasStartedRef, pollInputs, registerDirection 
  } = useGameInput(
    uiState.isPaused, 
    () => { 
        setUiState(p => ({...p, isPaused: true})); 
        refs.gameState.current = GameState.PAUSED;
        inputQueueRef.current = []; // Clear queue on pause to prevent buffered inputs
    },
    () => { setUiState(p => ({...p, isPaused: false})); refs.gameState.current = GameState.PLAYING; refs.lastTickTime.current = 0; requestAnimationFrame(loop); },
    triggerAbility,
    onExit
  );

  // --- Initialization ---
  useEffect(() => { 
      resetGameState(); 
      audio.init().then(() => setUiState(p => ({...p, audioEnabled: true}))).catch(() => {});
  }, [resetGameState, isTutorial]);

  // --- Game Loop ---
  const loop = useCallback((time: number) => {
    if (!refs.lastTickTime.current) refs.lastTickTime.current = time;
    const deltaTime = time - refs.lastTickTime.current;
    refs.lastTickTime.current = time;

    pollInputs();

    // Sync input start state (Fix for Tutorial Freeze)
    if (hasStartedRef.current && !refs.hasStarted.current) {
        refs.hasStarted.current = true;
        setShowPressKey(false);
    }
    if (refs.hasStarted.current && !hasStartedRef.current) hasStartedRef.current = true;

    // Stun Recovery Logic
    if (refs.isStunned.current) {
        refs.frame.current++; 
        // Only recover if player presses a key (handled in Game.tsx)
        // But we allow buffering one input for recovery
        if (inputQueueRef.current.length > 0) {
            recoverFromStun(refs, { 
                level, isTutorial, upgrades, onGameOver, setTutorialStepUI, directionRef, inputQueueRef, setShowPressKey 
            });
            // Clear queue after recovery to prevent double moves
            inputQueueRef.current = [];
        }
    } else {
        refs.tickAccumulator.current += deltaTime;
        
        // Check if on ICE biome for slowdown effect
        const head = refs.snake.current[0];
        const currentBiome = refs.worldMap.current.get(`${head.x},${head.y}`);
        const isOnIce = currentBiome === BlockType.ICE;
        
        let tickRate = 120;
        if (refs.activePowerUp.current === PowerUpType.SPEED_BOOST) {
            tickRate = 80;
        } else if (isOnIce) {
            tickRate = 160; // Slower on ice
        }

        while (refs.tickAccumulator.current >= tickRate) {
            updateGame(refs, {
                level,
                isTutorial,
                upgrades,
                onGameOver,
                setTutorialStepUI,
                directionRef,
                inputQueueRef,
                setShowPressKey
            });
            refs.tickAccumulator.current -= tickRate;
        }
    }
    
    // UI Throttle: Sync only every 3 frames (~20 FPS for UI) to save CPU for Canvas
    if (refs.frame.current % 3 === 0) {
        syncUI();
    }

    // Smooth Interpolation for 2.5D fluid movement
    const lerpSpeed = 0.35;
    for (let i = 0; i < refs.snake.current.length; i++) {
        if (!refs.snakeVisual.current[i]) refs.snakeVisual.current[i] = { ...refs.snake.current[i] };
        const target = refs.snake.current[i];
        const visual = refs.snakeVisual.current[i];
        visual.x += (target.x - visual.x) * lerpSpeed;
        visual.y += (target.y - visual.y) * lerpSpeed;
    }

    if (refs.boss.current) {
        if (!refs.boss.current.visualPosition) refs.boss.current.visualPosition = { ...refs.boss.current.position };
        refs.boss.current.visualPosition.x += (refs.boss.current.position.x - refs.boss.current.visualPosition.x) * 0.1;
        refs.boss.current.visualPosition.y += (refs.boss.current.position.y - refs.boss.current.visualPosition.y) * 0.1;
    }

    // Visual cleanup
    refs.beams.current = refs.beams.current.filter(b => { b.life -= 0.05; return b.life > 0; });

    // Drawing
    const canvas = canvasRef.current;
    if (canvas && containerRef.current) {
        if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
            renderScene(ctx, {
                width: canvas.width,
                height: canvas.height,
                headVisual: refs.snakeVisual.current[0] || {x:0, y:0},
                zoom: refs.activePowerUp.current === PowerUpType.SPEED_BOOST ? 0.8 : 1.0,
                worldMap: refs.worldMap.current,
                level,
                isTutorial,
                frame: refs.frame.current,
                tutorialTarget: refs.tutorialTarget.current,
                boss: refs.boss.current,
                snakeVisual: refs.snakeVisual.current,
                currentSkin,
                beams: refs.beams.current,
                projectiles: refs.projectiles.current,
                aoeZones: refs.aoeZones.current,
                particles: refs.particles.current,
                isBurning: refs.burnTimer.current > 0,
                isStunned: refs.isStunned.current
            });
        }
    }

    if (refs.gameState.current === GameState.PLAYING && !uiState.isPaused) requestAnimationFrame(loop);
  }, [uiState.isPaused, isTutorial, upgrades, level]);

  useEffect(() => { requestAnimationFrame(loop); return () => { refs.gameState.current = GameState.PAUSED; } }, [loop]);

  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  return (
    <div ref={containerRef} 
        className="relative w-full h-full bg-black overflow-hidden cursor-none touch-none select-none"
        onClick={() => audio.init()}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {!showShopInPause ? (
        <GameUI 
          score={uiState.score}
          health={uiState.health}
          combo={uiState.combo}
          powerUp={uiState.powerUp}
          powerUpTime={uiState.powerUpTime}
          isPaused={uiState.isPaused}
          audioEnabled={uiState.audioEnabled}
          isTutorial={isTutorial}
          tutorialStep={tutorialStepUI}
          showPressKey={showPressKey}
          joystick={uiState.joystick}
          onToggleAudio={() => setUiState(p => ({...p, audioEnabled: !p.audioEnabled}))}
          onPause={() => { 
              setUiState(p => ({...p, isPaused: true})); 
              refs.gameState.current = GameState.PAUSED;
              inputQueueRef.current = []; 
          }}
          onResume={() => { setUiState(p => ({...p, isPaused: false})); refs.gameState.current = GameState.PLAYING; refs.lastTickTime.current = 0; requestAnimationFrame(loop); }}
          onExit={onExit}
          onAbility={triggerAbility}
          onInput={registerDirection}
          onShop={stats && !isTutorial ? () => setShowShopInPause(true) : undefined}
        />
      ) : (
        stats && onBuyUpgrade && onBuyConsumable && onBuySkin && onEquipSkin && onBuyBg && onEquipBg && (
          <Shop
            stats={stats}
            onBack={() => setShowShopInPause(false)}
            onBuySkin={onBuySkin}
            onEquipSkin={onEquipSkin}
            onBuyBg={onBuyBg}
            onEquipBg={onEquipBg}
            onBuyUpgrade={onBuyUpgrade}
            onBuyConsumable={onBuyConsumable}
          />
        )
      )}
      
      <div className="absolute inset-0 z-20 md:hidden pointer-events-auto touch-none"
        onTouchStart={(e) => { 
           audio.init(); // Force audio init on first touch
           if(e.touches.length > 1) return;
           const t = e.touches[0]; 
           touchStartRef.current = { x: t.clientX, y: t.clientY };
           
           if(!refs.hasStarted.current) { 
              refs.hasStarted.current = true; 
              setShowPressKey(false); 
              hasStartedRef.current = true;
           } 
        }}
        onTouchMove={(e) => { 
           e.preventDefault(); 
           if (!touchStartRef.current) return;
           const t = e.touches[0]; 
           
           const dx = t.clientX - touchStartRef.current.x;
           const dy = t.clientY - touchStartRef.current.y;
           
           // Threshold 50px
           if (dx*dx + dy*dy > 2500) { 
               let newDir: Direction | null = null;
               if (Math.abs(dx) > Math.abs(dy)) {
                   newDir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
               } else {
                   newDir = dy > 0 ? Direction.DOWN : Direction.UP;
               }
               
               if (newDir) {
                   registerDirection(newDir);
                   touchStartRef.current = { x: t.clientX, y: t.clientY };
               }
           }
        }}
        onTouchEnd={() => { touchStartRef.current = null; }}
      />
    </div>
  );
};

export default Game;
