import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../../../core/services/language';
import { StaggerDirective } from '../../../../shared/directives/stagger.directive';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
interface DeviceOption {
  id: 'gaming' | 'work' | 'design' | 'student';
  icon: 'gaming' | 'work' | 'design' | 'student';
  queryParams: Record<string, string>;
  accent: string;
}

@Component({
  selector: 'app-find-your-device',
  imports: [StaggerDirective, ScrollRevealDirective],
  templateUrl: './find-your-device.html',
  styleUrl: './find-your-device.css',
})
export class FindYourDevice {
  private readonly router = inject(Router);
  readonly language = inject(LanguageService);

  readonly options: DeviceOption[] = [
    {
      id: 'gaming',
      icon: 'gaming',
      queryParams: { search: 'gaming' },
      accent: '#7C3AED',
    },
    {
      id: 'work',
      icon: 'work',
      queryParams: { search: 'office' },
      accent: '#0066FF',
    },
    {
      id: 'design',
      icon: 'design',
      queryParams: { search: 'oled' },
      accent: '#EC4899',
    },
    {
      id: 'student',
      icon: 'student',
      queryParams: { search: 'laptop' },
      accent: '#10B981',
    },
  ];

  getTitle(id: string): string {
    return this.language.t(`home.findYourDevice.${id}`);
  }

  getDesc(id: string): string {
    return this.language.t(`home.findYourDevice.${id}Desc`);
  }

  select(option: DeviceOption): void {
    void this.router.navigate(['/shop'], {
      queryParams: option.queryParams,
    });
  }
}
