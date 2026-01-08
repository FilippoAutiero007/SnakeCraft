import { describe, it, expect, beforeEach } from "vitest";
import { EnemyManager } from "./EnemyManager";

describe("EnemyManager", () => {
  let manager: EnemyManager;

  beforeEach(() => {
    manager = new EnemyManager();
  });

  it("should add basic enemy", () => {
    const enemy = manager.addEnemy(100, 100, "basic", 1, 1);

    expect(enemy.type).toBe("basic");
    expect(enemy.x).toBe(100);
    expect(enemy.y).toBe(100);
    expect(enemy.health).toBe(10);
    expect(manager.getEnemyCount()).toBe(1);
  });

  it("should add boss enemy", () => {
    const boss = manager.addEnemy(100, 100, "boss", 2, 2);

    expect(boss.type).toBe("boss");
    expect(boss.isBoss).toBe(true);
    expect(boss.health).toBe(100);
    expect(boss.size).toBe(20);
  });

  it("should spawn boss with level scaling", () => {
    const boss = manager.spawnBoss(100, 100, 3);

    expect(boss.isBoss).toBe(true);
    expect(boss.health).toBeGreaterThan(50);
    expect(boss.speed).toBeGreaterThan(1);
    expect(boss.damage).toBeGreaterThanOrEqual(2);
  });

  it("should update enemy positions", () => {
    const enemy = manager.addEnemy(100, 100, "basic", 2, 1);
    const initialX = enemy.x;
    const initialY = enemy.y;

    manager.update(400, 400);

    expect(enemy.x).not.toBe(initialX);
    expect(enemy.y).not.toBe(initialY);
  });

  it("should bounce enemies at canvas edges", () => {
    const enemy = manager.addEnemy(10, 10, "basic", 2, 1);
    enemy.vx = -10;
    enemy.vy = -10;

    manager.update(400, 400);

    expect(enemy.vx).toBeGreaterThan(0);
    expect(enemy.vy).toBeGreaterThan(0);
  });

  it("should damage enemy", () => {
    const enemy = manager.addEnemy(100, 100, "basic", 1, 1);
    const initialHealth = enemy.health;

    manager.damageEnemy(enemy.id, 5);

    expect(enemy.health).toBe(initialHealth - 5);
  });

  it("should remove dead enemies", () => {
    const enemy = manager.addEnemy(100, 100, "basic", 1, 1);

    manager.damageEnemy(enemy.id, 20);
    manager.update(400, 400);

    expect(manager.getEnemyCount()).toBe(0);
  });

  it("should find enemy at position", () => {
    const enemy = manager.addEnemy(100, 100, "basic", 1, 1);

    const found = manager.getEnemyAt(100, 100, 20);

    expect(found).toBe(enemy);
  });

  it("should find enemies in radius", () => {
    manager.addEnemy(100, 100, "basic", 1, 1);
    manager.addEnemy(110, 110, "basic", 1, 1);
    manager.addEnemy(200, 200, "basic", 1, 1);

    const enemies = manager.getEnemiesInRadius(100, 100, 50);

    expect(enemies.length).toBe(2);
  });

  it("should count bosses", () => {
    manager.addEnemy(100, 100, "basic", 1, 1);
    manager.addEnemy(150, 150, "boss", 2, 2);
    manager.addEnemy(200, 200, "basic", 1, 1);

    expect(manager.getBossCount()).toBe(1);
  });

  it("should clear all enemies", () => {
    manager.addEnemy(100, 100, "basic", 1, 1);
    manager.addEnemy(150, 150, "basic", 1, 1);

    manager.clear();

    expect(manager.getEnemyCount()).toBe(0);
  });
});
