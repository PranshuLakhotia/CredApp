'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';

export default function EmployerDashboardPage() {
  return (
    <DashboardLayout title="Employer Dashboard">
      <EmployerDashboard />
    </DashboardLayout>
  );
}
