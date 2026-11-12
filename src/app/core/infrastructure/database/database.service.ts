import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { environment } from '../../../../environments/environment';
import { DB_VERSION, MIGRATIONS } from './migrations';
import { MemoryDatabase, QueryResult } from './memory-database';

export type { QueryResult };

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private memory: MemoryDatabase | null = null;
  private ready = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.ready) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        await this.initWebStore();
      }

      const consistency = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(environment.dbName, false))
        .result;
      if (consistency.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(environment.dbName, false);
      } else {
        const useEncryption =
          environment.encryption && environment.dbEncryptionKey.length > 0;
        this.db = await this.sqlite.createConnection(
          environment.dbName,
          useEncryption,
          useEncryption ? environment.dbEncryptionKey : 'no-encryption',
          DB_VERSION,
          false
        );
      }
      await this.db.open();
      await this.runMigrations();
      if (Capacitor.getPlatform() === 'web') {
        await this.sqlite.saveToStore(environment.dbName);
      }
      this.ready = true;
    } catch (error) {
      console.warn('[Correria] SQLite unavailable, using memory store', error);
      this.memory = new MemoryDatabase();
      await this.memory.init();
      this.ready = true;
    }
  }

  private async initWebStore(): Promise<void> {
    const { defineCustomElements } = await import('jeep-sqlite/loader');
    defineCustomElements(window);
    await customElements.whenDefined('jeep-sqlite');
    if (!document.querySelector('jeep-sqlite')) {
      const jeepEl = document.createElement('jeep-sqlite');
      jeepEl.setAttribute('wasmPath', '/assets');
      document.body.appendChild(jeepEl);
      await customElements.whenDefined('jeep-sqlite');
    }
    await CapacitorSQLite.initWebStore();
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) {
      return;
    }
    for (const sql of MIGRATIONS) {
      await this.db.execute(sql);
    }
    await this.db.run(
      `INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?)`,
      ['schema_version', String(DB_VERSION)]
    );
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    const existing = await this.query('SELECT COUNT(*) as c FROM categorias');
    const count = Number(existing.values?.[0]?.['c'] ?? 0);
    if (count > 0) {
      return;
    }
    const now = new Date().toISOString();
    const seeds = [
      ['cat_trabalho', 'Trabalho', '#3b82f6', 'tarefa'],
      ['cat_pessoal', 'Pessoal', '#a855f7', 'tarefa'],
      ['cat_saude', 'Saúde', '#22c55e', 'evento'],
      ['cat_financeiro', 'Financeiro', '#ff6b00', 'financeiro'],
      ['cat_moradia', 'Moradia', '#f59e0b', 'financeiro'],
      ['cat_alimentacao', 'Alimentação', '#ef4444', 'financeiro'],
      ['cat_transporte', 'Transporte', '#06b6d4', 'financeiro'],
      ['cat_notas', 'Geral', '#94a3b8', 'nota'],
    ];
    for (const [id, nome, cor, tipo] of seeds) {
      await this.run(
        `INSERT INTO categorias(id, nome, cor, tipo, created_at, updated_at) VALUES(?,?,?,?,?,?)`,
        [id, nome, cor, tipo, now, now]
      );
    }
    await this.run(
      `INSERT INTO contas_bancarias(id, nome, tipo, saldo_atual, created_at, updated_at) VALUES(?,?,?,?,?,?)`,
      ['conta_carteira', 'Carteira', 'dinheiro', 0, now, now]
    );
  }

  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    await this.init();
    if (this.memory) {
      return this.memory.query(sql, params);
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const result = await this.db.query(sql, params as (string | number | null)[]);
    return { values: (result.values ?? []) as Record<string, unknown>[] };
  }

  async run(sql: string, params: unknown[] = []): Promise<QueryResult> {
    await this.init();
    if (this.memory) {
      return this.memory.run(sql, params);
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const result = await this.db.run(sql, params as (string | number | null)[]);
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore(environment.dbName);
    }
    return {
      changes: {
        changes: result.changes?.changes ?? 0,
        lastId: result.changes?.lastId,
      },
    };
  }

  async execute(sql: string): Promise<void> {
    await this.init();
    if (this.memory) {
      await this.memory.execute(sql);
      return;
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.execute(sql);
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore(environment.dbName);
    }
  }
}
