export type LancamentoTipo = 'receita' | 'despesa';
export type LancamentoStatus = 'previsto' | 'realizado';

export interface LancamentoFinanceiro {
  id: string;
  tipo: LancamentoTipo;
  valor: number;
  data: string;
  status: LancamentoStatus;
  descricao: string;
  categoriaId: string;
}

export interface ContaBancaria {
  id: string;
  nome: string;
  tipo: 'dinheiro' | 'corrente' | 'poupanca' | 'outra';
  saldoAtual: number;
}

export interface CartaoCredito {
  id: string;
  nome: string;
  limite: number;
  faturaAtual: number;
}

export interface SaldoResumo {
  saldoAtual: number;
  saldoPrevistoFimMes: number;
  receitasMes: number;
  despesasMes: number;
}
