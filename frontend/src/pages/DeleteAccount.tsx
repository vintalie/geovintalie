import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteAccount } from '@/api/user-consent';
import { Trash2 } from 'lucide-react';

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount({ password, confirm_delete: true });
      logout();
      navigate('/login');
      toast.success('Sua conta foi excluída com sucesso.');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Não foi possível excluir a conta. Tente novamente.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Excluir minha conta</CardTitle>
            <CardDescription>
              Esta ação é irreversível. Todos os seus dados pessoais serão
              removidos permanentemente da Geovintalie, conforme a LGPD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span>Conta: {user.email}</span>
              </div>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={() => {}}
                  disabled={deleting}
                  className="w-full"
                >
                  {deleting ? 'Excluindo...' : 'Confirmar exclusão de conta'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deseja realmente excluir sua conta? Essa ação não pode ser
                    desfeita e todos os seus dados pessoais serão apagados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (password && confirmed) handleDelete();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="delete-account-password" className="text-sm font-medium text-foreground block">Senha atual</label>
                    <input
                      id="delete-account-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha para confirmar"
                      className="w-full px-3 py-2 text-sm border rounded-md"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      id="delete-account-confirm"
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <label htmlFor="delete-account-confirm" className="text-sm text-foreground">
                      Confirmo que desejo excluir minha conta permanentemente.
                    </label>
                  </div>
                </form>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancelar</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting || !password || !confirmed}
                    >
                      {deleting ? 'Excluindo...' : 'Excluir conta'}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DeleteAccount;
