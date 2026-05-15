import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function GuestRoute() {
  const { session, isReady } = useAuth();

  if (!isReady) return null;
  if (session) return <Navigate to="/" replace />;

  return <Outlet />;
}
