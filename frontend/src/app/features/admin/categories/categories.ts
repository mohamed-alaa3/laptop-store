import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminCategoryService } from '../../../core/services/admin-category';
import { CategoryService } from '../../../core/services/category';
import { LanguageService } from '../../../core/services/language';
import { ToastService } from '../../../core/services/toast';
import { Button } from '../../../shared/components/button/button';
import { Skeleton } from '../../../shared/components/skeleton/skeleton';
import type { Category } from '../../../core/models/category.model';

interface CategoryForm {
  id: string | null;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  order: number;
  specificationTemplate: Array<{ nameEn: string; nameAr: string }>;
}

const emptyForm: CategoryForm = {
  id: null,
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  icon: '',
  order: 0,
  specificationTemplate: [],
};

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, Button, Skeleton],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class AdminCategories implements OnInit {
  private readonly adminService = inject(AdminCategoryService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  readonly language = inject(LanguageService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  // Modal state
  readonly isModalOpen = signal(false);
  readonly form = signal<CategoryForm>({ ...emptyForm });
  readonly isEditMode = computed(() => this.form().id !== null);

  // Delete confirmation
  readonly deleteConfirmId = signal<string | null>(null);
  readonly deleting = signal(false);

  readonly isEmpty = computed(() => !this.loading() && this.categories().length === 0);

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.adminService.list();
      this.categories.set(list);
    } catch {
      this.toast.error(
        this.language.language() === 'ar' ? 'فشل تحميل الفئات' : 'Failed to load categories',
      );
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.form.set({ ...emptyForm });
    this.isModalOpen.set(true);
  }

  openEdit(cat: Category): void {
    this.form.set({
      id: cat._id,
      nameEn: cat.name.en,
      nameAr: cat.name.ar,
      descriptionEn: cat.description?.en ?? '',
      descriptionAr: cat.description?.ar ?? '',
      icon: cat.icon ?? '',
      order: cat.order ?? 0,
      specificationTemplate: cat.specificationTemplate ?? [],
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.form.set({ ...emptyForm });
  }

  updateForm<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  // Spec template helpers
  addSpecTemplate(): void {
    this.form.update((f) => ({
      ...f,
      specificationTemplate: [...f.specificationTemplate, { nameEn: '', nameAr: '' }],
    }));
  }

  removeSpecTemplate(index: number): void {
    this.form.update((f) => ({
      ...f,
      specificationTemplate: f.specificationTemplate.filter((_, i) => i !== index),
    }));
  }

  updateSpecTemplate(index: number, field: 'nameEn' | 'nameAr', value: string): void {
    this.form.update((f) => ({
      ...f,
      specificationTemplate: f.specificationTemplate.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  async save(): Promise<void> {
    const f = this.form();

    if (!f.nameEn.trim() || !f.nameAr.trim()) {
      this.toast.error(
        this.language.language() === 'ar'
          ? 'الاسم بالإنجليزي والعربي مطلوب'
          : 'Name in English and Arabic is required',
      );
      return;
    }

    this.saving.set(true);

    try {
      const payload = {
        name: { en: f.nameEn.trim(), ar: f.nameAr.trim() },
        description:
          f.descriptionEn.trim() || f.descriptionAr.trim()
            ? { en: f.descriptionEn.trim(), ar: f.descriptionAr.trim() }
            : undefined,
        icon: f.icon.trim() || undefined,
        order: f.order,
        specificationTemplate: f.specificationTemplate.filter(
          (s) => s.nameEn.trim() && s.nameAr.trim(),
        ),
      };

      if (this.isEditMode() && f.id) {
        await this.adminService.update(f.id, payload);
        this.toast.success(
          this.language.language() === 'ar' ? 'تم تحديث الفئة' : 'Category updated',
        );
      } else {
        await this.adminService.create(payload);
        this.toast.success(
          this.language.language() === 'ar' ? 'تم إنشاء الفئة' : 'Category created',
        );
      }

      this.closeModal();
      await this.loadCategories();
      // Refresh global category service
     await this.categoryService.loadAll(true);
    } catch (err) {
      let message = this.language.language() === 'ar' ? 'فشل الحفظ' : 'Failed to save';

      if (err && typeof err === 'object' && 'error' in err) {
        const httpError = err as { error?: { message?: string } };
        message = httpError.error?.message ?? message;
      }

      this.toast.error(message);
    } finally {
      this.saving.set(false);
    }
  }

  requestDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.deleteConfirmId();
    if (!id) return;

    this.deleting.set(true);
    try {
      await this.adminService.delete(id);
      this.toast.success(this.language.language() === 'ar' ? 'تم حذف الفئة' : 'Category deleted');
      this.deleteConfirmId.set(null);
      await this.loadCategories();
     await this.categoryService.loadAll(true);
    } catch (err) {
      let message = this.language.language() === 'ar' ? 'فشل الحذف' : 'Failed to delete';

      if (err && typeof err === 'object' && 'error' in err) {
        const httpError = err as { error?: { message?: string } };
        message = httpError.error?.message ?? message;
      }

      this.toast.error(message);
    } finally {
      this.deleting.set(false);
    }
  }

  getCategoryName(cat: Category): string {
    return this.language.language() === 'ar' ? cat.name.ar : cat.name.en;
  }
}
