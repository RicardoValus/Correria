export interface Evento {
  id: string;
  titulo: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  cor: string;
  categoriaId?: string;
  descricao?: string;
}

export type AgendaViewMode = 'day' | 'week' | 'month';
