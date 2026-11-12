import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import {
  addOutline,
  alarmOutline,
  calculatorOutline,
  calendarOutline,
  checkboxOutline,
  documentTextOutline,
  ellipsisHorizontalOutline,
  homeOutline,
  walletOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
  homeOutline,
  calendarOutline,
  addOutline,
  walletOutline,
  ellipsisHorizontalOutline,
  checkboxOutline,
  documentTextOutline,
  alarmOutline,
  calculatorOutline,
});

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet],
})
export class TabsPage {
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly router = inject(Router);

  async openQuickAdd(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Adicionar',
      cssClass: 'quick-add-sheet',
      buttons: [
        {
          text: 'Tarefa',
          icon: 'checkbox-outline',
          handler: () => {
            void this.router.navigateByUrl('/tarefa/nova');
          },
        },
        {
          text: 'Evento',
          icon: 'calendar-outline',
          handler: () => {
            void this.router.navigateByUrl('/evento/nova');
          },
        },
        {
          text: 'Nota',
          icon: 'document-text-outline',
          handler: () => {
            void this.router.navigateByUrl('/nota/nova');
          },
        },
        {
          text: 'Lembrete',
          icon: 'alarm-outline',
          handler: () => {
            void this.router.navigateByUrl('/lembrete/nova');
          },
        },
        {
          text: 'Gasto rápido',
          icon: 'calculator-outline',
          handler: () => {
            void this.router.navigateByUrl('/lancamento-rapido');
          },
        },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }
}
