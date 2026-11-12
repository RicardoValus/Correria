import { calcularPrevisaoSaldo, gerarParcelas } from './previsao-saldo';
import { ContaRecorrente, LancamentoFinanceiro } from '../../../core/domain/types';

describe('calcularPrevisaoSaldo', () => {
  const baseTimestamps = {
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('should project balance including future expenses and income', () => {
    const lancamentos: LancamentoFinanceiro[] = [
      {
        id: '1',
        tipo: 'despesa',
        valor: 200,
        data: '2026-11-20T12:00:00.000Z',
        status: 'previsto',
        descricao: 'Mercado',
        categoriaId: null,
        contaBancariaId: 'c1',
        cartaoCreditoId: null,
        contaRecorrenteId: null,
        parcelamentoId: null,
        parcelaNumero: null,
        ignorarNaPrevisao: false,
        ...baseTimestamps,
      },
      {
        id: '2',
        tipo: 'receita',
        valor: 1000,
        data: '2026-11-25T12:00:00.000Z',
        status: 'previsto',
        descricao: 'Freelance',
        categoriaId: null,
        contaBancariaId: 'c1',
        cartaoCreditoId: null,
        contaRecorrenteId: null,
        parcelamentoId: null,
        parcelaNumero: null,
        ignorarNaPrevisao: false,
        ...baseTimestamps,
      },
    ];

    const result = calcularPrevisaoSaldo({
      saldoAtual: 500,
      ateDataIso: '2026-11-30T00:00:00.000Z',
      lancamentos,
      contasRecorrentes: [],
      hojeIso: '2026-11-12T00:00:00.000Z',
    });

    expect(result.saldo).toBe(1300);
  });

  it('should ignore flagged entries in forecast', () => {
    const lancamentos: LancamentoFinanceiro[] = [
      {
        id: '1',
        tipo: 'despesa',
        valor: 300,
        data: '2026-11-20T12:00:00.000Z',
        status: 'previsto',
        descricao: 'Viagem',
        categoriaId: null,
        contaBancariaId: 'c1',
        cartaoCreditoId: null,
        contaRecorrenteId: null,
        parcelamentoId: null,
        parcelaNumero: null,
        ignorarNaPrevisao: true,
        ...baseTimestamps,
      },
    ];

    const result = calcularPrevisaoSaldo({
      saldoAtual: 1000,
      ateDataIso: '2026-11-30T00:00:00.000Z',
      lancamentos,
      contasRecorrentes: [],
      hojeIso: '2026-11-12T00:00:00.000Z',
    });

    expect(result.saldo).toBe(1000);
  });

  it('should subtract active recurring bills not yet materialized', () => {
    const contas: ContaRecorrente[] = [
      {
        id: 'r1',
        nome: 'Internet',
        valor: 120,
        diaVencimento: 20,
        categoriaId: null,
        contaBancariaId: 'c1',
        ativa: true,
        lembreteDiasAntes: 1,
        ...baseTimestamps,
      },
    ];

    const result = calcularPrevisaoSaldo({
      saldoAtual: 500,
      ateDataIso: '2026-11-30T00:00:00.000Z',
      lancamentos: [],
      contasRecorrentes: contas,
      hojeIso: '2026-11-12T00:00:00.000Z',
    });

    expect(result.saldo).toBe(380);
  });
});

describe('gerarParcelas', () => {
  it('should generate remaining installments from current parcel', () => {
    const parcelas = gerarParcelas(100, 4, '2026-01-15T12:00:00.000Z', 2);
    expect(parcelas.length).toBe(3);
    expect(parcelas[0].numero).toBe(2);
    expect(parcelas[2].numero).toBe(4);
  });
});
