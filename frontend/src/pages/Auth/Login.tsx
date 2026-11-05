import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { login } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteHeader } from '@/components/SiteHeader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, login: setAuth } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await login(email, password);
      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid-paper">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold">Acesse sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre para gerenciar suas propriedades e imóveis.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              <LogIn className="h-4 w-4" /> Entrar
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta? <Link to="/register" className="text-primary hover:underline">Registre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
