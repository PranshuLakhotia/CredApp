'use client';

import React from 'react';
import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'full' | 'compact';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'compact' }) => {
  const { currentLanguage, setLanguage, languages, t } = useLanguage();

  const handleChange = (event: any) => {
    setLanguage(event.target.value);
  };

  if (variant === 'full') {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
          {t('language.title')}
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={currentLanguage}
            onChange={handleChange}
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
            }}
          >
            {languages.map((language) => (
              <MenuItem key={language.code} value={language.code}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem' }}>{language.flag}</Typography>
                  <Typography variant="body2">{language.nativeName}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 'auto' }}>
                    ({language.name})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={currentLanguage}
        onChange={handleChange}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            py: 0.5,
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            <Typography sx={{ fontSize: '1.125rem', mr: 0.5 }}>{language.flag}</Typography>
            <Typography variant="body2">{language.code.toUpperCase()}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;

