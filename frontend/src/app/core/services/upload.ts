import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { ApiSuccessResponse } from '../models/api-response.model';
import type { ProductImage } from '../models/product.model';

interface UploadResponse {
  images: ProductImage[];
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly api = inject(ApiService);

  async uploadImages(files: File[]): Promise<ProductImage[]> {
    if (files.length === 0) return [];

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file, file.name);
    }

    const response = await firstValueFrom(
      this.api.postFormData<ApiSuccessResponse<UploadResponse>>('/upload/images', formData),
    );

    return response.data.images;
  }

  async deleteImage(publicId: string): Promise<void> {
    await firstValueFrom(
      this.api.delete<ApiSuccessResponse<{ publicId: string }>>('/upload/images', { publicId }),
    );
  }
}
