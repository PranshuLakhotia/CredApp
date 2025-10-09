'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilitySettings {
  textToSpeech: boolean;
  biggerText: boolean;
  textSpacing: boolean;
  lineHeight: boolean;
  dyslexiaFriendly: boolean;
  highlightLinks: boolean;
  hideImages: boolean;
  largeCursor: boolean;
  invertColors: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleSetting: (key: keyof AccessibilitySettings) => void;
  resetSettings: () => void;
  speakText: (text: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  textToSpeech: false,
  biggerText: false,
  textSpacing: false,
  lineHeight: false,
  dyslexiaFriendly: false,
  highlightLinks: false,
  hideImages: false,
  largeCursor: false,
  invertColors: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply CSS classes to body based on settings
    const body = document.body;
    
    body.classList.toggle('accessibility-bigger-text', settings.biggerText);
    body.classList.toggle('accessibility-text-spacing', settings.textSpacing);
    body.classList.toggle('accessibility-line-height', settings.lineHeight);
    body.classList.toggle('accessibility-dyslexia', settings.dyslexiaFriendly);
    body.classList.toggle('accessibility-highlight-links', settings.highlightLinks);
    body.classList.toggle('accessibility-hide-images', settings.hideImages);
    body.classList.toggle('accessibility-large-cursor', settings.largeCursor);
    body.classList.toggle('accessibility-invert-colors', settings.invertColors);
  }, [settings]);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibilitySettings');
  };

  const speakText = (text: string) => {
    if (settings.textToSpeech && synth) {
      // Cancel any ongoing speech
      synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      synth.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, toggleSetting, resetSettings, speakText }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

