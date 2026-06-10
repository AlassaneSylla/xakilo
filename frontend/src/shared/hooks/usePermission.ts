import { useAuth } from '../../providers/AuthProvider';
import type { Role } from '../../features/auth/types';

export function usePermission() {
  const { user } = useAuth();
  const role: Role = user?.role ?? 'EMPLOYEE';

  return {
    role,
    isOwner:   role === 'OWNER',
    isManager: role === 'OWNER' || role === 'MANAGER',
    isSuperUser: user?.is_superuser ?? false,

    // Rapports
    canAccessDailyReport:   true,
    canAccessMonthlyReport: role === 'OWNER' || role === 'MANAGER',
    canAccessAnnualReport:  role === 'OWNER',

    // Gestion
    canManageUsers:     role === 'OWNER',
    canManageBoutiques: user?.is_superuser ?? false,
    canDelete:          role === 'OWNER' || role === 'MANAGER',
    canCancelRemoval:   role === 'OWNER' || role === 'MANAGER',
    canRecordPayment:   role === 'OWNER' || role === 'MANAGER',
    canFilterByDate:    role === 'OWNER',
    canExportReport:    role === 'OWNER',
  };
}