'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LearnerDashboard from '@/components/dashboard/LearnerDashboard';

export default function LearnerDashboardPage() {
  return (
    <DashboardLayout title="Learner Dashboard">
      <LearnerDashboard />
    </DashboardLayout>
  );
}
