
import Phaser from 'phaser';
import { Snake } from '../entities/Snake';
import { WorldManager } from '../entities/WorldManager';
import { Direction } from '../../types';
import { CELL_SIZE_PX } from '../../constants';

export class MainGameScene extends Phaser.Scene {
    private snake!: Snake;
    private worldManager!: WorldManager;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({ key: 'MainGameScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#111827');

        // Initialize Snake
        const startX = 10;
        const startY = 10;
        const skin = this.registry.get('skin') || 'classic';
        this.snake = new Snake(this, startX, startY, 3, skin);

        // Initialize World
        const level = this.registry.get('level') || 1;
        this.worldManager = new WorldManager(this, level);
        this.worldManager.update(startX, startY);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Camera
        // Center initially
        this.cameras.main.centerOn(startX * CELL_SIZE_PX, startY * CELL_SIZE_PX);
        this.cameras.main.setZoom(1.0);

        // Events
        this.game.events.on('inputDirection', (dir: Direction) => {
            if (this.snake) this.snake.setDirection(dir);
        });

        // Listen for skin updates from React
        this.game.events.on('updateSkin', (newSkin: string) => {
            // Logic to update snake skin (not implemented in Snake yet)
            console.log('Skin update requested:', newSkin);
        });
    }

    update(time: number, delta: number) {
        if (!this.snake) return;

        this.handleInput();

        const moved = this.snake.update(time, delta);
        if (moved) {
            const head = this.snake.getHead();
            this.worldManager.update(head.x, head.y);

            // Camera follow
            const px = head.x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            const py = head.y * CELL_SIZE_PX + CELL_SIZE_PX / 2;
            this.cameras.main.centerOn(px, py); // Basic snap follow
            // For smooth follow we need Snake to update position continuously or camera to lerp
            // Since Snake moves by grid, it snaps.
        }
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
