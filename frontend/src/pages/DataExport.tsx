import { useCallback, useState } from 'react';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { exportData } from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';
import { FileText } from 'lucide-react';

const DataExport = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<unknown>(null);

  const downloadJson = useCallback(
    (data: unknown, fileName: string) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleExport = async () => {
    setExporting(true);
    setExported(null);
    try {
      const response = await exportData();
      const data = response.data ?? response;
      setExported(data);

      const today = new Date().toISOString().slice(0, 10);
      downloadJson(data, `geovintalie-dados-pessoais-${today}.json`);

      toast.success(
        'Dados exportados com sucesso. O arquivo JSON foi baixado.'
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Não foi possível exportar os dados. Tente novamente.'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exportação de Dados Pessoais
            </CardTitle>
            <CardDescription>
              Solicite uma cópia de todos os dados pessoais que a Geovintalie
              trata sobre a sua conta (LGPD - direito de acesso e portabilidade).
              O arquivo é entregue no formato JSON.
            </CardDescription>
          </CardHeader>
        </Card>
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Usuário: </span>
            <span className="font-medium">{user.email}</span>
          </div>
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Solicitar exportação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full md:w-auto"
          >
            {exporting ? 'Gerando exportação...' : 'Exportar meus dados'}
          </Button>
          <p className="text-sm text-muted-foreground">
            O download começa automaticamente após a geração do arquivo.
          </p>
        </CardContent>
      </Card>

      {exported ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Visualização dos dados exportados</CardTitle>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  Ocultar visualização
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 rounded-md border bg-muted p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
                  <pre>{JSON.stringify(exported, null, 2)}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
};

export default DataExport;
