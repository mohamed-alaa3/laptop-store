import { Component, input, output, inject, signal, computed } from '@angular/core';
import { LanguageService } from '../../../core/services/language';
import { ToastService } from '../../../core/services/toast';
import { UploadService } from '../../../core/services/upload';
import type { ProductImage } from '../../../core/models/product.model';

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

@Component({
  selector: 'app-image-uploader',
  imports: [],
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.css',
})
export class ImageUploader {
  private readonly uploadService = inject(UploadService);
  private readonly toast = inject(ToastService);
  readonly language = inject(LanguageService);

  readonly images = input.required<ProductImage[]>();
  readonly imagesChange = output<ProductImage[]>();

  readonly uploading = signal(false);
  readonly isDragging = signal(false);
  readonly uploadProgress = signal(0);

  readonly canUploadMore = computed(() => this.images().length < MAX_FILES);

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    await this.handleFiles(Array.from(input.files));
    input.value = ''; // reset input
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    await this.handleFiles(Array.from(files));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  private async handleFiles(files: File[]): Promise<void> {
    if (this.uploading()) return;

    // Check max files
    const total = this.images().length + files.length;
    if (total > MAX_FILES) {
      this.toast.error(
        this.language.language() === 'ar'
          ? `الحد الأقصى ${MAX_FILES} صور`
          : `Maximum ${MAX_FILES} images allowed`,
      );
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        this.toast.error(
          this.language.language() === 'ar'
            ? `نوع الملف غير مدعوم: ${file.name}`
            : `Unsupported file type: ${file.name}`,
        );
        return;
      }
      if (file.size > MAX_SIZE) {
        this.toast.error(
          this.language.language() === 'ar'
            ? `حجم الملف كبير جداً: ${file.name} (الحد 5MB)`
            : `File too large: ${file.name} (max 5MB)`,
        );
        return;
      }
    }

    // Upload
    this.uploading.set(true);
    this.uploadProgress.set(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        this.uploadProgress.update((p) => Math.min(p + 10, 90));
      }, 200);

      const uploaded = await this.uploadService.uploadImages(files);
      clearInterval(progressInterval);
      this.uploadProgress.set(100);

      // Merge with existing images
      const current = this.images();
      const isFirstImage = current.length === 0;

      const merged = [
        ...current,
        ...uploaded.map((img, i) => ({
          ...img,
          isMain: isFirstImage && i === 0 ? true : img.isMain,
        })),
      ];

      this.imagesChange.emit(merged);

      this.toast.success(
        this.language.language() === 'ar'
          ? `تم رفع ${uploaded.length} صورة`
          : `${uploaded.length} image(s) uploaded`,
      );
    } catch (err) {
      let message = this.language.language() === 'ar' ? 'فشل رفع الصور' : 'Upload failed';

      if (err && typeof err === 'object' && 'error' in err) {
        const httpError = err as { error?: { message?: string } };
        message = httpError.error?.message ?? message;
      }

      this.toast.error(message);
    } finally {
      this.uploading.set(false);
      setTimeout(() => this.uploadProgress.set(0), 500);
    }
  }

  async removeImage(index: number): Promise<void> {
    const current = this.images();
    const image = current[index];
    if (!image) return;

    const confirmed = confirm(
      this.language.language() === 'ar' ? 'حذف هذه الصورة؟' : 'Delete this image?',
    );
    if (!confirmed) return;

    // Remove from list immediately (optimistic)
    const updated = current.filter((_, i) => i !== index);

    // If we removed the main image, make the first one main
    const hadMain = image.isMain;
    const finalImages =
      hadMain && updated.length > 0
        ? updated.map((img, i) => ({ ...img, isMain: i === 0 }))
        : updated;

    this.imagesChange.emit(finalImages);

    // Try to delete from Cloudinary (best-effort)
    try {
      await this.uploadService.deleteImage(image.publicId);
    } catch {
      // Silent failure — the image is already removed from the form
      // The backend will clean up when the product is saved/deleted
    }
  }

  setAsMain(index: number): void {
    const updated = this.images().map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    this.imagesChange.emit(updated);
  }

  moveImage(index: number, direction: -1 | 1): void {
    const current = [...this.images()];
    const target = index + direction;
    if (target < 0 || target >= current.length) return;

    [current[index], current[target]] = [current[target], current[index]];
    this.imagesChange.emit(current);
  }

  getMainImageIndex(): number {
    return this.images().findIndex((img) => img.isMain);
  }
}
