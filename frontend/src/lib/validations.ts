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
  body: z.string().max(4000, 'Mensagem muito longa.').optional(),
});

export const conversaSchema = z.object({
  provider_id: z.string().min(1, 'Informe o prestador de servico.'),
  appointment_id: z.string().optional(),
});

/**
 * Schema de validacao dos filtros de busca (Escopo B2).
 */
export const searchSchema = z.object({
  q: z.string().max(255, 'Busca muito longa.').optional(),
  category_id: z.coerce.number().int().positive().optional(),
  city: z.string().max(100, 'Cidade muito longa.').optional(),
  state: z.string().max(100, 'Estado muito longo.').optional(),
  min_rating: z.coerce.number().min(0, 'Nota minima invalida.').max(5, 'Nota minima invalida.').optional(),
  max_rating: z.coerce.number().min(0, 'Nota maxima invalida.').max(5, 'Nota maxima invalida.').optional(),
  min_price: z.coerce.number().min(0, 'Preco minimo invalido.').optional(),
  max_price: z.coerce.number().min(0, 'Preco maximo invalido.').optional(),
  limit: z.coerce.number().min(1, 'Limite invalido.').max(100, 'Limite invalido.').optional(),
  page: z.coerce.number().min(1, 'Pagina invalida.').optional(),
});
