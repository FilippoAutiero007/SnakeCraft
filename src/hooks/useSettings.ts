import { useState } from 'react';

export const useSettings = () => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('gameSettings');
        return saved ? JSON.parse(saved) : {
            language: 'it',
            buttonSize: 'medium',
            buttonPosition: 'bottom-right',
            volume: 80
        };
    });

    const updateSettings = (newSettings: any) => {
        setSettings(newSettings);
        localStorage.setItem('gameSettings', JSON.stringify(newSettings));
    };

    return [settings, updateSettings] as const;
};
