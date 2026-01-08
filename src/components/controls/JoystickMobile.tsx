"use client";

import React, { useEffect, useRef, useState } from "react";

interface JoystickMobileProps {
  onInput: (x: number, y: number) => void;
}

export default function JoystickMobile({ onInput }: JoystickMobileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) / 2;
    const centerX = radius;
    const centerY = radius;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disegna joystick
    const drawJoystick = (stickX: number, stickY: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cerchio esterno
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
      ctx.stroke();

      // Cerchio interno (stick)
      ctx.fillStyle = "#0099ff";
      ctx.beginPath();
      ctx.arc(stickX, stickY, radius / 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = radius - 5;

      let stickX = centerX;
      let stickY = centerY;

      if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        stickX = centerX + Math.cos(angle) * maxDistance;
        stickY = centerY + Math.sin(angle) * maxDistance;
      } else {
        stickX = x;
        stickY = y;
      }

      drawJoystick(stickX, stickY);

      // Calcola input normalizzato
      const inputX = (stickX - centerX) / maxDistance;
      const inputY = (stickY - centerY) / maxDistance;
      onInput(inputX, inputY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      drawJoystick(centerX, centerY);
      onInput(0, 0);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Disegna iniziale
    drawJoystick(centerX, centerY);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onInput]);

  return (
    <div ref={containerRef} className="w-32 h-32 bg-gray-900 rounded-full">
      <canvas
        ref={canvasRef}
        width={128}
        height={128}
        className="w-full h-full"
      />
    </div>
  );
}
