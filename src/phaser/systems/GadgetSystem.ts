import Phaser from 'phaser';
import { CELL_SIZE_PX } from '../../constants';

export enum GadgetType {
    NONE = 'NONE',
    TELEPORT = 'TELEPORT',
    SHIELD_BUBBLE = 'SHIELD_BUBBLE',
    TIME_SLOW = 'TIME_SLOW',
    MAGNET_FIELD = 'MAGNET_FIELD',
    BOMB = 'BOMB'
}

interface Gadget {
    type: GadgetType;
    cooldown: number;
    duration: number;
    lastUsed: number;
}

export class GadgetSystem {
    private scene: Phaser.Scene;
    private activeGadgets: Map<GadgetType, Gadget>;
    private equippedGadget: GadgetType = GadgetType.NONE;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.activeGadgets = new Map();
    }

    public equipGadget(type: GadgetType) {
        this.equippedGadget = type;
    }

    public useGadget(playerX: number, playerY: number): boolean {
        if (this.equippedGadget === GadgetType.NONE) return false;

        const gadget = this.getGadgetConfig(this.equippedGadget);
        const now = Date.now();

        // Check cooldown
        const lastUsed = this.activeGadgets.get(this.equippedGadget)?.lastUsed || 0;
        if (now - lastUsed < gadget.cooldown) {
            return false; // Still on cooldown
        }

        // Use gadget
        this.activateGadget(this.equippedGadget, playerX, playerY);

        // Update last used time
        this.activeGadgets.set(this.equippedGadget, {
            ...gadget,
            lastUsed: now
        });

        return true;
    }

    private getGadgetConfig(type: GadgetType): Gadget {
        switch (type) {
            case GadgetType.TELEPORT:
                return { type, cooldown: 10000, duration: 0, lastUsed: 0 };
            case GadgetType.SHIELD_BUBBLE:
                return { type, cooldown: 15000, duration: 5000, lastUsed: 0 };
            case GadgetType.TIME_SLOW:
                return { type, cooldown: 20000, duration: 8000, lastUsed: 0 };
            case GadgetType.MAGNET_FIELD:
                return { type, cooldown: 12000, duration: 6000, lastUsed: 0 };
            case GadgetType.BOMB:
                return { type, cooldown: 8000, duration: 0, lastUsed: 0 };
            default:
                return { type: GadgetType.NONE, cooldown: 0, duration: 0, lastUsed: 0 };
        }
    }

    private activateGadget(type: GadgetType, playerX: number, playerY: number) {
        switch (type) {
            case GadgetType.TELEPORT:
                this.teleport(playerX, playerY);
                break;
            case GadgetType.SHIELD_BUBBLE:
                this.shieldBubble();
                break;
            case GadgetType.TIME_SLOW:
                this.timeSlow();
                break;
            case GadgetType.MAGNET_FIELD:
                this.magnetField();
                break;
            case GadgetType.BOMB:
                this.bomb(playerX, playerY);
                break;
        }
    }

    private teleport(playerX: number, playerY: number) {
        // Teleport player forward in current direction
        const direction = this.scene.game.registry.get('currentDirection') || 'RIGHT';
        let dx = 0, dy = 0;

        switch (direction) {
            case 'UP': dy = -10; break;
            case 'DOWN': dy = 10; break;
            case 'LEFT': dx = -10; break;
            case 'RIGHT': dx = 10; break;
        }

        this.scene.game.events.emit('gadgetUsed', {
            type: 'TELEPORT',
            targetX: playerX + dx,
            targetY: playerY + dy
        });

        // Visual effect
        const px = playerX * CELL_SIZE_PX;
        const py = playerY * CELL_SIZE_PX;
        const circle = this.scene.add.circle(px, py, CELL_SIZE_PX * 2, 0x00FFFF, 0.5);
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => circle.destroy()
        });
    }

    private shieldBubble() {
        this.scene.game.events.emit('gadgetUsed', {
            type: 'SHIELD_BUBBLE',
            duration: 5000
        });

        // Visual effect - shield around player
        this.scene.game.events.emit('uiUpdate', { gadgetActive: 'SHIELD_BUBBLE' });
    }

    private timeSlow() {
        this.scene.game.events.emit('gadgetUsed', {
            type: 'TIME_SLOW',
            duration: 8000
        });

        // Slow down game time
        this.scene.time.timeScale = 0.5;
        this.scene.time.delayedCall(8000, () => {
            this.scene.time.timeScale = 1.0;
        });

        this.scene.game.events.emit('uiUpdate', { gadgetActive: 'TIME_SLOW' });
    }

    private magnetField() {
        this.scene.game.events.emit('gadgetUsed', {
            type: 'MAGNET_FIELD',
            duration: 6000,
            radius: 10
        });

        this.scene.game.events.emit('uiUpdate', { gadgetActive: 'MAGNET_FIELD' });
    }

    private bomb(playerX: number, playerY: number) {
        // Destroy blocks in radius
        const radius = 3;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    this.scene.game.events.emit('destroyBlock', {
                        x: playerX + dx,
                        y: playerY + dy
                    });
                }
            }
        }

        // Visual explosion
        const px = playerX * CELL_SIZE_PX;
        const py = playerY * CELL_SIZE_PX;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = CELL_SIZE_PX * radius;
            const particle = this.scene.add.circle(
                px + Math.cos(angle) * distance,
                py + Math.sin(angle) * distance,
                10,
                0xFF6600,
                1
            );
            
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }

        this.scene.cameras.main.shake(200, 0.03);
    }

    public getCooldownPercent(type: GadgetType): number {
        const gadget = this.activeGadgets.get(type);
        if (!gadget) return 1; // Ready to use

        const now = Date.now();
        const elapsed = now - gadget.lastUsed;
        return Math.min(1, elapsed / gadget.cooldown);
    }

    public isReady(type: GadgetType): boolean {
        return this.getCooldownPercent(type) >= 1;
    }
}
