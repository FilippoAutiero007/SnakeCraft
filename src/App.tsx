
import React, { useState, useEffect } from 'react';
import Game from '../components/Game';
import MainMenu from '../components/MainMenu';
import GameOver from '../components/GameOver';
import { AuthButton } from './components/auth/AuthButton';
import { Leaderboard, saveLeaderboardScore } from './components/ui/Leaderboard';
import SettingsModal from './components/ui/SettingsModal';
import { useUser } from '@clerk/clerk-react';

import { GameState, PlayerStats, UpgradeType, ConsumableType } from './types';
import { SKINS, BACKGROUNDS, UPGRADES, CONSUMABLES } from '../constants';

// Hook locale per gestire le impostazioni visto che è sparito dal file originale
const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gameSettings');
    return saved ? JSON.parse(saved) : {
      language: 'it',
      buttonSize: 'medium',
      buttonPosition: 'bottom-right',
      volume: 80
    };
  });
  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
  };
  return [settings, updateSettings] as const;
};

const App: React.FC = () => {
  const { user } = useUser();
  const [settings, updateSettings] = useSettings();
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Persistence
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('snakecraft_stats_v3');
    const parsed = saved ? JSON.parse(saved) : {};

    // Default Fallbacks for new fields
    return {
      points: parsed.points || 0,
      highScore: parsed.highScore || 0,
      levelsUnlocked: parsed.levelsUnlocked || 1,
      bossesDefeated: parsed.bossesDefeated || 0,
      ownedSkins: parsed.ownedSkins || ['classic'],
      currentSkin: parsed.currentSkin || SKINS[0].color,
      ownedBackgrounds: parsed.ownedBackgrounds || ['default'],
      currentBackground: parsed.currentBackground || BACKGROUNDS[0].class,
      upgrades: parsed.upgrades || {
        [UpgradeType.MAGNET]: 0,
        [UpgradeType.GREED]: 0,
        [UpgradeType.IRON_SCALE]: 0,
        [UpgradeType.LUCKY_FIND]: 0,
        [UpgradeType.EXTENDED_POWER]: 0,
      },
      inventory: parsed.inventory || {
        [ConsumableType.HEAD_START]: 0,
        [ConsumableType.SCORE_BOOSTER]: 0,
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('snakecraft_stats_v3', JSON.stringify(stats));
  }, [stats]);

  const handleStartGame = (level: number) => {
    // Consume Items logic
    setStats(prev => {
      const newInventory = { ...prev.inventory };
      let changed = false;

      if ((newInventory[ConsumableType.HEAD_START] || 0) > 0) {
        newInventory[ConsumableType.HEAD_START]--;
        changed = true;
      }
      if ((newInventory[ConsumableType.SCORE_BOOSTER] || 0) > 0) {
        newInventory[ConsumableType.SCORE_BOOSTER]--;
        changed = true;
      }

      if (changed) {
        const newState = { ...prev, inventory: newInventory };
        localStorage.setItem('snakecraft_stats_v3', JSON.stringify(newState));
        return newState;
      }
      return prev;
    });

    setCurrentLevel(level);
    setIsTutorialMode(false);
    setGameState(GameState.PLAYING);
  };

  const handleStartTutorial = () => {
    setCurrentLevel(1);
    setIsTutorialMode(true);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (score: number, victory: boolean) => {
    if (isTutorialMode) {
      setGameState(GameState.MENU);
      return;
    }

    setLastScore(score);
    setBossDefeated(victory);

    setStats(prev => {
      let newPoints = prev.points + Math.floor(score / 10);
      let newLevelsUnlocked = prev.levelsUnlocked;

      if (victory) {
        // Always unlock next level when boss is defeated
        newLevelsUnlocked = Math.max(prev.levelsUnlocked, currentLevel + 1);

        // Reward every 10 levels: 1000 chocolate
        if (currentLevel % 10 === 0) {
          newPoints += 1000;
        } else if (currentLevel % 5 === 0) {
          newPoints += 500; // Bonus for milestone
        } else {
          newPoints += 200; // Standard boss victory bonus
        }
      }

      const newState = {
        ...prev,
        points: newPoints,
        highScore: Math.max(prev.highScore, score),
        levelsUnlocked: newLevelsUnlocked,
        bossesDefeated: victory ? prev.bossesDefeated + 1 : prev.bossesDefeated
      };

      localStorage.setItem('snakecraft_stats_v3', JSON.stringify(newState));

      // Save to leaderboard if user is logged in
      if (user && score > 0) {
        saveLeaderboardScore(score, currentLevel, user);
      }

      return newState;
    });

    setGameState(GameState.GAME_OVER);
  };

  // --- SHOP LOGIC ---

  const buySkin = (id: string, price: number) => {
    if (stats.points >= price && !stats.ownedSkins.includes(id)) {
      setStats(prev => ({
        ...prev,
        points: prev.points - price,
        ownedSkins: [...prev.ownedSkins, id]
      }));
    }
  };

  const equipSkin = (classStr: string) => {
    setStats(prev => ({ ...prev, currentSkin: classStr }));
  };

  const buyBg = (id: string, price: number) => {
    if (stats.points >= price && !stats.ownedBackgrounds.includes(id)) {
      setStats(prev => ({
        ...prev,
        points: prev.points - price,
        ownedBackgrounds: [...prev.ownedBackgrounds, id]
      }));
    }
  };

  const equipBg = (classStr: string) => {
    setStats(prev => ({ ...prev, currentBackground: classStr }));
  };

  const buyUpgrade = (id: UpgradeType) => {
    const upgradeInfo = UPGRADES.find(u => u.id === id);
    if (!upgradeInfo) return;

    const currentLevel = stats.upgrades[id] || 0;
    if (currentLevel >= upgradeInfo.maxLevel) return;

    // Cost Formula: Base * (Multiplier ^ Level)
    const cost = Math.floor(upgradeInfo.basePrice * Math.pow(upgradeInfo.priceMult, currentLevel));

    if (stats.points >= cost) {
      setStats(prev => ({
        ...prev,
        points: prev.points - cost,
        upgrades: {
          ...prev.upgrades,
          [id]: currentLevel + 1
        }
      }));
    }
  };

  const buyConsumable = (id: ConsumableType) => {
    const itemInfo = CONSUMABLES.find(c => c.id === id);
    if (!itemInfo) return;

    if (stats.points >= itemInfo.price) {
      setStats(prev => ({
        ...prev,
        points: prev.points - itemInfo.price,
        inventory: {
          ...prev.inventory,
          [id]: (prev.inventory[id] || 0) + 1
        }
      }));
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 text-white font-sans select-none">
      {/* Auth Button (always visible) */}
      <AuthButton />

      {gameState === GameState.MENU && (
        <MainMenu
          stats={stats}
          onStart={handleStartGame}
          onTutorial={handleStartTutorial}
          onBuySkin={buySkin}
          onEquipSkin={equipSkin}
          onBuyBg={buyBg}
          onEquipBg={equipBg}
          onBuyUpgrade={buyUpgrade}
          onBuyConsumable={buyConsumable}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowSettings={() => setShowSettings(true)}
        />
      )}

      {gameState === GameState.PLAYING && (
        <Game
          level={currentLevel}
          currentSkin={stats.currentSkin}
          currentBg={stats.currentBackground}
          onGameOver={handleGameOver}
          onExit={() => setGameState(GameState.MENU)}
          isTutorial={isTutorialMode}
          upgrades={stats.upgrades}
          inventory={stats.inventory}
          stats={stats}
          onBuyUpgrade={buyUpgrade}
          onBuyConsumable={buyConsumable}
          onBuySkin={buySkin}
          onEquipSkin={equipSkin}
          onBuyBg={buyBg}
          onEquipBg={equipBg}
          settings={settings}
        />
      )}

      {gameState === GameState.GAME_OVER && (
        <GameOver
          score={lastScore}
          bossDefeated={bossDefeated}
          onRestart={() => setGameState(GameState.PLAYING)}
          onHome={() => setGameState(GameState.MENU)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Modals */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={updateSettings}
          currentSettings={settings}
        />
      )}
    </div>
  );
};

export default App;