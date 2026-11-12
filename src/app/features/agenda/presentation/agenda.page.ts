import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { EventoService } from '../application/evento.service';
import { AgendaViewMode } from '../domain/evento.model';
import { DateScrollerComponent } from '../../../shared/ui/date-scroller.component';
import { formatTime } from '../../../shared/utils/dates';

addIcons({ addOutline });

@Component({
  selector: 'app-agenda',
  standalone: true,
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    DateScrollerComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPage {
  private readonly eventoService = inject(EventoService);
  private readonly router = inject(Router);

  constructor() {
    void this.eventoService.load();
  }

  readonly formatTime = formatTime;
  readonly viewMode = signal<AgendaViewMode>('day');
  readonly selectedDate = this.eventoService.selectedDate;
  readonly eventos = this.eventoService.eventosDoDiaSelecionado;

  onDateChange(date: Date): void {
    this.eventoService.setSelectedDate(date);
  }

  setView(mode: AgendaViewMode): void {
    this.viewMode.set(mode);
  }

  eventTop(iso: string): number {
    const d = new Date(iso);
    const minutes = d.getHours() * 60 + d.getMinutes();
    return (minutes / (24 * 60)) * 100;
  }

  eventHeight(inicio: string, fim: string): number {
    const start = new Date(inicio).getTime();
    const end = new Date(fim).getTime();
    const minutes = Math.max(30, (end - start) / 60000);
    return (minutes / (24 * 60)) * 100;
  }

  openNovoEvento(): void {
    void this.router.navigateByUrl('/evento/nova');
  }
}
