
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser'; // Import Phaser to use type definitions or global object if needed
import { GameState, Direction, PowerUpType, UpgradeType, ConsumableType, PlayerStats } from '../../types';
import GameUI from './GameUI';
import { Shop } from './Shop';

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
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShopInPause, setShowShopInPause] = React.useState(false);

  // UI State - synced from Phaser
  const [uiState, setUiState] = React.useState({
    score: 0,
    health: 100,
    combo: 0,
    powerUp: PowerUpType.NONE,
    powerUpTime: 0,
    isPaused: false,
    audioEnabled: true,
    joystick: { x: 0, y: 0 }
  });
  const [tutorialStepUI, setTutorialStepUI] = React.useState(0);
  const [showPressKey, setShowPressKey] = React.useState(true);

  // Initialize Phaser
  useEffect(() => {
    // Dynamic import to avoid SSR issues if any (though this is Client Side)
    import('../../phaser/phaser.config').then(({ getPhaserConfig }) => {
      if (gameInstanceRef.current) return;

      const config = getPhaserConfig('phaser-game-container');

      // Inject game data into scene configs
      // We'll pass data via registry or scene start data in the future
      // For now, simple init

      const game = new Phaser.Game(config);
      gameInstanceRef.current = game;

      // Setup Event Listeners from Phaser
      game.events.on('scoreUpdate', (score: number) => setUiState(p => ({ ...p, score })));
      game.events.on('healthUpdate', (health: number) => setUiState(p => ({ ...p, health })));
      game.events.on('gameOver', (data: { score: number, victory: boolean }) => onGameOver(data.score, data.victory));
      game.events.on('uiUpdate', (data: any) => setUiState(p => ({ ...p, ...data })));
      game.events.on('pauseStateChange', (isPaused: boolean) => setUiState(p => ({ ...p, isPaused })));
      game.events.on('tutorialStep', (step: number) => setTutorialStepUI(step));

      // Send initial data
      game.registry.set('level', level);
      game.registry.set('skin', currentSkin);
      game.registry.set('upgrades', upgrades);
      game.registry.set('isTutorial', isTutorial);
    });

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle Props Updates
  useEffect(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.registry.set('skin', currentSkin);
      // We might need to emit an event to tell the scene to update the skin instantly
      gameInstanceRef.current.events.emit('updateSkin', currentSkin);
    }
  }, [currentSkin]);

  const handlePause = () => {
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('MainGameScene');
      if (scene) scene.scene.pause();
      setUiState(p => ({ ...p, isPaused: true }));
    }
  };

  const handleResume = () => {
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('MainGameScene');
      if (scene) scene.scene.resume();
      setUiState(p => ({ ...p, isPaused: false }));
    }
  };

  const handleAbility = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('triggerAbility');
    }
  };

  const handleInput = (direction: Direction) => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('inputDirection', direction);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Phaser Container */}
      <div id="phaser-game-container" className="w-full h-full" />

      {/* React UI Overlay */}
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
          onToggleAudio={() => setUiState(p => ({ ...p, audioEnabled: !p.audioEnabled }))}
          onPause={handlePause}
          onResume={handleResume}
          onExit={onExit}
          onAbility={handleAbility}
          onInput={handleInput}
          onShop={stats && !isTutorial ? () => setShowShopInPause(true) : undefined}
        // Mobile controls (touch layer) could be handled by Phaser or kept here
        // For now, let's keep GameUI but disable its touch listeners if they conflict, 
        // or pass inputs derived here to Phaser. 
        // Note: GameUI typically handles buttons. 
        />
      ) : (
        <Shop
          stats={stats!}
          onBack={() => setShowShopInPause(false)}
          onBuySkin={onBuySkin!}
          onEquipSkin={onEquipSkin!}
          onBuyBg={onBuyBg!}
          onEquipBg={onEquipBg!}
          onBuyUpgrade={onBuyUpgrade!}
          onBuyConsumable={onBuyConsumable!}
        />
      )}

      {/* Mobile Touch Layer for Swipe/Tap */}
      <MobileTouchLayer onInput={handleInput} />
    </div>
  );
};

// Mobile swipe detection component
const MobileTouchLayer: React.FC<{ onInput: (dir: Direction) => void }> = ({ onInput }) => {
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30; // Minimum swipe distance
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (Math.abs(dx) > minSwipe) {
        onInput(dx > 0 ? Direction.RIGHT : Direction.LEFT);
      }
    } else {
      // Vertical swipe
      if (Math.abs(dy) > minSwipe) {
        onInput(dy > 0 ? Direction.DOWN : Direction.UP);
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <div
      className="absolute inset-0 z-10 md:hidden pointer-events-auto touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
};


export default Game;
