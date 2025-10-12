import { User } from '@/types/auth';
import { AuthService } from '@/services/auth.service';

/**
 * Get the primary role dashboard path for a user
 * @param user - User object (optional if fetching fresh data)
 * @param userId - User ID to fetch roles for
 * @returns Dashboard path string
 */
export async function getUserDashboardPath(user?: User | null, userId?: string): Promise<string> {
  try {
    // If user object is provided and has roles in its data, use those
    if (user && (user as any).roles && Array.isArray((user as any).roles) && (user as any).roles.length > 0) {
      // User has roles array with role IDs - need to fetch role details
      if (userId || user.id) {
        try {
          const rolesData = await AuthService.getUserRoles(userId || user.id);
          if (rolesData && rolesData.roles && rolesData.roles.length > 0) {
            const primaryRole = rolesData.roles[0];
            return getRoleDashboardPath(primaryRole.role_type);
          }
        } catch (error) {
          console.error('Error fetching user roles:', error);
        }
      }
    }

    // Default fallback to learner dashboard
    return '/dashboard/learner';
  } catch (error) {
    console.error('Error determining user dashboard path:', error);
    return '/dashboard/learner';
  }
}

/**
 * Get dashboard path for a specific role type
 * @param roleType - The role type string
 * @returns Dashboard path string
 */
export function getRoleDashboardPath(roleType: string): string {
  const roleMap: { [key: string]: string } = {
    'learner': '/dashboard/learner',
    'employer': '/dashboard/employer',
    'issuer': '/dashboard/institution',
    'institution': '/dashboard/institution',
    'admin': '/dashboard/admin',
  };

  return roleMap[roleType] || '/dashboard/learner';
}

/**
 * Check if user has access to a specific role type
 * @param userRoles - Array of user's role objects
 * @param requiredRole - Required role type
 * @returns boolean indicating access
 */
export function hasRole(userRoles: any[], requiredRole: string): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  return userRoles.some(role => role.role_type === requiredRole);
}

/**
 * Check if user can access a specific dashboard path
 * @param userRoles - Array of user's role objects
 * @param dashboardPath - Dashboard path to check
 * @returns boolean indicating access
 */
export function canAccessDashboard(userRoles: any[], dashboardPath: string): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // Extract role type from dashboard path
  const pathToRole: { [key: string]: string } = {
    '/dashboard/learner': 'learner',
    '/dashboard/employer': 'employer',
    '/dashboard/institution': 'issuer',
    '/dashboard/admin': 'admin',
  };

  const requiredRole = pathToRole[dashboardPath];
  if (!requiredRole) {
    return false;
  }

  return hasRole(userRoles, requiredRole);
}

/**
 * Get user's primary role type
 * @param userRoles - Array of user's role objects
 * @returns Primary role type string or null
 */
export function getPrimaryRoleType(userRoles: any[]): string | null {
  if (!userRoles || userRoles.length === 0) {
    return null;
  }

  // Return the first role's type
  return userRoles[0]?.role_type || null;
}

