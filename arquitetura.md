# Correria — Arquitetura do App (Ionic + Capacitor)

> App pessoal, offline-first, que unifica agenda, tarefas, financeiro e notas em um só lugar. Tema escuro com laranja como cor de destaque, Material Design como base de componentes.

## Nome do projeto

**Correria** — remete a ritmo e energia (combina com o laranja do tema) e ao idiom "tomar o pulso" de algo, que é literalmente o que o app faz com rotina, agenda e dinheiro. Curto, duas sílabas, mesma pegada seca de "Resenha" e "Grana".

Alternativas: Correria, Rotina, Norte, Trilha, Prumo.

## Visão geral do produto

Um app pessoal, offline-first, que substitui a combinação de app de tarefas + calendário + app financeiro + bloco de notas por um único lugar, com tudo cruzado: uma conta que vence aparece na agenda, uma tarefa pode virar um lançamento financeiro, uma nota pode estar presa a um evento.

Pilares do produto:

1. **Central do dia** — uma tela só com tudo que precisa de atenção hoje (tarefas, compromissos, contas a vencer, lembretes), em vez de abrir quatro telas diferentes.
2. **Previsão financeira** — o diferencial do app: cruzar saldo atual, contas a pagar e a receber e responder "quanto vou ter no dia 30" a qualquer momento.
3. **Captura rápida** — qualquer coisa (tarefa, ideia, gasto, lembrete) entra pelo mesmo botão de `+`, sem precisar decidir a categoria na hora.
4. **Tudo local primeiro** — funciona 100% offline com SQLite local; sincronização em nuvem é um reforço opcional, não uma dependência.

Público: uso pessoal (não é multiusuário/colaborativo na v1), rodando em Android via Capacitor, com a mesma base de código pronta pra, no futuro, virar também uma versão desktop em Electron.

## Funcionalidades — Produtividade

### Central do dia (home)
- Resumo do dia: tarefas de hoje, compromissos, contas a vencer hoje, lembretes ativos.
- Barra de progresso "X de Y tarefas concluídas hoje".
- Saldo atual e saldo previsto até o fim do mês, em destaque.
- Botão flutuante de adição rápida (abre a Caixa de entrada).

### Caixa de entrada
- Captura rápida de qualquer coisa — texto ou voz — sem precisar escolher o tipo na hora.
- Lista de itens "a triar", cada um convertido depois em Tarefa, Evento, Nota, Lembrete ou Lançamento financeiro.

### Agenda / Calendário
- Visualização diária, semanal e mensal.
- Eventos recorrentes, com horário e duração.
- Categorias com cor própria (trabalho, pessoal, financeiro, saúde).
- Lembrete configurável antes de cada evento (ex.: 30 min, 1 dia).
- Vínculo opcional entre evento e tarefa.
- Bloqueio de horário (time blocking) pra trabalho, estudo e lazer.
- Vencimentos financeiros aparecem automaticamente no calendário (contas, parcelas, faturas de cartão).

### Tarefas
- Prioridade: urgente, alta, normal, baixa.
- Subtarefas e checklist.
- Tarefas recorrentes (diária, semanal, mensal, customizada).
- Categorias, etiquetas e agrupamento por projeto.
- Data de início e prazo final.
- Estimativa de tempo e registro de tempo gasto.
- Visualização Kanban: a fazer / em andamento / em revisão / concluída — além da lista simples.
- Favoritar tarefas, ações em lote (concluir/mover/excluir várias de uma vez).
- Progresso de conclusão por projeto/categoria.

### Lembretes
- Lembrete avulso, sem precisar virar tarefa ou evento.
- Recorrência e snooze (adiar por X minutos/horas).
- Notificação local mesmo com o app fechado.

### Notas
- Editor de texto rico (negrito, listas, títulos).
- Fixar e favoritar notas.
- Categorias e etiquetas.
- Anexar imagem ou arquivo.
- Nota com data, pra lembrar de algo no futuro.
- Vínculo da nota com tarefa, evento ou lançamento financeiro.
- Modelos prontos (reunião, ideia, lista de compras).
- *v2:* gravação de áudio com transcrição por voz.

### Hábitos
- Lista curta de hábitos diários (ex.: ler, treinar, estudar) com check simples e sequência de dias (streak).
- Aparece na Central do dia junto das tarefas.

### Busca global
- Busca unificada em tarefas, notas, eventos e lançamentos financeiros, por texto, categoria ou data.

### Backup, exportação e privacidade
- Backup e sincronização entre dispositivos (ver arquitetura técnica).
- Exportação de relatórios em PDF/CSV.
- Bloqueio por PIN ou biometria.

## Funcionalidades — Financeiro

