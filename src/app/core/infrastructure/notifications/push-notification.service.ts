import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { environment } from '../../../../environments/environment';
import { getFirebaseApp } from '../firebase/firebase-app';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  readonly token = signal<string | null>(null);
  readonly lastMessage = signal<string | null>(null);
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    if (Capacitor.isNativePlatform()) {
      await this.initNative();
      return;
    }

    await this.initWeb();
  }

  private async initNative(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      return;
    }

    await PushNotifications.register();

    await PushNotifications.addListener('registration', (event) => {
      this.token.set(event.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.warn('[Correria] Push registration error', error.error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.lastMessage.set(notification.title ?? notification.body ?? 'Nova notificação');
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      this.lastMessage.set(action.notification.title ?? 'Notificação aberta');
    });
  }

  private async initWeb(): Promise<void> {
    const supported = await isSupported().catch(() => false);
    if (!supported) {
      return;
    }

    if (!environment.firebase.vapidKey) {
      console.info(
        '[Correria] Defina environment.firebase.vapidKey para ativar push web (FCM).'
      );
      return;
    }

    try {
      getFirebaseApp();
      const messaging = getMessaging();
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      const currentToken = await getToken(messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (currentToken) {
        this.token.set(currentToken);
      }

      onMessage(messaging, (payload) => {
        this.lastMessage.set(
          payload.notification?.title ?? payload.data?.['title'] ?? 'Nova notificação'
        );
      });
    } catch (error) {
      console.warn('[Correria] Web push unavailable', error);
    }
  }
}
