export type TarefaPrioridade = 'urgente' | 'alta' | 'normal' | 'baixa';
export type TarefaStatus = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluida';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade: TarefaPrioridade;
  status: TarefaStatus;
  prazo?: string;
  concluida: boolean;
  categoriaId?: string;
}
