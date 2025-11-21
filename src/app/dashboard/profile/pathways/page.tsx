'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePathwaysPage() {
  const { user } = useAuth();
  return (
    <DashboardLayout title="Profile - Pathways" role={user?.role}>
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Learning Pathways
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your learning pathways will be displayed here.
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
