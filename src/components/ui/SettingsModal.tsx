"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Slider } from "./slider";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface Settings {
  language: "it" | "en";
  buttonSize: "small" | "medium" | "large";
  buttonPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  volume: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: Settings) => void;
  currentSettings?: Settings;
}

export default function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(currentSettings || {
    language: "it",
    buttonSize: "medium",
    buttonPosition: "bottom-right",
    volume: 80,
  });

  // Aggiorna lo stato se le props cambiano
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  // Carica impostazioni da localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gameSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("gameSettings", JSON.stringify(settings));
    if (onSave) onSave(settings);
    onClose();
  };

  const handleLanguageChange = (value: "it" | "en") => {
    setSettings({ ...settings, language: value });
  };

  const handleButtonSizeChange = (value: "small" | "medium" | "large") => {
    setSettings({ ...settings, buttonSize: value });
  };

  const handleButtonPositionChange = (
    value: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  ) => {
    setSettings({ ...settings, buttonPosition: value });
  };

  const handleVolumeChange = (value: number[]) => {
    setSettings({ ...settings, volume: value[0] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Impostazioni</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lingua */}
          <div>
            <Label className="text-white mb-2 block">Lingua</Label>
            <Select value={settings.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dimensione Pulsanti */}
          <div>
            <Label className="text-white mb-2 block">Dimensione Pulsanti</Label>
            <Select value={settings.buttonSize} onValueChange={handleButtonSizeChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="small">Piccoli</SelectItem>
                <SelectItem value="medium">Medi</SelectItem>
                <SelectItem value="large">Grandi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posizione Pulsanti */}
          <div>
            <Label className="text-white mb-2 block">Posizione Pulsanti</Label>
            <Select
              value={settings.buttonPosition}
              onValueChange={handleButtonPositionChange}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="bottom-right">Basso Destra</SelectItem>
                <SelectItem value="bottom-left">Basso Sinistra</SelectItem>
                <SelectItem value="top-right">Alto Destra</SelectItem>
                <SelectItem value="top-left">Alto Sinistra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Volume */}
          <div>
            <Label className="text-white mb-2 block">Volume: {settings.volume}%</Label>
            <Slider
              value={[settings.volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Pulsanti Azione */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              Salva
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold"
            >
              Annulla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
