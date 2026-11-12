import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TarefaService } from '../application/tarefa.service';
import { TarefaStatus } from '../domain/tarefa.model';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge.component';

const COLUNAS: { status: TarefaStatus; titulo: string }[] = [
  { status: 'a_fazer', titulo: 'A fazer' },
  { status: 'em_andamento', titulo: 'Em andamento' },
  { status: 'em_revisao', titulo: 'Em revisão' },
  { status: 'concluida', titulo: 'Concluída' },
];

@Component({
  selector: 'app-tarefa-kanban-detalhe',
  standalone: true,
  templateUrl: './tarefa-kanban-detalhe.page.html',
  styleUrls: ['./tarefa-kanban-detalhe.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    PriorityBadgeComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaKanbanDetalhePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tarefaService = inject(TarefaService);

  readonly colunas = COLUNAS;
  readonly tarefaId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly tarefa = computed(() => this.tarefaService.getById(this.tarefaId));

  constructor() {
    void this.tarefaService.load();
  }

  moverPara(status: TarefaStatus): void {
    if (!this.tarefaId) {
      return;
    }
    this.tarefaService.updateStatus(this.tarefaId, status);
  }

  editar(): void {
    void this.router.navigate(['/tarefa', this.tarefaId]);
  }
}
