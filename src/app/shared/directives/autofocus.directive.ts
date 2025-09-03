import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

type AutofocusOpts = boolean | '' | { select?: boolean; delay?: number } | null | undefined;

/**
 * Usage:
 *   <input appAutofocus />                              // focus
 *   <input [appAutofocus]="{ select: true }" />         // focus + select()
 *   <input [appAutofocus]="{ delay: 150 }" />           // focus après 150ms
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit, OnDestroy {
  @Input('appAutofocus') opts: AutofocusOpts;

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private timerId: number | null = null;

  ngAfterViewInit(): void {
    const { select, delay } = this.normalize(this.opts);
    this.zone.runOutsideAngular(() => {
      this.timerId = window.setTimeout(() => {
        const host = this.el.nativeElement;
        if (!host) return;
        // focus sans scroll pour éviter les sauts
        host.focus({ preventScroll: true } as FocusOptions);
        if (select && 'select' in (host as unknown as HTMLInputElement | HTMLTextAreaElement)) {
          try {
            (host as unknown as HTMLInputElement | HTMLTextAreaElement).select();
          } catch {
            // pas critique
          }
        }
      }, delay);
    });
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private normalize(v: AutofocusOpts): { select: boolean; delay: number } {
    // Présence de l'attribut sans valeur => true
    if (v === '' || v === true || v === undefined || v === null) {
      return { select: false, delay: 0 };
    }
    if (typeof v === 'object') {
      const sel = Boolean(v.select);
      const d = Number.isFinite(v.delay as number) ? Math.max(0, Number(v.delay)) : 0;
      return { select: sel, delay: d };
    }
    // v === false
    return { select: false, delay: 0 };
  }
}
