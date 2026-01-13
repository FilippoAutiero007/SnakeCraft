
import { useRef, useCallback, useState } from 'react';
import { 
  GameState, BlockType, SnakeSegment, Boss, 
  Projectile, AoEZone, PowerUpType, ConsumableType, 
  Direction, Particle
} from '../types';
import { INITIAL_SNAKE_LENGTH, INITIAL_HEALTH } from '../constants';

export const useGameState = (
  level: number, 
  isTutorial: boolean,
  inventory: Record<ConsumableType, number>
) => {
  // --- Mutable Game State (Refs for Performance) ---
  const refs = {
    gameState: useRef<GameState>(GameState.PLAYING),
    snake: useRef<SnakeSegment[]>([]),
    snakeVisual: useRef<{x: number, y: number}[]>([]),
    worldMap: useRef<Map<string, BlockType>>(new Map()),
    
    // Chunk Management
    chunkLastVisited: useRef<Map<string, number>>(new Map()),
    activeChunks: useRef<Set<string>>(new Set()),

    // Entities
    boss: useRef<Boss | null>(null),
    bossTick: useRef(0),
    projectiles: useRef<Projectile[]>([]),
    aoeZones: useRef<AoEZone[]>([]),
    beams: useRef<{x: number, y: number, life: number, direction: Direction, length: number}[]>([]),
    particles: useRef<Particle[]>([]),
    
    // Stats & Timers
    score: useRef(0),
    health: useRef(INITIAL_HEALTH),
    burnTimer: useRef(0),
    combo: useRef(0),
    comboTimer: useRef(0),
    growthBucket: useRef(0),
    activePowerUp: useRef<PowerUpType>(PowerUpType.NONE),
    powerUpTimer: useRef(0),
    scoreBoosterTime: useRef(0),
    
    // Engine State
    lastTickTime: useRef(0),
    tickAccumulator: useRef(0),
    frame: useRef(0),
    isStunned: useRef(false),
    hasStarted: useRef(!isTutorial),
    
    // Item Spawning
    itemCount: useRef(0),
    spawnTimer: useRef(0),
    
    // Tutorial
    tutorialStep: useRef(0), // Ref for logic, State for UI
    tutorialTarget: useRef<{x: number, y: number} | null>(null),
  };

  // --- UI Sync State (For React Rendering) ---
  const [uiState, setUiState] = useState({
     score: 0,
     health: INITIAL_HEALTH,
     combo: 0,
     powerUp: PowerUpType.NONE,
     powerUpTime: 0,
     isPaused: false,
     audioEnabled: false,
     joystick: { active: false, startX: 0, startY: 0, currX: 0, currY: 0 } 
  });

  const [tutorialStepUI, setTutorialStepUI] = useState(0);
  const [showPressKey, setShowPressKey] = useState(false);

  // Keep track of the last state sent to UI to avoid duplicates
  const lastSyncedState = useRef<string>("");

  // --- Initialization ---
  const resetGameState = useCallback(() => {
    // Clear Collections
    refs.worldMap.current.clear();
    refs.chunkLastVisited.current.clear();
    refs.activeChunks.current.clear();
    refs.beams.current = [];
    refs.projectiles.current = [];
    refs.aoeZones.current = [];
    refs.particles.current = [];
    
    // Reset Values
    refs.boss.current = null;
    refs.bossTick.current = 0;
    refs.tutorialTarget.current = null;
    refs.itemCount.current = 0;
    refs.spawnTimer.current = 0; 
    refs.burnTimer.current = 0;
    refs.isStunned.current = false;
    refs.score.current = 0;
    refs.health.current = INITIAL_HEALTH;
    refs.combo.current = 0;
    refs.growthBucket.current = 0;
    refs.activePowerUp.current = PowerUpType.NONE;
    refs.hasStarted.current = !isTutorial;
    refs.lastTickTime.current = 0;
    refs.frame.current = 0;

    // Apply Consumables
    const headStart = !isTutorial && (inventory[ConsumableType.HEAD_START] || 0) > 0;
    const startLength = headStart ? 10 : INITIAL_SNAKE_LENGTH;

    const scoreBoost = !isTutorial && (inventory[ConsumableType.SCORE_BOOSTER] || 0) > 0;
    refs.scoreBoosterTime.current = scoreBoost ? 3600 : 0; 

    // Init Snake
    const snake: SnakeSegment[] = [];
    const visualSnake: {x: number, y: number}[] = [];
    for(let i=0; i<startLength; i++) {
      snake.push({ x: -i, y: 0, isHead: i === 0 });
      visualSnake.push({ x: -i, y: 0 });
    }
    refs.snake.current = snake;
    refs.snakeVisual.current = visualSnake;

    // Reset UI
    const initialState = {
       score: 0,
       health: INITIAL_HEALTH,
       combo: 0,
       powerUp: PowerUpType.NONE,
       powerUpTime: 0,
       isPaused: false,
       audioEnabled: false,
       joystick: { active: false, startX: 0, startY: 0, currX: 0, currY: 0 }
    };
    setUiState(initialState);
    lastSyncedState.current = JSON.stringify(initialState);

    if (isTutorial) {
      refs.tutorialStep.current = 0;
      setTutorialStepUI(0);
      setShowPressKey(true);
    } else {
      setShowPressKey(false);
    }
    
    refs.gameState.current = GameState.PLAYING;
  }, [isTutorial, inventory]);

  const syncUI = useCallback(() => {
    // Only update if something relevant changed to reduce React re-renders
    const nextState = {
       score: refs.score.current,
       health: refs.health.current,
       combo: refs.combo.current,
       powerUp: refs.activePowerUp.current,
       powerUpTime: refs.powerUpTimer.current,
    };
    
    // Create a signature to check diff (excluding paused/audio/joystick which are handled separately)
    const sig = `${nextState.score}-${nextState.health}-${nextState.combo}-${nextState.powerUp}-${Math.floor(nextState.powerUpTime/10)}`;
    
    if (sig !== lastSyncedState.current) {
        lastSyncedState.current = sig;
        setUiState(prev => ({
           ...prev,
           ...nextState
        }));
    }
  }, []);

  return {
    refs,
    uiState,
    setUiState,
    tutorialStepUI,
    setTutorialStepUI,
    showPressKey,
    setShowPressKey,
    resetGameState,
    syncUI
  };
};