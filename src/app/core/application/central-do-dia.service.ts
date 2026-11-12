import { Injectable, computed, inject } from '@angular/core';
import { EventoService } from '../../features/agenda/application/evento.service';
import { FinanceiroService } from '../../features/financeiro/application/financeiro.service';
import { LembreteService } from '../../features/lembretes/application/lembrete.service';
import { TarefaService } from '../../features/tarefas/application/tarefa.service';

@Injectable({ providedIn: 'root' })
export class CentralDoDiaService {
  private readonly tarefaService = inject(TarefaService);
  private readonly eventoService = inject(EventoService);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly lembreteService = inject(LembreteService);

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await Promise.all([
      this.tarefaService.load(),
      this.eventoService.load(),
      this.financeiroService.load(),
      this.lembreteService.load(),
    ]);
  }

  readonly tarefasHoje = this.tarefaService.tarefasHoje;
  readonly progressoHoje = this.tarefaService.progressoHoje;
  readonly compromissos = this.eventoService.compromissosHoje;
  readonly contasAVencer = this.financeiroService.contasAVencerHoje;
  readonly lembretes = this.lembreteService.lembretesAtivosHoje;
  readonly resumoFinanceiro = this.financeiroService.resumo;

  readonly temItensPendentes = computed(
    () =>
      this.tarefasHoje().length > 0 ||
      this.compromissos().length > 0 ||
      this.contasAVencer().length > 0 ||
      this.lembretes().length > 0
  );
}
