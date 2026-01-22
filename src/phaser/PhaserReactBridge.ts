
import Phaser from 'phaser';
import { GameState } from '../types';

export class PhaserReactBridge {
    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    // Phaser -> React Events
    public emitScoreUpdate(score: number) {
        this.game.events.emit('scoreUpdate', score);
    }

    public emitHealthUpdate(health: number) {
        this.game.events.emit('healthUpdate', health);
    }

    public emitGameOver(score: number, victory: boolean) {
        this.game.events.emit('gameOver', { score, victory });
    }

    public emitUiUpdate(data: any) {
        this.game.events.emit('uiUpdate', data);
    }

    // React -> Phaser Commands
    public pauseGame() {
        const scene = this.game.scene.getScene('MainGameScene');
        if (scene) {
            scene.scene.pause();
            this.game.events.emit('pauseStateChange', true);
        }
    }

    public resumeGame() {
        const scene = this.game.scene.getScene('MainGameScene');
        if (scene) {
            scene.scene.resume();
            this.game.events.emit('pauseStateChange', false);
        }
    }

    public triggerAbility() {
        const scene = this.game.scene.getScene('MainGameScene');
        if (scene) {
            scene.events.emit('triggerAbility');
        }
    }

    public inputDirection(direction: any) { // Use any or specific Direction enum if available
        const scene = this.game.scene.getScene('MainGameScene');
        if (scene) {
            scene.events.emit('inputDirection', direction);
        }
    }
}
