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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
      toast.success('Sua conta foi excluída com sucesso.');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel excluir a conta. Tente novamente.'
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
                    Deseja realmente excluir sua conta? Essa acao nao pode ser
                    desfeita e todos os seus dados pessoais serao apagados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancelar</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
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
