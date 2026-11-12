import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { addDays, isSameDay } from '../utils/dates';

interface DayItem {
  date: Date;
  weekday: string;
  day: number;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-scroller',
  standalone: true,
  imports: [IonButton],
  template: `
    <div class="scroller">
      @for (item of days(); track item.date.getTime()) {
        <button
          type="button"
          class="day-chip"
          [class.today]="item.isToday"
          [class.selected]="item.isSelected"
          (click)="selectDay(item.date)"
        >
          <span class="weekday">{{ item.weekday }}</span>
          <span class="num">{{ item.day }}</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .scroller {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 8px 16px 12px;
        scrollbar-width: none;
      }
      .scroller::-webkit-scrollbar {
        display: none;
      }
      .day-chip {
        flex: 0 0 auto;
        min-width: 52px;
        border: 1px solid var(--pulso-border);
        background: var(--pulso-surface);
        border-radius: var(--pulso-radius);
        padding: 8px 6px;
        color: var(--pulso-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      }
      .day-chip.today .num {
        color: var(--pulso-orange);
      }
      .day-chip.selected {
        border-color: var(--pulso-orange);
        background: rgba(var(--ion-color-primary-rgb), 0.15);
        color: var(--pulso-text);
      }
      .weekday {
        font-size: 0.65rem;
        text-transform: uppercase;
      }
      .num {
        font-size: 1.1rem;
        font-weight: 700;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateScrollerComponent {
  readonly selected = input.required<Date>();
  readonly rangeDays = input(14);
  readonly dateChange = output<Date>();

  days(): DayItem[] {
    const anchor = this.selected();
    const start = addDays(anchor, -3);
    const count = this.rangeDays();
    const today = new Date();
    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    return Array.from({ length: count }, (_, i) => {
      const date = addDays(start, i);
      return {
        date,
        weekday: weekdays[date.getDay()],
        day: date.getDate(),
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, anchor),
      };
    });
  }

  selectDay(date: Date): void {
    this.dateChange.emit(date);
  }
}
