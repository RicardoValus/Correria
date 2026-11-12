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
import { addCircleOutline, cardOutline, repeatOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FinanceiroService } from '../application/financeiro.service';
import { CategoriaService } from '../../../core/application/categoria.service';
import { formatCurrencyBRL } from '../../../shared/utils/dates';

addIcons({ addCircleOutline, repeatOutline, cardOutline, trendingUpOutline, trendingDownOutline });

@Component({
  selector: 'app-financeiro',
  standalone: true,
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceiroPage {
  private readonly financeiro = inject(FinanceiroService);
  private readonly categoriaService = inject(CategoriaService);

  readonly resumo = this.financeiro.resumo;
  readonly recentes = this.financeiro.recentes;
  readonly formatCurrency = formatCurrencyBRL;

  constructor() {
    void this.financeiro.load();
    void this.categoriaService.load();
  }

  categoriaNome(id: string | null): string {
    if (!id) {
      return 'Sem categoria';
    }
    return this.categoriaService.getById(id)?.nome ?? 'Sem categoria';
  }
}
