import { Injectable, computed, signal } from '@angular/core';
import { EventoRepository } from '../infrastructure/evento.repository';
import { createId } from '../../../shared/utils/id';
import { defaultRecurrence } from '../../../core/domain/recurrence';
import { Evento as EventoEntity } from '../../../core/domain/types';
import { Evento } from '../domain/evento.model';
import { endOfDayIso, isSameDay, startOfDayIso } from '../../../shared/utils/dates';

export type EventoCreateInput = Omit<EventoEntity, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

function toView(entity: EventoEntity): Evento {
  return {
    id: entity.id,
    titulo: entity.titulo,
    dataHoraInicio: entity.dataHoraInicio,
    dataHoraFim: entity.dataHoraFim,
    cor: entity.cor,
    categoriaId: entity.categoriaId ?? undefined,
    descricao: entity.descricao,
  };
}

function toEntity(partial: Omit<Evento, 'id'>, id: string): EventoEntity {
  const now = new Date().toISOString();
  return {
    id,
    titulo: partial.titulo,
    descricao: partial.descricao ?? '',
    dataHoraInicio: partial.dataHoraInicio,
    dataHoraFim: partial.dataHoraFim,
    recorrencia: defaultRecurrence(),
    cor: partial.cor,
    categoriaId: partial.categoriaId ?? null,
    tarefaId: null,
    lembreteMinutosAntes: null,
    timeBlocking: false,
    createdAt: now,
    updatedAt: now,
  };
}

@Injectable({ providedIn: 'root' })
export class EventoService {
  private readonly store = signal<EventoEntity[]>([]);
  readonly selectedDate = signal<Date>(new Date());

  readonly eventos = computed(() => this.store().map(toView));

  readonly eventosDoDiaSelecionado = computed(() => {
    const day = this.selectedDate();
    return this.eventos()
      .filter((e) => isSameDay(e.dataHoraInicio, day))
      .sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio));
  });

  readonly compromissosHoje = computed(() => {
    const today = new Date();
    return this.eventos()
      .filter((e) => isSameDay(e.dataHoraInicio, today))
      .sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio));
  });

  constructor(private readonly repository: EventoRepository) {}

  async load(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const items = await this.repository.list();
    this.store.set(items);
  }

  async createEntity(input: EventoCreateInput): Promise<EventoEntity> {
    const now = new Date().toISOString();
    const evento: EventoEntity = {
      id: input.id ?? createId(),
      titulo: input.titulo,
      descricao: input.descricao ?? '',
      dataHoraInicio: input.dataHoraInicio,
      dataHoraFim: input.dataHoraFim,
      recorrencia: input.recorrencia ?? defaultRecurrence(),
      cor: input.cor,
      categoriaId: input.categoriaId ?? null,
      tarefaId: input.tarefaId ?? null,
      lembreteMinutosAntes: input.lembreteMinutosAntes ?? null,
      timeBlocking: input.timeBlocking ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.save(evento);
    await this.refresh();
    return evento;
  }

  async update(evento: EventoEntity): Promise<void> {
    const updated: EventoEntity = {
      ...evento,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.save(updated);
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
    await this.refresh();
  }

  async listForDay(date = new Date()): Promise<EventoEntity[]> {
    const start = startOfDayIso(date);
    const end = endOfDayIso(date);
    return this.repository.listByRange(start, end);
  }

  getById(id: string): Evento | undefined {
    return this.eventos().find((e) => e.id === id);
  }

  save(evento: Evento): void {
    const existing = this.store().find((e) => e.id === evento.id);
    const entity: EventoEntity = existing
      ? {
          ...existing,
          titulo: evento.titulo,
          descricao: evento.descricao ?? '',
          dataHoraInicio: evento.dataHoraInicio,
          dataHoraFim: evento.dataHoraFim,
          cor: evento.cor,
          categoriaId: evento.categoriaId ?? null,
          updatedAt: new Date().toISOString(),
        }
      : toEntity(evento, evento.id);
    void this.repository.save(entity).then(() => this.refresh());
  }

  create(partial: Omit<Evento, 'id'>): Evento {
    const id = createId();
    const entity = toEntity(partial, id);
    void this.repository.save(entity).then(() => this.refresh());
    return toView(entity);
  }

  setSelectedDate(date: Date): void {
    this.selectedDate.set(date);
  }

  contarNoDia(date: Date): number {
    const start = startOfDayIso(date);
    const end = endOfDayIso(date);
    return this.store().filter(
      (e) => e.dataHoraInicio >= start && e.dataHoraInicio <= end
    ).length;
  }
}
