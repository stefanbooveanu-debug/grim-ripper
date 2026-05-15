import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PROJECT } from '../content/hacktm';
import './Nav.css';

export function Nav() {
  const { pathname } = useLocation();
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-logo">◆</span>
        <span className="nav-title">{PROJECT.name}</span>
      </Link>
      <nav className="nav-links" aria-label="Main">
        <Link to="/" className={pathname === '/' ? 'active' : ''}>
          Overview
        </Link>
        <Link to="/builder" className={pathname === '/builder' ? 'active' : ''}>
          Builder
        </Link>
        <Link to="/console" className={pathname === '/console' ? 'active' : ''}>
          Console
        </Link>
        <Link to="/logs" className={pathname === '/logs' ? 'active' : ''}>
          Logs
        </Link>
        <Link to="/play" className={pathname === '/play' ? 'active' : ''}>
          Demo
        </Link>
        {session && (
          <span className="nav-user" title={session.email}>
            {session.name.split(' ')[0]}
          </span>
        )}
        <button type="button" className="nav-logout" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </header>
  );
}
