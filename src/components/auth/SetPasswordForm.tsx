'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, CheckCircle } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

// Validation schema
const setPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

export default function SetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // Redirect to forgot password if no token
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  const password = watch('new_password');

  const onSubmit = async (data: SetPasswordFormData) => {
    if (!token) {
      setError('Invalid or expired reset token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await AuthService.resetPassword({
        token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'error.main';
    if (strength <= 3) return 'warning.main';
    return 'success.main';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { text: 'One special character', test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
  ];

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Password Reset Successful
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Typography>

          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            Redirecting to sign in page in a few seconds...
          </Alert>

          <Button
            variant="contained"
            onClick={() => router.push('/auth/login')}
            sx={{ px: 4 }}
          >
            Sign In Now
          </Button>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Icon */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Lock sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      </Box>

      {/* Instructions */}
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', lineHeight: 1.6 }}>
        Create a new secure password for your account. Make sure it meets all the requirements below.
      </Typography>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* New Password */}
      <Controller
        name="new_password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Password Requirements */}
      {password && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            Password Requirements:
          </Typography>
          {passwordRequirements.map((req, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle
                sx={{
                  fontSize: 16,
                  mr: 1,
                  color: req.test(password) ? 'success.main' : 'grey.400',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: req.test(password) ? 'success.main' : 'text.secondary',
                }}
              >
                {req.text}
              </Typography>
            </Box>
          ))}
          
          {/* Password Strength Indicator */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: getPasswordStrengthColor(getPasswordStrength(password)),
                fontWeight: 500,
              }}
            >
              Password Strength: {getPasswordStrengthText(getPasswordStrength(password))}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Confirm Password */}
      <Controller
        name="confirm_password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.message}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Reset Password Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || isSubmitting}
        sx={{
          mb: 3,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {isLoading || isSubmitting ? 'Resetting Password...' : 'Reset Password'}
      </Button>

      {/* Back to Login Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Link
          href="/auth/login"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Back to Sign In
        </Link>
      </Box>
    </Box>
  );
}
