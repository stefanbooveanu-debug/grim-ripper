import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute() {
  const { session, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="auth-loading" aria-busy="true">
        <span className="auth-loading-dot" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
