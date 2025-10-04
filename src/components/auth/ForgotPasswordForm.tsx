'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AuthService.forgotPassword(data);
      setIsSuccess(true);
      
      // Redirect to verify code page after 2 seconds
      setTimeout(() => {
        router.push(`/auth/verify-code?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      await onSubmit({ email });
    }
  };

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
            <Email sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Check Your Email
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </Typography>

          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            If you don't see the email in your inbox, please check your spam folder.
          </Alert>

          <Button
            variant="outlined"
            onClick={handleResendEmail}
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            Resend Email
          </Button>

          <Box sx={{ mt: 3 }}>
            <Link
              href="/auth/login"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <ArrowBack fontSize="small" />
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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

      {/* Instructions */}
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {/* Email Field */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Email Address"
            type="email"
            autoComplete="email"
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Send Reset Link Button */}
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
        {isLoading || isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>

      {/* Back to Login Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Link
          href="/auth/login"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <ArrowBack fontSize="small" />
          Back to Sign In
        </Link>
      </Box>
    </Box>
  );
}
