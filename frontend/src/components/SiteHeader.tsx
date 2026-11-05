import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogIn, LogOut, MapPinned, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  const isAdmin = user?.role === 'admin' || user?.tipo === 'admin' || user?.is_admin;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <MapPinned className="h-5 w-5 text-accent" />
          Geovintalie
        </Link>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="h-9">
                <Link to="/">
                  <LayoutDashboard className="h-4 w-4" /> Painel
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4" /> Administração
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
