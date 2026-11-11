import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Controller, useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAppointments,
  createAppointment,
  cancelAppointment,
  type Appointment,
} from '@/api/scheduling';
import { agendamentoSchema } from '@/lib/validations';

type AgendamentoForm = z.infer<typeof agendamentoSchema>;

const STATUS_LABEL: Record<
  AppointmentView['status'],
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

const isDayDisabled = (d: Date) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  return d < today;
};

interface AppointmentView {
  id: number;
  provider_name: string;
  client_name: string;
  service: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

const STATUS_PT_TO_EN: Record<string, AppointmentView['status']> = {
  pendente: 'pending',
  confirmado: 'confirmed',
  concluido: 'completed',
  cancelado: 'cancelled',
};

const toView = (a: Appointment): AppointmentView => ({
  id: a.id,
  provider_name: a.provider.business_name,
  client_name: a.client.name,
  service: a.observacoes ?? 'Servico',
  scheduled_at: `${a.date}T${a.time}:00`,
  status: STATUS_PT_TO_EN[a.status] ?? 'pending',
  created_at: a.created_at,
});

const campoErro = (
  nome: keyof AgendamentoForm,
  errors: FieldErrors<AgendamentoForm>,
) => {
  const erro = errors[nome];
  return erro ? (
    <p className="text-[0.8rem] font-medium text-destructive">
      {erro.message}
    </p>
  ) : null;
};

const Scheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<Set<number>>(new Set());
  const submitting = useRef(false);

  const form = useForm<AgendamentoForm>({
    defaultValues: {
      provider_id: '',
      service: '',
      day: undefined as unknown as Date,
      time: '',
    },
  });
  const { control, reset, getValues, formState } = form;
  const errors = formState.errors;

  const viewAppointments = useMemo(
    () => appointments.map(toView),
    [appointments],
  );

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

  const onSubmitForm = async () => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      const resultado = agendamentoSchema.safeParse(getValues());
      if (!resultado.success) {
        for (const issue of resultado.error.issues) {
          const campo = (issue.path[0] ?? 'form') as keyof AgendamentoForm;
          form.setError(campo, { type: 'manual', message: issue.message });
        }
        toast.error('Preencha prestador, servico, data e horario.');
        return;
      }
      const data = getValues();
      const date = data.day.toISOString().slice(0, 10);
      await createAppointment({
        provider_id: Number(data.provider_id),
        scheduled_at: `${date}T${data.time}:00`,
        service: data.service,
      });
      toast.success('Agendamento criado com sucesso.');
      reset({
        provider_id: '',
        service: '',
        day: undefined as unknown as Date,
        time: '',
      });
      await loadAppointments();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Nao foi possivel criar o agendamento.',
      );
    } finally {
      submitting.current = false;
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

  const statusOf = (status: AppointmentView['status']) => STATUS_LABEL[status];

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dataSelecionadaLabel = (day: Date | undefined) => {
    if (!day) return null;
    return day.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

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
                  <form
                    onSubmit={(evento) => {
                      evento.preventDefault();
                      onSubmitForm();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Prestador</Label>
                      <Controller
                        name="provider_id"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(value ?? '')
                              }
                              value={field.value}
                              disabled={saving}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecionar" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROVIDERS.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={String(p.id)}
                                  >
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {campoErro('provider_id', errors)}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Servico</Label>
                      <Controller
                        name="service"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(value ?? '')
                              }
                              value={field.value}
                              disabled={saving}
                            >
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
                            {campoErro('service', errors)}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Data <Clock className="h-4 w-4" />
                      </Label>
                      <Controller
                        name="day"
                        control={control}
                        render={({ field }) => {
                          const selected = field.value as Date | undefined;
                          return (
                            <>
                              <DayPicker
                                mode="single"
                                selected={selected}
                                onSelect={(d) => field.onChange(d ?? undefined)}
                                disabled={isDayDisabled}
                                showOutsideDays={false}
                                className="w-full"
                              />
                              {selected && (
                                <p className="text-[0.8rem] text-muted-foreground">
                                  {dataSelecionadaLabel(selected)}
                                </p>
                              )}
                              {campoErro('day', errors)}
                            </>
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Horario</Label>
                      <Controller
                        name="time"
                        control={control}
                        render={({ field }) => (
                          <>
                            <div className="grid grid-cols-4 gap-2">
                              {TIMES.map((t) => (
                                <Button
                                  key={t}
                                  type="button"
                                  variant={
                                    field.value === t ? 'default' : 'outline'
                                  }
                                  size="sm"
                                  onClick={() => field.onChange(t)}
                                  disabled={saving}
                                >
                                  {t}
                                </Button>
                              ))}
                            </div>
                            {campoErro('time', errors)}
                          </>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      onClick={(evento) => {
                        evento.preventDefault();
                        onSubmitForm();
                      }}
                      disabled={saving}
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
                    {viewAppointments.length} agendamento(
                    {viewAppointments.length !== 1 ? 's' : ''})
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
                    {viewAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhum agendamento. Crie o primeiro ao lado.
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      viewAppointments.map((a) => (
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
