import { Injectable, computed, signal } from '@angular/core';
import { LembreteRepository } from '../infrastructure/lembrete.repository';
import { NotificationService } from '../../../core/infrastructure/notifications/notification.service';
import { createId } from '../../../shared/utils/id';
import { defaultRecurrence } from '../../../core/domain/recurrence';
import { Lembrete, ReminderStatus } from '../../../core/domain/types';
import { endOfDayIso, startOfDayIso } from '../../../shared/utils/dates';

export type LembreteCreateInput = Omit<Lembrete, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

@Injectable({ providedIn: 'root' })
export class LembreteService {
  private readonly store = signal<Lembrete[]>([]);

  readonly lembretes = this.store.asReadonly();

  readonly lembretesAtivosHoje = computed(() => {
    const start = startOfDayIso();
    const end = endOfDayIso();
    return this.store().filter(
      (l) =>
        (l.status === 'ativo' || l.status === 'adiado') &&
        l.dataHora >= start &&
        l.dataHora <= end
    );
  });

  constructor(
    private readonly repository: LembreteRepository,
    private readonly notifications: NotificationService
  ) {}

  async load(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const items = await this.repository.list();
    this.store.set(items);
  }

  getById(id: string): Lembrete | undefined {
    return this.store().find((l) => l.id === id);
  }

  save(lembrete: Lembrete): void {
    void this.persist(lembrete);
  }

  toggleConcluido(id: string): void {
    const current = this.store().find((l) => l.id === id);
    if (!current) {
      return;
    }
    const status: ReminderStatus =
      current.status === 'concluido' ? 'ativo' : 'concluido';
    void this.update({ ...current, status });
  }

  async create(input: LembreteCreateInput): Promise<Lembrete> {
    const now = new Date().toISOString();
    const lembrete: Lembrete = {
      id: input.id ?? createId(),
      titulo: input.titulo,
      dataHora: input.dataHora,
      recorrencia: input.recorrencia ?? defaultRecurrence(),
      status: input.status ?? 'ativo',
      tarefaId: input.tarefaId ?? null,
      eventoId: input.eventoId ?? null,
      contaRecorrenteId: input.contaRecorrenteId ?? null,
      notificationId: input.notificationId ?? this.notifications.nextNotificationId(),
      createdAt: now,
      updatedAt: now,
    };
    await this.persist(lembrete);
    return lembrete;
  }

  async update(lembrete: Lembrete): Promise<void> {
    const updated: Lembrete = {
      ...lembrete,
      updatedAt: new Date().toISOString(),
    };
    await this.persist(updated);
  }

  async remove(id: string): Promise<void> {
    const current = await this.repository.getById(id);
    if (current) {
      await this.cancelNotificationIfNeeded(current);
    }
    await this.repository.remove(id);
    await this.refresh();
  }

  async snooze(id: string, minutes: number): Promise<void> {
    const current = await this.repository.getById(id);
    if (!current) {
      return;
    }
    const at = new Date();
    at.setMinutes(at.getMinutes() + minutes);
    const updated: Lembrete = {
      ...current,
      dataHora: at.toISOString(),
      status: 'adiado',
      updatedAt: new Date().toISOString(),
    };
    await this.cancelNotificationIfNeeded(current);
    updated.notificationId = this.notifications.nextNotificationId();
    await this.persist(updated);
  }

  async complete(id: string): Promise<void> {
    const current = await this.repository.getById(id);
    if (!current) {
      return;
    }
    await this.cancelNotificationIfNeeded(current);
    await this.update({ ...current, status: 'concluido' });
  }

  async listForDay(date = new Date()): Promise<Lembrete[]> {
    const start = startOfDayIso(date);
    const end = endOfDayIso(date);
    const items = await this.repository.listInRange(start, end);
    return items.filter((l) => l.status === 'ativo' || l.status === 'adiado');
  }

  private async persist(lembrete: Lembrete): Promise<void> {
    const previous = await this.repository.getById(lembrete.id);
    if (previous) {
      await this.cancelNotificationIfNeeded(previous);
    }
    await this.repository.save(lembrete);
    await this.scheduleNotification(lembrete);
    await this.refresh();
  }

  private async scheduleNotification(lembrete: Lembrete): Promise<void> {
    if (lembrete.status === 'concluido') {
      return;
    }
    const at = new Date(lembrete.dataHora);
    const notifId = lembrete.notificationId ?? this.notifications.nextNotificationId();
    await this.notifications.schedule(notifId, lembrete.titulo, lembrete.titulo, at);
    if (lembrete.notificationId !== notifId) {
      await this.repository.save({
        ...lembrete,
        notificationId: notifId,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  private async cancelNotificationIfNeeded(lembrete: Lembrete): Promise<void> {
    if (lembrete.notificationId == null) {
      return;
    }
    await this.notifications.cancel(lembrete.notificationId);
  }
}
