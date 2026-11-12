import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { FinanceiroService } from '../application/financeiro.service';
import { CategoriaService } from '../../../core/application/categoria.service';
import { NumericKeypadComponent } from '../../../shared/ui/numeric-keypad.component';
import { formatCurrencyBRL } from '../../../shared/utils/dates';
import { Categoria } from '../../../core/domain/types';
import {
  carOutline,
  cashOutline,
  gameControllerOutline,
  homeOutline,
  pricetagOutline,
  restaurantOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
  restaurantOutline,
  carOutline,
  homeOutline,
  gameControllerOutline,
  cashOutline,
  pricetagOutline,
});

@Component({
  selector: 'app-lancamento-rapido',
  standalone: true,
  templateUrl: './lancamento-rapido.page.html',
  styleUrls: ['./lancamento-rapido.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonIcon,
    NumericKeypadComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LancamentoRapidoPage {
  private readonly financeiro = inject(FinanceiroService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  readonly categorias = signal<Categoria[]>([]);
  readonly categoriaSelecionada = signal('');
  readonly centavos = signal(0);

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await this.categoriaService.load();
    const items = await this.categoriaService.listByTipo('financeiro');
    this.categorias.set(items);
    this.categoriaSelecionada.set(items[0]?.id ?? '');
  }

  valorFormatado(): string {
    return formatCurrencyBRL(this.centavos() / 100);
  }

  selecionarCategoria(id: string): void {
    this.categoriaSelecionada.set(id);
  }

  onDigit(digit: string): void {
    if (digit === '.') {
      return;
    }
    const next = `${this.centavos()}${digit}`;
    const parsed = Number.parseInt(next, 10);
    this.centavos.set(Number.isNaN(parsed) ? this.centavos() : parsed);
  }

  onBackspace(): void {
    const raw = `${this.centavos()}`;
    const next = raw.slice(0, -1);
    this.centavos.set(next.length ? Number.parseInt(next, 10) : 0);
  }

  async salvar(): Promise<void> {
    const valor = this.centavos() / 100;
    if (valor <= 0) {
      return;
    }
    const categoriaId = this.categoriaSelecionada();
    const nome = this.categoriaService.getById(categoriaId)?.nome ?? 'Gasto rápido';
    await this.financeiro.quickExpense({
      valor,
      categoriaId: categoriaId || null,
      descricao: nome,
    });
    void this.router.navigateByUrl('/tabs/financeiro');
  }
}
