import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DatabaseService } from './core/infrastructure/database/database.service';
import { NotificationService } from './core/infrastructure/notifications/notification.service';
import { PushNotificationService } from './core/infrastructure/notifications/push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly database = inject(DatabaseService);
  private readonly notifications = inject(NotificationService);
  private readonly push = inject(PushNotificationService);

  async ngOnInit(): Promise<void> {
    await this.database.init();
    await this.notifications.init();
    await this.push.init();
  }
}
