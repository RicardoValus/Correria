import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/infrastructure/database/database.service';
import { mapSubtarefa, mapTarefa } from '../../../core/infrastructure/database/mappers';
import { Subtarefa, Tarefa, TaskStatus } from '../../../core/domain/types';
import { endOfDayIso, startOfDayIso } from '../../../shared/utils/dates';

@Injectable({ providedIn: 'root' })
export class TarefaRepository {
  constructor(private readonly db: DatabaseService) {}

  async list(): Promise<Tarefa[]> {
    const result = await this.db.query(
      'SELECT * FROM tarefas ORDER BY updated_at DESC'
    );
    return (result.values ?? []).map(mapTarefa);
  }

  async getById(id: string): Promise<Tarefa | null> {
    const result = await this.db.query('SELECT * FROM tarefas WHERE id = ?', [id]);
    const row = result.values?.[0];
    return row ? mapTarefa(row) : null;
  }

  async listByStatus(status: TaskStatus): Promise<Tarefa[]> {
    const result = await this.db.query(
      'SELECT * FROM tarefas WHERE status = ? ORDER BY updated_at DESC',
      [status]
    );
    return (result.values ?? []).map(mapTarefa);
  }

  async listToday(): Promise<Tarefa[]> {
    const start = startOfDayIso();
    const end = endOfDayIso();
    const [byPrazo, byInicio] = await Promise.all([
      this.db.query(
        'SELECT * FROM tarefas WHERE prazo >= ? AND prazo <= ? ORDER BY updated_at DESC',
        [start, end]
      ),
      this.db.query(
        'SELECT * FROM tarefas WHERE data_inicio >= ? AND data_inicio <= ? ORDER BY updated_at DESC',
        [start, end]
      ),
    ]);
    const byId = new Map<string, Tarefa>();
    for (const row of [...(byPrazo.values ?? []), ...(byInicio.values ?? [])]) {
      const tarefa = mapTarefa(row);
      byId.set(tarefa.id, tarefa);
    }
    return [...byId.values()];
  }

  async save(tarefa: Tarefa): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO tarefas(id, titulo, descricao, prioridade, status, data_inicio, prazo, recorrencia, estimativa_min, tempo_gasto_min, favorito, categoria_id, projeto, evento_id, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        tarefa.id,
        tarefa.titulo,
        tarefa.descricao,
        tarefa.prioridade,
        tarefa.status,
        tarefa.dataInicio,
        tarefa.prazo,
        JSON.stringify(tarefa.recorrencia),
        tarefa.estimativaMin,
        tarefa.tempoGastoMin,
        tarefa.favorito ? 1 : 0,
        tarefa.categoriaId,
        tarefa.projeto,
        tarefa.eventoId,
        tarefa.createdAt,
        tarefa.updatedAt,
      ]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.run('DELETE FROM subtarefas WHERE tarefa_id = ?', [id]);
    await this.db.run('DELETE FROM tarefas WHERE id = ?', [id]);
  }

  async listSubtarefas(tarefaId: string): Promise<Subtarefa[]> {
    const result = await this.db.query(
      'SELECT * FROM subtarefas WHERE tarefa_id = ? ORDER BY ordem ASC',
      [tarefaId]
    );
    return (result.values ?? []).map(mapSubtarefa);
  }

  async saveSubtarefa(subtarefa: Subtarefa): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO subtarefas(id, tarefa_id, titulo, concluida, ordem) VALUES(?,?,?,?,?)`,
      [
        subtarefa.id,
        subtarefa.tarefaId,
        subtarefa.titulo,
        subtarefa.concluida ? 1 : 0,
        subtarefa.ordem,
      ]
    );
  }

  async removeSubtarefa(id: string): Promise<void> {
    await this.db.run('DELETE FROM subtarefas WHERE id = ?', [id]);
  }

  async toggleComplete(id: string): Promise<void> {
    const result = await this.db.query('SELECT * FROM subtarefas WHERE id = ?', [id]);
    const row = result.values?.[0];
    if (!row) {
      return;
    }
    const next = Number(row['concluida']) ? 0 : 1;
    await this.db.run('UPDATE subtarefas SET concluida = ? WHERE id = ?', [next, id]);
  }
}
