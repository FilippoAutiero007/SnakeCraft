
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { MainGameScene } from './scenes/MainGameScene';

export const getPhaserConfig = (parent: string): Phaser.Types.Core.GameConfig => {
    return {
        type: Phaser.AUTO,
        parent: parent,
        backgroundColor: '#111827', // Gray-900 to match React app bg
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%'
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false // Set to true for debugging collisions
            }
        },
        scene: [PreloadScene, MainGameScene],
        pixelArt: true // Important for retro feel
    };
};
