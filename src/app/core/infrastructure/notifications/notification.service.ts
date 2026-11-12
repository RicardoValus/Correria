import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permissionGranted = false;

  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const permission = await LocalNotifications.requestPermissions();
    this.permissionGranted = permission.display === 'granted';
  }

  async schedule(
    id: number,
    title: string,
    body: string,
    at: Date
  ): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.permissionGranted) {
      return;
    }
    if (at.getTime() <= Date.now()) {
      return;
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at },
          extra: { source: 'pulso' },
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
