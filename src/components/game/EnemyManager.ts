export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "basic" | "boss" | "special";
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  color: string;
  size: number;
  isBoss: boolean;
}

export class EnemyManager {
  enemies: Enemy[] = [];
  nextId = 0;
  spawnRate = 0.02; // 2% di probabilità per frame
  maxEnemies = 20;

  addEnemy(
    x: number,
    y: number,
    type: "basic" | "boss" | "special" = "basic",
    speed: number = 1,
    damage: number = 1
  ): Enemy {
    const enemy: Enemy = {
      id: `enemy_${this.nextId++}`,
      x,
      y,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      type,
      health: type === "boss" ? 100 : 10,
      maxHealth: type === "boss" ? 100 : 10,
      speed,
      damage,
      color: type === "boss" ? "#ff00ff" : "#ff0000",
      size: type === "boss" ? 20 : 10,
      isBoss: type === "boss",
    };

    this.enemies.push(enemy);
    return enemy;
  }

  spawnBoss(x: number, y: number, level: number): Enemy {
    const health = 50 + level * 20;
    const speed = 1 + level * 0.2;
    const damage = 1 + Math.floor(level / 2);

    return this.addEnemy(x, y, "boss", speed, damage);
  }

  update(canvasWidth: number, canvasHeight: number): void {
    // Aggiorna posizioni nemici
    this.enemies.forEach((enemy) => {
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      // Rimbalzo ai bordi
      if (enemy.x - enemy.size < 0 || enemy.x + enemy.size > canvasWidth) {
        enemy.vx *= -1;
      }
      if (enemy.y - enemy.size < 0 || enemy.y + enemy.size > canvasHeight) {
        enemy.vy *= -1;
      }

      // Mantieni dentro i limiti
      enemy.x = Math.max(enemy.size, Math.min(canvasWidth - enemy.size, enemy.x));
      enemy.y = Math.max(enemy.size, Math.min(canvasHeight - enemy.size, enemy.y));
    });

    // Rimuovi nemici morti
    this.enemies = this.enemies.filter((e) => e.health > 0);
  }

  damageEnemy(enemyId: string, damage: number): boolean {
    const enemy = this.enemies.find((e) => e.id === enemyId);
    if (!enemy) return false;

    enemy.health -= damage;
    return enemy.health <= 0;
  }

  getEnemyAt(x: number, y: number, radius: number = 10): Enemy | undefined {
    return this.enemies.find((enemy) => {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < radius + enemy.size;
    });
  }

  getEnemiesInRadius(x: number, y: number, radius: number): Enemy[] {
    return this.enemies.filter((enemy) => {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < radius;
    });
  }

  clear(): void {
    this.enemies = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.enemies.forEach((enemy) => {
      ctx.fillStyle = enemy.color;

      if (enemy.isBoss) {
        // Disegna boss come quadrato
        ctx.fillRect(
          enemy.x - enemy.size / 2,
          enemy.y - enemy.size / 2,
          enemy.size,
          enemy.size
        );

        // Disegna barra salute
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(
          enemy.x - enemy.size / 2,
          enemy.y - enemy.size / 2 - 10,
          enemy.size,
          3
        );

        ctx.fillStyle = "#00ff00";
        ctx.fillRect(
          enemy.x - enemy.size / 2,
          enemy.y - enemy.size / 2 - 10,
          (enemy.health / enemy.maxHealth) * enemy.size,
          3
        );
      } else {
        // Disegna nemico normale come cerchio
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  getBossCount(): number {
    return this.enemies.filter((e) => e.isBoss).length;
  }

  getEnemyCount(): number {
    return this.enemies.length;
  }
}
