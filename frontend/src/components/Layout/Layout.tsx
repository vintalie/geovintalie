import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../SiteHeader';
import { UserSidebar } from '../UserSidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <UserSidebar />
      <div className="flex flex-1">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
