import { Outlet } from 'react-router-dom';
import { usePresentationMode } from '../hooks/usePresentationMode';
import { DownloadWindowBanner } from './DownloadWindowBanner';
import { Nav } from './Nav';
import './Layout.css';

export function Layout() {
  usePresentationMode();

  return (
    <div className="layout">
      <Nav />
      <DownloadWindowBanner />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
