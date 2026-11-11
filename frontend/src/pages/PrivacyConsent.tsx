import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  getConsents,
  acceptConsent,
  revokeConsent,
  type UserConsent,
} from '@/api/user-consent';
import { Loader2 } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  true: 'Aceito',
  false: 'Pendente',
};

const STATUS_VARIANT: Record<string, 'default' | 'outline'> = {
  true: 'default',
  false: 'outline',
};

const TIPO_LABEL: Record<string, string> = {
  marketing: 'Marketing e comunicacoes',
  analytics: 'Analytics e desempenho',
  third_party: 'Compartilhamento com terceiros',
};

const PrivacyConsent = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  const loadConsents = async () => {
    try {
      const response = await getConsents();
      const data = response.data?.data ?? response.data ?? [];
      setConsents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Não foi possível carregar os consentimentos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const labelFor = (consent: UserConsent) =>
    TIPO_LABEL[consent.purpose] || consent.purpose.replace(/_/g, ' ');

  const handleToggle = async (consent: UserConsent) => {
    const next = !consent.granted;
    setToggling((prev) => new Set([...prev, consent.id]));

    // Otimista: reflete imediatamente, reverte em caso de erro.
    setConsents((list) =>
      list.map((c) =>
        c.id === consent.id ? { ...c, granted: next } : c
      )
    );

    try {
      if (next) {
        await acceptConsent(consent.purpose, true);
        toast.success(`Consentimento aceito: ${labelFor(consent)}.`);
      } else {
        await revokeConsent(consent.purpose);
        toast.success(`Consentimento revogado: ${labelFor(consent)}.`);
      }
    } catch (error: any) {
      setConsents((list) =>
        list.map((c) =>
          c.id === consent.id ? { ...c, granted: !next } : c
        )
      );
      toast.error(
        error.response?.data?.message ||
          'Não foi possível atualizar o consentimento. Tente novamente.'
      );
    } finally {
      setToggling((prev) => {
        const nextSet = new Set(prev);
        nextSet.delete(consent.id);
        return nextSet;
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando consentimentos...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Consentimentos LGPD</CardTitle>
              <CardDescription>
                Gerencie seus consentimentos de tratamento de dados pessoais.
                Alterne cada item para aceitar ou revogar.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Usuário: </span>
            <span className="font-medium">{user.email}</span>
          </div>
        )}
      </div>

      {consents.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Alert>
              <AlertTitle>Nenhum consentimento encontrado</AlertTitle>
              <AlertDescription>
                Não há registros de consentimento para a sua conta no momento.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="w-1/3">Consentimento</TableCell>
                  <TableCell className="w-1/3">Descrição</TableCell>
                  <TableCell className="w-1/6 text-center">Status</TableCell>
                  <TableCell className="w-1/6 text-center">Ação</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell className="font-medium">{labelFor(consent)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Sem descrição disponível.
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={STATUS_VARIANT[String(consent.granted)]}>
                        {STATUS_LABEL[String(consent.granted)]}
                        {consent.granted && consent.granted_at ? (
                          <span className="ml-2 text-xs text-muted-foreground/80">
                            {new Date(consent.granted_at).toLocaleString('pt-BR')}
                          </span>
                        ) : null}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={consent.granted}
                        onCheckedChange={() => handleToggle(consent)}
                        disabled={toggling.has(consent.id)}
                      />
                      <Label className="ml-2 text-xs text-muted-foreground">
                        {consent.granted ? 'Revogar consentimento' : 'Aceitar consentimento'}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default PrivacyConsent;
