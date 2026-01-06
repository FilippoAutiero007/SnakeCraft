import React, { useState, useEffect } from 'react';
import { Settings, Volume2, VolumeX, Globe, Move, Maximize2 } from 'lucide-react';

export interface GameSettings {
  language: 'it' | 'en';
  volume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  buttonSize: number; // 60-100 (mobile)
  buttonPosition: 'default' | 'custom';
  customPositions?: {
    joystick?: { x: number; y: number };
    power?: { x: number; y: number };
    gadget?: { x: number; y: number };
  };
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
  currentSettings: GameSettings;
}

const DEFAULT_SETTINGS: GameSettings = {
  language: 'it',
  volume: 70,
  musicEnabled: true,
  sfxEnabled: true,
  buttonSize: 60,
  buttonPosition: 'default'
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleSave = () => {
    onSave(settings);
    localStorage.setItem('snakecraft_settings', JSON.stringify(settings));
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  if (!isOpen) return null;

  const translations = {
    it: {
      title: 'Impostazioni',
      language: 'Lingua',
      audio: 'Audio',
      music: 'Musica',
      sfx: 'Effetti Sonori',
      volume: 'Volume',
      controls: 'Controlli Mobile',
      buttonSize: 'Dimensione Pulsanti',
      buttonPosition: 'Posizione Pulsanti',
      default: 'Predefinita',
      custom: 'Personalizzata',
      save: 'Salva',
      cancel: 'Annulla',
      reset: 'Ripristina'
    },
    en: {
      title: 'Settings',
      language: 'Language',
      audio: 'Audio',
      music: 'Music',
      sfx: 'Sound Effects',
      volume: 'Volume',
      controls: 'Mobile Controls',
      buttonSize: 'Button Size',
      buttonPosition: 'Button Position',
      default: 'Default',
      custom: 'Custom',
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset'
    }
  };

  const t = translations[settings.language];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-purple-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7" />
            {t.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Language */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-bold">
              <Globe className="w-5 h-5" />
              {t.language}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings(prev => ({ ...prev, language: 'it' }))}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-bold transition-all
                  ${settings.language === 'it'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                `}
              >
                🇮🇹 Italiano
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, language: 'en' }))}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-bold transition-all
                  ${settings.language === 'en'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                `}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white font-bold">
              {settings.musicEnabled || settings.sfxEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              {t.audio}
            </label>

            {/* Music Toggle */}
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <span className="text-white">{t.music}</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }))}
                className={`
                  w-14 h-7 rounded-full transition-all relative
                  ${settings.musicEnabled ? 'bg-purple-600' : 'bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-all
                    ${settings.musicEnabled ? 'right-1' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* SFX Toggle */}
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <span className="text-white">{t.sfx}</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }))}
                className={`
                  w-14 h-7 rounded-full transition-all relative
                  ${settings.sfxEnabled ? 'bg-purple-600' : 'bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-all
                    ${settings.sfxEnabled ? 'right-1' : 'left-1'}
                  `}
                />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{t.volume}</span>
                <span className="text-white font-bold">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => setSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white font-bold">
              <Move className="w-5 h-5" />
              {t.controls}
            </label>

            {/* Button Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{t.buttonSize}</span>
                <span className="text-white font-bold">{settings.buttonSize}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="10"
                value={settings.buttonSize}
                onChange={(e) => setSettings(prev => ({ ...prev, buttonSize: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Button Position */}
            <div className="space-y-2">
              <span className="text-sm text-gray-400">{t.buttonPosition}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, buttonPosition: 'default' }))}
                  className={`
                    flex-1 py-2 px-4 rounded-lg font-bold transition-all
                    ${settings.buttonPosition === 'default'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }
                  `}
                >
                  {t.default}
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, buttonPosition: 'custom' }))}
                  className={`
                    flex-1 py-2 px-4 rounded-lg font-bold transition-all
                    ${settings.buttonPosition === 'custom'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }
                  `}
                  disabled
                  title="Coming soon"
                >
                  {t.custom} 🔜
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 flex gap-3 rounded-b-2xl border-t border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all text-gray-300"
          >
            {t.reset}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to load settings
export const useSettings = (): [GameSettings, (settings: GameSettings) => void] => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('snakecraft_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('snakecraft_settings', JSON.stringify(newSettings));
  };

  return [settings, updateSettings];
};
