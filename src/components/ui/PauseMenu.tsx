"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PauseMenuProps {
  onResume: () => void;
  onSettings?: () => void;
  onHome?: () => void;
}

export default function PauseMenu({
  onResume,
  onSettings,
  onHome,
}: PauseMenuProps) {
  return (
    <Dialog open={true}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">PAUSA</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            onClick={onResume}
            className="bg-green-500 hover:bg-green-600 text-white font-bold"
            size="lg"
          >
            Riprendi
          </Button>
          <Button
            onClick={onSettings}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
            size="lg"
          >
            Impostazioni
          </Button>
          <Button
            onClick={onHome}
            className="bg-red-500 hover:bg-red-600 text-white font-bold"
            size="lg"
          >
            Menu Principale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
