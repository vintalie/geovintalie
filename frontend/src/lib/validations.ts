import { z } from 'zod';

/**
 * Schemas de validacao de formularios do escopo B4 (agendamento e chat interno).
 * Usados com react-hook-form para validar campos antes de chamar a API v2.
 */

export const agendamentoSchema = z.object({
  provider_id: z.string().min(1, 'Informe o prestador de servico.'),
  service: z.string().min(1, 'Informe o tipo de servico.'),
  day: z.date(),
  time: z.string().min(1, 'Informe o horario.'),
});

export const mensagemSchema = z.object({
  body: z.string().min(1, 'Digite uma mensagem antes de enviar.').max(4000, 'Mensagem muito longa.'),
});

export const conversaSchema = z.object({
  provider_id: z.string().min(1, 'Informe o prestador de servico.'),
  appointment_id: z.string().optional(),
});
