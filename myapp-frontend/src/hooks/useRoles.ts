import { useAuth } from '../context/AuthContext';

/**
 * Hook for role-based access checks.
 * See Coding_guidelines.md § Role-Based UI Gating for usage.
 */
export const useRoles = () => {
  const { user } = useAuth();
  const roles: string[] = user?.roles ?? [];
  const isLoggedIn = user !== null;

  return {
    /** Raw role array for the current user. Empty array if not logged in or no roles assigned. */
    roles,
    /** True if the user has this exact role. */
    hasRole: (role: string): boolean => roles.includes(role),
    /** True if the user has at least one of the given roles. */
    hasAnyRole: (roleList: string[]): boolean => roleList.some(r => roles.includes(r)),
    /** Convenience shortcuts */
    isCandidate: roles.includes('User'),
    isRecruiter: roles.includes('Recruiter'),
    isSeller: roles.includes('Manager'),
    isLoggedIn,
  };
};
