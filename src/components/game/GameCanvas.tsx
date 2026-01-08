"use client";

import React, { useEffect, useRef } from "react";
import type { GameState } from "@/hooks/useGameState";
import type { GameInput } from "@/hooks/useGameInput";

interface GameCanvasProps {
  gameState: GameState;
  input: GameInput;
  isPaused: boolean;
}

export default function GameCanvas({
  gameState,
  input,
  isPaused,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Imposta dimensioni canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Pulisci canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Disegna griglia
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Disegna giocatore
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(
      gameState.playerPos.x * gridSize,
      gameState.playerPos.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );

    // Disegna nemici
    ctx.fillStyle = "#ff0000";
    gameState.enemies.forEach((enemy) => {
      ctx.fillRect(
        enemy.x * gridSize,
        enemy.y * gridSize,
        gridSize - 2,
        gridSize - 2
      );
    });

    // Disegna power-up
    ctx.fillStyle = "#ffff00";
    gameState.powerUps.forEach((powerUp) => {
      ctx.beginPath();
      ctx.arc(
        powerUp.x * gridSize + gridSize / 2,
        powerUp.y * gridSize + gridSize / 2,
        gridSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Se in pausa, disegna overlay
    if (isPaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2);
    }
  }, [gameState, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ display: "block" }}
    />
  );
}
