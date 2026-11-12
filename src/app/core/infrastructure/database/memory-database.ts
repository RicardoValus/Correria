export interface QueryResult {
  values?: Record<string, unknown>[];
  changes?: { changes: number; lastId?: number };
}

type Row = Record<string, unknown>;

export class MemoryDatabase {
  private tables = new Map<string, Row[]>();
  private readonly storageKey = 'correria_memory_db_v1';

  async init(): Promise<void> {
    if (this.loadFromStorage()) {
      return;
    }
    const names = [
      'categorias',
      'tags',
      'tarefas',
      'subtarefas',
      'tarefa_tags',
      'eventos',
      'lembretes',
      'notas',
      'nota_tags',
      'anexos',
      'contas_bancarias',
      'cartoes_credito',
      'contas_recorrentes',
      'parcelamentos',
      'lancamentos',
      'meta',
    ];
    for (const name of names) {
      this.tables.set(name, []);
    }
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    const now = new Date().toISOString();
    const cats: Row[] = [
      { id: 'cat_trabalho', nome: 'Trabalho', cor: '#3b82f6', tipo: 'tarefa', created_at: now, updated_at: now },
      { id: 'cat_pessoal', nome: 'Pessoal', cor: '#a855f7', tipo: 'tarefa', created_at: now, updated_at: now },
      { id: 'cat_saude', nome: 'Saúde', cor: '#22c55e', tipo: 'evento', created_at: now, updated_at: now },
      { id: 'cat_financeiro', nome: 'Financeiro', cor: '#ff6b00', tipo: 'financeiro', created_at: now, updated_at: now },
      { id: 'cat_moradia', nome: 'Moradia', cor: '#f59e0b', tipo: 'financeiro', created_at: now, updated_at: now },
      { id: 'cat_alimentacao', nome: 'Alimentação', cor: '#ef4444', tipo: 'financeiro', created_at: now, updated_at: now },
      { id: 'cat_transporte', nome: 'Transporte', cor: '#06b6d4', tipo: 'financeiro', created_at: now, updated_at: now },
      { id: 'cat_notas', nome: 'Geral', cor: '#94a3b8', tipo: 'nota', created_at: now, updated_at: now },
    ];
    this.tables.set('categorias', cats);
    this.tables.set('contas_bancarias', [
      {
        id: 'conta_carteira',
        nome: 'Carteira',
        tipo: 'dinheiro',
        saldo_atual: 0,
        created_at: now,
        updated_at: now,
      },
    ]);
    this.persist();
  }

