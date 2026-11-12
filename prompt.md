# Prompt — Projeto Pulso (Ionic + Capacitor)

Quero que você construa um app mobile chamado **Pulso**: um app pessoal, offline-first, que unifica agenda, tarefas, financeiro e notas em um só lugar. O app é single-user (sem backend/colaboração multiusuário na v1).

Siga à risca o arquivo `ARQUITETURA.md` (anexado neste mesmo projeto) para:
- lista completa de funcionalidades (produtividade e financeiro);
- modelo de dados (entidades e relacionamentos);
- arquitetura técnica (camadas, stack, persistência, notificações, segurança);
- estrutura de pastas exata a seguir;
- design system e tema visual (laranja + Material Design, dark mode).

## Stack obrigatória
- Ionic 8 + Angular (standalone components, signals) + Capacitor 6, TypeScript.
- Persistência local com `@capacitor-community/sqlite` (offline-first, banco criptografado).
- Sem NgRx — estado via Angular signals + services.
- Notificações locais com `@capacitor/local-notifications`.
- Sem integração de backend/sync na v1 (deixar os pontos de extensão prontos, mas não implementar).

## Organização do código
Siga exatamente a estrutura de pastas descrita em `ARQUITETURA.md` (seção "Estrutura de pastas"): cada feature com suas camadas `domain/`, `application/`, `infrastructure/` e `presentation/` quando aplicável, mais `core/` e `shared/` para o que é transversal.

## Design
- Tema escuro por padrão, laranja como cor primária de destaque (não como cor de fundo).
- Material Design 3 como base de componentes, adaptado aos componentes do Ionic.
- Referências visuais: vou anexar prints de apps de produtividade/financeiro como inspiração de layout. Use-os como referência de composição de tela (cards, calendário, dashboard financeiro, teclado numérico de lançamento rápido, kanban), não como algo para copiar pixel a pixel — adapte tudo à paleta laranja + dark do Pulso.
- Tab bar inferior fixa com 5 ícones: Central do dia, Agenda, `+` (captura rápida), Financeiro, Mais.

## Ordem sugerida de implementação (Fase 1 — MVP)
1. Setup do projeto Ionic + Capacitor, tema (cores, tipografia) e estrutura de pastas.
2. Camada `core` (SQLite, migrations, repositórios base).
3. Módulo **Tarefas** (CRUD + Kanban).
4. Módulo **Agenda** (CRUD de eventos + visualização dia/semana/mês).
5. Módulo **Lembretes** (notificações locais).
6. Módulo **Notas** (CRUD + editor rico básico).
7. Módulo **Financeiro**: contas, lançamentos, contas recorrentes, parcelamentos, cartões, e o motor de **previsão de saldo**.
8. Tela **Central do dia** integrando tudo.

Não implemente ainda: Caixa de entrada, Orçamento/metas, dashboard com gráficos comparativos, busca global, exportação PDF/CSV, hábitos, sync/backup, biometria, áudio/transcrição — essas entram nas Fases 2 e 3 descritas em `ARQUITETURA.md`.

## Observações
- Priorize código limpo, tipado e testável — regras de negócio (ex.: cálculo de previsão de saldo, geração de parcelas e recorrências) devem ficar isoladas em `domain/`/`application/`, sem dependência de Angular ou Capacitor, para serem testadas com testes unitários puros.
- Em caso de dúvida de escopo, prefira seguir exatamente o que está em `ARQUITETURA.md` em vez de inventar funcionalidades novas.
