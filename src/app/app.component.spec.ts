import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { DatabaseService } from './core/infrastructure/database/database.service';
import { NotificationService } from './core/infrastructure/notifications/notification.service';
import { PushNotificationService } from './core/infrastructure/notifications/push-notification.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: DatabaseService,
          useValue: { init: async () => undefined },
        },
        {
          provide: NotificationService,
          useValue: { init: async () => undefined },
        },
        {
          provide: PushNotificationService,
          useValue: { init: async () => undefined },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
