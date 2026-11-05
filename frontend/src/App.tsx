import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  return (
    <BrowserRouter basename={basename === '/' ? '' : basename}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
