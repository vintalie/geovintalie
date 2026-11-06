import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  MapPinned,
  Store,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  Users,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const isAdmin = (user: any) =>
  user?.tipo_nome === 'admin' || user?.role === 'admin' || user?.tipo === 'admin' || user?.is_admin;

const userMenuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: MapPinned, label: 'Minhas Propriedades' },
  { href: '/products', icon: Store, label: 'Meus Produtos' },
  { href: '/map', icon: MapPin, label: 'Mapa' },
  { href: '/import-export', icon: FileSpreadsheet, label: 'Importar/Exportar' },
  { href: '/profile', icon: Users, label: 'Perfil' },
  { href: '/privacy-consent', icon: ShieldCheck, label: 'Consentimentos LGPD' },
  { href: '/data-export', icon: FileText, label: 'Exportar meus dados' },
  { href: '/delete-account', icon: LogOut, label: 'Excluir conta' },
];

const adminMenuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: MapPinned, label: 'Propriedades' },
  { href: '/products', icon: Store, label: 'Produtos' },
  { href: '/map', icon: MapPin, label: 'Mapa' },
  { href: '/import-export', icon: FileSpreadsheet, label: 'Importar/Exportar' },
  { href: '/countries', icon: MapPinned, label: 'Países' },
  { href: '/states', icon: MapPinned, label: 'Estados' },
  { href: '/cities', icon: MapPinned, label: 'Cidades' },
  { href: '/neighborhoods', icon: MapPinned, label: 'Bairros' },
  { href: '/streets', icon: MapPinned, label: 'Ruas' },
  { href: '/admin', icon: ShieldCheck, label: 'Administração' },
  { href: '/users', icon: Users, label: 'Usuários' },
  { href: '/profile', icon: Users, label: 'Perfil' },
  { href: '/privacy-consent', icon: ShieldCheck, label: 'Consentimentos LGPD' },
  { href: '/data-export', icon: FileText, label: 'Exportar meus dados' },
  { href: '/delete-account', icon: LogOut, label: 'Excluir conta' },
];

export function UserSidebar({
  className,
  open = true,
  onClose,
}: {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = isAdmin(user) ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  return (
    <aside
      className={cn(
        'border-r bg-background flex flex-col transition-width duration-300 ease-in-out',
        className,
      )}
      style={{ width: open ? '16rem' : '3rem' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPinned className="h-5 w-5 text-accent" />
          {open && <span className="font-display font-semibold text-sm">Geovintalie</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose || (() => {})}
          className="mr-2"
        >
          <span className="sr-only">Alternar painel lateral</span>
        </Button>
      </div>
      {open && (
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <p className="px-2 py-1 text-xs text-muted-foreground">Navegação</p>
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors"
              >
                {item.icon ? <item.icon className="mr-2 h-4 w-4 shrink-0" /> : null}
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-4 px-2 py-1 space-y-1">
            <p className="px-2 py-1 text-xs text-muted-foreground">Conta</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-destructive hover:text-destructive/90 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" /> Sair
            </button>
          </div>
        </nav>
      )}
      {open && (
        <footer className="p-2">
          <Badge variant="outline" className="w-full text-xs">
            {isAdmin(user) ? 'Admin' : 'Usuário'}
          </Badge>
        </footer>
      )}
    </aside>
  );
}

export function SidebarTriggerButton() {
  return null;
}
