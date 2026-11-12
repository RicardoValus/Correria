import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/central', pathMatch: 'full' },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', redirectTo: 'central', pathMatch: 'full' },
      {
        path: 'central',
        loadComponent: () =>
          import('./features/central-do-dia/presentation/central-do-dia.page').then(
            (m) => m.CentralDoDiaPage,
          ),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./features/agenda/presentation/agenda.page').then((m) => m.AgendaPage),
      },
      {
        path: 'financeiro',
        loadComponent: () =>
          import('./features/financeiro/presentation/financeiro.page').then(
            (m) => m.FinanceiroPage,
          ),
      },
      {
        path: 'mais',
        loadComponent: () =>
          import('./features/mais/presentation/mais.page').then((m) => m.MaisPage),
      },
    ],
  },
  {
    path: 'tarefas',
    loadComponent: () =>
      import('./features/tarefas/presentation/tarefas.page').then((m) => m.TarefasPage),
  },
  {
    path: 'tarefa/nova',
    loadComponent: () =>
      import('./features/tarefas/presentation/tarefa-form.page').then((m) => m.TarefaFormPage),
  },
  {
    path: 'tarefa/:id',
    loadComponent: () =>
      import('./features/tarefas/presentation/tarefa-form.page').then((m) => m.TarefaFormPage),
  },
  {
    path: 'tarefa/:id/kanban',
    loadComponent: () =>
      import('./features/tarefas/presentation/tarefa-kanban-detalhe.page').then(
        (m) => m.TarefaKanbanDetalhePage,
      ),
  },
  {
    path: 'evento/nova',
    loadComponent: () =>
      import('./features/agenda/presentation/evento-form.page').then((m) => m.EventoFormPage),
  },
  {
    path: 'evento/:id',
    loadComponent: () =>
      import('./features/agenda/presentation/evento-form.page').then((m) => m.EventoFormPage),
  },
  {
    path: 'notas',
    loadComponent: () =>
      import('./features/notas/presentation/notas.page').then((m) => m.NotasPage),
  },
  {
    path: 'nota/nova',
    loadComponent: () =>
      import('./features/notas/presentation/nota-form.page').then((m) => m.NotaFormPage),
  },
  {
    path: 'nota/:id',
    loadComponent: () =>
      import('./features/notas/presentation/nota-form.page').then((m) => m.NotaFormPage),
  },
  {
    path: 'lembretes',
    loadComponent: () =>
      import('./features/lembretes/presentation/lembretes.page').then((m) => m.LembretesPage),
  },
  {
    path: 'lembrete/nova',
    loadComponent: () =>
      import('./features/lembretes/presentation/lembrete-form.page').then((m) => m.LembreteFormPage),
  },
  {
    path: 'lembrete/:id',
    loadComponent: () =>
      import('./features/lembretes/presentation/lembrete-form.page').then((m) => m.LembreteFormPage),
  },
  {
    path: 'lancamento-rapido',
    loadComponent: () =>
      import('./features/financeiro/presentation/lancamento-rapido.page').then(
        (m) => m.LancamentoRapidoPage,
      ),
  },
];
