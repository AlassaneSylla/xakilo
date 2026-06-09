import type { Role } from '../../features/auth/types';

export function getRoleLabel(user: { role?: Role; is_superuser?: boolean }) {
  if (user.is_superuser) return 'Super Admin';
  switch (user.role) {
    case 'OWNER':    return 'Propriétaire';
    case 'MANAGER':  return 'Manager';
    case 'EMPLOYEE': return 'Employé';
    default:         return 'Utilisateur';
  }
}