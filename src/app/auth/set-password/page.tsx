'use client';

import React, { Suspense } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import SetPasswordForm from '@/components/auth/SetPasswordForm';
import { CircularProgress, Box } from '@mui/material';

function SetPasswordContent() {
  return <SetPasswordForm />;
}

export default function SetPasswordPage() {
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a strong password for your account"
      illustration="Secure Password"
    >
      <Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      }>
        <SetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
