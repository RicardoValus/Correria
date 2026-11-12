import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { LembreteService } from '../application/lembrete.service';
import { Lembrete as LembreteEntity } from '../../../core/domain/types';
import { defaultRecurrence } from '../../../core/domain/recurrence';

@Component({
  selector: 'app-lembrete-form',
  standalone: true,
  templateUrl: './lembrete-form.page.html',
  styleUrls: ['./lembrete-form.page.scss'],
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
    IonLabel,
    IonButton,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LembreteFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lembreteService = inject(LembreteService);

  readonly editingId = signal<string | null>(null);
  private existing: LembreteEntity | null = null;

  readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    dataHora: [new Date().toISOString(), Validators.required],
  });

  constructor() {
    void this.lembreteService.load().then(() => this.applyRoute());
  }

  private applyRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    const lembrete = this.lembreteService.getById(id);
    if (lembrete) {
      this.editingId.set(id);
      this.existing = lembrete;
      this.form.patchValue({
        titulo: lembrete.titulo,
        dataHora: lembrete.dataHora,
      });
    }
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    if (this.existing) {
      await this.lembreteService.update({
        ...this.existing,
        titulo: value.titulo,
        dataHora: value.dataHora,
      });
    } else {
      await this.lembreteService.create({
        titulo: value.titulo,
        dataHora: value.dataHora,
        recorrencia: defaultRecurrence(),
        status: 'ativo',
        tarefaId: null,
        eventoId: null,
        contaRecorrenteId: null,
        notificationId: null,
      });
    }
    void this.router.navigateByUrl('/lembretes');
  }
}
