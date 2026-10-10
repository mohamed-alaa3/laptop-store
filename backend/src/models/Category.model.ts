import { Schema, model, type Document } from "mongoose";

export interface ILocalizedString {
  en: string;
  ar: string;
}

export interface ISpecTemplate {
  nameEn: string;
  nameAr: string;
}

export interface ICategory extends Document {
  name: ILocalizedString;
  slug: string;
  description?: ILocalizedString;
  icon?: string;
  specificationTemplate: ISpecTemplate[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const localizedStringSchema = new Schema<ILocalizedString>(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const specTemplateSchema = new Schema<ISpecTemplate>(
  {
    nameEn: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: localizedStringSchema,
      required: [true, "Category name is required"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: localizedStringSchema,
      required: false,
    },
    icon: {
      type: String,
      trim: true,
      required: false,
    },
    specificationTemplate: {
      type: [specTemplateSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index({ order: 1, createdAt: -1 });

export const Category = model<ICategory>("Category", categorySchema);
