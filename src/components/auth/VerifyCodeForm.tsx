'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Link,
  Alert,
  TextField,
} from '@mui/material';
import { ArrowBack, Security } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

export default function VerifyCodeForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.verifyResetCode({
        email,
        code: verificationCode,
      });

      if (response.valid) {
        // Redirect to set password page with token
        router.push(`/auth/set-password?token=${encodeURIComponent(response.token)}`);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid verification code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email address is required to resend code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await AuthService.forgotPassword({ email });
      
      // Show success message
      setError(null);
      // You might want to show a success toast here
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
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
          <Security sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      </Box>

      {/* Instructions */}
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
        We've sent a 6-digit verification code to
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, mb: 4, textAlign: 'center' }}>
        {email || 'your email address'}
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

      {/* Code Input Fields */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 4 }}>
        {code.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 600,
              },
            }}
            sx={{
              width: 56,
              '& .MuiOutlinedInput-root': {
                height: 56,
              },
            }}
            autoComplete="off"
          />
        ))}
      </Box>

      {/* Verify Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || code.join('').length !== 6}
        sx={{
          mb: 3,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </Button>

      {/* Resend Code */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Didn't receive the code?
        </Typography>
        <Button
          variant="text"
          onClick={handleResendCode}
          disabled={isLoading}
          sx={{
            color: 'primary.main',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          Resend Code
        </Button>
      </Box>

      {/* Back Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Link
          href="/auth/forgot-password"
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
          Back to Forgot Password
        </Link>
      </Box>
    </Box>
  );
}
