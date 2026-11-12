import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/infrastructure/database/database.service';
import { mapNota } from '../../../core/infrastructure/database/mappers';
import { Nota } from '../../../core/domain/types';

@Injectable({ providedIn: 'root' })
export class NotaRepository {
  constructor(private readonly db: DatabaseService) {}

  async list(): Promise<Nota[]> {
    const result = await this.db.query(
      'SELECT * FROM notas ORDER BY fixada DESC, updated_at DESC'
    );
    return (result.values ?? []).map(mapNota);
  }

  async getById(id: string): Promise<Nota | null> {
    const result = await this.db.query('SELECT * FROM notas WHERE id = ?', [id]);
    const row = result.values?.[0];
    return row ? mapNota(row) : null;
  }

  async save(nota: Nota): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO notas(id, titulo, corpo, fixada, favorita, data_lembrete, categoria_id, tarefa_id, evento_id, lancamento_id, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nota.id,
        nota.titulo,
        nota.corpo,
        nota.fixada ? 1 : 0,
        nota.favorita ? 1 : 0,
        nota.dataLembrete,
        nota.categoriaId,
        nota.tarefaId,
        nota.eventoId,
        nota.lancamentoId,
        nota.createdAt,
        nota.updatedAt,
      ]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.run('DELETE FROM notas WHERE id = ?', [id]);
  }
}
