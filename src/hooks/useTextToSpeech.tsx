'use client';

import { useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

/**
 * Hook to enable text-to-speech on hover for elements
 * Automatically adds hover listeners when text-to-speech is enabled
 */
export const useTextToSpeech = () => {
  const { settings, speakText } = useAccessibility();

  useEffect(() => {
    if (!settings.textToSpeech) return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Get text content from the element
      let textToSpeak = '';
      
      // Priority: aria-label > alt > title > textContent
      if (target.hasAttribute('aria-label')) {
        textToSpeak = target.getAttribute('aria-label') || '';
      } else if (target.hasAttribute('alt')) {
        textToSpeak = target.getAttribute('alt') || '';
      } else if (target.hasAttribute('title')) {
        textToSpeak = target.getAttribute('title') || '';
      } else if (target.textContent && target.textContent.trim().length > 0) {
        // Get only direct text, not nested elements
        const clone = target.cloneNode(true) as HTMLElement;
        const children = clone.querySelectorAll('*');
        children.forEach(child => child.remove());
        textToSpeak = clone.textContent?.trim() || '';
      }

      // Only speak if we have text and it's not too long
      if (textToSpeak && textToSpeak.length > 0 && textToSpeak.length < 200) {
        speakText(textToSpeak);
      }
    };

    // Add listeners to interactive elements
    const selectorsToTarget = [
      'button',
      'a',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'label',
      'span',
      '[data-speak]', // Custom attribute for elements that should be spoken
    ];

    const elements = document.querySelectorAll(selectorsToTarget.join(', '));
    
    elements.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter as EventListener);
    });

    // Cleanup
    return () => {
      elements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter as EventListener);
      });
    };
  }, [settings.textToSpeech, speakText]);

  return { speakText };
};

