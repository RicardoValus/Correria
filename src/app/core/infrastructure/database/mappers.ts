import {
  CartaoCredito,
  Categoria,
  ContaBancaria,
  ContaRecorrente,
  Evento,
  LancamentoFinanceiro,
  Lembrete,
  Nota,
  Parcelamento,
  RecurrenceRule,
  Subtarefa,
  Tarefa,
} from '../../domain/types';
import { defaultRecurrence } from '../../domain/recurrence';

function parseRecurrence(raw: unknown): RecurrenceRule {
  if (!raw) {
    return defaultRecurrence();
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as RecurrenceRule;
    } catch {
      return defaultRecurrence();
    }
  }
  return raw as RecurrenceRule;
}

export function mapCategoria(row: Record<string, unknown>): Categoria {
  return {
    id: String(row['id']),
    nome: String(row['nome']),
    cor: String(row['cor']),
    tipo: row['tipo'] as Categoria['tipo'],
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapTarefa(row: Record<string, unknown>): Tarefa {
  return {
    id: String(row['id']),
    titulo: String(row['titulo']),
    descricao: String(row['descricao'] ?? ''),
    prioridade: row['prioridade'] as Tarefa['prioridade'],
    status: row['status'] as Tarefa['status'],
    dataInicio: (row['data_inicio'] as string | null) ?? null,
    prazo: (row['prazo'] as string | null) ?? null,
    recorrencia: parseRecurrence(row['recorrencia']),
    estimativaMin: row['estimativa_min'] == null ? null : Number(row['estimativa_min']),
    tempoGastoMin: Number(row['tempo_gasto_min'] ?? 0),
    favorito: Boolean(row['favorito']),
    categoriaId: (row['categoria_id'] as string | null) ?? null,
    projeto: (row['projeto'] as string | null) ?? null,
    eventoId: (row['evento_id'] as string | null) ?? null,
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapSubtarefa(row: Record<string, unknown>): Subtarefa {
  return {
    id: String(row['id']),
    tarefaId: String(row['tarefa_id']),
    titulo: String(row['titulo']),
    concluida: Boolean(row['concluida']),
    ordem: Number(row['ordem'] ?? 0),
  };
}

export function mapEvento(row: Record<string, unknown>): Evento {
  return {
    id: String(row['id']),
    titulo: String(row['titulo']),
    descricao: String(row['descricao'] ?? ''),
    dataHoraInicio: String(row['data_hora_inicio']),
    dataHoraFim: String(row['data_hora_fim']),
    recorrencia: parseRecurrence(row['recorrencia']),
    cor: String(row['cor']),
    categoriaId: (row['categoria_id'] as string | null) ?? null,
    tarefaId: (row['tarefa_id'] as string | null) ?? null,
    lembreteMinutosAntes:
      row['lembrete_minutos_antes'] == null
        ? null
        : Number(row['lembrete_minutos_antes']),
    timeBlocking: Boolean(row['time_blocking']),
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapLembrete(row: Record<string, unknown>): Lembrete {
  return {
    id: String(row['id']),
    titulo: String(row['titulo']),
    dataHora: String(row['data_hora']),
    recorrencia: parseRecurrence(row['recorrencia']),
    status: row['status'] as Lembrete['status'],
    tarefaId: (row['tarefa_id'] as string | null) ?? null,
    eventoId: (row['evento_id'] as string | null) ?? null,
    contaRecorrenteId: (row['conta_recorrente_id'] as string | null) ?? null,
    notificationId:
      row['notification_id'] == null ? null : Number(row['notification_id']),
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapNota(row: Record<string, unknown>): Nota {
  return {
    id: String(row['id']),
    titulo: String(row['titulo']),
    corpo: String(row['corpo'] ?? ''),
    fixada: Boolean(row['fixada']),
    favorita: Boolean(row['favorita']),
    dataLembrete: (row['data_lembrete'] as string | null) ?? null,
    categoriaId: (row['categoria_id'] as string | null) ?? null,
    tarefaId: (row['tarefa_id'] as string | null) ?? null,
    eventoId: (row['evento_id'] as string | null) ?? null,
    lancamentoId: (row['lancamento_id'] as string | null) ?? null,
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapContaBancaria(row: Record<string, unknown>): ContaBancaria {
  return {
    id: String(row['id']),
    nome: String(row['nome']),
    tipo: row['tipo'] as ContaBancaria['tipo'],
    saldoAtual: Number(row['saldo_atual'] ?? 0),
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapCartao(row: Record<string, unknown>): CartaoCredito {
  return {
    id: String(row['id']),
    nome: String(row['nome']),
    limite: Number(row['limite'] ?? 0),
    diaFechamento: Number(row['dia_fechamento']),
    diaVencimento: Number(row['dia_vencimento']),
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapLancamento(row: Record<string, unknown>): LancamentoFinanceiro {
  return {
    id: String(row['id']),
    tipo: row['tipo'] as LancamentoFinanceiro['tipo'],
    valor: Number(row['valor']),
    data: String(row['data']),
    status: row['status'] as LancamentoFinanceiro['status'],
    descricao: String(row['descricao'] ?? ''),
    categoriaId: (row['categoria_id'] as string | null) ?? null,
    contaBancariaId: (row['conta_bancaria_id'] as string | null) ?? null,
    cartaoCreditoId: (row['cartao_credito_id'] as string | null) ?? null,
    contaRecorrenteId: (row['conta_recorrente_id'] as string | null) ?? null,
    parcelamentoId: (row['parcelamento_id'] as string | null) ?? null,
    parcelaNumero:
      row['parcela_numero'] == null ? null : Number(row['parcela_numero']),
    ignorarNaPrevisao: Boolean(row['ignorar_na_previsao']),
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapContaRecorrente(row: Record<string, unknown>): ContaRecorrente {
  return {
    id: String(row['id']),
    nome: String(row['nome']),
    valor: Number(row['valor']),
    diaVencimento: Number(row['dia_vencimento']),
    categoriaId: (row['categoria_id'] as string | null) ?? null,
    contaBancariaId: (row['conta_bancaria_id'] as string | null) ?? null,
    ativa: Boolean(row['ativa']),
    lembreteDiasAntes: Number(row['lembrete_dias_antes'] ?? 1),
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}

export function mapParcelamento(row: Record<string, unknown>): Parcelamento {
  return {
    id: String(row['id']),
    descricao: String(row['descricao']),
    valorParcela: Number(row['valor_parcela']),
    numParcelas: Number(row['num_parcelas']),
    parcelaAtual: Number(row['parcela_atual']),
    dataInicio: String(row['data_inicio']),
    cartaoCreditoId: (row['cartao_credito_id'] as string | null) ?? null,
    categoriaId: (row['categoria_id'] as string | null) ?? null,
    createdAt: String(row['created_at']),
    updatedAt: String(row['updated_at']),
  };
}
