
import Phaser from 'phaser';
import { Direction, Coordinate, SnakeSegment } from '../../types';
import { CELL_SIZE_PX, SKINS } from '../../constants';

export class Snake {
    private scene: Phaser.Scene;
    private body: SnakeSegment[];
    private direction: Direction;
    private nextDirection: Direction;
    private group: Phaser.GameObjects.Group;
    private headColor: number;
    private bodyColor: number;
    private growing: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, initialLength: number, skinId: string) {
        this.scene = scene;
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;

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

        // Update isHead
        this.body[0].isHead = false;

        // Add new head
        this.body.unshift({ ...head, isHead: true });

        // Remove tail unless growing
        if (!grow) {
            this.body.pop();
        }

        this.render();
    }

    public isOccupying(x: number, y: number): boolean {
        // Ignore tail (last segment) because it will move away (unless growing, but usually collision happens before grow)
        // If we want strict check:
        for (let i = 0; i < this.body.length - 1; i++) {
            if (this.body[i].x === x && this.body[i].y === y) return true;
        }
        return false;
    }

    private render() {
        this.group.clear(true, true);

        this.body.forEach(segment => {
            const x = segment.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            const y = segment.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;

            const color = segment.isHead ? 0xFFFFFF : this.bodyColor;

            const rect = this.scene.add.rectangle(x, y, CELL_SIZE_PX - 2, CELL_SIZE_PX - 2, color);
            this.group.add(rect);
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
}
