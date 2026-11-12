import { ContaRecorrente, LancamentoFinanceiro } from '../../../core/domain/types';

export interface SaldoSnapshot {
  data: string;
  saldo: number;
}

export interface PrevisaoInput {
  saldoAtual: number;
  ateDataIso: string;
  lancamentos: LancamentoFinanceiro[];
  contasRecorrentes: ContaRecorrente[];
  hojeIso?: string;
}

export function calcularPrevisaoSaldo(input: PrevisaoInput): SaldoSnapshot {
  const hoje = startOfDay(new Date(input.hojeIso ?? new Date().toISOString()));
  const alvo = startOfDay(new Date(input.ateDataIso));
  let saldo = input.saldoAtual;

  for (const lancamento of input.lancamentos) {
    if (lancamento.ignorarNaPrevisao) {
      continue;
    }
    const data = startOfDay(new Date(lancamento.data));
    if (data.getTime() <= hoje.getTime()) {
      continue;
    }
    if (data.getTime() > alvo.getTime()) {
      continue;
    }
    if (lancamento.status === 'realizado') {
      continue;
    }
    saldo += signedAmount(lancamento.tipo, lancamento.valor);
  }

  for (const conta of input.contasRecorrentes) {
    if (!conta.ativa) {
      continue;
    }
    for (const vencimento of gerarVencimentos(conta, hoje, alvo)) {
      const jaExiste = input.lancamentos.some(
        (l) =>
          l.contaRecorrenteId === conta.id &&
          sameDay(new Date(l.data), vencimento)
      );
      if (jaExiste) {
        continue;
      }
      saldo -= conta.valor;
    }
  }

  return { data: alvo.toISOString(), saldo };
}

export function gerarParcelas(
  valorParcela: number,
  numParcelas: number,
  dataInicioIso: string,
  parcelaAtual = 1
): Array<{ numero: number; valor: number; data: string }> {
  const inicio = new Date(dataInicioIso);
  const parcelas: Array<{ numero: number; valor: number; data: string }> = [];
  for (let n = parcelaAtual; n <= numParcelas; n++) {
    const data = new Date(inicio);
    data.setMonth(inicio.getMonth() + (n - parcelaAtual));
    parcelas.push({
      numero: n,
      valor: valorParcela,
      data: data.toISOString(),
    });
  }
  return parcelas;
}

function signedAmount(tipo: 'receita' | 'despesa', valor: number): number {
  return tipo === 'receita' ? valor : -valor;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function gerarVencimentos(
  conta: ContaRecorrente,
  de: Date,
  ate: Date
): Date[] {
  const datas: Date[] = [];
  const cursor = new Date(de.getFullYear(), de.getMonth(), 1);
  while (cursor.getTime() <= ate.getTime()) {
    const dia = Math.min(
      conta.diaVencimento,
      daysInMonth(cursor.getFullYear(), cursor.getMonth())
    );
    const venc = new Date(cursor.getFullYear(), cursor.getMonth(), dia);
    if (venc.getTime() > de.getTime() && venc.getTime() <= ate.getTime()) {
      datas.push(venc);
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return datas;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
