'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstitutionDashboard from '@/components/dashboard/InstitutionDashboard';

export default function InstitutionDashboardPage() {
  return (
    <DashboardLayout title="Institution Dashboard">
      <InstitutionDashboard />
    </DashboardLayout>
  );
}
