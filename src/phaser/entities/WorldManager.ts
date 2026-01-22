
import Phaser from 'phaser';
import { BlockType } from '../../types';
import { generateBlock, getChunkCoords, getChunkKey } from '../../utils/logic';
import { CELL_SIZE_PX, BLOCK_COLORS, VIEWPORT_WIDTH_CELLS, CHUNK_SIZE } from '../../constants';

export class WorldManager {
    private scene: Phaser.Scene;
    private map: Map<string, BlockType>;
    private visuals: Map<string, Phaser.GameObjects.Rectangle>; // Track visuals
    private blockGroup: Phaser.GameObjects.Group;
    private visibleChunks: Set<string>;
    private currentLevel: number = 1;

    constructor(scene: Phaser.Scene, level: number) {
        this.scene = scene;
        this.currentLevel = level;
        this.map = new Map();
        this.visuals = new Map();
        this.visibleChunks = new Set();
        this.blockGroup = this.scene.add.group();
    }

    public update(headX: number, headY: number) {
        const { cx, cy } = getChunkCoords(headX, headY);

        // Determine chunks to load (3x3 area around player)
        const chunksToLoad = new Set<string>();
        for (let x = cx - 1; x <= cx + 1; x++) {
            for (let y = cy - 1; y <= cy + 1; y++) {
                chunksToLoad.add(getChunkKey(x, y));
            }
        }

        // Load new chunks
        chunksToLoad.forEach(key => {
            if (!this.visibleChunks.has(key)) {
                this.loadChunk(key);
                this.visibleChunks.add(key);
            }
        });

        // TODO: Unload far chunks logic could go here
    }

    private loadChunk(key: string) {
        const [cxStr, cyStr] = key.split(',');
        const cx = parseInt(cxStr);
        const cy = parseInt(cyStr);

        for (let x = cx * CHUNK_SIZE; x < (cx + 1) * CHUNK_SIZE; x++) {
            for (let y = cy * CHUNK_SIZE; y < (cy + 1) * CHUNK_SIZE; y++) {
                const blockType = generateBlock(x, y, this.currentLevel, false, this.map);
                if (blockType !== BlockType.EMPTY) {
                    this.map.set(`${x},${y}`, blockType);
                    this.renderBlock(x, y, blockType);
                }
            }
        }
    }

    private renderBlock(x: number, y: number, type: BlockType) {
        if (type === BlockType.EMPTY) return;

        const key = `${x},${y}`;
        // If already rendered, skip
        if (this.visuals.has(key)) return;

        const colorStr = BLOCK_COLORS[type] || '#ffffff';
        const color = parseInt(colorStr.replace('#', '0x'), 16);

        const px = x * CELL_SIZE_PX + CELL_SIZE_PX / 2;
        const py = y * CELL_SIZE_PX + CELL_SIZE_PX / 2;

        const rect = this.scene.add.rectangle(px, py, CELL_SIZE_PX, CELL_SIZE_PX, color);
        this.blockGroup.add(rect);
        this.visuals.set(key, rect);
    }

    public getBlock(x: number, y: number): BlockType {
        const key = `${x},${y}`;
        if (this.map.has(key)) {
            return this.map.get(key)!;
        }
        // Generate just in case (e.g. collision check beyond visible)
        const type = generateBlock(x, y, this.currentLevel, false, this.map);
        this.map.set(key, type);
        // If we generate on getBlock, we usually don't render immediately until update() sees it's in a chunk
        // But if it IS in a visible chunk but somehow missing, we might want to render? 
        // Usually getBlock is for Logic.
        return type;
    }

    public removeBlock(x: number, y: number) {
        const key = `${x},${y}`;
        this.map.set(key, BlockType.EMPTY);

        const visual = this.visuals.get(key);
        if (visual) {
            visual.destroy();
            this.visuals.delete(key);
        }
    }
}
