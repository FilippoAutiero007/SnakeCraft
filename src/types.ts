
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  SHOP = 'SHOP',
  LEVEL_SELECT = 'LEVEL_SELECT',
  LEADERBOARD = 'LEADERBOARD'
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum BlockType {
  EMPTY = 'EMPTY',
  DIRT = 'DIRT', // Normal point (Chocolate)
  GOLD = 'GOLD', // Rare point
  STONE = 'STONE', // Obstacle
  BEDROCK = 'BEDROCK', // Indestructible
  LAVA = 'LAVA', // Death
  MAGMA = 'MAGMA', // Damage (-5 HP)
  ICE = 'ICE', // Slippery
  TRAP = 'TRAP', // Damage
  POWERUP_BOX = 'POWERUP_BOX',
  EVENT = 'EVENT' // Special event block
}

export enum BiomeType {
  GRASSLAND = 'GRASSLAND',
  DESERT = 'DESERT',
  TUNDRA = 'TUNDRA',
  OBSIDIAN_WASTE = 'OBSIDIAN_WASTE'
}

export enum PowerUpType {
  NONE = 'NONE',
  LASER_EYES = 'LASER_EYES', // Shoot
  GHOST_SHIELD = 'GHOST_SHIELD', // Invulnerable
  TIME_FREEZE = 'TIME_FREEZE', // Slow enemies
  SPEED_BOOST = 'SPEED_BOOST', // Fast move
  HEAL = 'HEAL', // Instant Heal

  // New
  ECHO_BOMB = 'ECHO_BOMB', // Area damage pulses
  FURY_CLAWS = 'FURY_CLAWS', // 3x3 Block Break
  DRAGON_HEART = 'DRAGON_HEART', // Regen + Fire trail
  THUNDER_MIND = 'THUNDER_MIND', // Auto-dodge (Ignore next hit)
  MIST_WINGS = 'MIST_WINGS', // Flight (Ignore terrain)
  SHADOW_TRACE = 'SHADOW_TRACE', // Double damage/score
  LUNAR_HARVEST = 'LUNAR_HARVEST', // Energy/Heal
  PHOENIX_EYE = 'PHOENIX_EYE', // Auto-Revive
}

// --- NEW SHOP TYPES ---

export enum UpgradeType {
  MAGNET = 'MAGNET',          // Pickup range
  GREED = 'GREED',            // More chocolate per block
  IRON_SCALE = 'IRON_SCALE',  // Reduced damage from traps/walls
  LUCKY_FIND = 'LUCKY_FIND',  // Higher chance for Gold/Powerups
  EXTENDED_POWER = 'EXTENDED_POWER' // Powerups last longer
}

export enum ConsumableType {
  HEAD_START = 'HEAD_START',  // Start with length 10
  SCORE_BOOSTER = 'SCORE_BOOSTER', // 2x Score for first minute
  REVIVE_KIT = 'REVIVE_KIT'   // (Not implemented yet, placeholder)
}

export interface PlayerStats {
  points: number; // Currency (Chocolate)
  highScore: number;
  levelsUnlocked: number;
  bossesDefeated: number;

  // Cosmetics
  ownedSkins: string[];
  currentSkin: string;
  ownedBackgrounds: string[];
  currentBackground: string;

  // RPG Elements
  upgrades: Record<UpgradeType, number>; // Level of each upgrade
  inventory: Record<ConsumableType, number>; // Count of consumables
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface SnakeSegment extends Coordinate {
  isHead: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  damage: number;
  color: string;
}

export interface AoEZone {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  growthRate: number;
  damage: number;
  color: string;
  opacity: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface Boss {
  position: Coordinate;
  visualPosition: { x: number, y: number }; // For smooth interpolation
  hp: number;
  maxHp: number;
  isActive: boolean;
  type: 'GOLEM' | 'PHOENIX' | 'SHADOW' | 'CYBER_WORM' | 'PUMPKIN_KING';
  phase: 'IDLE' | 'ATTACK' | 'COOLDOWN' | 'CHARGING';
  attackTimer: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  initialSpeed: number;
}