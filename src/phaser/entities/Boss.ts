import Phaser from 'phaser';
import { Coordinate, Boss as BossData, Projectile, AoEZone } from '../../types';
import { CELL_SIZE_PX } from '../../constants';
import { findPath } from '../../ai/pathfinding';

export type BossType = 'GOLEM' | 'PHOENIX' | 'SHADOW' | 'CYBER_WORM' | 'PUMPKIN_KING';

interface BossConfig {
    type: BossType;
    maxHp: number;
    speed: number;
    attackPower: number;
    attackCooldown: number;
    specialAbilityCooldown: number;
    color: number;
    size: number;
}

const BOSS_CONFIGS: Record<BossType, BossConfig> = {
    GOLEM: {
        type: 'GOLEM',
        maxHp: 200,
        speed: 0.5,
        attackPower: 25,
        attackCooldown: 3000,
        specialAbilityCooldown: 8000,
        color: 0x8B4513,
        size: 3
    },
    PHOENIX: {
        type: 'PHOENIX',
        maxHp: 150,
        speed: 1.5,
        attackPower: 15,
        attackCooldown: 2000,
        specialAbilityCooldown: 10000,
        color: 0xFF4500,
        size: 2.5
    },
    SHADOW: {
        type: 'SHADOW',
        maxHp: 180,
        speed: 2.0,
        attackPower: 20,
        attackCooldown: 1500,
        specialAbilityCooldown: 7000,
        color: 0x2F4F4F,
        size: 2
    },
    CYBER_WORM: {
        type: 'CYBER_WORM',
        maxHp: 250,
        speed: 1.0,
        attackPower: 30,
        attackCooldown: 2500,
        specialAbilityCooldown: 9000,
        color: 0x00CED1,
        size: 4
    },
    PUMPKIN_KING: {
        type: 'PUMPKIN_KING',
        maxHp: 300,
        speed: 0.8,
        attackPower: 35,
        attackCooldown: 3500,
        specialAbilityCooldown: 12000,
        color: 0xFF8C00,
        size: 3.5
    }
};

