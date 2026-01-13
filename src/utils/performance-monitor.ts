/**
 * Performance Monitor
 * 
 * Tracks game performance metrics to ensure 60 FPS
 */

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples: number = 60;
  private lastFrameTime: number = 0;
  
  constructor() {
    this.lastFrameTime = performance.now();
  }
  
  /**
   * Record a new frame
   */
  public recordFrame(): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }
  
  /**
   * Get current FPS
   */
  public getFPS(): number {
    if (this.frameTimes.length === 0) return 60;
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return Math.round(1000 / avgFrameTime);
  }
  
  /**
   * Get average frame time in ms
   */
  public getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 16.67;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }
  
  /**
   * Check if performance is good (above 50 FPS)
   */
  public isPerformanceGood(): boolean {
    return this.getFPS() >= 50;
  }
  
  /**
   * Reset metrics
   */
  public reset(): void {
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
  }
  
  /**
   * Get performance stats
   */
  public getStats(): { fps: number; avgFrameTime: number; minFPS: number; maxFPS: number } {
    if (this.frameTimes.length === 0) {
      return { fps: 60, avgFrameTime: 16.67, minFPS: 60, maxFPS: 60 };
    }
    
    const minFrameTime = Math.min(...this.frameTimes);
    const maxFrameTime = Math.max(...this.frameTimes);
    
    return {
      fps: this.getFPS(),
      avgFrameTime: this.getAverageFrameTime(),
      minFPS: Math.round(1000 / maxFrameTime),
      maxFPS: Math.round(1000 / minFrameTime)
    };
  }
}

// Global singleton
export const globalPerformanceMonitor = new PerformanceMonitor();
