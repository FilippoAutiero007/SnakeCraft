import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "./useGameState";

describe("useGameState", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.score).toBe(0);
    expect(result.current.level).toBe(0);
    expect(result.current.lives).toBe(3);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.gameOver).toBe(false);
    expect(result.current.playerLength).toBe(3);
  });

  it("should update score and calculate level", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updateScore(500);
    });

    expect(result.current.score).toBe(500);
    expect(result.current.level).toBe(0);

    act(() => {
      result.current.updateScore(500);
    });

    expect(result.current.score).toBe(1000);
    expect(result.current.level).toBe(1);
  });

  it("should update player position", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updatePlayerPos(20, 30);
    });

    expect(result.current.playerPos.x).toBe(20);
    expect(result.current.playerPos.y).toBe(30);
  });

  it("should update player length", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updatePlayerLength(5);
    });

    expect(result.current.playerLength).toBe(5);
  });

  it("should set biome", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setBiome("ice");
    });

    expect(result.current.currentBiome).toBe("ice");
  });

  it("should toggle pause state", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setPaused(true);
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.setPaused(false);
    });

    expect(result.current.isPaused).toBe(false);
  });

  it("should set game over state", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setGameOver(true);
    });

    expect(result.current.gameOver).toBe(true);
  });

  it("should reset game state", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updateScore(1000);
      result.current.setBiome("lava");
      result.current.setPaused(true);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.score).toBe(0);
    expect(result.current.level).toBe(0);
    expect(result.current.currentBiome).toBe("grass");
    expect(result.current.isPaused).toBe(false);
  });
});
