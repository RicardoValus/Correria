import { Injectable, computed, signal } from '@angular/core';
import { TarefaRepository } from '../infrastructure/tarefa.repository';
import { createId } from '../../../shared/utils/id';
import { defaultRecurrence } from '../../../core/domain/recurrence';
import { Tarefa as TarefaEntity, TaskStatus } from '../../../core/domain/types';
import { Tarefa, TarefaStatus } from '../domain/tarefa.model';
import { endOfDayIso, startOfDayIso } from '../../../shared/utils/dates';

export type TarefaCreateInput = Omit<TarefaEntity, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

function toView(entity: TarefaEntity): Tarefa {
  return {
    id: entity.id,
    titulo: entity.titulo,
    descricao: entity.descricao,
    prioridade: entity.prioridade,
    status: entity.status as TarefaStatus,
    prazo: entity.prazo ?? undefined,
    concluida: entity.status === 'concluida',
    categoriaId: entity.categoriaId ?? undefined,
  };
}

function toEntity(view: Partial<Tarefa> & Pick<Tarefa, 'id' | 'titulo' | 'prioridade' | 'status'>): TarefaEntity {
  const status = view.status ?? 'a_fazer';
  return {
    id: view.id,
    titulo: view.titulo,
    descricao: view.descricao ?? '',
    prioridade: view.prioridade,
    status: status as TaskStatus,
    dataInicio: null,
    prazo: view.prazo ?? null,
    recorrencia: defaultRecurrence(),
    estimativaMin: null,
    tempoGastoMin: 0,
    favorito: false,
    categoriaId: view.categoriaId ?? null,
    projeto: null,
    eventoId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class TarefaService {
  private readonly store = signal<TarefaEntity[]>([]);

  readonly tarefas = computed(() => this.store().map(toView));

  readonly tarefasHoje = computed(() => {
    const start = startOfDayIso();
    const end = endOfDayIso();
    return this.tarefas().filter(
      (t) =>
        t.prazo &&
        t.prazo >= start &&
        t.prazo <= end &&
        !t.concluida
    );
  });

  readonly progressoHoje = computed(() => {
    const start = startOfDayIso();
    const end = endOfDayIso();
    const doDia = this.tarefas().filter((t) => t.prazo && t.prazo >= start && t.prazo <= end);
    if (doDia.length === 0) {
      return { concluidas: 0, total: 0, percentual: 0 };
    }
    const concluidas = doDia.filter((t) => t.concluida).length;
    return {
      concluidas,
      total: doDia.length,
      percentual: Math.round((concluidas / doDia.length) * 100),
    };
  });

  constructor(private readonly repository: TarefaRepository) {}

  async load(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const items = await this.repository.list();
    this.store.set(items);
  }

  async createEntity(input: TarefaCreateInput): Promise<TarefaEntity> {
    const now = new Date().toISOString();
    const tarefa: TarefaEntity = {
      id: input.id ?? createId(),
      titulo: input.titulo,
      descricao: input.descricao ?? '',
      prioridade: input.prioridade,
      status: input.status ?? 'a_fazer',
      dataInicio: input.dataInicio ?? null,
      prazo: input.prazo ?? null,
      recorrencia: input.recorrencia ?? defaultRecurrence(),
      estimativaMin: input.estimativaMin ?? null,
      tempoGastoMin: input.tempoGastoMin ?? 0,
      favorito: input.favorito ?? false,
      categoriaId: input.categoriaId ?? null,
      projeto: input.projeto ?? null,
      eventoId: input.eventoId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.save(tarefa);
    await this.refresh();
    return tarefa;
  }

  async update(tarefa: TarefaEntity): Promise<void> {
    const updated: TarefaEntity = {
      ...tarefa,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.save(updated);
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
    await this.refresh();
  }

  async moveStatus(id: string, status: TaskStatus): Promise<void> {
    const current = await this.repository.getById(id);
    if (!current) {
      return;
    }
    await this.update({ ...current, status });
  }

  async toggleFavorite(id: string): Promise<void> {
    const current = await this.repository.getById(id);
    if (!current) {
      return;
    }
    await this.update({ ...current, favorito: !current.favorito });
  }

  async listToday(): Promise<TarefaEntity[]> {
    return this.repository.listToday();
  }

  listByStatus(status: TarefaStatus): Tarefa[] {
    return this.tarefas().filter((t) => t.status === status);
  }

  getById(id: string): Tarefa | undefined {
    return this.tarefas().find((t) => t.id === id);
  }

  save(view: Tarefa): void {
    const entity = this.store().find((t) => t.id === view.id);
    const merged: TarefaEntity = entity
      ? {
          ...entity,
          titulo: view.titulo,
          descricao: view.descricao ?? '',
          prioridade: view.prioridade,
          status: view.status as TaskStatus,
          prazo: view.prazo ?? null,
          categoriaId: view.categoriaId ?? null,
          updatedAt: new Date().toISOString(),
        }
      : toEntity(view);
    void this.repository.save(merged).then(() => this.refresh());
  }

  create(partial: Omit<Tarefa, 'id'>): Tarefa {
    const entity = toEntity({
      ...partial,
      id: createId(),
      titulo: partial.titulo,
      prioridade: partial.prioridade,
      status: partial.status,
    });
    void this.repository.save(entity).then(() => this.refresh());
    return toView(entity);
  }

  toggleConcluida(id: string): void {
    const current = this.store().find((t) => t.id === id);
    if (!current) {
      return;
    }
    const concluida = current.status !== 'concluida';
    const status: TaskStatus = concluida ? 'concluida' : 'a_fazer';
    void this.update({ ...current, status });
  }

  updateStatus(id: string, status: TarefaStatus): void {
    void this.moveStatus(id, status as TaskStatus);
  }
}
