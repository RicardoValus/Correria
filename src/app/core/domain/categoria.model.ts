export type CategoriaTipo = 'tarefa' | 'evento' | 'financeiro' | 'nota';

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  tipo: CategoriaTipo;
  icone?: string;
}
