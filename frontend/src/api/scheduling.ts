import api from './axios';
import type { Appointment } from '@/types';

/**
 * Camada de integracao com o AppointmentsController do backend.
 *
 * Contrato ASSUMIDO (endpoints sob /api/v2/appointments):
 *   GET    /api/v2/appointments              -> index  (agendamentos do usuario logado, cliente ou prestador)
 *   POST   /api/v2/appointments              -> store  (corpo: { provider_id, service, scheduled_at })
 *   DELETE /api/v2/appointments/:id          -> destroy (cancelamento do agendamento)
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 * ATENCAO: ajustar nomes de endpoint/corpo conforme o contrato final da API v2.
 */

export const getAppointments = () =>
  api.get<{ data: Appointment[] }>('/api/v2/appointments');

export const createAppointment = (payload: {
  provider_id: number;
  service: string;
  scheduled_at: string;
}) => api.post('/api/v2/appointments', payload);

export const cancelAppointment = (id: number | string) =>
  api.delete(`/api/v2/appointments/${id}`);

export type { Appointment };
