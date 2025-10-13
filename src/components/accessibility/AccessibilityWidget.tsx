'use client';

import React, { useState, useEffect } from 'react';
import { AccessibilityButton } from './AccessibilityButton';
import { AccessibilitySidebar } from './AccessibilitySidebar';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export const AccessibilityWidget: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Enable text-to-speech on hover across the app
  useTextToSpeech();

  // Keyboard shortcut: Alt + A to toggle accessibility sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      
      // ESC to close sidebar
      if (e.key === 'Escape' && isSidebarOpen) {
        e.preventDefault();
        setIsSidebarOpen(false);
      }
    };

    // Only add event listener when component is mounted
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSidebarOpen]);

  return (
    <>
      <AccessibilityButton onClick={() => setIsSidebarOpen(true)} />
      <AccessibilitySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

