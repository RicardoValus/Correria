import { Injectable, signal } from '@angular/core';
import { DatabaseService } from '../infrastructure/database/database.service';
import { mapCategoria } from '../infrastructure/database/mappers';
import { Categoria, CategoryType } from '../domain/types';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  readonly categorias = signal<Categoria[]>([]);

  constructor(private readonly db: DatabaseService) {
    void this.load();
  }

  async load(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const result = await this.db.query('SELECT * FROM categorias ORDER BY nome ASC');
    const items = (result.values ?? []).map(mapCategoria);
    this.categorias.set(items);
  }

  async list(): Promise<Categoria[]> {
    const result = await this.db.query('SELECT * FROM categorias ORDER BY nome ASC');
    return (result.values ?? []).map(mapCategoria);
  }

  listByTipo(tipo: CategoryType): Categoria[] {
    return this.categorias().filter((c) => c.tipo === tipo);
  }

  getById(id: string): Categoria | undefined {
    return this.categorias().find((c) => c.id === id);
  }
}
