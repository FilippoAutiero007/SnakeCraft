
import Phaser from 'phaser';
import { SnakeSmooth as Snake } from '../entities/SnakeSmooth'; // Usa movimento fluido
import { WorldManager } from '../entities/WorldManager';
import { Boss, BossType } from '../entities/Boss';
import { Direction, BlockType, PowerUpType, UpgradeType, ConsumableType } from '../../types';
import { CELL_SIZE_PX } from '../../constants';
import { getBiome, getBiomeEffect } from '../../utils/logic';
import { ProgressionSystem } from '../systems/ProgressionSystem';

export class MainGameScene extends Phaser.Scene {
    private snake!: Snake;
    private worldManager!: WorldManager;
    private boss: Boss | null = null;
    private bossGraphics!: Phaser.GameObjects.Graphics;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    // Game Loop State
    private lastMoveTime: number = 0;
    private moveInterval: number = 100; // ms
    private score: number = 0;
    private health: number = 100;
    private isGameOver: boolean = false;
    private spawnTimer: number = 0;
    private activePowerUp: PowerUpType = PowerUpType.NONE;
    private powerUpTimer: Phaser.Time.TimerEvent | null = null;
    private isTutorial: boolean = false;
    private combo: number = 0;
    private comboTimer: number = 0;
    private bossSpawnScore: number = 500;
    private bossDefeated: boolean = false;
    private upgrades: Record<UpgradeType, number> = {
        MAGNET: 0,
        GREED: 0,
        IRON_SCALE: 0,
        LUCKY_FIND: 0,
        EXTENDED_POWER: 0
    };
    private consumablesUsed: Record<ConsumableType, boolean> = {
        HEAD_START: false,
        SCORE_BOOSTER: false,
        REVIVE_KIT: false
    };
    private scoreMultiplier: number = 1;
    private biomeEffectTimer: number = 0;
    private progressionSystem!: ProgressionSystem;
    private chocolateEaten: number = 0;

