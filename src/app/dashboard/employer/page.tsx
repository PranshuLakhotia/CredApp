'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function EmployerDashboardPage() {
  return (
    <RoleGuard allowedPath="/dashboard/employer" requiredRole="employer">
      <DashboardLayout title="Employer Dashboard">
        <EmployerDashboard />
      </DashboardLayout>
    </RoleGuard>
  );
}
