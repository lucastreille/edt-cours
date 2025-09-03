import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

export interface DropPayload {
  from: number;
  to: number;
}

@Directive({
  selector: '[appDroppable]',
  standalone: true,
})
export class DroppableDirective {
  @Input('appDroppable') index = 0;
  @Output() appDropped = new EventEmitter<DropPayload>();

  private isOver = false;

  // Visuel de survol (sans Tailwind utilitaire dans le template)
  @HostBinding('class.outline') get outline(): boolean {
    return this.isOver;
  }
  @HostBinding('class.outline-2') get outline2(): boolean {
    return this.isOver;
  }
  @HostBinding('class.outline-indigo-500') get outlineColor(): boolean {
    return this.isOver;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(ev: DragEvent): void {
    ev.preventDefault(); // sinon 'drop' ne se déclenche pas
    this.isOver = true;
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.isOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.isOver = false;

    const raw = ev.dataTransfer?.getData('text/plain') ?? '';
    const from = Number(raw);
    const to = this.index;

    if (Number.isFinite(from) && Number.isFinite(to) && from !== to) {
      this.appDropped.emit({ from, to });
    }
  }
}
