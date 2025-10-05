'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect based on user role or default to learner
  React.useEffect(() => {
    // Don't wait for auth - just redirect based on what we have
    if (!isLoading) {
      const userRole = user?.role || 'learner'; // Default to learner if no user
      
      // Redirect to role-specific dashboard
      switch (userRole) {
        case 'learner':
          router.push('/dashboard/learner');
          break;
        case 'employer':
          router.push('/dashboard/employer');
          break;
        case 'institution':
          router.push('/dashboard/institution');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard/learner'); // Default fallback
          break;
      }
    }
  }, [isLoading, user?.role, router]);

  // Show loading while redirecting
  return (
    <div className="mt-64 md:mt-24 flex items-center justify-center h-full w-full">
      <LoadingAnimation />
    </div>
  );
}
