
import Phaser from 'phaser';
import { Snake } from '../entities/Snake';
import { WorldManager } from '../entities/WorldManager';
import { Direction, BlockType } from '../../types';
import { CELL_SIZE_PX } from '../../constants';

export class MainGameScene extends Phaser.Scene {
    private snake!: Snake;
    private worldManager!: WorldManager;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    // Game Loop State
    private lastMoveTime: number = 0;
    private moveInterval: number = 100; // ms
    private score: number = 0;
    private isGameOver: boolean = false;

    constructor() {
        super({ key: 'MainGameScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#111827');

        const startX = 10;
        const startY = 10;
        const skin = this.registry.get('skin') || 'classic';
        const level = this.registry.get('level') || 1;

        this.snake = new Snake(this, startX, startY, 3, skin);
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

        // Listen for skin updates
        this.game.events.on('updateSkin', (newSkin: string) => {
            console.log('Skin update requested:', newSkin);
        });

        // Reset state
        this.score = 0;
        this.isGameOver = false;
        this.game.events.emit('scoreUpdate', 0);
    }

    update(time: number, delta: number) {
        if (this.isGameOver || !this.snake) return;

        this.handleInput();

        if (time - this.lastMoveTime > this.moveInterval) {
            this.lastMoveTime = time;
            this.tick();
        }
    }

    private tick() {
        const next = this.snake.previewMove();
        const block = this.worldManager.getBlock(next.x, next.y);

        // Collision: Self
        if (this.snake.isOccupying(next.x, next.y)) {
            this.handleGameOver();
            return;
        }

        // Collision: World
        if (block === BlockType.STONE || block === BlockType.BEDROCK || block === BlockType.LAVA) {
            this.handleGameOver();
            return;
        }

        let grow = false;
        if (block === BlockType.DIRT) {
            this.score += 10;
            grow = true;
            this.game.events.emit('scoreUpdate', this.score);
            this.worldManager.removeBlock(next.x, next.y);
        } else if (block === BlockType.GOLD) {
            this.score += 50;
            grow = true;
            this.game.events.emit('scoreUpdate', this.score);
            this.worldManager.removeBlock(next.x, next.y);
        }

        this.snake.move(grow);
        this.worldManager.update(next.x, next.y);

        // Center Camera
        const head = this.snake.getHead();
        const px = head.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        const py = head.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        this.cameras.main.centerOn(px, py);
    }

    private handleGameOver() {
        this.isGameOver = true;
        this.cameras.main.shake(200, 0.05);
        this.game.events.emit('gameOver', { score: this.score, victory: false });
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
