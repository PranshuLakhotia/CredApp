'use client';

import React, { Suspense } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import VerifyCodeForm from '@/components/auth/VerifyCodeForm';
import { CircularProgress, Box } from '@mui/material';

function VerifyCodeContent() {
  return <VerifyCodeForm />;
}

export default function VerifyCodePage() {
  return (
    <AuthLayout
      title="Verify Code"
      subtitle="Enter the verification code sent to your email"
      illustration="Check Email"
    >
      <Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      }>
        <VerifyCodeContent />
      </Suspense>
    </AuthLayout>
  );
}
