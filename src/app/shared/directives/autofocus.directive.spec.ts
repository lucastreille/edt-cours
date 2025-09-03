import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  standalone: true,
  imports: [AutofocusDirective],
  template: `
    <input id="a" />
    <input id="b" appAutofocus />
  `,
})
class HostCmp {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<HostCmp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostCmp],
    }).compileComponents();

    fixture = TestBed.createComponent(HostCmp);
  });

  it('should focus the element with appAutofocus', fakeAsync(() => {
    fixture.detectChanges();
    const b: HTMLInputElement | null = fixture.nativeElement.querySelector('#b');
    expect(b).toBeTruthy();
    spyOn(b as HTMLInputElement, 'focus').and.callThrough();
    tick(0); // laisser le setTimeout s'exécuter
    expect((b as HTMLInputElement).focus).toHaveBeenCalled();
  }));
});
