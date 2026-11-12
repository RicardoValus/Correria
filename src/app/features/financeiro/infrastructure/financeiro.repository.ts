import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/infrastructure/database/database.service';
import {
  mapCartao,
  mapContaBancaria,
  mapContaRecorrente,
  mapLancamento,
  mapParcelamento,
} from '../../../core/infrastructure/database/mappers';
import {
  CartaoCredito,
  ContaBancaria,
  ContaRecorrente,
  LancamentoFinanceiro,
  Parcelamento,
} from '../../../core/domain/types';

@Injectable({ providedIn: 'root' })
export class FinanceiroRepository {
  constructor(private readonly db: DatabaseService) {}

  async listContas(): Promise<ContaBancaria[]> {
    const result = await this.db.query(
      'SELECT * FROM contas_bancarias ORDER BY updated_at DESC'
    );
    return (result.values ?? []).map(mapContaBancaria);
  }

  async getContaById(id: string): Promise<ContaBancaria | null> {
    const result = await this.db.query('SELECT * FROM contas_bancarias WHERE id = ?', [
      id,
    ]);
    const row = result.values?.[0];
    return row ? mapContaBancaria(row) : null;
  }

  async saveConta(conta: ContaBancaria): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO contas_bancarias(id, nome, tipo, saldo_atual, created_at, updated_at) VALUES(?,?,?,?,?,?)`,
      [
        conta.id,
        conta.nome,
        conta.tipo,
        conta.saldoAtual,
        conta.createdAt,
        conta.updatedAt,
      ]
    );
  }

  async removeConta(id: string): Promise<void> {
    await this.db.run('DELETE FROM contas_bancarias WHERE id = ?', [id]);
  }

  async sumSaldoContas(): Promise<number> {
    const result = await this.db.query(
      'SELECT COALESCE(SUM(saldo_atual), 0) as total FROM contas_bancarias'
    );
    return Number(result.values?.[0]?.['total'] ?? 0);
  }

  async applySaldoDelta(contaId: string, delta: number): Promise<void> {
    const conta = await this.getContaById(contaId);
    if (!conta) {
      return;
    }
    const updated: ContaBancaria = {
      ...conta,
      saldoAtual: conta.saldoAtual + delta,
      updatedAt: new Date().toISOString(),
    };
    await this.saveConta(updated);
  }

  async listCartoes(): Promise<CartaoCredito[]> {
    const result = await this.db.query(
      'SELECT * FROM cartoes_credito ORDER BY updated_at DESC'
    );
    return (result.values ?? []).map(mapCartao);
  }

  async saveCartao(cartao: CartaoCredito): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO cartoes_credito(id, nome, limite, dia_fechamento, dia_vencimento, created_at, updated_at) VALUES(?,?,?,?,?,?,?)`,
      [
        cartao.id,
        cartao.nome,
        cartao.limite,
        cartao.diaFechamento,
        cartao.diaVencimento,
        cartao.createdAt,
        cartao.updatedAt,
      ]
    );
  }

  async removeCartao(id: string): Promise<void> {
    await this.db.run('DELETE FROM cartoes_credito WHERE id = ?', [id]);
  }

  async listLancamentos(): Promise<LancamentoFinanceiro[]> {
    const result = await this.db.query(
      'SELECT * FROM lancamentos ORDER BY data DESC'
    );
    return (result.values ?? []).map(mapLancamento);
  }

  async listLancamentosNoPeriodo(start: string, end: string): Promise<LancamentoFinanceiro[]> {
    const result = await this.db.query(
      'SELECT * FROM lancamentos WHERE data >= ? AND data <= ? ORDER BY data DESC',
      [start, end]
    );
    return (result.values ?? []).map(mapLancamento);
  }

  async saveLancamento(lancamento: LancamentoFinanceiro): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO lancamentos(id, tipo, valor, data, status, descricao, categoria_id, conta_bancaria_id, cartao_credito_id, conta_recorrente_id, parcelamento_id, parcela_numero, ignorar_na_previsao, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        lancamento.id,
        lancamento.tipo,
        lancamento.valor,
        lancamento.data,
        lancamento.status,
        lancamento.descricao,
        lancamento.categoriaId,
        lancamento.contaBancariaId,
        lancamento.cartaoCreditoId,
        lancamento.contaRecorrenteId,
        lancamento.parcelamentoId,
        lancamento.parcelaNumero,
        lancamento.ignorarNaPrevisao ? 1 : 0,
        lancamento.createdAt,
        lancamento.updatedAt,
      ]
    );
  }

  async removeLancamento(id: string): Promise<void> {
    await this.db.run('DELETE FROM lancamentos WHERE id = ?', [id]);
  }

  async listContasRecorrentes(): Promise<ContaRecorrente[]> {
    const result = await this.db.query(
      'SELECT * FROM contas_recorrentes ORDER BY updated_at DESC'
    );
    return (result.values ?? []).map(mapContaRecorrente);
  }

  async saveContaRecorrente(conta: ContaRecorrente): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO contas_recorrentes(id, nome, valor, dia_vencimento, categoria_id, conta_bancaria_id, ativa, lembrete_dias_antes, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        conta.id,
        conta.nome,
        conta.valor,
        conta.diaVencimento,
        conta.categoriaId,
        conta.contaBancariaId,
        conta.ativa ? 1 : 0,
        conta.lembreteDiasAntes,
        conta.createdAt,
        conta.updatedAt,
      ]
    );
  }

  async removeContaRecorrente(id: string): Promise<void> {
    await this.db.run('DELETE FROM contas_recorrentes WHERE id = ?', [id]);
  }

  async listParcelamentos(): Promise<Parcelamento[]> {
    const result = await this.db.query(
      'SELECT * FROM parcelamentos ORDER BY updated_at DESC'
    );
    return (result.values ?? []).map(mapParcelamento);
  }

  async saveParcelamento(parcelamento: Parcelamento): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO parcelamentos(id, descricao, valor_parcela, num_parcelas, parcela_atual, data_inicio, cartao_credito_id, categoria_id, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        parcelamento.id,
        parcelamento.descricao,
        parcelamento.valorParcela,
        parcelamento.numParcelas,
        parcelamento.parcelaAtual,
        parcelamento.dataInicio,
        parcelamento.cartaoCreditoId,
        parcelamento.categoriaId,
        parcelamento.createdAt,
        parcelamento.updatedAt,
      ]
    );
  }

  async removeParcelamento(id: string): Promise<void> {
    await this.db.run('DELETE FROM lancamentos WHERE parcelamento_id = ?', [id]);
    await this.db.run('DELETE FROM parcelamentos WHERE id = ?', [id]);
  }
}
