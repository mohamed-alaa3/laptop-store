import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../../../../core/services/admin-product';
import { CategoryService } from '../../../../core/services/category';
import { LanguageService } from '../../../../core/services/language';
import { ToastService } from '../../../../core/services/toast';
import { Button } from '../../../../shared/components/button/button';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { BasicInfoSection } from './sections/basic-info';
import { PricingStockSection } from './sections/pricing-stock';
import { SpecificationsSection } from './sections/specifications';
import { OffersSection } from './sections/offers';
import { ImagesSection } from './sections/images';
import type {
  ProductCondition,
  Specification,
  ProductImage,
  Product,
} from '../../../../core/models/product.model';

export interface ProductFormData {
  nameEn: string;
  nameAr: string;
  brand: string;
  category: string;
  condition: ProductCondition;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  featured: boolean;
  newArrival: boolean;
  tags: string;
  specifications: Specification[];
  offerEnabled: boolean;
  offerType: 'discount' | 'free-gift';
  discountType: 'percentage' | 'fixed';
  discountValue: number | null;
  giftProductId: string;
  giftQuantity: number | null;
  offerMessageEn: string;
  offerMessageAr: string;
}

const emptyForm: ProductFormData = {
  nameEn: '',
  nameAr: '',
  brand: '',
  category: '',
  condition: 'new',
  descriptionEn: '',
  descriptionAr: '',
  price: 0,
  oldPrice: null,
  stock: 0,
  featured: false,
  newArrival: false,
  tags: '',
  specifications: [],
  offerEnabled: false,
  offerType: 'discount',
  discountType: 'percentage',
  discountValue: null,
  giftProductId: '',
  giftQuantity: null,
  offerMessageEn: '',
  offerMessageAr: '',
};

@Component({
  selector: 'app-admin-product-form',
  imports: [
    RouterLink,
    FormsModule,
    Button,
    Skeleton,
    BasicInfoSection,
    PricingStockSection,
    SpecificationsSection,
    OffersSection,
    ImagesSection,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class AdminProductForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(AdminProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  readonly language = inject(LanguageService);

  readonly form = signal<ProductFormData>({ ...emptyForm });
  readonly isEdit = signal(false);
  readonly productId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly currentImages = signal<ProductImage[]>([]);
  readonly allProducts = signal<Product[]>([]);

  readonly categories = this.categoryService.categories;

  readonly pageTitle = computed(() => {
    if (this.isEdit()) {
      return this.language.language() === 'ar' ? 'تعديل منتج' : 'Edit Product';
    }
    return this.language.language() === 'ar' ? 'إضافة منتج' : 'New Product';
  });

  async ngOnInit(): Promise<void> {
    void this.categoryService.loadAll();
    void this.loadAllProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productId.set(id);
      await this.loadProduct(id);
    }
  }

  private async loadAllProducts(): Promise<void> {
    try {
      const result = await this.productService.list({ limit: 100 });
      this.allProducts.set(result.items);
    } catch {
      // Silent fail — the dropdown will just be empty
    }
  }

  private async loadProduct(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const product = await this.productService.getById(id);
      this.form.set({
        nameEn: product.name.en,
        nameAr: product.name.ar,
        brand: product.brand,
        category: product.category,
        condition: product.condition,
        descriptionEn: product.description.en,
        descriptionAr: product.description.ar,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock,
        featured: product.featured,
        newArrival: product.newArrival,
        tags: product.tags.join(', '),
        specifications: product.specifications ?? [],
        offerEnabled: product.offer?.isActive ?? false,
        offerType: product.offer?.type ?? 'discount',
        discountType: product.offer?.discountType ?? 'percentage',
        discountValue: product.offer?.discountValue ?? null,
        giftProductId: product.offer?.giftProduct ?? '',
        giftQuantity: product.offer?.giftQuantity ?? null,
        offerMessageEn: product.offer?.message?.en ?? '',
        offerMessageAr: product.offer?.message?.ar ?? '',
      });

      this.currentImages.set(product.images ?? []);
    } catch {
      this.toast.error(
        this.language.language() === 'ar' ? 'فشل تحميل المنتج' : 'Failed to load product',
      );
      void this.router.navigate(['/admin/products']);
    } finally {
      this.loading.set(false);
    }
  }

  updateForm(key: keyof ProductFormData, value: unknown): void {
    this.form.update((f) => ({ ...f, [key]: value }) as ProductFormData);
  }

  async save(): Promise<void> {
    const f = this.form();

    // Validation
    if (!f.nameEn.trim() || !f.nameAr.trim()) {
      this.toast.error(
        this.language.language() === 'ar'
          ? 'الاسم بالإنجليزي والعربي مطلوب'
          : 'Name in English and Arabic is required',
      );
      return;
    }
    if (!f.brand.trim()) {
      this.toast.error(this.language.language() === 'ar' ? 'الماركة مطلوبة' : 'Brand is required');
      return;
    }
    if (!f.category) {
      this.toast.error(this.language.language() === 'ar' ? 'الفئة مطلوبة' : 'Category is required');
      return;
    }
    if (f.price <= 0) {
      this.toast.error(
        this.language.language() === 'ar'
          ? 'السعر يجب أن يكون أكبر من صفر'
          : 'Price must be greater than 0',
      );
      return;
    }

    this.saving.set(true);

    try {
      const payload: Record<string, unknown> = {
        name: { en: f.nameEn.trim(), ar: f.nameAr.trim() },
        brand: f.brand.trim(),
        category: f.category,
        condition: f.condition,
        price: f.price,
        stock: f.stock,
        description: {
          en: f.descriptionEn.trim(),
          ar: f.descriptionAr.trim(),
        },
        featured: f.featured,
        newArrival: f.newArrival,
        tags: f.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        specifications: f.specifications,
        images: this.currentImages(),
      };

      if (f.oldPrice !== null && f.oldPrice > 0) {
        payload['oldPrice'] = f.oldPrice;
      }

      // Offer
      if (f.offerEnabled) {
        const offer: Record<string, unknown> = {
          isActive: true,
          type: f.offerType,
        };

        if (f.offerType === 'discount') {
          offer['discountType'] = f.discountType;
          offer['discountValue'] = f.discountValue;
        } else {
          offer['giftProduct'] = f.giftProductId || undefined;
          offer['giftQuantity'] = f.giftQuantity;
        }

        if (f.offerMessageEn || f.offerMessageAr) {
          offer['message'] = {
            en: f.offerMessageEn,
            ar: f.offerMessageAr,
          };
        }

        payload['offer'] = offer;
      }

      if (this.isEdit() && this.productId()) {
        await this.productService.update(this.productId()!, payload);
        this.toast.success(
          this.language.language() === 'ar' ? 'تم تحديث المنتج' : 'Product updated',
        );
      } else {
        await this.productService.create(payload);
        this.toast.success(
          this.language.language() === 'ar' ? 'تم إنشاء المنتج' : 'Product created',
        );
      }

      void this.router.navigate(['/admin/products']);
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

  cancel(): void {
    void this.router.navigate(['/admin/products']);
  }
}
