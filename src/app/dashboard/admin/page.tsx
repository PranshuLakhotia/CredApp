'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedPath="/dashboard/admin" requiredRole="admin">
      <DashboardLayout title="Admin Dashboard">
        <AdminDashboard />
      </DashboardLayout>
    </RoleGuard>
  );
}
