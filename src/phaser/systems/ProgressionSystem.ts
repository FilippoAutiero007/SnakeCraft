import Phaser from 'phaser';

export interface LevelConfig {
    level: number;
    bossType: 'GOLEM' | 'PHOENIX' | 'SHADOW' | 'CYBER_WORM' | 'PUMPKIN_KING';
    scoreThreshold: number;
    baseSpeed: number;
    enemyCount: number;
    hazardDensity: number;
    rewardMultiplier: number;
}

export class ProgressionSystem {
    private currentLevel: number = 1;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, startLevel: number = 1) {
        this.scene = scene;
        this.currentLevel = startLevel;
    }

    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    public advanceToNextLevel() {
        this.currentLevel++;
        this.scene.game.events.emit('levelAdvanced', {
            level: this.currentLevel,
            config: this.getLevelConfig()
        });
    }

    public getLevelConfig(): LevelConfig {
        const level = this.currentLevel;
        
        // Boss rotation (cycles through all 5 bosses)
        const bossTypes: Array<'GOLEM' | 'PHOENIX' | 'SHADOW' | 'CYBER_WORM' | 'PUMPKIN_KING'> = [
            'GOLEM',
            'PHOENIX',
            'SHADOW',
            'CYBER_WORM',
            'PUMPKIN_KING'
        ];
        const bossType = bossTypes[(level - 1) % bossTypes.length];

        // Score threshold to spawn boss (increases each level)
        const scoreThreshold = 500 + (level - 1) * 200;

        // Base speed decreases (faster gameplay)
        const baseSpeed = Math.max(50, 100 - (level - 1) * 5);

        // Enemy count increases
        const enemyCount = Math.min(10, 2 + Math.floor((level - 1) * 0.5));

        // Hazard density increases
        const hazardDensity = Math.min(0.3, 0.05 + (level - 1) * 0.02);

        // Reward multiplier increases
        const rewardMultiplier = 1 + (level - 1) * 0.1;

        return {
            level,
            bossType,
            scoreThreshold,
            baseSpeed,
            enemyCount,
            hazardDensity,
            rewardMultiplier
        };
    }

    public calculateDifficulty(): number {
        // Returns a difficulty score from 1-10
        return Math.min(10, 1 + Math.floor((this.currentLevel - 1) / 2));
    }

    public getSpeedMultiplier(chocolateEaten: number): number {
        // Speed increases as player eats more chocolate
        // Every 10 chocolate increases speed by 5%
        const speedBoost = Math.floor(chocolateEaten / 10) * 0.05;
        return Math.min(2.0, 1 + speedBoost); // Cap at 2x speed
    }

    public shouldSpawnBoss(score: number): boolean {
        const config = this.getLevelConfig();
        return score >= config.scoreThreshold;
    }

    public getNextLevelRequirement(): number {
        return this.getLevelConfig().scoreThreshold;
    }

    public reset() {
        this.currentLevel = 1;
    }
}
