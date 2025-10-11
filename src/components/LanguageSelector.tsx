'use client';

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography
} from '@mui/material';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

export default function LanguageSelector() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { locale, setLocale } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (languageCode: string) => {
    await setLocale(languageCode);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<Globe size={16} />}
        endIcon={<ChevronDown size={16} />}
        sx={{
          color: 'text.secondary',
          textTransform: 'none',
          minWidth: 'auto',
          px: 1,
          py: 0.5,
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: '16px' }}>{currentLanguage.flag}</span>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currentLanguage.code.toUpperCase()}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: 3,
            borderRadius: 2
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === locale}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <span style={{ fontSize: '20px' }}>{language.flag}</span>
            </ListItemIcon>
            <ListItemText 
              primary={language.name}
              primaryTypographyProps={{
                fontWeight: language.code === locale ? 600 : 400
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
