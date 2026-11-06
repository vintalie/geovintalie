import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import {
  getConsents,
  acceptConsent,
  revokeConsent,
  type UserConsent,
} from '@/api/user-consent';
import { BarChart3, Loader2, Mail, ShieldCheck, Share2 } from 'lucide-react';

type ConsentPurpose = {
  tipo: 'marketing' | 'analytics' | 'third_party';
  titulo: string;
  descricao: string;
  icon: React.ElementType;
};

const PURPOSES: ConsentPurpose[] = [
  {
    tipo: 'marketing',
    titulo: 'Marketing e comunicacoes',
    descricao:
      'Receba novidades, ofertas e promocoes da Geovintalie por e-mail e outros canais.',
    icon: Mail,
  },
  {
    tipo: 'analytics',
    titulo: 'Analytics e desempenho',
    descricao:
      'Coleta de dados de uso e navegacao para melhorar a plataforma e a sua experiencia.',
    icon: BarChart3,
  },
  {
    tipo: 'third_party',
    titulo: 'Compartilhamento com terceiros',
    descricao:
      'Permite o compartilhamento de seus dados com parceiros terceiros para prestacao de servicos relacionados a sua conta.',
    icon: Share2,
  },
];

const PrivacyConsent = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const byTipo = useMemo(() => {
    const map = new Map<string, UserConsent>();
    consents.forEach((c) => map.set(c.purpose, c));
    return map;
  }, [consents]);

  const loadConsents = useCallback(async () => {
    try {
      const response = await getConsents();
      const data = response.data?.data ?? response.data ?? [];
      setConsents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel carregar os consentimentos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const labelFor = (tipo: string) =>
    PURPOSES.find((p) => p.tipo === tipo)?.titulo || tipo;

  const handleToggle = async (tipo: string) => {
    const current = byTipo.get(tipo)?.granted ?? false;
    const next = !current;
    const previous = [...consents];

    setToggling((prev) => new Set([...prev, tipo]));
    setConsents((list) =>
      list.map((c) =>
        c.purpose === tipo ? { ...c, granted: next } : c,
      ),
    );

    try {
      if (next) {
        await acceptConsent(tipo, true);
      } else {
        await revokeConsent(tipo);
      }
      await loadConsents();
      toast.success(
        `Consentimento ${next ? 'aceito' : 'revogado'}: ${labelFor(tipo)}.`,
      );
    } catch (error: any) {
      setConsents(previous);
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel atualizar o consentimento. Tente novamente.',
      );
    } finally {
      setToggling((prev) => {
        const nextSet = new Set(prev);
        nextSet.delete(tipo);
        return nextSet;
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-card">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando consentimentos...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Card className="shadow-card flex-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Consentimentos LGPD
            </CardTitle>
            <CardDescription>
              Gerencie o tratamento dos seus dados pessoais por finalidade.
              Voce pode alterar suas escolhas a qualquer momento, conforme a
              LGPD. As mudancas sao aplicadas imediatamente.
            </CardDescription>
          </CardHeader>
        </Card>
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Usuario: </span>
            <span className="font-medium">{user.email}</span>
          </div>
        )}
      </div>

      <Card className="shadow-card grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardContent className="p-0">
          {PURPOSES.map((purpose) => {
            const consent = byTipo.get(purpose.tipo);
            const aceito = consent?.aceito ?? false;
            const Icon = purpose.icon;
            return (
              <Card key={purpose.tipo} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="text-base leading-tight">
                        {purpose.titulo}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {purpose.descricao}
                      </CardDescription>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Badge variant={aceito ? 'default' : 'secondary'}>
                      {aceito ? 'Aceito' : 'Pendente'}
                    </Badge>
                    {aceito && consent?.aceito_em && (
                      <span className="text-xs text-muted-foreground">
                        desde{' '}
                        {new Date(consent.aceito_em).toLocaleDateString(
                          'pt-BR',
                        )}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={aceito}
                        onCheckedChange={() => handleToggle(purpose.tipo)}
                        disabled={toggling.has(purpose.tipo)}
                      />
                      <Label className="text-xs text-muted-foreground">
                        {aceito ? 'Desativar' : 'Ativar'}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {consents.length === 0 && !loading && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Alert>
              <AlertTitle>Nenhum consentimento encontrado</AlertTitle>
              <AlertDescription>
                Nao ha registros de consentimento para a sua conta no momento.
              Ative as finalidades acima para registrar suas escolhas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default PrivacyConsent;
