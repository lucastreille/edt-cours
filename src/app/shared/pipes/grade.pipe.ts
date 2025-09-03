import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforme une note 0..20 en lettre A/B/C avec seuils:
 * - A: >= high (par défaut 16)
 * - B: >= mid  (par défaut 12)
 * - C: sinon
 *
 * Utilisation:
 * {{ note | grade }}             // seuils par défaut (16/12)
 * {{ note | grade : 15 : 10 }}   // seuils custom
 */
@Pipe({
  name: 'grade',
  standalone: true,
  pure: true,
})
export class GradePipe implements PipeTransform {
  transform(value: number | null | undefined, high = 16, mid = 12): string {
    if (value === null || value === undefined) return '–';

    const v = Number(value);
    if (!Number.isFinite(v) || v < 0 || v > 20) return '–';

    if (high <= mid) {
      // garde-fou: si les seuils sont fournis à l'envers, on rétablit default
      high = 16;
      mid = 12;
    }

    if (v >= high) return 'A';
    if (v >= mid) return 'B';
    return 'C';
  }
}
