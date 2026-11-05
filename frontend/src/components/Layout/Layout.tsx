import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../SiteHeader';
import { UserSidebar } from '../UserSidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col border-r bg-background w-[16rem] shrink-0">
        <UserSidebar />
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
