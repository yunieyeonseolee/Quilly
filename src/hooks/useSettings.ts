import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const SETTINGS_KEY = 'quilly_settings';

type Settings = {
  notificationsEnabled: boolean;
  language: 'system' | 'en' | 'ko';
  currency: 'USD' | 'KRW';
};

const defaultSettings: Settings = {
  notificationsEnabled: true,
  language: 'system',
  currency: 'USD',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await AsyncStorage.getItem(SETTINGS_KEY);
        if (data) {
          setSettings(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (!isLoading) {
      const saveSettings = async () => {
        try {
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      };
      saveSettings();
    }
  }, [settings, isLoading]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    isLoading,
    updateSettings,
  };
};