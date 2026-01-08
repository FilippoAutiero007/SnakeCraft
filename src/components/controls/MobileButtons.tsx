"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface MobileButtonsProps {
  onPowerUp?: () => void;
  onGadget?: () => void;
  onPause?: () => void;
}

export default function MobileButtons({
  onPowerUp,
  onGadget,
  onPause,
}: MobileButtonsProps) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:flex-row">
      <Button
        onClick={onPowerUp}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        size="lg"
      >
        Power
      </Button>
      <Button
        onClick={onGadget}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
        size="lg"
      >
        Gadget
      </Button>
      <Button
        onClick={onPause}
        className="bg-red-500 hover:bg-red-600 text-white font-bold"
        size="lg"
      >
        Pausa
      </Button>
    </div>
  );
}
