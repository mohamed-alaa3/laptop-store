import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dots-loader',
  imports: [],
  template: `
    <div
      class="dots-loader"
      [style.transform]="'scale(' + size() + ')'"
      role="status"
      aria-label="Loading"
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  `,
  host: {
    class: 'inline-flex items-center justify-center',
  },
})
export class DotsLoader {
  readonly size = input<number>(1);
}
