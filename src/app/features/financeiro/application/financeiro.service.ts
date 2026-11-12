import { Injectable, computed, signal } from '@angular/core';
import { FinanceiroRepository } from '../infrastructure/financeiro.repository';
import {
  calcularPrevisaoSaldo,
  gerarParcelas,
} from '../domain/previsao-saldo';
import { createId } from '../../../shared/utils/id';
import {
  CartaoCredito,
  ContaBancaria,
  ContaRecorrente,
  LancamentoFinanceiro,
  Parcelamento,
} from '../../../core/domain/types';
import { endOfDayIso, endOfMonthIso, startOfDayIso } from '../../../shared/utils/dates';
import { SaldoResumo } from '../domain/financeiro.model';

export type LancamentoCreateInput = Omit<LancamentoFinanceiro, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type ParcelamentoCreateInput = Omit<
  Parcelamento,
  'id' | 'createdAt' | 'updatedAt'
> & { id?: string };

export interface QuickExpenseInput {
  valor: number;
  descricao?: string;
  categoriaId?: string | null;
  contaBancariaId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  readonly contas = signal<ContaBancaria[]>([]);
  readonly cartoes = signal<CartaoCredito[]>([]);
  readonly lancamentos = signal<LancamentoFinanceiro[]>([]);
  readonly contasRecorrentes = signal<ContaRecorrente[]>([]);
  readonly parcelamentos = signal<Parcelamento[]>([]);
  readonly resumo = signal<SaldoResumo>({
    saldoAtual: 0,
    saldoPrevistoFimMes: 0,
    receitasMes: 0,
    despesasMes: 0,
  });

