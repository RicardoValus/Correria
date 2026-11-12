import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  alarmOutline,
  cardOutline,
  checkboxOutline,
  documentTextOutline,
  informationCircleOutline,
  walletOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FinanceiroService } from '../../financeiro/application/financeiro.service';
import { formatCurrencyBRL } from '../../../shared/utils/dates';

addIcons({
  checkboxOutline,
  documentTextOutline,
  alarmOutline,
  walletOutline,
  cardOutline,
  informationCircleOutline,
});

@Component({
  selector: 'app-mais',
  standalone: true,
  templateUrl: './mais.page.html',
  styleUrls: ['./mais.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaisPage {
  private readonly financeiro = inject(FinanceiroService);

  readonly contas = this.financeiro.contas;
  readonly cartoes = this.financeiro.cartoes;
  readonly formatCurrency = formatCurrencyBRL;

  constructor() {
    void this.financeiro.load();
  }
}
