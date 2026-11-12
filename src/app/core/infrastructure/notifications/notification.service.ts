import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permissionGranted = false;

  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        this.permissionGranted = result === 'granted';
      }
      return;
    }
    const permission = await LocalNotifications.requestPermissions();
    this.permissionGranted = permission.display === 'granted';

    await LocalNotifications.createChannel({
      id: 'correria-default',
      name: 'Correria',
      description: 'Lembretes e avisos do Correria',
      importance: 5,
      visibility: 1,
    });
  }

  async schedule(
    id: number,
    title: string,
    body: string,
    at: Date
  ): Promise<void> {
    if (at.getTime() <= Date.now()) {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      if (!this.permissionGranted || !('Notification' in window)) {
        return;
      }
      const delay = at.getTime() - Date.now();
      window.setTimeout(() => {
        new Notification(title, { body, icon: 'assets/brand/icon-correria.png' });
      }, delay);
      return;
    }

    if (!this.permissionGranted) {
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at },
          channelId: 'correria-default',
          smallIcon: 'ic_stat_correria',
          extra: { source: 'correria' },
        },
      ],
    });
  }

  async cancel(id: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  nextNotificationId(): number {
    return Math.floor(Date.now() % 2_000_000_000);
  }
}
