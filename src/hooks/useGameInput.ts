import { useState, useEffect, useCallback } from 'react';

export interface GameInput {
  moveX: number; // -1 (left) to 1 (right)
  moveY: number; // -1 (up) to 1 (down)
  usePower: boolean;
  useGadget: boolean;
  pause: boolean;
  mouseX?: number;
  mouseY?: number;
  isMobile: boolean;
}

export const useGameInput = () => {
  const [input, setInput] = useState<GameInput>({
    moveX: 0,
    moveY: 0,
    usePower: false,
    useGadget: false,
    pause: false,
    isMobile: false
  });

  const [isMobile] = useState(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || (window.innerWidth <= 768 && window.matchMedia("(orientation: landscape)").matches);
  });

  // Keyboard input for desktop
  useEffect(() => {
    if (isMobile) return;

    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key.toLowerCase());
      
      // Power-up: Space
      if (e.key === ' ') {
        setInput(prev => ({ ...prev, usePower: true }));
        e.preventDefault();
      }
      
      // Gadget: M
      if (e.key.toLowerCase() === 'm') {
        setInput(prev => ({ ...prev, useGadget: true }));
      }
      
      // Pause: ESC
      if (e.key === 'Escape') {
        setInput(prev => ({ ...prev, pause: !prev.pause }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
      
      if (e.key === ' ') {
        setInput(prev => ({ ...prev, usePower: false }));
      }
      if (e.key.toLowerCase() === 'm') {
        setInput(prev => ({ ...prev, useGadget: false }));
      }
    };

    const updateMovement = () => {
      let moveX = 0;
      let moveY = 0;

      // WASD + Arrow keys
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) moveX = -1;
      if (keysPressed.has('d') || keysPressed.has('arrowright')) moveX = 1;
      if (keysPressed.has('w') || keysPressed.has('arrowup')) moveY = -1;
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) moveY = 1;

      setInput(prev => ({ ...prev, moveX, moveY, isMobile: false }));
    };

    const interval = setInterval(updateMovement, 16); // ~60fps

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMobile]);

  // Mouse tracking for basket ability
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      setInput(prev => ({ ...prev, mouseX: e.clientX, mouseY: e.clientY }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Mobile touch input handlers (to be called from mobile components)
  const setMobileMove = useCallback((x: number, y: number) => {
    setInput(prev => ({ ...prev, moveX: x, moveY: y, isMobile: true }));
  }, []);

  const setMobilePower = useCallback((active: boolean) => {
    setInput(prev => ({ ...prev, usePower: active }));
  }, []);

  const setMobileGadget = useCallback((active: boolean) => {
    setInput(prev => ({ ...prev, useGadget: active }));
  }, []);

  const setMobilePause = useCallback(() => {
    setInput(prev => ({ ...prev, pause: !prev.pause }));
  }, []);

  return {
    input,
    isMobile,
    // Mobile control methods
    setMobileMove,
    setMobilePower,
    setMobileGadget,
    setMobilePause
  };
};
