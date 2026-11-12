import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TarefaPrioridade } from '../../features/tarefas/domain/tarefa.model';

const LABELS: Record<TarefaPrioridade, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  normal: 'Normal',
  baixa: 'Baixa',
};

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  template: `<span class="correria-badge" [class]="badgeClass()">{{ label() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<TarefaPrioridade>();

  label(): string {
    return LABELS[this.priority()];
  }

  badgeClass(): string {
    const map: Record<TarefaPrioridade, string> = {
      urgente: 'urgent',
      alta: 'high',
      normal: '',
      baixa: 'success',
    };
    return map[this.priority()];
  }
}
