import api from './axios';
import type { Appointment } from '@/types';

/**
 * Camada de integracao com o AppointmentController do backend (Escopo B4).
 *
 * Contrato da API v2 (conforme api/routes/api.php):
 *   GET    /api/v2/appointments              -> index  (agendamentos do usuario logado)
 *   GET    /api/v2/agendamentos              -> index  (alias em portugues)
 *   POST   /api/v2/appointments              -> store  (corpo: { provider_id, date, time, valor?, observacoes? })
 *   POST   /api/v2/agendamentos              -> store  (alias em portugues)
 *   GET/PUT/DELETE /api/v2/appointments/:id  -> show/update/destroy
 *   GET/PATCH/DELETE /api/v2/agendamentos/:id -> show/update/destroy (alias em portugues)
 *
 * O token e injetado automaticamente pelo interceptor de src/api/axios.ts.
 */

export const getAppointments = () =>
  api.get<{ data: Appointment[] }>('/api/v2/appointments');

export const createAppointment = (payload: {
  provider_id: number;
  date: string;
  time: string;
  valor?: number | null;
  observacoes?: string | null;
}) => api.post('/api/v2/appointments', payload);

export const updateAppointment = (id: number | string, payload: {
  status?: string;
  valor?: number | null;
  observacoes?: string | null;
}) => api.put(`/api/v2/appointments/${id}`, payload);

export const cancelAppointment = (id: number | string) =>
  api.delete(`/api/v2/appointments/${id}`);

export type { Appointment };
