import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { deleteAccount } from '@/api/user-consent';
import { Trash2 } from 'lucide-react';

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount({ password, confirm_delete });
      logout();
      navigate('/login');
      toast.success('Sua conta foi excluída com sucesso.');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel excluir a conta. Tente novamente.',
      );
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Excluir minha conta</CardTitle>
            <CardDescription>
              Esta acao e irreversivel. Seus dados pessoais serao excluidos ou
              anonimizados de forma definitiva da Geovintalie, conforme o
              direito ao esquecimento da LGPD, e nao poderao ser recuperados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span>Conta: {user.email}</span>
              </div>
            )}
            {!open && (
              <Button
                variant="destructive"
                onClick={() => setOpen(true)}
                disabled={deleting}
                className="w-full"
              >
                {deleting ? 'Excluindo...' : 'Confirmar exclusão de conta'}
              </Button>
            )}
            {open && (
              <div className="mt-4">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Confirmar exclusão</CardTitle>
                    <CardDescription>
                      Deseja realmente excluir sua conta? Essa acao nao pode ser
                      desfeita e todos os seus dados pessoais serao apagados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="password">Senha atual</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha para confirmar"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="confirm-delete"
                        checked={confirmDelete}
                        onCheckedChange={(checked) =>
                          setConfirmDelete(checked === true)
                        }
                      />
                      <Label htmlFor="confirm-delete" className="text-sm">
                        Confirmo que desejo excluir minha conta de forma
                        definitiva
                      </Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={deleting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting || !password || !confirmDelete}
                    >
                      {deleting ? 'Excluindo...' : 'Excluir conta'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DeleteAccount;
