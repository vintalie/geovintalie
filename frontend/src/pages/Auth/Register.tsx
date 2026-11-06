import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { register as registerApi } from '../../api/auth';
import { login } from '../../api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteHeader } from '@/components/SiteHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await registerApi(name, email, password);
      const response = await login(email, password);
      const { token } = response.data;
      setAuth(token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro no registro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid-paper bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-4 py-8 md:py-12">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-display">Criar conta</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Cadastre-se para começar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <Button className="w-full" disabled={busy} type="submit">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Registrar
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
