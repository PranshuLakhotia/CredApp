'use client';

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import SetPasswordForm from '@/components/auth/SetPasswordForm';

export default function SetPasswordPage() {
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a strong password for your account"
      illustration="🔒 Secure Password"
    >
      <SetPasswordForm />
    </AuthLayout>
  );
}
