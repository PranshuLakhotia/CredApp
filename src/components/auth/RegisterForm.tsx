'use client';

import React, { useState } from 'react';
import {  Box,  TextField,  Button,  Typography,  Link,  Alert,  Divider,  IconButton,  InputAdornment,  FormControl,  InputLabel,  Select,  MenuItem,} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Phone } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest } from '@/types/auth';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be no more than 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
  phone_number: z.string().optional(),
  gender: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      confirm_password: '',
      phone_number: '',
      gender: '',
    },
  });

  const password = watch('password');

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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      
      // Prepare the registration data to match backend expectations
      const registrationData: RegisterRequest = {
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        confirm_password: data.confirm_password,
        phone_number: data.phone_number || undefined,
        gender: data.gender || undefined,
      };
      
      console.log('Sending registration data:', registrationData);
      await register(registrationData);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error);
    }
  };

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

      {/* Full Name */}
      <Controller
        name="full_name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Full Name"
            autoComplete="name"
            error={!!errors.full_name}
            helperText={errors.full_name?.message}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Email */}
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
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 3 }}
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

      {/* Phone and Gender Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Controller
          name="phone_number"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Phone Number (Optional)"
              type="tel"
              autoComplete="tel"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Gender (Optional)</InputLabel>
              <Select {...field} label="Gender (Optional)">
                <MenuItem value="">
                  <em>Prefer not to say</em>
                </MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Box>

      {/* Password */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message}
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

      {/* Password Strength Indicator */}
      {password && (
        <Box sx={{ mb: 3 }}>
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
      )}

      {/* Confirm Password */}
      <Controller
        name="confirm_password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.message}
            sx={{ mb: 3 }}
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

      {/* Register Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || isSubmitting}
        sx={{
          mt: 4,
          mb: 3,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {isLoading || isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>

      {/* Divider */}
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      {/* Sign In Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