### Lançamentos e contas
- Receitas e despesas, com categoria, data, conta/cartão de origem.
- Contas/carteiras: dinheiro, conta corrente, poupança, outras — saldo próprio por conta.
- Lançamentos previstos x realizados.

### Contas recorrentes
- Aluguel, internet, energia, assinaturas, etc., com valor, dia de vencimento e lembrete automático.
- Reajuste manual de valor quando a conta muda.

### Parcelamentos
- Número de parcelas, valor da parcela, parcela atual, previsão de término.
- Vínculo com cartão de crédito quando a compra foi parcelada no cartão.

### Cartões de crédito
- Limite, fatura atual, dia de fechamento e vencimento.
- Parcelas futuras já entram automaticamente no cálculo das faturas seguintes.

### Orçamento e metas
- Orçamento mensal por categoria, com alerta ao se aproximar/estourar o limite.
- Metas financeiras (ex.: juntar R$X até uma data), com progresso visual.
- Controle de dívidas: quanto falta pagar e previsão de quitação.

### Previsão de saldo (recurso-chave)
- O app cruza saldo atual, contas a pagar e a receber (incluindo recorrentes e parcelas futuras) pra responder, em qualquer data futura: *"se eu pagar tudo que está previsto e receber tudo que é esperado, quanto vou ter no dia X?"*
- Simulação ajustável: dá pra marcar um lançamento previsto como "não vai acontecer" e ver o impacto no saldo projetado antes de confirmar algo.

### Histórico e relatórios
- Comparação de receitas x despesas entre meses (gráfico).
- Exportação de relatórios em PDF/CSV.

### Lançamento rápido
- Fluxo de input tipo calculadora pra lançar um gasto em poucos toques (categoria → teclado numérico → salvar).

## Modelo de dados

| Entidade | Campos principais | Relacionamentos |
| --- | --- | --- |
| `Categoria` | id, nome, cor, tipo (tarefa/evento/financeiro/nota) | usada por Tarefa, Evento, Nota, LancamentoFinanceiro |
| `Tag` | id, nome | N:N com Tarefa, Nota |
| `Tarefa` | id, titulo, descricao, prioridade, status (kanban), dataInicio, prazo, recorrencia, estimativaMin, tempoGastoMin, favorito | pertence a Categoria/Projeto; tem N `Subtarefa`; pode linkar 1 `Evento` |
| `Subtarefa` | id, titulo, concluida | pertence a `Tarefa` |
| `Evento` | id, titulo, dataHoraInicio, dataHoraFim, recorrencia, cor | pertence a Categoria; pode linkar 1 `Tarefa`; gera `Lembrete` |
| `Lembrete` | id, titulo, dataHora, recorrencia, status (ativo/adiado/concluido) | pode referenciar Tarefa, Evento, ContaRecorrente ou ser avulso |
| `Nota` | id, titulo, corpo (rich text), fixada, favorita, dataLembrete | pertence a Categoria; N:N com Tag; pode linkar Tarefa/Evento/LancamentoFinanceiro; N `Anexo` |
| `Anexo` | id, tipo (imagem/arquivo/áudio), caminho | pertence a `Nota` |
| `ContaBancaria` | id, nome, tipo (dinheiro/corrente/poupança/outra), saldoAtual | tem N `LancamentoFinanceiro` |
| `CartaoCredito` | id, nome, limite, diaFechamento, diaVencimento | tem N `Parcelamento`; gera `FaturaMensal` calculada |
| `LancamentoFinanceiro` | id, tipo (receita/despesa), valor, data, status (previsto/realizado), descricao | pertence a Categoria e a ContaBancaria/CartaoCredito; pode vir de `ContaRecorrente` ou `Parcelamento` |
| `ContaRecorrente` | id, nome, valor, diaVencimento, categoria, ativa | gera `LancamentoFinanceiro` todo mês + `Lembrete` |
| `Parcelamento` | id, descricao, valorParcela, numParcelas, parcelaAtual, dataInicio | pertence a CartaoCredito (opcional); gera `LancamentoFinanceiro` por parcela |
| `OrcamentoMensal` | id, categoria, mesAno, valorLimite | referencia Categoria |
| `MetaFinanceira` | id, titulo, valorAlvo, valorAtual, dataAlvo | independente, atualizada manualmente ou por aporte |

Todas as entidades têm `createdAt`/`updatedAt` pra permitir sync incremental quando o backup em nuvem for ligado.

## Arquitetura técnica

**Stack:** Ionic 8 + Angular (standalone components, signals) + Capacitor 6, TypeScript. Build único pra Android via Capacitor; a mesma base de componentes Angular dá pra empacotar depois em Electron pra desktop.

**Persistência:** SQLite local via `@capacitor-community/sqlite`, offline-first — o app funciona 100% sem internet, e local é sempre a fonte da verdade. Banco criptografado (SQLCipher, já suportado pelo mesmo plugin).

