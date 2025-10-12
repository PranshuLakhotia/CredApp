'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstitutionDashboard from '@/components/dashboard/InstitutionDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function InstitutionDashboardPage() {
  return (
    <RoleGuard allowedPath="/dashboard/institution" requiredRole="issuer">
      <DashboardLayout title="Institution Dashboard">
        <InstitutionDashboard />
      </DashboardLayout>
    </RoleGuard>
  );
}