    constructor() {
        super({ key: 'MainGameScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#111827');

        const startX = 10;
        const startY = 10;
        const skin = this.registry.get('skin') || 'classic';
        const level = this.registry.get('level') || 1;
        this.isTutorial = this.registry.get('isTutorial') || false;

        // Load player stats for upgrades and consumables
        const playerStats = this.registry.get('playerStats');
        if (playerStats) {
            this.upgrades = playerStats.upgrades || this.upgrades;
            
            // Apply consumables
            if (playerStats.inventory?.HEAD_START > 0 && !this.consumablesUsed.HEAD_START) {
                this.consumablesUsed.HEAD_START = true;
                // Will start with length 10 (handled in Snake creation)
            }
            if (playerStats.inventory?.SCORE_BOOSTER > 0 && !this.consumablesUsed.SCORE_BOOSTER) {
                this.consumablesUsed.SCORE_BOOSTER = true;
                this.scoreMultiplier = 2;
                // Reset after 60 seconds
                this.time.delayedCall(60000, () => {
                    this.scoreMultiplier = 1;
                });
            }
        }

        // Create boss graphics layer
        this.bossGraphics = this.add.graphics();

        // Initialize progression system
        this.progressionSystem = new ProgressionSystem(this, level);
        const levelConfig = this.progressionSystem.getLevelConfig();
        this.bossSpawnScore = levelConfig.scoreThreshold;
        this.moveInterval = levelConfig.baseSpeed;

        const initialLength = this.consumablesUsed.HEAD_START ? 10 : 3;
        this.snake = new Snake(this, startX, startY, initialLength, skin);
        
        // Configura velocità di interpolazione del movimento
        if (this.snake instanceof Snake) {
            this.snake.setMoveSpeed(this.moveInterval);
        }
        this.worldManager = new WorldManager(this, level);
        this.worldManager.update(startX, startY);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        this.cameras.main.centerOn(startX * CELL_SIZE_PX, startY * CELL_SIZE_PX);
        this.cameras.main.setZoom(1.0);

        this.game.events.on('inputDirection', (dir: Direction) => {
            if (this.snake && !this.isGameOver) this.snake.setDirection(dir);
        });

        // Listen for ability trigger (LASER_EYES)
        this.game.events.on('triggerAbility', () => {
            if (this.activePowerUp === PowerUpType.LASER_EYES) {
                this.fireLaser();
            }
        });

        // Listen for skin updates
        this.game.events.on('updateSkin', (newSkin: string) => {
            if (this.snake) {
                this.snake.updateSkin(newSkin);
            }
        });

        // Reset state
        this.score = 0;
        this.health = 100;
        this.combo = 0;
        this.comboTimer = 0;
        this.isGameOver = false;
        this.activePowerUp = PowerUpType.NONE;
        if (this.powerUpTimer) {
            this.powerUpTimer.destroy();
            this.powerUpTimer = null;
        }
        
        // Emit initial UI state
        this.game.events.emit('scoreUpdate', 0);
        this.game.events.emit('healthUpdate', 100);
        this.game.events.emit('uiUpdate', { combo: 0 });
    }

    update(time: number, delta: number) {
        if (this.isGameOver || !this.snake) return;

        this.handleInput();

        if (time - this.lastMoveTime > this.moveInterval) {
            this.lastMoveTime = time;
            this.tick();
        }

        // Spawn items check every approx 1s
        this.spawnTimer += delta;
        if (this.spawnTimer > 1000) {
            const head = this.snake.getHead();
            this.worldManager.spawnItemNearPlayer(head.x, head.y);
            this.spawnTimer = 0;
        }

        // Apply biome environmental effects
        this.biomeEffectTimer += delta;
        if (this.biomeEffectTimer > 2000) { // Every 2 seconds
            this.biomeEffectTimer = 0;
            const head = this.snake.getHead();
            const biome = getBiome(head.x, head.y, this.isTutorial);
            const effect = getBiomeEffect(biome);
            
            if (effect) {
                if (effect.type === 'heat' || effect.type === 'toxic') {
                    this.takeDamage(effect.value);
                } else if (effect.type === 'cold') {
                    // Slow down movement temporarily
                    this.moveInterval = Math.max(100, this.moveInterval * 1.2);
                    this.time.delayedCall(2000, () => {
                        this.moveInterval = 100;
                    });
                }
            }
        }

        // Update boss
        if (this.boss) {
            this.boss.update(delta, this.snake.getHead(), (x, y) => this.worldManager.getBlock(x, y));
            
            // Check boss attacks on player
            const head = this.snake.getHead();
            const projectileDamage = this.boss.checkProjectileCollision(head.x, head.y);
            const aoeDamage = this.boss.checkAoECollision(head.x, head.y);
            
            if (projectileDamage > 0) {
                this.takeDamage(projectileDamage);
            }
            if (aoeDamage > 0) {
                this.takeDamage(aoeDamage);
            }

            // Render boss attacks
            this.bossGraphics.clear();
            this.boss.render(this.bossGraphics);
        } else if (!this.isTutorial && !this.bossDefeated && this.progressionSystem.shouldSpawnBoss(this.score)) {
            // Spawn boss when score threshold reached
            this.spawnBoss();
        }
    }

    private tick() {
        const next = this.snake.previewMove();
        const block = this.worldManager.getBlock(next.x, next.y);

        // Collision: Self
        if (this.snake.isOccupying(next.x, next.y) && this.activePowerUp !== PowerUpType.GHOST_SHIELD) {
            this.handleGameOver();
            return;
        }

        // Collision: World
        const isShielded = this.activePowerUp === PowerUpType.GHOST_SHIELD;
        if (block === BlockType.STONE || block === BlockType.BEDROCK) {
            if (isShielded && block === BlockType.STONE) {
                // Ghost shield can break stone blocks
                this.worldManager.removeBlock(next.x, next.y);
            } else if (block === BlockType.BEDROCK) {
                this.handleGameOver();
                return;
            } else {
                // Stone does damage but doesn't kill instantly
                this.takeDamage(20);
                if (this.health <= 0) return;
                // Bounce back - don't move
                return;
            }
        } else if (block === BlockType.LAVA) {
            if (!isShielded) {
                this.takeDamage(15); // Reduced from 30
                if (this.health <= 0) return;
            }
        } else if (block === BlockType.MAGMA && !isShielded) {
            this.takeDamage(3); // Reduced from 5
        } else if (block === BlockType.TRAP && !isShielded) {
            this.takeDamage(15);
        }

        let grow = false;
        if (block === BlockType.DIRT) {
            this.chocolateEaten++;
            this.addScore(10);
            grow = true;
            this.worldManager.removeBlock(next.x, next.y);
            
            // Increase speed as player eats chocolate
            const speedMultiplier = this.progressionSystem.getSpeedMultiplier(this.chocolateEaten);
            this.moveInterval = Math.max(50, 100 / speedMultiplier);
        } else if (block === BlockType.GOLD) {
            this.addScore(50);
            grow = true;
            this.worldManager.removeBlock(next.x, next.y);
        } else if (block === BlockType.POWERUP_BOX) {
            this.handlePowerUp();
            this.worldManager.removeBlock(next.x, next.y);
        }
        
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else if (this.combo > 0) {
            this.combo = 0;
            this.game.events.emit('uiUpdate', { combo: 0 });
        }

        this.snake.move(grow);
        this.worldManager.update(next.x, next.y);

        // Center Camera
        const head = this.snake.getHead();
        const px = head.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        const py = head.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        this.cameras.main.centerOn(px, py);
    }

    private handlePowerUp() {
        const types = [PowerUpType.SPEED_BOOST, PowerUpType.GHOST_SHIELD, PowerUpType.LASER_EYES];
        const random = types[Math.floor(Math.random() * types.length)];

        // Clear any existing power-up timer
        if (this.powerUpTimer) {
            this.powerUpTimer.destroy();
            this.powerUpTimer = null;
        }

        // Set active power-up
        this.activePowerUp = random;

        // Notify React UI
        this.game.events.emit('uiUpdate', { powerUp: random, powerUpTime: 600 });

        // Apply effect logic based on power-up type
        if (random === PowerUpType.SPEED_BOOST) {
            this.moveInterval = 50;
        }

        // Set timer to reset power-up after 10 seconds (600 ticks at ~60fps = ~10s)
        this.powerUpTimer = this.time.delayedCall(10000, () => {
            this.resetPowerUp();
        });
    }

    private resetPowerUp() {
        if (this.activePowerUp === PowerUpType.SPEED_BOOST) {
            this.moveInterval = 100;
        }
        this.activePowerUp = PowerUpType.NONE;
        this.game.events.emit('uiUpdate', { powerUp: PowerUpType.NONE, powerUpTime: 0 });
        if (this.powerUpTimer) {
            this.powerUpTimer.destroy();
            this.powerUpTimer = null;
        }
    }

    private addScore(base: number) {
        // Apply GREED upgrade
        const greedMultiplier = 1 + (this.upgrades.GREED * 0.15);
        base = Math.floor(base * greedMultiplier);

        // Apply score booster consumable
        base = Math.floor(base * this.scoreMultiplier);

        // Combo bonus
        this.combo++;
        this.comboTimer = 30; // ~0.5 seconds at 60fps tick rate
        
        const comboMultiplier = 1 + (this.combo * 0.1); // 10% bonus per combo
        const finalScore = Math.floor(base * comboMultiplier);
        
        this.score += finalScore;
        this.game.events.emit('scoreUpdate', this.score);
        this.game.events.emit('uiUpdate', { combo: this.combo });
    }

    private takeDamage(amount: number) {
        if (this.isTutorial) return;
        
        // Apply IRON_SCALE upgrade (damage reduction)
        const damageReduction = 1 - (this.upgrades.IRON_SCALE * 0.1);
        amount = Math.floor(amount * damageReduction);
        
        this.health = Math.max(0, this.health - amount);
        this.game.events.emit('healthUpdate', this.health);
        this.cameras.main.shake(100, 0.02);
        
        if (this.health <= 0) {
            this.handleGameOver();
        }
    }

    private fireLaser() {
        if (!this.snake) return;
        
        const head = this.snake.getHead();
        const dir = this.snake.getDirection();
        
        // Create laser beam visual
        let dx = 0, dy = 0;
        switch (dir) {
            case Direction.UP: dy = -1; break;
            case Direction.DOWN: dy = 1; break;
            case Direction.LEFT: dx = -1; break;
            case Direction.RIGHT: dx = 1; break;
        }
        
        // Check if laser hits boss
        if (this.boss) {
            const bossData = this.boss.getData();
            for (let i = 1; i <= 10; i++) {
                const tx = head.x + dx * i;
                const ty = head.y + dy * i;
                
                // Check if laser hits boss position
                if (Math.abs(tx - bossData.position.x) < 2 && Math.abs(ty - bossData.position.y) < 2) {
                    const defeated = this.boss.takeDamage(50);
                    if (defeated) {
                        this.handleBossDefeat();
                    }
                    break;
                }
            }
        }
        
        // Destroy blocks in laser path (up to 10 blocks)
        for (let i = 1; i <= 10; i++) {
            const tx = head.x + dx * i;
            const ty = head.y + dy * i;
            const block = this.worldManager.getBlock(tx, ty);
            
            if (block === BlockType.BEDROCK) break;
            
            if (block === BlockType.STONE || block === BlockType.DIRT || block === BlockType.GOLD) {
                this.worldManager.removeBlock(tx, ty);
                this.score += 5;
            }
            
            // Draw laser effect
            const px = tx * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            const py = ty * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            const laserRect = this.add.rectangle(px, py, CELL_SIZE_PX, CELL_SIZE_PX, 0xff0000, 0.8);
            this.time.delayedCall(200, () => laserRect.destroy());
        }
        
        this.game.events.emit('scoreUpdate', this.score);
    }

    private handleGameOver() {
        this.isGameOver = true;
        this.cameras.main.shake(200, 0.05);
        this.game.events.emit('gameOver', { score: this.score, victory: false });
    }

    private spawnBoss() {
        const levelConfig = this.progressionSystem.getLevelConfig();
        const bossType = levelConfig.bossType;
        
        const head = this.snake.getHead();
        const bossX = head.x + 15;
        const bossY = head.y + 15;
        
        this.boss = new Boss(this, bossX, bossY, bossType, levelConfig.level);
        this.game.events.emit('uiUpdate', { 
            bossSpawned: true, 
            bossType: bossType,
            level: levelConfig.level 
        });
    }

    private handleBossDefeat() {
        this.bossDefeated = false; // Reset for next level
        this.boss = null;
        
        // Reward player
        const levelConfig = this.progressionSystem.getLevelConfig();
        const reward = Math.floor(1000 * levelConfig.rewardMultiplier);
        this.addScore(reward);
        
        // Advance to next level
        this.progressionSystem.advanceToNextLevel();
        const nextConfig = this.progressionSystem.getLevelConfig();
        this.bossSpawnScore = this.score + nextConfig.scoreThreshold;
        
        // Notify UI
        this.game.events.emit('levelComplete', { 
            level: levelConfig.level,
            nextLevel: nextConfig.level,
            reward: reward
        });
        
        // Continue playing (infinite levels)
        this.cameras.main.flash(500, 255, 215, 0);
    }

    private handleInput() {
        if (!this.cursors) return;

        if (this.cursors.left.isDown) {
            this.snake.setDirection(Direction.LEFT);
        } else if (this.cursors.right.isDown) {
            this.snake.setDirection(Direction.RIGHT);
        } else if (this.cursors.up.isDown) {
            this.snake.setDirection(Direction.UP);
        } else if (this.cursors.down.isDown) {
            this.snake.setDirection(Direction.DOWN);
        }
    }
}