export class Boss {
    private scene: Phaser.Scene;
    private config: BossConfig;
    private data: BossData;
    private sprite: Phaser.GameObjects.Rectangle;
    private healthBar: Phaser.GameObjects.Graphics;
    private lastAttackTime: number = 0;
    private lastSpecialTime: number = 0;
    private projectiles: Projectile[] = [];
    private aoeZones: AoEZone[] = [];
    private level: number;
    private targetPosition: Coordinate | null = null;
    private pathUpdateTimer: number = 0;
    private currentPath: Coordinate[] = [];
    private pathIndex: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, type: BossType, level: number = 1) {
        this.scene = scene;
        this.config = BOSS_CONFIGS[type];
        this.level = level;

        // Scale boss stats with level
        const hpMultiplier = 1 + (level - 1) * 0.3;
        const damageMultiplier = 1 + (level - 1) * 0.2;

        this.data = {
            position: { x, y },
            visualPosition: { x: x * CELL_SIZE_PX, y: y * CELL_SIZE_PX },
            hp: Math.floor(this.config.maxHp * hpMultiplier),
            maxHp: Math.floor(this.config.maxHp * hpMultiplier),
            isActive: true,
            type: type,
            phase: 'IDLE',
            attackTimer: 0
        };

        // Create boss sprite
        const size = CELL_SIZE_PX * this.config.size;
        this.sprite = scene.add.rectangle(
            this.data.visualPosition.x,
            this.data.visualPosition.y,
            size,
            size,
            this.config.color
        );
        this.sprite.setStrokeStyle(4, 0xFFFFFF);

        // Create health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    public update(delta: number, playerPos: Coordinate, getBlock: (x: number, y: number) => any) {
        if (!this.data.isActive) return;

        const currentTime = Date.now();

        // Update AI and movement
        this.updateAI(delta, playerPos, getBlock);

        // Update attack patterns
        this.updateAttacks(currentTime, playerPos);

        // Update projectiles
        this.updateProjectiles(delta);

        // Update AoE zones
        this.updateAoEZones(delta);

        // Update visual position (smooth interpolation)
        const targetX = this.data.position.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        const targetY = this.data.position.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        this.data.visualPosition.x += (targetX - this.data.visualPosition.x) * 0.1;
        this.data.visualPosition.y += (targetY - this.data.visualPosition.y) * 0.1;

        this.sprite.setPosition(this.data.visualPosition.x, this.data.visualPosition.y);
        this.updateHealthBar();
    }

    private updateAI(delta: number, playerPos: Coordinate, getBlock: (x: number, y: number) => any) {
        this.pathUpdateTimer += delta;

        // Update path every 500ms
        if (this.pathUpdateTimer > 500) {
            this.pathUpdateTimer = 0;
            const path = findPath(
                this.data.position,
                playerPos,
                (x, y) => {
                    const block = getBlock(x, y);
                    return block === 'EMPTY' || block === 'DIRT' || block === 'GOLD';
                }
            );
            if (path && path.length > 1) {
                this.currentPath = path;
                this.pathIndex = 0;
            }
        }

        // Follow path
        if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
            const target = this.currentPath[this.pathIndex];
            const dx = target.x - this.data.position.x;
            const dy = target.y - this.data.position.y;

            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                this.pathIndex++;
            } else {
                // Move towards target
                const speed = this.config.speed * (delta / 1000);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.data.position.x += (dx / distance) * speed;
                    this.data.position.y += (dy / distance) * speed;
                }
            }
        }
    }

    private updateAttacks(currentTime: number, playerPos: Coordinate) {
        // Regular attack
        if (currentTime - this.lastAttackTime > this.config.attackCooldown) {
            this.lastAttackTime = currentTime;
            this.performRegularAttack(playerPos);
        }

        // Special ability
        if (currentTime - this.lastSpecialTime > this.config.specialAbilityCooldown) {
            this.lastSpecialTime = currentTime;
            this.performSpecialAbility(playerPos);
        }
    }

    private performRegularAttack(playerPos: Coordinate) {
        switch (this.config.type) {
            case 'GOLEM':
                this.golemRockThrow(playerPos);
                break;
            case 'PHOENIX':
                this.phoenixFireball(playerPos);
                break;
            case 'SHADOW':
                this.shadowDash(playerPos);
                break;
            case 'CYBER_WORM':
                this.cyberLaser(playerPos);
                break;
            case 'PUMPKIN_KING':
                this.pumpkinBomb(playerPos);
                break;
        }
    }

    private performSpecialAbility(playerPos: Coordinate) {
        switch (this.config.type) {
            case 'GOLEM':
                this.golemEarthquake();
                break;
            case 'PHOENIX':
                this.phoenixRebirth();
                break;
            case 'SHADOW':
                this.shadowClones();
                break;
            case 'CYBER_WORM':
                this.cyberEMP();
                break;
            case 'PUMPKIN_KING':
                this.pumpkinHarvest();
                break;
        }
    }

    // GOLEM Attacks
    private golemRockThrow(playerPos: Coordinate) {
        const dx = playerPos.x - this.data.position.x;
        const dy = playerPos.y - this.data.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.projectiles.push({
                x: this.data.position.x * CELL_SIZE_PX,
                y: this.data.position.y * CELL_SIZE_PX,
                vx: (dx / distance) * 3,
                vy: (dy / distance) * 3,
                size: 20,
                damage: this.config.attackPower,
                color: '#8B4513'
            });
        }
    }

    private golemEarthquake() {
        // Create expanding shockwave
        this.aoeZones.push({
            x: this.data.position.x * CELL_SIZE_PX,
            y: this.data.position.y * CELL_SIZE_PX,
            radius: 0,
            maxRadius: CELL_SIZE_PX * 5,
            growthRate: 200,
            damage: this.config.attackPower * 1.5,
            color: '#8B4513',
            opacity: 0.6
        });
        this.scene.cameras.main.shake(300, 0.02);
    }

    // PHOENIX Attacks
    private phoenixFireball(playerPos: Coordinate) {
        // Shoot 3 fireballs in a spread
        for (let i = -1; i <= 1; i++) {
            const angle = Math.atan2(
                playerPos.y - this.data.position.y,
                playerPos.x - this.data.position.x
            ) + (i * 0.3);

            this.projectiles.push({
                x: this.data.position.x * CELL_SIZE_PX,
                y: this.data.position.y * CELL_SIZE_PX,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                size: 15,
                damage: this.config.attackPower,
                color: '#FF4500'
            });
        }
    }

    private phoenixRebirth() {
        // Heal and create fire ring
        this.data.hp = Math.min(this.data.maxHp, this.data.hp + 50);
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.projectiles.push({
                x: this.data.position.x * CELL_SIZE_PX,
                y: this.data.position.y * CELL_SIZE_PX,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 12,
                damage: this.config.attackPower * 0.8,
                color: '#FF6347'
            });
        }
    }

    // SHADOW Attacks
    private shadowDash(playerPos: Coordinate) {
        // Quick dash towards player
        const dx = playerPos.x - this.data.position.x;
        const dy = playerPos.y - this.data.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.data.position.x += (dx / distance) * 3;
            this.data.position.y += (dy / distance) * 3;
        }
    }

    private shadowClones() {
        // Create illusion projectiles from multiple directions
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = CELL_SIZE_PX * 4;
            this.projectiles.push({
                x: this.data.position.x * CELL_SIZE_PX + Math.cos(angle) * distance,
                y: this.data.position.y * CELL_SIZE_PX + Math.sin(angle) * distance,
                vx: -Math.cos(angle) * 2,
                vy: -Math.sin(angle) * 2,
                size: 10,
                damage: this.config.attackPower * 0.5,
                color: '#2F4F4F'
            });
        }
    }

    // CYBER_WORM Attacks
    private cyberLaser(playerPos: Coordinate) {
        // Straight laser beam
        const dx = playerPos.x - this.data.position.x;
        const dy = playerPos.y - this.data.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.projectiles.push({
                x: this.data.position.x * CELL_SIZE_PX,
                y: this.data.position.y * CELL_SIZE_PX,
                vx: (dx / distance) * 6,
                vy: (dy / distance) * 6,
                size: 8,
                damage: this.config.attackPower,
                color: '#00CED1'
            });
        }
    }

    private cyberEMP() {
        // Disable player abilities temporarily and create electric field
        this.scene.game.events.emit('bossSpecial', { type: 'EMP', duration: 3000 });
        
        this.aoeZones.push({
            x: this.data.position.x * CELL_SIZE_PX,
            y: this.data.position.y * CELL_SIZE_PX,
            radius: 0,
            maxRadius: CELL_SIZE_PX * 6,
            growthRate: 300,
            damage: this.config.attackPower * 0.3,
            color: '#00CED1',
            opacity: 0.4
        });
    }

    // PUMPKIN_KING Attacks
    private pumpkinBomb(playerPos: Coordinate) {
        // Lob explosive pumpkin
        const dx = playerPos.x - this.data.position.x;
        const dy = playerPos.y - this.data.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.projectiles.push({
                x: this.data.position.x * CELL_SIZE_PX,
                y: this.data.position.y * CELL_SIZE_PX,
                vx: (dx / distance) * 2.5,
                vy: (dy / distance) * 2.5,
                size: 25,
                damage: this.config.attackPower * 1.2,
                color: '#FF8C00'
            });
        }
    }

    private pumpkinHarvest() {
        // Spawn multiple explosive pumpkins around the arena
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = CELL_SIZE_PX * 3;
            
            this.aoeZones.push({
                x: this.data.position.x * CELL_SIZE_PX + Math.cos(angle) * distance,
                y: this.data.position.y * CELL_SIZE_PX + Math.sin(angle) * distance,
                radius: 0,
                maxRadius: CELL_SIZE_PX * 2,
                growthRate: 150,
                damage: this.config.attackPower,
                color: '#FF8C00',
                opacity: 0.7
            });
        }
    }

    private updateProjectiles(delta: number) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx * (delta / 16);
            proj.y += proj.vy * (delta / 16);

            // Remove if out of bounds
            const maxDistance = CELL_SIZE_PX * 20;
            if (Math.abs(proj.x - this.data.position.x * CELL_SIZE_PX) > maxDistance ||
                Math.abs(proj.y - this.data.position.y * CELL_SIZE_PX) > maxDistance) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    private updateAoEZones(delta: number) {
        for (let i = this.aoeZones.length - 1; i >= 0; i--) {
            const zone = this.aoeZones[i];
            zone.radius += zone.growthRate * (delta / 1000);

            if (zone.radius >= zone.maxRadius) {
                this.aoeZones.splice(i, 1);
            }
        }
    }

    public takeDamage(amount: number): boolean {
        this.data.hp -= amount;
        this.scene.cameras.main.flash(100, 255, 0, 0, false);

        if (this.data.hp <= 0) {
            this.data.hp = 0;
            this.data.isActive = false;
            this.destroy();
            return true; // Boss defeated
        }

        return false;
    }

    public checkProjectileCollision(x: number, y: number): number {
        let totalDamage = 0;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            const dx = proj.x - x * CELL_SIZE_PX;
            const dy = proj.y - y * CELL_SIZE_PX;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CELL_SIZE_PX / 2 + proj.size / 2) {
                totalDamage += proj.damage;
                this.projectiles.splice(i, 1);
            }
        }

        return totalDamage;
    }

    public checkAoECollision(x: number, y: number): number {
        let totalDamage = 0;

        for (const zone of this.aoeZones) {
            const dx = zone.x - x * CELL_SIZE_PX;
            const dy = zone.y - y * CELL_SIZE_PX;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < zone.radius) {
                totalDamage += zone.damage * 0.016; // Per frame damage
            }
        }

        return totalDamage;
    }

    public render(graphics: Phaser.GameObjects.Graphics) {
        // Render projectiles
        for (const proj of this.projectiles) {
            graphics.fillStyle(parseInt(proj.color.replace('#', '0x')), 1);
            graphics.fillCircle(proj.x, proj.y, proj.size);
        }

        // Render AoE zones
        for (const zone of this.aoeZones) {
            graphics.fillStyle(parseInt(zone.color.replace('#', '0x')), zone.opacity);
            graphics.fillCircle(zone.x, zone.y, zone.radius);
        }
    }

    private updateHealthBar() {
        this.healthBar.clear();

        const barWidth = CELL_SIZE_PX * this.config.size;
        const barHeight = 8;
        const x = this.data.visualPosition.x - barWidth / 2;
        const y = this.data.visualPosition.y - (CELL_SIZE_PX * this.config.size) / 2 - 15;

        // Background
        this.healthBar.fillStyle(0x000000, 0.8);
        this.healthBar.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthPercent = this.data.hp / this.data.maxHp;
        const healthColor = healthPercent > 0.5 ? 0x00FF00 : healthPercent > 0.25 ? 0xFFFF00 : 0xFF0000;
        this.healthBar.fillStyle(healthColor, 1);
        this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

        // Border
        this.healthBar.lineStyle(2, 0xFFFFFF, 1);
        this.healthBar.strokeRect(x, y, barWidth, barHeight);
    }

    public getData(): BossData {
        return this.data;
    }

    public getProjectiles(): Projectile[] {
        return this.projectiles;
    }

    public getAoEZones(): AoEZone[] {
        return this.aoeZones;
    }

    public destroy() {
        this.sprite.destroy();
        this.healthBar.destroy();
        this.projectiles = [];
        this.aoeZones = [];
    }
}
