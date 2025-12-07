'use client';

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  // International languages
  { code: 'en', name: 'English', flag: '🇺🇸', category: 'international' },
  { code: 'es', name: 'Español', flag: '🇪🇸', category: 'international' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', category: 'international' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', category: 'international' },
  // Indian languages (22 scheduled languages)
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', category: 'indian' }, // Hindi
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳', category: 'indian' }, // Bengali
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', category: 'indian' }, // Telugu
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', category: 'indian' }, // Marathi
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', category: 'indian' }, // Tamil
  { code: 'ur', name: 'اردو', flag: '🇮🇳', category: 'indian' }, // Urdu
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', category: 'indian' }, // Gujarati
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', category: 'indian' }, // Kannada
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳', category: 'indian' }, // Odia
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', category: 'indian' }, // Punjabi
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳', category: 'indian' }, // Malayalam
  { code: 'as', name: 'অসমীয়া', flag: '🇮🇳', category: 'indian' }, // Assamese
  { code: 'ne', name: 'नेपाली', flag: '🇮🇳', category: 'indian' }, // Nepali
  { code: 'sd', name: 'سنڌي', flag: '🇮🇳', category: 'indian' }, // Sindhi
  { code: 'sa', name: 'संस्कृतम्', flag: '🇮🇳', category: 'indian' }, // Sanskrit
  { code: 'ks', name: 'कॉशुर', flag: '🇮🇳', category: 'indian' }, // Kashmiri
  { code: 'mai', name: 'मैथिली', flag: '🇮🇳', category: 'indian' }, // Maithili
  { code: 'kok', name: 'कोंकणी', flag: '🇮🇳', category: 'indian' }, // Konkani
  { code: 'brx', name: 'बड़ो', flag: '🇮🇳', category: 'indian' }, // Bodo
  { code: 'doi', name: 'डोगरी', flag: '🇮🇳', category: 'indian' }, // Dogri
  { code: 'mni', name: 'ꯃꯤꯇꯩꯂꯣꯟ', flag: '🇮🇳', category: 'indian' }, // Manipuri
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳', category: 'indian' } // Santhali
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

  const internationalLanguages = languages.filter(lang => lang.category === 'international');
  const indianLanguages = languages.filter(lang => lang.category === 'indian');

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
            minWidth: 220,
            maxHeight: 500,
            overflowY: 'auto',
            boxShadow: 3,
            borderRadius: 2
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 600, color: 'text.secondary', display: 'block' }}>
          International
        </Typography>
        {internationalLanguages.map((language) => (
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
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 600, color: 'text.secondary', display: 'block' }}>
          Indian Languages (22 Scheduled Languages)
        </Typography>
        {indianLanguages.map((language) => (
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
