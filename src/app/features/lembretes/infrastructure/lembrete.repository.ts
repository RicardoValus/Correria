import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/infrastructure/database/database.service';
import { mapLembrete } from '../../../core/infrastructure/database/mappers';
import { Lembrete, ReminderStatus } from '../../../core/domain/types';

@Injectable({ providedIn: 'root' })
export class LembreteRepository {
  constructor(private readonly db: DatabaseService) {}

  async list(): Promise<Lembrete[]> {
    const result = await this.db.query(
      'SELECT * FROM lembretes ORDER BY data_hora ASC'
    );
    return (result.values ?? []).map(mapLembrete);
  }

  async listByStatus(status: ReminderStatus): Promise<Lembrete[]> {
    const result = await this.db.query(
      'SELECT * FROM lembretes WHERE status = ? ORDER BY data_hora ASC',
      [status]
    );
    return (result.values ?? []).map(mapLembrete);
  }

  async listInRange(start: string, end: string): Promise<Lembrete[]> {
    const result = await this.db.query(
      'SELECT * FROM lembretes WHERE data_hora >= ? AND data_hora <= ? ORDER BY data_hora ASC',
      [start, end]
    );
    return (result.values ?? []).map(mapLembrete);
  }

  async getById(id: string): Promise<Lembrete | null> {
    const result = await this.db.query('SELECT * FROM lembretes WHERE id = ?', [id]);
    const row = result.values?.[0];
    return row ? mapLembrete(row) : null;
  }

  async save(lembrete: Lembrete): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO lembretes(id, titulo, data_hora, recorrencia, status, tarefa_id, evento_id, conta_recorrente_id, notification_id, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [
        lembrete.id,
        lembrete.titulo,
        lembrete.dataHora,
        JSON.stringify(lembrete.recorrencia),
        lembrete.status,
        lembrete.tarefaId,
        lembrete.eventoId,
        lembrete.contaRecorrenteId,
        lembrete.notificationId,
        lembrete.createdAt,
        lembrete.updatedAt,
      ]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.run('DELETE FROM lembretes WHERE id = ?', [id]);
  }
}
