'use client';

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your CredHub account to continue"
      illustration="🔐 Secure Login"
    >
      <LoginForm />
    </AuthLayout>
  );
}
