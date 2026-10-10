export interface LocalizedString {
  en: string;
  ar: string;
}

export interface SpecificationTemplate {
  nameEn: string;
  nameAr: string;
}

export interface Category {
  _id: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;
  icon?: string;
  specificationTemplate: SpecificationTemplate[];
  order: number;
  createdAt: string;
  updatedAt: string;
}
