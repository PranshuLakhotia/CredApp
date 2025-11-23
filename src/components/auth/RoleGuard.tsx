'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';
import { canAccessDashboard, getRoleDashboardPath } from '@/utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional: specific role required
  allowedPath?: string;  // Optional: specific path this guard protects
}

/**
 * RoleGuard component to protect routes based on user roles
 * 
 * Usage:
 * <RoleGuard allowedPath="/dashboard/learner">
 *   <LearnerDashboard />
 * </RoleGuard>
 */
export default function RoleGuard({ children, requiredRole, allowedPath }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      // If not authenticated, redirect to login
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Wait for authentication to complete
      if (isLoading) {
        return;
      }

      // If authenticated, check role-based access
      if (user) {
        try {
          const userId = (user as any).id || (user as any)._id;
          
          if (!userId) {
            console.error('No user ID found');
            router.push('/auth/login');
            return;
          }

          // Fetch user's roles
          const rolesData = await AuthService.getUserRoles(userId);
          
          if (!rolesData || !rolesData.roles || rolesData.roles.length === 0) {
            // User has no roles - redirect to a default page or show error
            console.warn('User has no roles assigned');
            setHasAccess(false);
            setIsChecking(false);
            return;
          }

          const userRoles = rolesData.roles;

          // Check if user has the required role (if specified)
          if (requiredRole) {
            const hasRequiredRole = userRoles.some((role: any) => role.role_type === requiredRole);
            if (!hasRequiredRole) {
              // Redirect to user's primary dashboard
              const userDashboard = getRoleDashboardPath(userRoles[0].role_type);
              router.push(userDashboard);
              return;
            }
          }

          // Check if user can access the specific path (if specified)
          if (allowedPath) {
            const canAccess = canAccessDashboard(userRoles, allowedPath);
            if (!canAccess) {
              // Redirect to user's primary dashboard
              const userDashboard = getRoleDashboardPath(userRoles[0].role_type);
              router.push(userDashboard);
              return;
            }
          }

          // User has access
          setHasAccess(true);
        } catch (error) {
          console.error('Error checking user roles:', error);
          // On error, redirect to login
          router.push('/auth/login');
        }
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [user, isAuthenticated, isLoading, requiredRole, allowedPath, router]);

  // Show loading while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show access denied message if no access
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this dashboard. You are being redirected to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Render children if access is granted
  return <>{children}</>;
}


