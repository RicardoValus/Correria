import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TarefaService } from '../application/tarefa.service';
import { createId } from '../../../shared/utils/id';
import { Tarefa, TarefaPrioridade, TarefaStatus } from '../domain/tarefa.model';
import { endOfDayIso } from '../../../shared/utils/dates';

@Component({
  selector: 'app-tarefa-form',
  standalone: true,
  templateUrl: './tarefa-form.page.html',
  styleUrls: ['./tarefa-form.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tarefaService = inject(TarefaService);

  readonly editingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descricao: [''],
    prioridade: ['normal' as TarefaPrioridade, Validators.required],
    status: ['a_fazer' as TarefaStatus, Validators.required],
  });

  constructor() {
    void this.tarefaService.load().then(() => this.applyRoute());
  }

  private applyRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    const tarefa = this.tarefaService.getById(id);
    if (tarefa) {
      this.editingId.set(id);
      this.form.patchValue({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao ?? '',
        prioridade: tarefa.prioridade,
        status: tarefa.status,
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    const id = this.editingId() ?? createId();
    const tarefa: Tarefa = {
      id,
      titulo: value.titulo,
      descricao: value.descricao,
      prioridade: value.prioridade,
      status: value.status,
      concluida: value.status === 'concluida',
      prazo: endOfDayIso(),
    };
    this.tarefaService.save(tarefa);
    void this.router.navigateByUrl('/tarefas');
  }
}
