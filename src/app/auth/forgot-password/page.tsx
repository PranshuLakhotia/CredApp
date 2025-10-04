'use client';

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Don't worry, we'll help you reset your password"
      illustration="🔑 Reset Password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
