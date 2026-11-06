import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../SiteHeader';
import { UserSidebar } from '../UserSidebar';
import { useState } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Overlay para mobile quando sidebar está aberto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col border-r bg-background w-[16rem] shrink-0">
          <UserSidebar open={true} />
        </aside>

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col min-w-0 relative">
          {/* Mobile sidebar toggle button (somente mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-background border border-input text-foreground hover:bg-accent/50"
            aria-label="Abrir menu"
          >
            <span className="sr-only">Abrir painel lateral</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Sidebar mobile (posicionado sobre o conteúdo quando aberto) */}
          {sidebarOpen && (
            <div className="fixed inset-y-0 left-0 z-50 w-[16rem] bg-background border-r border-input transform translate-x-0 transition-transform duration-300 md:hidden">
              <UserSidebar open={true} onClose={() => setSidebarOpen(false)} />
            </div>
          )}

          <div className="flex flex-1 flex-col min-w-0">
            <SiteHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
