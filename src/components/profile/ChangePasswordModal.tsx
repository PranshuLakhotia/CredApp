'use client';

import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassword = (password: string) => {
    const validationErrors: string[] = [];
    
    if (password.length < 4) {
      validationErrors.push('Be At Least 4 Characters In Length');
    }
    
    if (password === formData.currentPassword) {
      validationErrors.push('Not Be Same As Your Current Password');
    }
    
    // Check for common passwords (simplified)
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      validationErrors.push('Not Contain Common Passwords');
    }
    
    return validationErrors;
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = async () => {
    const passwordErrors = validatePassword(formData.newPassword);
    setErrors(passwordErrors);
    
    if (passwordErrors.length > 0) {
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
      });
      setOtpSent(false);
      setErrors([]);
    }, 2000);
  };

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 0,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="change-password-modal"
    >
      <Paper sx={modalStyle}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 4, 
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Change Password
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              onClick={handleResendOTP}
              disabled={isLoading}
              sx={{ 
                textTransform: 'none',
                color: '#3b82f6',
                fontWeight: 500
              }}
            >
              Resend OTP
            </Button>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 3 }}>
          {/* Current Password */}
          <TextField
            fullWidth
            type="password"
            label="Type Current Password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            placeholder="Type Current Password"
            sx={{ mb: 3 }}
          />

          {/* New Password */}
          <TextField
            fullWidth
            type="password"
            label="Type New Password"
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            placeholder="Type New Password"
            sx={{ mb: 3 }}
          />

          {/* Confirm Password */}
          <TextField
            fullWidth
            type="password"
            label="Retype New Password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Retype New Password"
            sx={{ mb: 3 }}
          />

          {/* OTP Field */}
          <TextField
            fullWidth
            label="Enter OTP Send To Rohitkadam12@Gmail.Com"
            value={formData.otp}
            onChange={(e) => handleInputChange('otp', e.target.value)}
            placeholder="Enter OTP Send To Rohitkadam12@Gmail.Com"
            sx={{ mb: 4 }}
          />

          {/* Change Password Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleChangePassword}
            disabled={isLoading}
            sx={{
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              bgcolor: '#3b82f6',
              '&:hover': {
                bgcolor: '#2563eb'
              },
              mb: 3
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'CHANGE PASSWORD'
            )}
          </Button>

          {/* Password Requirements */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Your New Password Must:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: errors.includes('Be At Least 4 Characters In Length') ? '#ef4444' : '#22c55e' 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: errors.includes('Be At Least 4 Characters In Length') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem'
                  }}
                >
                  Be At Least 4 Characters In Length
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: errors.includes('Not Be Same As Your Current Password') ? '#ef4444' : '#22c55e' 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: errors.includes('Not Be Same As Your Current Password') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem'
                  }}
                >
                  Not Be Same As Your Current Password
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: errors.includes('Not Contain Common Passwords') ? '#ef4444' : '#22c55e' 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: errors.includes('Not Contain Common Passwords') ? '#ef4444' : '#22c55e',
                    fontSize: '0.875rem'
                  }}
                >
                  Not Contain Common Passwords
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  • {error}
                </Typography>
              ))}
            </Alert>
          )}
        </Box>
      </Paper>
    </Modal>
  );
}
