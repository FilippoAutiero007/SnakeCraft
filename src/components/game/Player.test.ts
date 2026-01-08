import { describe, it, expect, beforeEach } from "vitest";
import { Player } from "./Player";

describe("Player", () => {
  let player: Player;

  beforeEach(() => {
    player = new Player(100, 100);
  });

  it("should initialize with correct position and length", () => {
    expect(player.x).toBe(100);
    expect(player.y).toBe(100);
    expect(player.getLength()).toBe(3);
  });

  it("should set direction correctly", () => {
    player.setDirection(1, 0);
    expect(player.vx).toBe(2); // speed = 2
    expect(player.vy).toBe(0);
  });

  it("should not move backwards", () => {
    player.setDirection(1, 0);
    player.setDirection(-1, 0); // Tenta di andare all'indietro
    expect(player.vx).toBe(2); // Rimane nella direzione precedente
  });

  it("should grow when requested", () => {
    const initialLength = player.getLength();
    player.grow(2);
    expect(player.maxLength).toBe(initialLength + 2);
  });

  it("should detect self collision", () => {
    // Crea un serpente lungo
    for (let i = 0; i < 10; i++) {
      player.grow();
    }

    // Simula movimento in cerchio per causare auto-collisione
    player.setDirection(1, 0);
    for (let i = 0; i < 50; i++) {
      player.update(400, 400);
    }

    player.setDirection(0, 1);
    for (let i = 0; i < 50; i++) {
      player.update(400, 400);
    }

    player.setDirection(-1, 0);
    for (let i = 0; i < 50; i++) {
      player.update(400, 400);
    }

    player.setDirection(0, -1);
    for (let i = 0; i < 50; i++) {
      player.update(400, 400);
    }

    // Dopo aver fatto un cerchio, dovrebbe collidere con se stesso
    const hasCollision = player.checkCollisionWithSelf();
    expect(hasCollision).toBe(true);
  });

  it("should detect collision with point", () => {
    player.setDirection(1, 0);
    player.update(400, 400);

    const headPos = player.getHeadPosition();
    const hasCollision = player.checkCollisionWithPoint(
      headPos.x + 5,
      headPos.y,
      10
    );

    expect(hasCollision).toBe(true);
  });

  it("should wrap around canvas edges", () => {
    player.x = 0;
    player.y = 0;
    player.vx = -5;
    player.vy = -5;

    player.update(400, 400);

    expect(player.x).toBe(400);
    expect(player.y).toBe(400);
  });

  it("should reset correctly", () => {
    player.grow(5);
    player.setDirection(1, 1);
    player.update(400, 400);

    player.reset(50, 50);

    expect(player.x).toBe(50);
    expect(player.y).toBe(50);
    expect(player.vx).toBe(0);
    expect(player.vy).toBe(0);
    expect(player.getLength()).toBe(3);
  });

  it("should change color", () => {
    player.setColor("#ff0000");
    expect(player.color).toBe("#ff0000");
  });

  it("should change speed", () => {
    player.setSpeed(5);
    player.setDirection(1, 0);
    expect(player.vx).toBe(5);
  });
});
