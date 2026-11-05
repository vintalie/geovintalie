import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../SiteHeader';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