  private loadFromStorage(): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw) as Record<string, Row[]>;
      for (const [key, value] of Object.entries(parsed)) {
        this.tables.set(key, value);
      }
      return this.tables.size > 0;
    } catch {
      return false;
    }
  }

  private persist(): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      const payload: Record<string, Row[]> = {};
      for (const [key, value] of this.tables.entries()) {
        payload[key] = value;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
  }

  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    if (/SELECT COUNT\(\*\) as c FROM categorias/i.test(normalized)) {
      return { values: [{ c: this.tables.get('categorias')?.length ?? 0 }] };
    }

    const orderByIndex = normalized.search(/\s+ORDER BY\s+/i);
    const sqlWithoutOrder =
      orderByIndex >= 0 ? normalized.slice(0, orderByIndex).trim() : normalized;

    const selectMatch = sqlWithoutOrder.match(
      /^SELECT \* FROM (\w+)(?: WHERE (.+))?$/i
    );
    if (selectMatch) {
      const table = selectMatch[1];
      let rows = [...(this.tables.get(table) ?? [])];
      if (selectMatch[2]) {
        rows = this.filterRows(rows, selectMatch[2], params);
      }
      if (/ORDER BY updated_at DESC/i.test(normalized)) {
        rows.sort((a, b) => String(b['updated_at']).localeCompare(String(a['updated_at'])));
      }
      if (/ORDER BY data_hora_inicio ASC/i.test(normalized)) {
        rows.sort((a, b) =>
          String(a['data_hora_inicio']).localeCompare(String(b['data_hora_inicio']))
        );
      }
      if (/ORDER BY data DESC/i.test(normalized)) {
        rows.sort((a, b) => String(b['data']).localeCompare(String(a['data'])));
      }
      if (/ORDER BY data_hora ASC/i.test(normalized)) {
        rows.sort((a, b) => String(a['data_hora']).localeCompare(String(b['data_hora'])));
      }
      if (/ORDER BY fixada DESC/i.test(normalized)) {
        rows.sort((a, b) => Number(b['fixada']) - Number(a['fixada']));
      }
      if (/ORDER BY ordem ASC/i.test(normalized)) {
        rows.sort((a, b) => Number(a['ordem']) - Number(b['ordem']));
      }
      if (/ORDER BY nome ASC/i.test(normalized)) {
        rows.sort((a, b) => String(a['nome']).localeCompare(String(b['nome'])));
      }
      return { values: rows };
    }

    const sumMatch = normalized.match(
      /^SELECT COALESCE\(SUM\(saldo_atual\), 0\) as total FROM contas_bancarias$/i
    );
    if (sumMatch) {
      const rows = this.tables.get('contas_bancarias') ?? [];
      const total = rows.reduce((acc, row) => acc + Number(row['saldo_atual'] ?? 0), 0);
      return { values: [{ total }] };
    }

    return { values: [] };
  }

  async run(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const normalized = sql.replace(/\s+/g, ' ').trim();

    const insertMatch = normalized.match(
      /^INSERT(?: OR REPLACE)? INTO (\w+)\(([^)]+)\) VALUES\(([^)]+)\)$/i
    );
    if (insertMatch) {
      const table = insertMatch[1];
      const columns = insertMatch[2].split(',').map((c) => c.trim());
      const row: Row = {};
      columns.forEach((col, i) => {
        row[col] = params[i] as unknown;
      });
      const rows = this.tables.get(table) ?? [];
      const idx = rows.findIndex((r) => r['id'] === row['id'] || (table === 'meta' && r['key'] === row['key']));
      if (idx >= 0) {
        rows[idx] = row;
      } else {
        rows.push(row);
      }
      this.tables.set(table, rows);
      this.persist();
      return { changes: { changes: 1 } };
    }

    const updateMatch = normalized.match(/^UPDATE (\w+) SET (.+) WHERE (.+)$/i);
    if (updateMatch) {
      const table = updateMatch[1];
      const setPart = updateMatch[2];
      const wherePart = updateMatch[3];
      const setCols = setPart.split(',').map((p) => p.trim().split('=')[0].trim());
      const whereParamsStart = setCols.length;
      const rows = this.tables.get(table) ?? [];
      let changes = 0;
      for (const row of rows) {
        if (this.matchesWhere(row, wherePart, params.slice(whereParamsStart))) {
          setCols.forEach((col, i) => {
            row[col] = params[i] as unknown;
          });
          changes += 1;
        }
      }
      if (changes > 0) {
        this.persist();
      }
      return { changes: { changes } };
    }

    const deleteMatch = normalized.match(/^DELETE FROM (\w+) WHERE (.+)$/i);
    if (deleteMatch) {
      const table = deleteMatch[1];
      const wherePart = deleteMatch[2];
      const rows = this.tables.get(table) ?? [];
      const kept = rows.filter((row) => !this.matchesWhere(row, wherePart, params));
      const changes = rows.length - kept.length;
      this.tables.set(table, kept);
      this.persist();
      return { changes: { changes } };
    }

    return { changes: { changes: 0 } };
  }

  async execute(_sql: string): Promise<void> {
    return;
  }

  private filterRows(rows: Row[], where: string, params: unknown[]): Row[] {
    return rows.filter((row) => this.matchesWhere(row, where, params));
  }

  private matchesWhere(row: Row, where: string, params: unknown[]): boolean {
    const parts = where.split(/ AND /i).map((p) => p.trim());
    let paramIndex = 0;
    return parts.every((part) => {
      if (/(\w+)\s*=\s*\?/.test(part)) {
        const col = part.split('=')[0].trim();
        const expected = params[paramIndex++];
        return row[col] === expected;
      }
      if (/(\w+)\s*>=\s*\?/.test(part)) {
        const col = part.split('>=')[0].trim();
        const expected = String(params[paramIndex++]);
        return String(row[col] ?? '') >= expected;
      }
      if (/(\w+)\s*<=\s*\?/.test(part)) {
        const col = part.split('<=')[0].trim();
        const expected = String(params[paramIndex++]);
        return String(row[col] ?? '') <= expected;
      }
      if (/(\w+)\s*>\s*\?/.test(part)) {
        const col = part.split('>')[0].trim();
        const expected = String(params[paramIndex++]);
        return String(row[col] ?? '') > expected;
      }
      if (/(\w+)\s*<\s*\?/.test(part)) {
        const col = part.split('<')[0].trim();
        const expected = String(params[paramIndex++]);
        return String(row[col] ?? '') < expected;
      }
      return true;
    });
  }
}
