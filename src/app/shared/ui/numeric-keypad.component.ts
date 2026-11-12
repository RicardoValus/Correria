import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/angular/standalone';
import { backspaceOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({ backspaceOutline });

@Component({
  selector: 'app-numeric-keypad',
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonButton, IonIcon],
  template: `
    <ion-grid class="keypad">
      @for (row of rows; track row) {
        <ion-row>
          @for (key of row; track key) {
            <ion-col size="4">
              @if (key === 'back') {
                <ion-button expand="block" fill="clear" class="key key-action" (click)="onBackspace()">
                  <ion-icon name="backspace-outline" slot="icon-only"></ion-icon>
                </ion-button>
              } @else {
                <ion-button expand="block" fill="clear" class="key" (click)="onDigit(key)">
                  {{ key }}
                </ion-button>
              }
            </ion-col>
          }
        </ion-row>
      }
    </ion-grid>
  `,
  styles: [
    `
      .keypad {
        padding: 0;
      }
      .key {
        --color: var(--correria-text);
        font-size: 1.35rem;
        font-weight: 600;
        height: 52px;
        margin: 4px 0;
        --background: var(--correria-surface-2);
        --border-radius: var(--correria-radius-sm);
      }
      .key-action {
        --color: var(--correria-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericKeypadComponent {
  readonly digit = output<string>();
  readonly backspace = output<void>();

  readonly rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'back'],
  ];

  onDigit(value: string): void {
    this.digit.emit(value);
  }

  onBackspace(): void {
    this.backspace.emit();
  }
}
