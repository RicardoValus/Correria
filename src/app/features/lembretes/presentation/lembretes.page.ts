import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonCheckbox,
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
import { addOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { LembreteService } from '../application/lembrete.service';
import { formatShortDate, formatTime } from '../../../shared/utils/dates';

addIcons({ addOutline });

@Component({
  selector: 'app-lembretes',
  standalone: true,
  templateUrl: './lembretes.page.html',
  styleUrls: ['./lembretes.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonFab,
    IonFabButton,
    IonIcon,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LembretesPage {
  private readonly lembreteService = inject(LembreteService);
  private readonly router = inject(Router);

  readonly lembretes = this.lembreteService.lembretes;
  readonly formatTime = formatTime;
  readonly formatShortDate = formatShortDate;

  constructor() {
    void this.lembreteService.load();
  }

  novo(): void {
    void this.router.navigateByUrl('/lembrete/nova');
  }

  toggle(id: string): void {
    void this.lembreteService.toggleConcluido(id);
  }
}
