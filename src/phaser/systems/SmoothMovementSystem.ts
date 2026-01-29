import Phaser from 'phaser';

/**
 * Sistema di movimento fluido con interpolazione Lerp
 * Risolve il problema di "motion sickness" causato dal movimento a scatti
 */
export class SmoothMovementSystem {
    private scene: Phaser.Scene;
    private interpolationDuration: number = 100; // ms per muoversi da una cella all'altra
    private tweens: Map<string, Phaser.Tweens.Tween> = new Map();

    constructor(scene: Phaser.Scene, moveIntervalMs: number = 100) {
        this.scene = scene;
        this.interpolationDuration = moveIntervalMs * 0.95; // Leggermente più veloce per evitare overlapping
    }

    /**
     * Anima fluida il movimento di un oggetto da una posizione griglia a un'altra
     * @param gameObject Oggetto Phaser da animare
     * @param fromX Posizione X griglia iniziale
     * @param fromY Posizione Y griglia iniziale
     * @param toX Posizione X griglia finale
     * @param toY Posizione Y griglia finale
     * @param cellSizePx Dimensione della cella in pixel
     * @param entityId ID univoco per tracciare il tween
     */
    public smoothMove(
        gameObject: Phaser.GameObjects.GameObject,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        cellSizePx: number,
        entityId: string = 'default'
    ): void {
        // Calcola posizioni pixel
        const startX = fromX * cellSizePx + cellSizePx / 2;
        const startY = fromY * cellSizePx + cellSizePx / 2;
        const endX = toX * cellSizePx + cellSizePx / 2;
        const endY = toY * cellSizePx + cellSizePx / 2;

        // Cancella tween precedente se esiste
        const existingTween = this.tweens.get(entityId);
        if (existingTween) {
            existingTween.stop();
            this.tweens.delete(entityId);
        }

        // Crea nuovo tween con interpolazione lineare
        const tween = this.scene.tweens.add({
            targets: gameObject,
            x: endX,
            y: endY,
            duration: this.interpolationDuration,
            ease: 'Linear',
            onComplete: () => {
                this.tweens.delete(entityId);
            }
        });

        this.tweens.set(entityId, tween);
    }

    /**
     * Anima il movimento di più oggetti contemporaneamente (es. corpo del serpente)
     */
    public smoothMoveMultiple(
        gameObjects: Array<{ object: Phaser.GameObjects.GameObject; fromX: number; fromY: number; toX: number; toY: number; id: string }>,
        cellSizePx: number
    ): void {
        gameObjects.forEach(item => {
            this.smoothMove(
                item.object,
                item.fromX,
                item.fromY,
                item.toX,
                item.toY,
                cellSizePx,
                item.id
            );
        });
    }

    /**
     * Imposta la velocità di interpolazione
     */
    public setInterpolationSpeed(durationMs: number): void {
        this.interpolationDuration = durationMs;
    }

    /**
     * Ferma tutti i tween attivi
     */
    public stopAll(): void {
        this.tweens.forEach(tween => tween.stop());
        this.tweens.clear();
    }

    /**
     * Ferma il tween di un'entità specifica
     */
    public stop(entityId: string): void {
        const tween = this.tweens.get(entityId);
        if (tween) {
            tween.stop();
            this.tweens.delete(entityId);
        }
    }

    /**
     * Verifica se un'entità sta attualmente muovendosi
     */
    public isMoving(entityId: string): boolean {
        return this.tweens.has(entityId);
    }

    /**
     * Ottiene il numero di tween attivi
     */
    public getActiveCount(): number {
        return this.tweens.size;
    }
}

/**
 * Utility per interpolazione lineare (Lerp)
 */
export const lerp = (start: number, end: number, t: number): number => {
    return start + (end - start) * t;
};

/**
 * Utility per interpolazione easing (ease-out quadratic)
 * Crea movimento più naturale e meno meccanico
 */
export const easeOutQuad = (t: number): number => {
    return 1 - (1 - t) * (1 - t);
};

/**
 * Utility per interpolazione easing (ease-in-out cubic)
 * Perfetto per movimento che accelera e decelera naturalmente
 */
export const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
