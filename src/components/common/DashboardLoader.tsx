'use client';

import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface DashboardLoaderProps {
  title?: string;
  message?: string;
}

export default function DashboardLoader({ 
  title = "Loading...", 
  message = "Please wait while we fetch your data" 
}: DashboardLoaderProps) {
  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '200px',
      gap: 2
    }}>
      <LinearProgress 
        sx={{ 
          width: '100%', 
          maxWidth: 400,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8, #1e40af)',
          }
        }} 
      />
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#6b7280', 
          fontWeight: 500,
          textAlign: 'center',
          fontSize: { xs: '1rem', sm: '1.125rem' }
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#9ca3af', 
          textAlign: 'center',
          fontSize: { xs: '0.875rem', sm: '0.9rem' }
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}
