'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LearnerDashboard from '@/components/dashboard/LearnerDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function LearnerDashboardPage() {
  return (
    <RoleGuard allowedPath="/dashboard/learner" requiredRole="learner">
      <DashboardLayout title="Learner Dashboard">
        <LearnerDashboard />
      </DashboardLayout>
    </RoleGuard>
  );
}
