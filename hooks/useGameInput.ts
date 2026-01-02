
import { useRef, useEffect, useCallback } from 'react';
import { Direction } from '../types';

export const useGameInput = (
  isPaused: boolean,
  onPause: () => void,
  onResume: () => void,
  onAbility: () => void,
  onExit: () => void
) => {
  const directionRef = useRef<Direction>(Direction.RIGHT);
  const inputQueueRef = useRef<Direction[]>([]);
  const hasStartedRef = useRef(false);

  const isOpposite = (d1: Direction, d2: Direction) => {
    return (d1 === Direction.UP && d2 === Direction.DOWN) ||
           (d1 === Direction.DOWN && d2 === Direction.UP) ||
           (d1 === Direction.LEFT && d2 === Direction.RIGHT) ||
           (d1 === Direction.RIGHT && d2 === Direction.LEFT);
  };

  const registerDirection = useCallback((newDir: Direction) => {
      const lastIntended = inputQueueRef.current.length > 0 
        ? inputQueueRef.current[inputQueueRef.current.length - 1] 
        : directionRef.current;
      
      // Only register if it's different and not opposite
      if (newDir !== lastIntended && !isOpposite(newDir, lastIntended)) {
          // Limit queue to 2 to prevent laggy feel on spam
          if (inputQueueRef.current.length < 2) { 
              inputQueueRef.current.push(newDir);
              if (!hasStartedRef.current) hasStartedRef.current = true;
          }
      }
  }, []);

  const pollInputs = useCallback(() => {
     // Intentionally empty - Logic moved to event handlers for tighter response
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!hasStartedRef.current && (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key))) {
         hasStartedRef.current = true;
      }

      if (e.key === 'Escape') {
         if (isPaused) onExit();
         else onPause();
      }
      
      if (e.key === ' ') {
         if (isPaused) onResume();
         else onAbility();
      }

      let newDir: Direction | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w') newDir = Direction.UP;
      if (e.key === 'ArrowDown' || e.key === 's') newDir = Direction.DOWN;
      if (e.key === 'ArrowLeft' || e.key === 'a') newDir = Direction.LEFT;
      if (e.key === 'ArrowRight' || e.key === 'd') newDir = Direction.RIGHT;

      if (newDir) {
          registerDirection(newDir);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); };
  }, [isPaused, onPause, onResume, onExit, onAbility, registerDirection]);

  return {
    directionRef,
    inputQueueRef,
    hasStartedRef,
    pollInputs,
    isOpposite,
    registerDirection
  };
};
