/**
 * High-Performance Asset Caching System
 * 
 * Provides aggressive caching for all game assets to achieve 60 FPS
 * - Pre-renders static assets to off-screen canvases
 * - Manages cache lifecycle
 * - Optimizes memory usage
 */

export class AssetCache {
  private cache: Map<string, HTMLCanvasElement> = new Map();
  private maxCacheSize: number = 100;
  private accessCount: Map<string, number> = new Map();
  
  /**
   * Get or create cached asset
   */
  public getOrCreate(
    key: string,
    width: number,
    height: number,
    renderer: (ctx: CanvasRenderingContext2D) => void
  ): HTMLCanvasElement {
    
    // Return cached version if exists
    if (this.cache.has(key)) {
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
      return this.cache.get(key)!;
    }
    
    // Create new cached asset
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      renderer(ctx);
      this.cache.set(key, canvas);
      this.accessCount.set(key, 1);
      
      // Enforce cache size limit
      if (this.cache.size > this.maxCacheSize) {
        this.evictLeastUsed();
      }
    }
    
    return canvas;
  }
  
  /**
   * Pre-load asset into cache
   */
  public preload(
    key: string,
    width: number,
    height: number,
    renderer: (ctx: CanvasRenderingContext2D) => void
  ): void {
    if (!this.cache.has(key)) {
      this.getOrCreate(key, width, height, renderer);
    }
  }
  
  /**
   * Check if asset is cached
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Get cached asset directly (without auto-creation)
   */
  public get(key: string): HTMLCanvasElement | undefined {
    if (this.cache.has(key)) {
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    }
    return this.cache.get(key);
  }
  
  /**
   * Remove asset from cache
   */
  public remove(key: string): void {
    this.cache.delete(key);
    this.accessCount.delete(key);
  }
  
  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.accessCount.clear();
  }
  
  /**
   * Evict least used assets when cache is full
   */
  private evictLeastUsed(): void {
    let minAccess = Infinity;
    let leastUsedKey: string | null = null;
    
    this.accessCount.forEach((count, key) => {
      if (count < minAccess) {
        minAccess = count;
        leastUsedKey = key;
      }
    });
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.accessCount.delete(leastUsedKey);
    }
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): { size: number; maxSize: number; hitRate: number } {
    const totalAccess = Array.from(this.accessCount.values()).reduce((a, b) => a + b, 0);
    const hitRate = totalAccess / Math.max(1, this.cache.size);
    
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate
    };
  }
  
  /**
   * Reset access counters (useful for benchmarking)
   */
  public resetAccessCounters(): void {
    this.accessCount.clear();
  }
}

// Global singleton instance
export const globalAssetCache = new AssetCache();
