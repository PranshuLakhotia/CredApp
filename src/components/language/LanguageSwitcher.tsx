'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import { Language, Check } from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode as any);
    handleClose();
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <>
      <Tooltip title={t('language.changeLanguage')}>
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{
            color: '#6b7280',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              color: '#374151'
            }
          }}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Language fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            minWidth: 250,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {t('language.selectLanguage')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {currentLang?.nativeName}
          </Typography>
        </Box>
        
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            selected={language.code === currentLanguage}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: '#eff6ff',
                '&:hover': {
                  backgroundColor: '#dbeafe',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Typography sx={{ fontSize: '1.5rem' }}>
                {language.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: language.code === currentLanguage ? 600 : 400 }}>
                  {language.nativeName}
                </Typography>
              }
              secondary={
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {language.name}
                </Typography>
              }
            />
            {language.code === currentLanguage && (
              <Check sx={{ color: '#3b82f6', fontSize: '1.25rem', ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;

