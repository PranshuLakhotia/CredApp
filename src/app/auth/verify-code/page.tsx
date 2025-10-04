'use client';

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import VerifyCodeForm from '@/components/auth/VerifyCodeForm';

export default function VerifyCodePage() {
  return (
    <AuthLayout
      title="Verify Code"
      subtitle="Enter the verification code sent to your email"
      illustration="📧 Check Email"
    >
      <VerifyCodeForm />
    </AuthLayout>
  );
}
