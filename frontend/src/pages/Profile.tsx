import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateUser, me } from '../api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', kind: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(user!.id, { name, email, phone });
      const response = await me();
      const userData = response.data.user ?? response.data;
      setUser(userData);
      setMessage({ text: 'Perfil atualizado com sucesso!', kind: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Erro ao atualizar perfil.', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Meu Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais de usuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message.text && (
            <Alert variant={message.kind === 'error' ? 'destructive' : undefined}>
              <AlertTitle>{message.kind === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Atualizando...' : 'Atualizar Perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">ID</span>
            <span className="text-sm font-mono text-muted-foreground">#{user?.id}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Tipo de usuario</span>
            <Badge variant={user?.tipo_nome === 'admin' ? 'destructive' : 'secondary'}>
              {user?.tipo_nome ?? 'Usuario'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Telefone</span>
            <span className="text-sm font-mono text-muted-foreground">
              {user?.phone ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">E-mail verificado</span>
            <Badge variant="secondary">{user?.email_verified_at ? 'Sim' : 'Não'}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Criado em</span>
            <span className="text-sm font-mono text-muted-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Atualizado em</span>
            <span className="text-sm font-mono text-muted-foreground">
              {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Profile;
