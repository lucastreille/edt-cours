import { Pipe, PipeTransform } from '@angular/core';

type InputDate = string | number | Date | null | undefined;

/**
 * Transforme une date en durée relative FR:
 * - à l’instant / il y a Ns/min/h/j/mois/an(s)
 * - hier pour ~1 jour
 * - futur: dans Ns/min/h/j/mois/an(s)
 *
 * Usage: {{ createdAt | durationAgo }}
 */
@Pipe({
  name: 'durationAgo',
  standalone: true,
  pure: true,
})
export class DurationAgoPipe implements PipeTransform {
  transform(value: InputDate): string {
    const date = this.parse(value);
    if (!date) return '–';

    const now = Date.now();
    const diffMs = now - date.getTime();
    const future = diffMs < 0;
    const absMs = Math.abs(diffMs);

    const sec = Math.round(absMs / 1000);
    if (sec <= 5) return 'à l’instant';

    const min = Math.round(sec / 60);
    if (min < 60) return this.out(min, 'min', future);

    const hr = Math.round(min / 60);
    if (hr < 24) return this.out(hr, 'h', future);

    const day = Math.round(hr / 24);
    if (!future && day === 1) return 'hier';
    if (day < 30) return this.out(day, 'j', future);

    const month = Math.round(day / 30);
    if (month < 12) return this.out(month, 'mois', future, /*pluralKeep=*/ true);

    const year = Math.round(month / 12);
    return this.out(year, year > 1 ? 'ans' : 'an', future);
  }

  private parse(v: InputDate): Date | null {
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    if (typeof v === 'number') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private out(n: number, unit: string, future: boolean, pluralKeep = false): string {
    const u = pluralKeep ? unit : this.pluralize(unit, n);
    return future ? `dans ${n} ${u}` : `il y a ${n} ${u}`;
  }

  private pluralize(unit: string, n: number): string {
    if (unit === 'min' || unit === 'h' || unit === 'j') return unit;
    return n > 1 ? `${unit}s` : unit;
  }
}
