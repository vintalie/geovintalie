import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  MapPinned,
  Store,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
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
];

export function UserSidebar({ className }: { className?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open] = useState(true);

  const menuItems = isAdmin(user) ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider defaultOpen={open}>
      <Sidebar className={cn("border-r", className)} side="left">
        <SidebarTrigger asChild>
          <Button variant="outline" size="icon" className="mr-2">
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SidebarTrigger>
        <SidebarContent>
          <SidebarHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-accent" />
              <span className="font-display font-semibold text-sm">Geovintalie</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin(user) ? 'Administrador' : 'Usuário'}
            </p>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="text-sm">
                      {item.icon ? (
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      ) : null}
                      {item.label}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Conta</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/90"
                  >
                    <LogOut className="h-4 w-4 shrink-0" /> Sair
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <Badge variant="outline" className="w-full text-xs">
            {isAdmin(user) ? 'Admin' : 'Usuário'}
          </Badge>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

export function SidebarTriggerButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <SidebarTrigger asChild>
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
        <span className="sr-only">Alternar painel lateral</span>
      </Button>
    </SidebarTrigger>
  );
}
