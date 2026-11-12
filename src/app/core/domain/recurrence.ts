import { RecurrenceRule } from './types';

export function nextOccurrence(
  fromIso: string,
  rule: RecurrenceRule,
  afterIso?: string
): string | null {
  if (rule.frequency === 'nenhuma') {
    return null;
  }

  const base = new Date(fromIso);
  const after = afterIso ? new Date(afterIso) : new Date(fromIso);
  const cursor = new Date(Math.max(base.getTime(), after.getTime()));

  if (cursor.getTime() <= after.getTime() && afterIso) {
    advance(cursor, rule);
  }

  if (rule.until) {
    const until = new Date(rule.until);
    if (cursor.getTime() > until.getTime()) {
      return null;
    }
  }

  return cursor.toISOString();
}

function advance(date: Date, rule: RecurrenceRule): void {
  const step = Math.max(1, rule.interval || 1);
  switch (rule.frequency) {
    case 'diaria':
      date.setDate(date.getDate() + step);
      break;
    case 'semanal':
      date.setDate(date.getDate() + 7 * step);
      break;
    case 'mensal':
      date.setMonth(date.getMonth() + step);
      break;
    case 'customizada':
      date.setDate(date.getDate() + step);
      break;
    default:
      throw new Error(`Unsupported recurrence: ${rule.frequency}`);
  }
}

export function defaultRecurrence(): RecurrenceRule {
  return { frequency: 'nenhuma', interval: 1, until: null };
}
