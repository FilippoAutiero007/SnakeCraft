
import Phaser from 'phaser';

export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Simple text to verify Phaser is working
        this.add.text(width / 2, height / 2, 'SnakeCraft Phaser Engine\n     Coming Soon', {
            font: '32px monospace',
            color: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);

        // Setup Grid Visualization (temporary)
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 1);

        // Draw simple grid
        for (let i = 0; i < width; i += 20) {
            graphics.moveTo(i, 0);
            graphics.lineTo(i, height);
        }
        for (let i = 0; i < height; i += 20) {
            graphics.moveTo(0, i);
            graphics.lineTo(width, i);
        }
        graphics.strokePath();
    }

    update(time: number, delta: number) {
        // Game loop
    }
}
