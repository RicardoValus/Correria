import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/infrastructure/database/database.service';
import { mapEvento } from '../../../core/infrastructure/database/mappers';
import { Evento } from '../../../core/domain/types';

@Injectable({ providedIn: 'root' })
export class EventoRepository {
  constructor(private readonly db: DatabaseService) {}

  async list(): Promise<Evento[]> {
    const result = await this.db.query(
      'SELECT * FROM eventos ORDER BY data_hora_inicio ASC'
    );
    return (result.values ?? []).map(mapEvento);
  }

  async listByRange(start: string, end: string): Promise<Evento[]> {
    const result = await this.db.query(
      'SELECT * FROM eventos WHERE data_hora_inicio >= ? AND data_hora_inicio <= ? ORDER BY data_hora_inicio ASC',
      [start, end]
    );
    return (result.values ?? []).map(mapEvento);
  }

  async getById(id: string): Promise<Evento | null> {
    const result = await this.db.query('SELECT * FROM eventos WHERE id = ?', [id]);
    const row = result.values?.[0];
    return row ? mapEvento(row) : null;
  }

  async save(evento: Evento): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO eventos(id, titulo, descricao, data_hora_inicio, data_hora_fim, recorrencia, cor, categoria_id, tarefa_id, lembrete_minutos_antes, time_blocking, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        evento.id,
        evento.titulo,
        evento.descricao,
        evento.dataHoraInicio,
        evento.dataHoraFim,
        JSON.stringify(evento.recorrencia),
        evento.cor,
        evento.categoriaId,
        evento.tarefaId,
        evento.lembreteMinutosAntes,
        evento.timeBlocking ? 1 : 0,
        evento.createdAt,
        evento.updatedAt,
      ]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.run('DELETE FROM eventos WHERE id = ?', [id]);
  }
}
