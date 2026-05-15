import { Outlet } from 'react-router-dom';
import { usePresentationMode } from '../hooks/usePresentationMode';
import { Nav } from './Nav';
import './Layout.css';

export function Layout() {
  usePresentationMode();

  return (
    <div className="layout">
      <Nav />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
