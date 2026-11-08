import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import {
  getAppointments,
  createAppointment,
  cancelAppointment,
  type Appointment,
} from '@/api/scheduling';

const STATUS_LABEL: Record<
  Appointment['status'],
  { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }
> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  completed: { label: 'Concluido', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

const PROVIDERS = [
  { id: 1, name: 'Maria Oliveira - Limpeza e Conservacao' },
  { id: 2, name: 'Joao Santos - Reparos Residencial' },
  { id: 3, name: 'Ana Costa - Jardim e Paisagismo' },
];

const SERVICES = [
  'Consulta de vistoria',
  'Limpeza pos-obra',
  'Reparo geral',
  'Manutencao de jardim',
  'Avaliacao de imovel',
];

const generateTimes = (from: number, to: number): string[] => {
  const times: string[] = [];
  for (let h = from; h < to; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`);
  }
  return times;
};
const TIMES = generateTimes(8, 18);

const isSameDay = (a: Date, b: Date) =>
  a.toDateString() === b.toDateString();

const Scheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<Set<number>>(new Set());

  const [providerId, setProviderId] = useState<string>('');
  const [service, setService] = useState('');
  const [day, setDay] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');

  const loadAppointments = useCallback(async () => {
    try {
      const response = await getAppointments();
      const data = response.data?.data ?? response.data ?? [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel carregar os agendamentos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const today = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  const isDayDisabled = useCallback(
    (d: Date) => d < today,
    [today],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId || !service || !day || !time) {
      toast.error('Preencha prestador, servico, data e horario.');
      return;
    }
    setSaving(true);
    try {
      const scheduled_at = `${day.toISOString().slice(0, 10)}T${time}:00`;
      await createAppointment({
        provider_id: Number(providerId),
        service,
        scheduled_at,
      });
      toast.success('Agendamento criado com sucesso.');
      setProviderId('');
      setService('');
      setDay(undefined);
      setTime('');
      await loadAppointments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel criar o agendamento.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    setCancelling((prev) => new Set([...prev, id]));
    try {
      await cancelAppointment(id);
      toast.success('Agendamento cancelado.');
      await loadAppointments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel cancelar o agendamento.',
      );
    } finally {
      setCancelling((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const statusOf = (status: Appointment['status']) => STATUS_LABEL[status];

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-card">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Calendar className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando agendamentos...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Agendamentos
          </CardTitle>
          <CardDescription>
            Solicite visitas e servicos aos prestadores da plataforma e
            acompanhe o status dos seus agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-6 md:grid-cols-12 p-6">
            <div className="md:span-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Novo agendamento</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Prestador</Label>
                      <Select
                        value={providerId}
                        onValueChange={(value) => setProviderId(value ?? '')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Servico</Label>
                      <Select value={service} onValueChange={setService}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tipo de servico" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Data <Clock className="h-4 w-4" />
                      </Label>
                      <DayPicker
                        mode="single"
                        selected={day}
                        onSelect={setDay}
                        disabled={isDayDisabled}
                        showOutsideDays={false}
                        className="w-full"
                      />
                      {day && (
                        <p className="text-xs text-muted-foreground">
                          {day.toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Horario</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIMES.map((t) => {
                          const active = time === t;
                          return (
                            <Button
                              key={t}
                              type="button"
                              variant={active ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setTime(t)}
                              disabled={saving}
                            >
                              {t}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        saving ||
                        !providerId ||
                        !service ||
                        !day ||
                        !time
                      }
                      className="w-full"
                    >
                      {saving ? 'Agendando...' : 'Agendar'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="md:span-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Meus agendamentos</CardTitle>
                  <CardDescription>
                    {appointments.length} agendamento(
                    {appointments.length !== 1 ? 's' : ''})
                  </CardDescription>
                </CardHeader>
                <Table>
                  <TableCaption>Lista de agendamentos</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prestador / Servico</TableHead>
                      <TableHead className="w-48">Data e horario</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-20">Acao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhum agendamento. Crie o primeiro ao lado.
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">
                            {a.provider_name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDateTime(a.scheduled_at)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {a.service}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusOf(a.status).variant}>
                              {statusOf(a.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {a.status === 'pending' && !cancelling.has(a.id) ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancel(a.id)}
                                className="w-full"
                              >
                                Cancelar
                              </Button>
                            ) : cancelling.has(a.id) ? (
                              <Button size="sm" disabled className="w-full">
                                <Calendar className="h-4 w-4 animate-spin" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-full"
                              >
                                Indisponível
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Scheduling;
