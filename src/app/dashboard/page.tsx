'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';
import { UserRole } from '@/types/auth';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine user role from current path if not available in user object
  const getRoleFromPath = (path: string): UserRole => {
    if (path.includes('/dashboard/institution')) return 'institution';
    if (path.includes('/dashboard/employer')) return 'employer';
    if (path.includes('/dashboard/admin')) return 'admin';
    return 'learner'; // default
  };

  // Redirect based on user role or default to learner
  React.useEffect(() => {
    console.log('DashboardPage useEffect triggered:');
    console.log('- isLoading:', isLoading);
    console.log('- pathname:', pathname);
    console.log('- user?.role:', user?.role);
    console.log('- pathname === "/dashboard":', pathname === '/dashboard');
    
    // Only redirect if we're on the exact /dashboard path (not sub-paths)
    if (!isLoading && pathname === '/dashboard') {
      const userRole = user?.role || 'learner'; // Default to learner if no role
      console.log('- About to redirect with userRole:', userRole);
      
      // Redirect to role-specific dashboard
      switch (userRole) {
        case 'learner':
          console.log('- Redirecting to /dashboard/learner');
          router.push('/dashboard/learner');
          break;
        case 'employer':
          console.log('- Redirecting to /dashboard/employer');
          router.push('/dashboard/employer');
          break;
        case 'institution':
          console.log('- Redirecting to /dashboard/institution');
          router.push('/dashboard/institution');
          break;
        case 'admin':
          console.log('- Redirecting to /dashboard/admin');
          router.push('/dashboard/admin');
          break;
        default:
          console.log('- Redirecting to /dashboard/learner (default)');
          router.push('/dashboard/learner'); // Default fallback
          break;
      }
    } else {
      console.log('- Not redirecting (condition not met)');
    }
  }, [isLoading, user?.role, pathname, router]);

  // Show loading while redirecting
  return (
    <div className="mt-64 md:mt-24 flex items-center justify-center h-full w-full">
      <LoadingAnimation />
    </div>
  );
}
