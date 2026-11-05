import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';

function App() {
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  return (
    <SidebarProvider defaultOpen={true}>
      <BrowserRouter basename={basename === '/' ? '' : basename}>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;
