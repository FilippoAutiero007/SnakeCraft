"use client";

import { useState, useEffect, useCallback } from "react";

export interface GameInput {
  moveX: number;
  moveY: number;
  power: boolean;
  gadget: boolean;
  pause: boolean;
}

const initialInput: GameInput = {
  moveX: 0,
  moveY: 0,
  power: false,
  gadget: false,
  pause: false,
};

export function useGameInput() {
  const [input, setInput] = useState<GameInput>(initialInput);
  const [keys, setKeys] = useState<Record<string, boolean>>({});

  // Gestione tastiera PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => ({ ...prev, [key]: true }));

      // Controlli speciali
      if (key === " ") e.preventDefault(); // Spazio per power
      if (key === "m") e.preventDefault(); // M per gadget
      if (key === "escape") e.preventDefault(); // ESC per pausa
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => ({ ...prev, [key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Aggiorna input basato sui tasti premuti
  useEffect(() => {
    let moveX = 0;
    let moveY = 0;

    // Movimento WASD
    if (keys["w"] || keys["arrowup"]) moveY = -1;
    if (keys["s"] || keys["arrowdown"]) moveY = 1;
    if (keys["a"] || keys["arrowleft"]) moveX = -1;
    if (keys["d"] || keys["arrowright"]) moveX = 1;

    // Controlli speciali
    const power = keys[" "];
    const gadget = keys["m"];
    const pause = keys["escape"];

    setInput({
      moveX,
      moveY,
      power,
      gadget,
      pause,
    });
  }, [keys]);

  const setTouchInput = useCallback((x: number, y: number) => {
    setInput((prev) => ({
      ...prev,
      moveX: x,
      moveY: y,
    }));
  }, []);

  const setPowerActive = useCallback((active: boolean) => {
    setInput((prev) => ({
      ...prev,
      power: active,
    }));
  }, []);

  const setGadgetActive = useCallback((active: boolean) => {
    setInput((prev) => ({
      ...prev,
      gadget: active,
    }));
  }, []);

  return {
    input,
    setTouchInput,
    setPowerActive,
    setGadgetActive,
  };
}
