
import Phaser from 'phaser';
import { Direction, Coordinate, SnakeSegment } from '../../types';
import { CELL_SIZE_PX, SKINS } from '../../constants';

export class Snake {
    private scene: Phaser.Scene;
    private body: SnakeSegment[];
    private direction: Direction;
    private nextDirection: Direction;
    private moveTimer: number = 0;
    private moveInterval: number = 100; // ms per move (speed)
    private group: Phaser.GameObjects.Group;
    private headColor: number;
    private bodyColor: number;

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
        this.headColor = 0xffffff; // White head usually or lighter
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

    public update(time: number, delta: number): boolean {
        this.moveTimer += delta;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer -= this.moveInterval;
            this.move();
            return true; // Moved this frame
        }
        return false;
    }

    private move() {
        this.direction = this.nextDirection;

        const head = { ...this.body[0] };

        switch (this.direction) {
            case Direction.UP: head.y--; break;
            case Direction.DOWN: head.y++; break;
            case Direction.LEFT: head.x--; break;
            case Direction.RIGHT: head.x++; break;
        }

        // Update isHead
        head.isHead = true;
        this.body[0].isHead = false;

        // Move body
        this.body.unshift(head);
        this.body.pop();

        this.render();
    }

    // TODO: Separate Logic from Render for smooth interpolation
    // Currently snapping to grid for simplicity of first pass
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

    public grow() {
        const tail = this.body[this.body.length - 1];
        this.body.push({ ...tail });
    }
}
