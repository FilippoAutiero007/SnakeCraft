import Phaser from 'phaser';
import { Direction, Coordinate, SnakeSegment } from '../../types';
import { CELL_SIZE_PX, SKINS } from '../../constants';
import { SmoothMovementSystem } from '../systems/SmoothMovementSystem';

/**
 * Versione migliorata di Snake con movimento fluido (interpolazione Lerp)
 * Risolve il problema di motion sickness del movimento a scatti
 */
export class SnakeSmooth {
    private scene: Phaser.Scene;
    private body: SnakeSegment[];
    private direction: Direction;
    private nextDirection: Direction;
    private group: Phaser.GameObjects.Group;
    private headColor: number;
    private bodyColor: number;
    private growing: boolean = false;
    private smoothMovement: SmoothMovementSystem;
    
    // Tracking per interpolazione
    private visualPositions: Map<string, { x: number; y: number }> = new Map();
    private lastGridPositions: Map<string, { x: number; y: number }> = new Map();

    constructor(scene: Phaser.Scene, x: number, y: number, initialLength: number, skinId: string) {
        this.scene = scene;
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.smoothMovement = new SmoothMovementSystem(scene, 100);

        // Initialize body
        this.body = [];
        for (let i = 0; i < initialLength; i++) {
            this.body.push({ x: x - i, y: y, isHead: i === 0 });
        }

        // Colors
        const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
        const colorInt = parseInt(skin.color.replace('#', '0x'), 16);
        this.headColor = 0xffffff;
        this.bodyColor = colorInt;

        // Create Group for rendering
        this.group = this.scene.add.group();
        this.render();
    }

    public setDirection(dir: Direction) {
        // Prevent 180 turns
        if (this.direction === Direction.UP && dir === Direction.DOWN) return;
        if (this.direction === Direction.DOWN && dir === Direction.UP) return;
        if (this.direction === Direction.LEFT && dir === Direction.RIGHT) return;
        if (this.direction === Direction.RIGHT && dir === Direction.LEFT) return;

        this.nextDirection = dir;
    }

    public previewMove(): Coordinate {
        const head = this.body[0];
        const next = { ...head };

        switch (this.nextDirection) {
            case Direction.UP: next.y--; break;
            case Direction.DOWN: next.y++; break;
            case Direction.LEFT: next.x--; break;
            case Direction.RIGHT: next.x++; break;
        }
        return next;
    }

    public move(grow: boolean = false) {
        this.direction = this.nextDirection;
        const head = this.previewMove();
        
        // Salva posizioni precedenti per interpolazione
        const previousPositions = this.body.map((seg, idx) => ({
            id: `segment-${idx}`,
            fromX: seg.x,
            fromY: seg.y,
            toX: idx === 0 ? head.x : this.body[idx - 1].x,
            toY: idx === 0 ? head.y : this.body[idx - 1].y,
            object: null as any // Sarà riempito in render()
        }));

        // Update body logic
        this.body[0].isHead = false;
        this.body.unshift({ ...head, isHead: true });

        if (!grow) {
            this.body.pop();
        }

        // Render con interpolazione
        this.renderSmooth(previousPositions);
    }

    public isOccupying(x: number, y: number): boolean {
        // Ignore tail (last segment) because it will move away
        for (let i = 0; i < this.body.length - 1; i++) {
            if (this.body[i].x === x && this.body[i].y === y) return true;
        }
        return false;
    }

    private render() {
        this.group.clear(true, true);

        this.body.forEach((segment, idx) => {
            const x = segment.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            const y = segment.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;

            const color = segment.isHead ? 0xFFFFFF : this.bodyColor;

            const rect = this.scene.add.rectangle(x, y, CELL_SIZE_PX - 2, CELL_SIZE_PX - 2, color);
            rect.setData('segmentId', `segment-${idx}`);
            this.group.add(rect);
            
            // Salva posizione visuale iniziale
            this.visualPositions.set(`segment-${idx}`, { x, y });
        });
    }

    private renderSmooth(previousPositions: any[]) {
        this.group.clear(true, true);

        // Crea nuovi rettangoli per il nuovo frame
        const moveAnimations: any[] = [];

        this.body.forEach((segment, idx) => {
            const x = segment.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            const y = segment.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;

            const color = segment.isHead ? 0xFFFFFF : this.bodyColor;

            const rect = this.scene.add.rectangle(x, y, CELL_SIZE_PX - 2, CELL_SIZE_PX - 2, color);
            rect.setData('segmentId', `segment-${idx}`);
            this.group.add(rect);

            // Prepara animazione smooth
            if (idx < previousPositions.length) {
                const prev = previousPositions[idx];
                const fromX = prev.fromX * CELL_SIZE_PX + CELL_SIZE_PX / 2;
                const fromY = prev.fromY * CELL_SIZE_PX + CELL_SIZE_PX / 2;

                moveAnimations.push({
                    object: rect,
                    fromX: fromX,
                    fromY: fromY,
                    toX: x,
                    toY: y,
                    id: `segment-${idx}`
                });
            }
        });

        // Applica animazioni smooth
        moveAnimations.forEach(anim => {
            this.smoothMovement.smoothMove(
                anim.object,
                anim.fromX / CELL_SIZE_PX - 0.5,
                anim.fromY / CELL_SIZE_PX - 0.5,
                anim.toX / CELL_SIZE_PX - 0.5,
                anim.toY / CELL_SIZE_PX - 0.5,
                CELL_SIZE_PX,
                anim.id
            );
        });
    }

    public getHead(): Coordinate {
        return this.body[0];
    }

    public getDirection(): Direction {
        return this.direction;
    }

    public updateSkin(skinId: string) {
        const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
        const colorInt = parseInt(skin.color.replace('#', '0x'), 16);
        this.bodyColor = colorInt;
        this.render();
    }

    public setMoveSpeed(durationMs: number) {
        this.smoothMovement.setInterpolationSpeed(durationMs);
    }

    public destroy() {
        this.smoothMovement.stopAll();
        this.group.clear(true, true);
        this.visualPositions.clear();
        this.lastGridPositions.clear();
    }
}
