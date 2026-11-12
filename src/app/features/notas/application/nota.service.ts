import { Injectable, signal } from '@angular/core';
import { NotaRepository } from '../infrastructure/nota.repository';
import { createId } from '../../../shared/utils/id';
import { Nota } from '../../../core/domain/types';

export type NotaCreateInput = Omit<Nota, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

@Injectable({ providedIn: 'root' })
export class NotaService {
  private readonly store = signal<Nota[]>([]);

  readonly notas = this.store.asReadonly();

  constructor(private readonly repository: NotaRepository) {}

  async load(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const items = await this.repository.list();
    this.store.set(items);
  }

  getById(id: string): Nota | undefined {
    return this.store().find((n) => n.id === id);
  }

  save(nota: Nota): void {
    void this.repository.save(nota).then(() => this.refresh());
  }

  async create(input: NotaCreateInput): Promise<Nota> {
    const now = new Date().toISOString();
    const nota: Nota = {
      id: input.id ?? createId(),
      titulo: input.titulo,
      corpo: input.corpo ?? '',
      fixada: input.fixada ?? false,
      favorita: input.favorita ?? false,
      dataLembrete: input.dataLembrete ?? null,
      categoriaId: input.categoriaId ?? null,
      tarefaId: input.tarefaId ?? null,
      eventoId: input.eventoId ?? null,
      lancamentoId: input.lancamentoId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.save(nota);
    await this.refresh();
    return nota;
  }

  async update(nota: Nota): Promise<void> {
    const updated: Nota = {
      ...nota,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.save(updated);
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
    await this.refresh();
  }
}
