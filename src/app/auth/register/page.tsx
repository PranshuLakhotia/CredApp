'use client';

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join CredHub and start managing your digital credentials securely"
      illustration="🚀 Get Started"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
