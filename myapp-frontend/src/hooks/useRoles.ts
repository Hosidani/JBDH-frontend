import { useAuth } from '../context/AuthContext';

export function useRoles() {
  const { roles } = useAuth();
  return {
    roles,
    hasRole: (role: string) => roles.includes(role),
    hasAnyRole: (check: string[]) => check.some(r => roles.includes(r)),
    isCandidate: roles.includes('User'),
    isRecruiter: roles.includes('Recruiter'),
    isSeller:    roles.includes('Manager'),
  };
}