**Gerenciamento de estado:** Angular signals + serviços, sem NgRx — é um app single-user, o estado é majoritariamente local/reativo por feature.

### Camadas (DDD/Clean Architecture, adaptado do backend)

| Camada | Responsabilidade | Exemplos |
| --- | --- | --- |
| `domain/` | Entidades e regras de negócio puras, sem dependência de Angular/Capacitor | cálculo de previsão de saldo, geração de parcelas, regra de recorrência |
| `application/` (use-cases) | Orquestra os casos de uso, chama repositórios | `CriarLancamento`, `CalcularPrevisaoSaldo`, `GerarLembretesDoMes` |
| `infrastructure/` | Implementações concretas: repositórios SQLite, plugins Capacitor | `TarefaRepositorySqlite`, `NotificationService`, `BiometricAuthService` |
| `presentation/` | Módulos Angular por feature, componentes standalone, páginas Ionic | `agenda/`, `tarefas/`, `financeiro/`, `notas/` |

### Notificações
- `@capacitor/local-notifications` pra lembretes, eventos e vencimentos — recorrentes, agendados localmente.

### Sincronização / backup (fase 2+, opcional)
- **Opção A — Firebase** (Firestore + Auth): menos código, sync e push quase prontos, porém menos controle e vendor lock-in.
- **Opção B — backend próprio** (Node.js + Mezzio/PHP + MariaDB): mais controle, consistente com o stack já dominado, porém mais esforço.
- Recomendação: começar sem sync (100% local), decidir entre A e B só quando múltiplos aparelhos virar necessidade real.

### Segurança
- Bloqueio por PIN ou biometria via plugin nativo (`capacitor-native-biometric` ou equivalente).
- Banco SQLite criptografado localmente.

## Estrutura de pastas

```
src/
  app/
    core/
      domain/              # entidades e value objects compartilhados
      application/          # casos de uso transversais (ex.: previsão de saldo)
      infrastructure/
        database/           # setup e migrations do SQLite (@capacitor-community/sqlite)
        notifications/      # wrapper do @capacitor/local-notifications
        security/           # PIN/biometria, criptografia
    shared/
      ui/                   # componentes standalone reaproveitáveis (botões, cards, inputs)
      theme/                # variáveis de tema (laranja + Material)
      utils/
    features/
      central-do-dia/
        presentation/
      caixa-de-entrada/
        presentation/
      agenda/
        domain/
        application/
        infrastructure/
        presentation/
      tarefas/
        domain/
        application/
        infrastructure/
        presentation/
      financeiro/
        domain/              # regras de parcelamento, recorrência, previsão de saldo
        application/
        infrastructure/
        presentation/
      notas/
        domain/
        application/
        infrastructure/
        presentation/
      lembretes/
        application/
        infrastructure/
      busca/
        application/
  assets/
  environments/
capacitor.config.ts
```

## Design e tema visual

Base: Material Design 3, tema escuro por padrão, laranja como cor primária de destaque — mapeado nas variáveis CSS do Ionic (`--ion-color-primary` e as variáveis Material correspondentes), não como cor de fundo.

| Token | Papel |
| --- | --- |
| Primária (laranja) | Botão de ação flutuante, progresso, destaques, ícone ativo da tab bar |
| Fundo | Cinza quase preto (dark surface) |
| Superfície dos cards | Cinza escuro, levemente mais claro que o fundo, cantos arredondados (8–12px) |
| Sucesso / receita | Verde |
| Alerta / despesa, estouro de orçamento | Vermelho/laranja mais quente |

Componentes-chave a desenhar:
- Card de tarefa com barra de progresso.
- Dia/semana de calendário com blocos coloridos por categoria.
- Dashboard financeiro com saldo em destaque + cards de resumo (entradas/saídas).
- Teclado numérico tipo calculadora pro lançamento rápido de gasto.
- Kanban horizontal com colunas roláveis pra tarefas.
- Tab bar inferior fixa com 5 ícones: Central do dia, Agenda, `+` (captura rápida), Financeiro, Mais (notas/config).

## Roadmap do MVP

| Fase | Entrega |
| --- | --- |
| **Fase 1 — MVP** | Tarefas (com Kanban), Agenda básica, Lembretes, Notas simples, Financeiro básico (lançamentos, contas recorrentes, parcelamentos, previsão de saldo), tema visual completo |
| **Fase 2** | Caixa de entrada, Orçamento mensal e metas financeiras, dashboard financeiro com gráficos comparativos, busca global, exportação PDF/CSV, hábitos |
| **Fase 3** | Sync/backup em nuvem, PIN/biometria, gravação de áudio em notas com transcrição, versão desktop em Electron |
