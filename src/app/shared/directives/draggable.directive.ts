import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective {
  @Input('appDraggable') index = 0;

  private dragging = false;

  // a11y + UX
  @HostBinding('attr.draggable') readonly draggable = true;
  @HostBinding('attr.aria-grabbed') get ariaGrabbed(): 'true' | 'false' {
    return this.dragging ? 'true' : 'false';
  }
  @HostBinding('class.cursor-move') readonly cursorMove = true;
  @HostBinding('class.opacity-50') get dim(): boolean {
    return this.dragging;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(ev: DragEvent): void {
    if (!ev.dataTransfer) return;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', String(this.index));
    this.dragging = true;
  }

  @HostListener('dragend')
  onDragEnd(): void {
    this.dragging = false;
  }
}
