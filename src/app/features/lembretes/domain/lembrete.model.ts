export type LembreteStatus = 'ativo' | 'adiado' | 'concluido';

export interface Lembrete {
  id: string;
  titulo: string;
  dataHora: string;
  status: LembreteStatus;
}
