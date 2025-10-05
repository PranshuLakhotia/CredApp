'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Box, Typography, Paper } from '@mui/material';

export default function ProfileCredentialsPage() {
  return (
    <DashboardLayout title="Profile - Credentials">
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Credentials
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your credentials will be displayed here.
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
