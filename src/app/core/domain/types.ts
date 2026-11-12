export type CategoryType = 'tarefa' | 'evento' | 'financeiro' | 'nota';
export type TaskPriority = 'urgente' | 'alta' | 'normal' | 'baixa';
export type TaskStatus = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluida';
export type ReminderStatus = 'ativo' | 'adiado' | 'concluido';
export type AttachmentType = 'imagem' | 'arquivo' | 'audio';
export type BankAccountType = 'dinheiro' | 'corrente' | 'poupanca' | 'outra';
export type FinancialEntryType = 'receita' | 'despesa';
export type FinancialEntryStatus = 'previsto' | 'realizado';
export type RecurrenceFrequency = 'diaria' | 'semanal' | 'mensal' | 'customizada' | 'nenhuma';

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  until?: string | null;
  weekDays?: number[];
}

export interface Categoria extends Timestamps {
  id: string;
  nome: string;
  cor: string;
  tipo: CategoryType;
}

export interface Tag extends Timestamps {
  id: string;
  nome: string;
}

export interface Subtarefa {
  id: string;
  tarefaId: string;
  titulo: string;
  concluida: boolean;
  ordem: number;
}

export interface Tarefa extends Timestamps {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: TaskPriority;
  status: TaskStatus;
  dataInicio: string | null;
  prazo: string | null;
  recorrencia: RecurrenceRule;
  estimativaMin: number | null;
  tempoGastoMin: number;
  favorito: boolean;
  categoriaId: string | null;
  projeto: string | null;
  eventoId: string | null;
}

export interface Evento extends Timestamps {
  id: string;
  titulo: string;
  descricao: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  recorrencia: RecurrenceRule;
  cor: string;
  categoriaId: string | null;
  tarefaId: string | null;
  lembreteMinutosAntes: number | null;
  timeBlocking: boolean;
}

export interface Lembrete extends Timestamps {
  id: string;
  titulo: string;
  dataHora: string;
  recorrencia: RecurrenceRule;
  status: ReminderStatus;
  tarefaId: string | null;
  eventoId: string | null;
  contaRecorrenteId: string | null;
  notificationId: number | null;
}

export interface Nota extends Timestamps {
  id: string;
  titulo: string;
  corpo: string;
  fixada: boolean;
  favorita: boolean;
  dataLembrete: string | null;
  categoriaId: string | null;
  tarefaId: string | null;
  eventoId: string | null;
  lancamentoId: string | null;
}

export interface Anexo extends Timestamps {
  id: string;
  notaId: string;
  tipo: AttachmentType;
  caminho: string;
  nome: string;
}

export interface ContaBancaria extends Timestamps {
  id: string;
  nome: string;
  tipo: BankAccountType;
  saldoAtual: number;
}

export interface CartaoCredito extends Timestamps {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
}

export interface LancamentoFinanceiro extends Timestamps {
  id: string;
  tipo: FinancialEntryType;
  valor: number;
  data: string;
  status: FinancialEntryStatus;
  descricao: string;
  categoriaId: string | null;
  contaBancariaId: string | null;
  cartaoCreditoId: string | null;
  contaRecorrenteId: string | null;
  parcelamentoId: string | null;
  parcelaNumero: number | null;
  ignorarNaPrevisao: boolean;
}

export interface ContaRecorrente extends Timestamps {
  id: string;
  nome: string;
  valor: number;
  diaVencimento: number;
  categoriaId: string | null;
  contaBancariaId: string | null;
  ativa: boolean;
  lembreteDiasAntes: number;
}

export interface Parcelamento extends Timestamps {
  id: string;
  descricao: string;
  valorParcela: number;
  numParcelas: number;
  parcelaAtual: number;
  dataInicio: string;
  cartaoCreditoId: string | null;
  categoriaId: string | null;
}
