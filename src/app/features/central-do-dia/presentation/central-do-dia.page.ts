import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { chevronForwardOutline, flagOutline, timeOutline, walletOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CentralDoDiaService } from '../../../core/application/central-do-dia.service';
import { formatCurrencyBRL, formatHeaderDate, formatTime } from '../../../shared/utils/dates';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge.component';

addIcons({ chevronForwardOutline, flagOutline, timeOutline, walletOutline });

@Component({
  selector: 'app-central-do-dia',
  standalone: true,
  templateUrl: './central-do-dia.page.html',
  styleUrls: ['./central-do-dia.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    RouterLink,
    PriorityBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CentralDoDiaPage {
  private readonly central = inject(CentralDoDiaService);

  readonly headerDate = formatHeaderDate();
  readonly formatCurrency = formatCurrencyBRL;
  readonly formatTime = formatTime;

  readonly tarefasHoje = this.central.tarefasHoje;
  readonly progresso = this.central.progressoHoje;
  readonly compromissos = this.central.compromissos;
  readonly contas = this.central.contasAVencer;
  readonly lembretes = this.central.lembretes;
  readonly financeiro = this.central.resumoFinanceiro;
}
