import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { createOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TarefaService } from '../application/tarefa.service';
import { TarefaStatus } from '../domain/tarefa.model';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge.component';

addIcons({ createOutline });

type FiltroChip = { id: TarefaStatus | 'todas'; label: string };

const CHIPS: FiltroChip[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'a_fazer', label: 'A fazer' },
  { id: 'em_andamento', label: 'Em andamento' },
  { id: 'em_revisao', label: 'Em revisão' },
  { id: 'concluida', label: 'Concluída' },
];

@Component({
  selector: 'app-tarefas',
  standalone: true,
  templateUrl: './tarefas.page.html',
  styleUrls: ['./tarefas.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonIcon,
    RouterLink,
    PriorityBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefasPage {
  private readonly tarefaService = inject(TarefaService);

  constructor() {
    void this.tarefaService.load();
  }

  readonly chips = CHIPS;
  readonly filtro = signal<TarefaStatus | 'todas'>('todas');
  readonly todas = this.tarefaService.tarefas;

  readonly filtradas = computed(() => {
    const f = this.filtro();
    if (f === 'todas') {
      return this.todas();
    }
    return this.todas().filter((t) => t.status === f);
  });

  setFiltro(id: TarefaStatus | 'todas'): void {
    this.filtro.set(id);
  }

  toggleTarefa(id: string): void {
    this.tarefaService.toggleConcluida(id);
  }

  chipLabel(status: TarefaStatus): string {
    return CHIPS.find((c) => c.id === status)?.label ?? status;
  }
}
