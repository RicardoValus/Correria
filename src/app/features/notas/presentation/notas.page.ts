import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addOutline, pinOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NotaService } from '../application/nota.service';
import { formatShortDate } from '../../../shared/utils/dates';

addIcons({ addOutline, pinOutline });

@Component({
  selector: 'app-notas',
  standalone: true,
  templateUrl: './notas.page.html',
  styleUrls: ['./notas.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonFab,
    IonFabButton,
    IonIcon,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotasPage {
  private readonly notaService = inject(NotaService);
  private readonly router = inject(Router);

  readonly notas = this.notaService.notas;
  readonly formatShortDate = formatShortDate;

  constructor() {
    void this.notaService.load();
  }

  novaNota(): void {
    void this.router.navigateByUrl('/nota/nova');
  }

  preview(corpo: string): string {
    return corpo.replace(/\*\*/g, '').split('\n')[0].slice(0, 80);
  }
}
