export const DB_VERSION = 1;

export const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    tipo TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tarefas (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    prioridade TEXT NOT NULL,
    status TEXT NOT NULL,
    data_inicio TEXT,
    prazo TEXT,
    recorrencia TEXT NOT NULL,
    estimativa_min INTEGER,
    tempo_gasto_min INTEGER NOT NULL DEFAULT 0,
    favorito INTEGER NOT NULL DEFAULT 0,
    categoria_id TEXT,
    projeto TEXT,
    evento_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subtarefas (
    id TEXT PRIMARY KEY NOT NULL,
    tarefa_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    concluida INTEGER NOT NULL DEFAULT 0,
    ordem INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tarefa_tags (
    tarefa_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (tarefa_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS eventos (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    data_hora_inicio TEXT NOT NULL,
    data_hora_fim TEXT NOT NULL,
    recorrencia TEXT NOT NULL,
    cor TEXT NOT NULL,
    categoria_id TEXT,
    tarefa_id TEXT,
    lembrete_minutos_antes INTEGER,
    time_blocking INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lembretes (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    data_hora TEXT NOT NULL,
    recorrencia TEXT NOT NULL,
    status TEXT NOT NULL,
    tarefa_id TEXT,
    evento_id TEXT,
    conta_recorrente_id TEXT,
    notification_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notas (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    corpo TEXT NOT NULL DEFAULT '',
    fixada INTEGER NOT NULL DEFAULT 0,
    favorita INTEGER NOT NULL DEFAULT 0,
    data_lembrete TEXT,
    categoria_id TEXT,
    tarefa_id TEXT,
    evento_id TEXT,
    lancamento_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS nota_tags (
    nota_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (nota_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS anexos (
    id TEXT PRIMARY KEY NOT NULL,
    nota_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    caminho TEXT NOT NULL,
    nome TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS contas_bancarias (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    saldo_atual REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cartoes_credito (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    limite REAL NOT NULL DEFAULT 0,
    dia_fechamento INTEGER NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contas_recorrentes (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    categoria_id TEXT,
    conta_bancaria_id TEXT,
    ativa INTEGER NOT NULL DEFAULT 1,
    lembrete_dias_antes INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS parcelamentos (
    id TEXT PRIMARY KEY NOT NULL,
    descricao TEXT NOT NULL,
    valor_parcela REAL NOT NULL,
    num_parcelas INTEGER NOT NULL,
    parcela_atual INTEGER NOT NULL DEFAULT 1,
    data_inicio TEXT NOT NULL,
    cartao_credito_id TEXT,
    categoria_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lancamentos (
    id TEXT PRIMARY KEY NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    status TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    categoria_id TEXT,
    conta_bancaria_id TEXT,
    cartao_credito_id TEXT,
    conta_recorrente_id TEXT,
    parcelamento_id TEXT,
    parcela_numero INTEGER,
    ignorar_na_previsao INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
];
