'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Example component demonstrating how to use multilingual support
 * This component is for reference only - not used in production
 */
export const LanguageExample: React.FC = () => {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {t('common.welcome')}
          </Typography>

          <Typography variant="body1" paragraph>
            Current Language: <Chip label={currentLanguage.toUpperCase()} color="primary" size="small" />
          </Typography>

          {/* Example: Common translations */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>{t('common.dashboard')}</Typography>
            <Typography variant="body2">- {t('common.overview')}</Typography>
            <Typography variant="body2">- {t('common.profile')}</Typography>
            <Typography variant="body2">- {t('common.settings')}</Typography>
          </Box>

          {/* Example: Navigation translations */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Navigation</Typography>
            <Typography variant="body2">- {t('navigation.credentials')}</Typography>
            <Typography variant="body2">- {t('navigation.skills')}</Typography>
            <Typography variant="body2">- {t('navigation.pathways')}</Typography>
          </Box>

          {/* Example: Dashboard translations */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Dashboard</Typography>
            <Typography variant="body2">- {t('dashboard.totalCredentials')}</Typography>
            <Typography variant="body2">- {t('dashboard.verified')}</Typography>
            <Typography variant="body2">- {t('dashboard.pending')}</Typography>
          </Box>

          {/* Language switching buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}>
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setLanguage(lang.code)}
              >
                {lang.flag} {lang.nativeName}
              </Button>
            ))}
          </Box>

          {/* Example: Using translations in various scenarios */}
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {`// Usage Examples:

// Simple translation
{t('common.save')}

// Nested translation
{t('accessibility.description.textToSpeech')}

// With parameters (if supported)
{t('greeting', { name: 'John' })}

// Conditional rendering
{currentLanguage === 'hi' && <Component />}`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LanguageExample;

