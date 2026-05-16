import { Home, ScrollText, Skull, Terminal, Gamepad2, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Nav.css';

const navItems = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/builder', label: 'Builder', icon: Skull },
  { href: '/console', label: 'Console', icon: Terminal },
  { href: '/logs', label: 'Logs', icon: ScrollText },
  { href: '/play', label: 'Demo', icon: Gamepad2 },
] as const;

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
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-title">GRIM DROPPER</span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-link-icon" aria-hidden />
                <span className="nav-link-label">{label}</span>
              </Link>
            );
          })}
          {session && (
            <span className="nav-user" title={session.email}>
              {session.name.split(' ')[0]}
            </span>
          )}
          <button type="button" className="nav-logout" onClick={handleLogout}>
            <LogOut className="nav-link-icon" aria-hidden />
            <span className="nav-link-label">Log out</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
