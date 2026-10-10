import { Component, input, inject } from '@angular/core';
import { LanguageService } from '../../../../core/services/language';
import type { Specification } from '../../../../core/models/product.model';

@Component({
  selector: 'app-specs-table',
  imports: [],
  templateUrl: './specs-table.html',
  styleUrl: './specs-table.css',
})
export class SpecsTable {
  readonly specs = input.required<Specification[]>();
  readonly language = inject(LanguageService);

  getSpecName(spec: Specification): string {
    return this.language.language() === 'ar' ? spec.name.ar : spec.name.en;
  }

  getSpecValue(spec: Specification): string {
    return this.language.language() === 'ar' ? spec.value.ar : spec.value.en;
  }
}
