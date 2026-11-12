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
import { EventoService } from '../application/evento.service';
import { createId } from '../../../shared/utils/id';
import { Evento } from '../domain/evento.model';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  templateUrl: './evento-form.page.html',
  styleUrls: ['./evento-form.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventoService = inject(EventoService);
  readonly editingId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    dataHoraInicio: [new Date().toISOString(), Validators.required],
    dataHoraFim: [new Date(Date.now() + 3600000).toISOString(), Validators.required],
    cor: ['#ff6b00'],
    descricao: [''],
  });

  constructor() {
    void this.eventoService.load().then(() => this.applyRoute());
  }

  private applyRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    const evento = this.eventoService.getById(id);
    if (evento) {
      this.editingId.set(id);
      this.form.patchValue({
        titulo: evento.titulo,
        dataHoraInicio: evento.dataHoraInicio,
        dataHoraFim: evento.dataHoraFim,
        cor: evento.cor,
        descricao: evento.descricao ?? '',
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    const id = this.editingId() ?? createId();
    const evento: Evento = {
      id,
      titulo: value.titulo,
      dataHoraInicio: value.dataHoraInicio,
      dataHoraFim: value.dataHoraFim,
      cor: value.cor,
      descricao: value.descricao,
    };
    this.eventoService.save(evento);
    void this.router.navigateByUrl('/tabs/agenda');
  }
}
