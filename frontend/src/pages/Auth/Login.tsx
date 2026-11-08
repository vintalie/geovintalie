import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { login } from '../../api/auth';
import { register as registerApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent, mode: 'login' | 'register') => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const response = await login(email, password);
        const { token } = response.data;
        setAuth(token);
      } else {
        await registerApi(name, email, password);
        const response = await login(email, password);
        const { token } = response.data;
        setAuth(token);
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (mode === 'login' ? 'Erro ao fazer login' : 'Erro no registro'),
      );
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
            <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Entre para gerenciar suas propriedades e imóveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="w-full">
                  <LogIn className="h-4 w-4 mr-2" /> Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" /> Criar conta
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="relative space-y-1.5">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {error && <div className="text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative space-y-1.5">
                    <Label htmlFor="regEmail">E-mail</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="relative space-y-1.5">
                    <Label htmlFor="regPassword">Senha</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {error && <div className="text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Registrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button
                onClick={() => {
                  // Switch to register tab via tabs would need ref, using navigate as fallback
                }}
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