  readonly recentes = computed(() =>
    [...this.lancamentos()]
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 8),
  );

  readonly contasAVencerHoje = computed(() => {
    const start = startOfDayIso();
    const end = endOfDayIso();
    return this.lancamentos()
      .filter((l) => l.status === 'previsto' && l.data >= start && l.data <= end)
      .map((l) => ({
        id: l.id,
        descricao: l.descricao,
        valor: l.valor,
      }));
  });

  constructor(private readonly repository: FinanceiroRepository) {}

  async load(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const [contas, cartoes, lancamentos, contasRecorrentes, parcelamentos] =
      await Promise.all([
        this.repository.listContas(),
        this.repository.listCartoes(),
        this.repository.listLancamentos(),
        this.repository.listContasRecorrentes(),
        this.repository.listParcelamentos(),
      ]);
    this.contas.set(contas);
    this.cartoes.set(cartoes);
    this.lancamentos.set(lancamentos);
    this.contasRecorrentes.set(contasRecorrentes);
    this.parcelamentos.set(parcelamentos);
    const saldoAtual = await this.repository.sumSaldoContas();
    const saldoPrevistoFimMes = await this.previsaoAteFimDoMes();
    const monthStart = startOfDayIso(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const monthEnd = endOfMonthIso();
    const doMes = lancamentos.filter(
      (l) => l.data >= monthStart && l.data <= monthEnd && l.status === 'realizado'
    );
    const receitasMes = doMes
      .filter((l) => l.tipo === 'receita')
      .reduce((acc, l) => acc + l.valor, 0);
    const despesasMes = doMes
      .filter((l) => l.tipo === 'despesa')
      .reduce((acc, l) => acc + l.valor, 0);
    this.resumo.set({
      saldoAtual,
      saldoPrevistoFimMes,
      receitasMes,
      despesasMes,
    });
  }

  async saldoAtual(): Promise<number> {
    return this.repository.sumSaldoContas();
  }

  async previsaoAteFimDoMes(reference = new Date()): Promise<number> {
    const saldoAtual = await this.saldoAtual();
    const lancamentos = await this.repository.listLancamentos();
    const contasRecorrentes = await this.repository.listContasRecorrentes();
    const snapshot = calcularPrevisaoSaldo({
      saldoAtual,
      ateDataIso: endOfMonthIso(reference),
      lancamentos,
      contasRecorrentes,
      hojeIso: startOfDayIso(reference),
    });
    return snapshot.saldo;
  }

  async listLancamentosPrevistosHoje(date = new Date()): Promise<LancamentoFinanceiro[]> {
    const start = startOfDayIso(date);
    const end = endOfDayIso(date);
    const items = await this.repository.listLancamentosNoPeriodo(start, end);
    return items.filter((l) => l.status === 'previsto');
  }

  async createLancamento(input: LancamentoCreateInput): Promise<LancamentoFinanceiro> {
    const now = new Date().toISOString();
    const lancamento: LancamentoFinanceiro = {
      id: input.id ?? createId(),
      tipo: input.tipo,
      valor: input.valor,
      data: input.data,
      status: input.status,
      descricao: input.descricao ?? '',
      categoriaId: input.categoriaId ?? null,
      contaBancariaId: input.contaBancariaId ?? null,
      cartaoCreditoId: input.cartaoCreditoId ?? null,
      contaRecorrenteId: input.contaRecorrenteId ?? null,
      parcelamentoId: input.parcelamentoId ?? null,
      parcelaNumero: input.parcelaNumero ?? null,
      ignorarNaPrevisao: input.ignorarNaPrevisao ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.saveLancamento(lancamento);
    if (
      lancamento.status === 'realizado' &&
      lancamento.contaBancariaId &&
      !lancamento.cartaoCreditoId
    ) {
      const delta = lancamento.tipo === 'receita' ? lancamento.valor : -lancamento.valor;
      await this.repository.applySaldoDelta(lancamento.contaBancariaId, delta);
    }
    await this.refresh();
    return lancamento;
  }

  async createParcelamento(input: ParcelamentoCreateInput): Promise<Parcelamento> {
    const now = new Date().toISOString();
    const parcelamento: Parcelamento = {
      id: input.id ?? createId(),
      descricao: input.descricao,
      valorParcela: input.valorParcela,
      numParcelas: input.numParcelas,
      parcelaAtual: input.parcelaAtual ?? 1,
      dataInicio: input.dataInicio,
      cartaoCreditoId: input.cartaoCreditoId ?? null,
      categoriaId: input.categoriaId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.saveParcelamento(parcelamento);
    const parcelas = gerarParcelas(
      parcelamento.valorParcela,
      parcelamento.numParcelas,
      parcelamento.dataInicio,
      parcelamento.parcelaAtual
    );
    for (const parcela of parcelas) {
      const lancamento: LancamentoFinanceiro = {
        id: createId(),
        tipo: 'despesa',
        valor: parcela.valor,
        data: parcela.data,
        status: 'previsto',
        descricao: `${parcelamento.descricao} (${parcela.numero}/${parcelamento.numParcelas})`,
        categoriaId: parcelamento.categoriaId,
        contaBancariaId: null,
        cartaoCreditoId: parcelamento.cartaoCreditoId,
        contaRecorrenteId: null,
        parcelamentoId: parcelamento.id,
        parcelaNumero: parcela.numero,
        ignorarNaPrevisao: false,
        createdAt: now,
        updatedAt: now,
      };
      await this.repository.saveLancamento(lancamento);
    }
    await this.refresh();
    return parcelamento;
  }

  lancamentoRapido(categoriaId: string, centavos: number, descricao: string): void {
    void this.quickExpense({
      valor: centavos / 100,
      descricao,
      categoriaId,
    });
  }

  async quickExpense(input: QuickExpenseInput): Promise<LancamentoFinanceiro> {
    const contas = this.contas().length
      ? this.contas()
      : await this.repository.listContas();
    const contaId =
      input.contaBancariaId ?? contas[0]?.id ?? 'conta_carteira';
    return this.createLancamento({
      tipo: 'despesa',
      valor: input.valor,
      data: new Date().toISOString(),
      status: 'realizado',
      descricao: input.descricao ?? 'Gasto rápido',
      categoriaId: input.categoriaId ?? 'cat_alimentacao',
      contaBancariaId: contaId,
      cartaoCreditoId: null,
      contaRecorrenteId: null,
      parcelamentoId: null,
      parcelaNumero: null,
      ignorarNaPrevisao: false,
    });
  }
}
