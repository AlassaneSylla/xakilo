import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { PATHS } from './paths';
import type { Role } from '../features/auth/types';

interface Props {
  roles: Role[];
  superuserAllowed?: boolean;
}

export default function RequireRole({ roles, superuserAllowed = false }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to={PATHS.LOGIN} replace />;
  if (superuserAllowed && user.is_superuser) return <Outlet />;
  if (user.role && roles.includes(user.role)) return <Outlet />;

  // Superuser trying to access a boutique-only route → send to admin dashboard
  if (user.is_superuser) return <Navigate to={PATHS.ADMIN_HOME} replace />;

  return <Navigate to={PATHS.HOME} replace />;
}
