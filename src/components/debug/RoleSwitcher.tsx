'use client';

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

export default function RoleSwitcher() {
  const { user } = useAuth();

  const handleRoleChange = (newRole: UserRole) => {
    // For testing - we'll need to update the mock user
    // In a real app, this would be handled differently
    window.location.reload(); // Simple reload for now
  };

  if (!user) return null;

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        top: 80, 
        right: 20, 
        p: 2, 
        zIndex: 1300,
        minWidth: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        🧪 Debug Mode
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>Switch Role</InputLabel>
        <Select
          value={user.role}
          label="Switch Role"
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        >
          <MenuItem value="learner">👨‍🎓 Learner</MenuItem>
          <MenuItem value="employer">🏢 Employer</MenuItem>
          <MenuItem value="institution">🎓 Institution</MenuItem>
          <MenuItem value="admin">⚙️ Admin</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Current: {user.role}
      </Typography>
    </Paper>
  );
}
