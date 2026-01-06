import React, { useRef, useEffect, useState } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  size?: number;
  position?: 'left' | 'right';
}

export const JoystickMobile: React.FC<JoystickProps> = ({ 
  onMove, 
  size = 120,
  position = 'right'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.4;
    const stickRadius = size * 0.2;

    // Draw base circle (outer boundary)
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = isActive 
      ? 'rgba(139, 92, 246, 0.3)' 
      : 'rgba(100, 100, 100, 0.3)';
    ctx.fill();
    ctx.strokeStyle = isActive ? 'rgba(139, 92, 246, 0.8)' : 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw stick (movable circle)
    ctx.beginPath();
    ctx.arc(centerX + stickPos.x, centerY + stickPos.y, stickRadius, 0, Math.PI * 2);
    ctx.fillStyle = isActive 
      ? 'rgba(168, 85, 247, 0.9)' 
      : 'rgba(150, 150, 150, 0.7)';
    ctx.fill();
    ctx.strokeStyle = isActive ? '#a855f7' : '#999';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    if (!isActive) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      ctx.fill();
    }
  }, [stickPos, isActive, size]);

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = size / 2;
    const centerY = size / 2;
    const maxDistance = size * 0.35;

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      
      // Only handle our joystick's touch
      if (touchIdRef.current !== null && touch.identifier !== touchIdRef.current) {
        continue;
      }

      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const deltaX = touchX - centerX;
      const deltaY = touchY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Start tracking this touch
      if (touchIdRef.current === null) {
        touchIdRef.current = touch.identifier;
        setIsActive(true);
      }

      if (distance > 0) {
        // Clamp to max distance
        const clampedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        const clampedX = Math.cos(angle) * clampedDistance;
        const clampedY = Math.sin(angle) * clampedDistance;

        setStickPos({ x: clampedX, y: clampedY });

        // Normalize to -1 to 1 range
        const normalizedX = clampedX / maxDistance;
        const normalizedY = clampedY / maxDistance;

        onMove(normalizedX, normalizedY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Check if our tracked touch ended
    let ourTouchEnded = true;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchIdRef.current) {
        ourTouchEnded = false;
        break;
      }
    }

    if (ourTouchEnded) {
      touchIdRef.current = null;
      setIsActive(false);
      setStickPos({ x: 0, y: 0 });
      onMove(0, 0);
    }
  };

  const positionClass = position === 'right' 
    ? 'right-8 bottom-32' 
    : 'left-8 bottom-32';

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`fixed ${positionClass} z-50 touch-none select-none`}
      style={{
        filter: isActive ? 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))' : 'none',
        transition: 'filter 0.2s'
      }}
    />
  );
};
