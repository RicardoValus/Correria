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
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NotaService } from '../application/nota.service';
import { Nota as NotaEntity } from '../../../core/domain/types';

@Component({
  selector: 'app-nota-form',
  standalone: true,
  templateUrl: './nota-form.page.html',
  styleUrls: ['./nota-form.page.scss'],
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
    IonTextarea,
    IonToggle,
    IonButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotaFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notaService = inject(NotaService);

  readonly editingId = signal<string | null>(null);
  private existing: NotaEntity | null = null;

  readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    corpo: [''],
    fixada: [false],
    favorita: [false],
  });

  constructor() {
    void this.notaService.load().then(() => this.applyRoute());
  }

  private applyRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    const nota = this.notaService.getById(id);
    if (nota) {
      this.editingId.set(id);
      this.existing = nota;
      this.form.patchValue({
        titulo: nota.titulo,
        corpo: nota.corpo,
        fixada: nota.fixada,
        favorita: nota.favorita,
      });
    }
  }

  wrapBold(): void {
    const corpo = this.form.controls.corpo;
    corpo.setValue(`${corpo.value} **texto em negrito** `);
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    if (this.existing) {
      await this.notaService.update({
        ...this.existing,
        titulo: value.titulo,
        corpo: value.corpo,
        fixada: value.fixada,
        favorita: value.favorita,
      });
    } else {
      await this.notaService.create({
        titulo: value.titulo,
        corpo: value.corpo,
        fixada: value.fixada,
        favorita: value.favorita,
        dataLembrete: null,
        categoriaId: null,
        tarefaId: null,
        eventoId: null,
        lancamentoId: null,
      });
    }
    void this.router.navigateByUrl('/notas');
  }
}
