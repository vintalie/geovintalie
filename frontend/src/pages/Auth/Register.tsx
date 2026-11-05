import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { register as registerApi } from '../../api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteHeader } from '@/components/SiteHeader';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await registerApi(name, email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro no registro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid-paper bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold font-display">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cadastre-se para começar.</p>
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="text-primary hover:underline">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
