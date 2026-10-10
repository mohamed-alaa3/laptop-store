import {
  Schema,
  model,
  Types,
  type Document,
  type HydratedDocument,
} from "mongoose";
import type { ILocalizedString } from "./Category.model";

export type ProductCondition = "new" | "imported";
export type OfferType = "discount" | "free-gift";
export type DiscountType = "percentage" | "fixed";

export interface IProductImage {
  url: string;
  publicId: string;
  isMain: boolean;
}

export interface ISpecification {
  name: ILocalizedString;
  value: ILocalizedString;
}

export interface IOffer {
  isActive: boolean;
  type: OfferType;
  discountType?: DiscountType;
  discountValue?: number;
  giftProduct?: Types.ObjectId;
  giftQuantity?: number;
  message?: ILocalizedString;
  startDate?: Date;
  endDate?: Date;
}

export interface IProduct extends Document {
  name: ILocalizedString;
  slug: string;
  brand: string;
  category: Types.ObjectId;
  condition: ProductCondition;
  price: number;
  oldPrice?: number;
  stock: number;
  description: ILocalizedString;
  images: IProductImage[];
  specifications: ISpecification[];
  featured: boolean;
  newArrival: boolean;
  offer?: IOffer;
  tags: string[];
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

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    isMain: { type: Boolean, default: false },
  },
  { _id: false },
);

const specificationSchema = new Schema<ISpecification>(
  {
    name: {
      type: localizedStringSchema,
      required: true,
    },
    value: {
      type: localizedStringSchema,
      required: true,
    },
  },
  { _id: false },
);

const offerSchema = new Schema<IOffer>(
  {
    isActive: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["discount", "free-gift"],
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: false,
    },
    discountValue: {
      type: Number,
      min: 0,
      required: false,
    },
    giftProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    giftQuantity: {
      type: Number,
      min: 1,
      required: false,
    },
    message: {
      type: localizedStringSchema,
      required: false,
    },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: localizedStringSchema,
      required: [true, "Product name is required"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    condition: {
      type: String,
      enum: ["new", "imported"],
      required: [true, "Condition is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      min: [0, "Old price cannot be negative"],
      required: false,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    description: {
      type: localizedStringSchema,
      required: [true, "Description is required"],
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    specifications: {
      type: [specificationSchema],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    newArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    offer: {
      type: offerSchema,
      required: false,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Text index for MongoDB fallback search
productSchema.index(
  {
    "name.en": "text",
    "name.ar": "text",
    brand: "text",
    "description.en": "text",
    "description.ar": "text",
    tags: "text",
  },
  {
    name: "product_text_index",
    weights: {
      "name.en": 10,
      "name.ar": 10,
      brand: 5,
      tags: 3,
      "description.en": 1,
      "description.ar": 1,
    },
  },
);

// Compound indexes for common queries
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ featured: 1, createdAt: -1 });
productSchema.index({ newArrival: 1, createdAt: -1 });
productSchema.index({ price: 1 });

export const Product = model<IProduct>("Product", productSchema);

export type ProductDocument = HydratedDocument<IProduct>;

/**
 * Shape returned by `.lean()` queries.
 * We can't rely on Mongoose's FlattenMaps here.
 */
export type ProductLean = {
  _id: Types.ObjectId;
  name: ILocalizedString;
  slug: string;
  brand: string;
  category: Types.ObjectId;
  condition: ProductCondition;
  price: number;
  oldPrice?: number;
  stock: number;
  description: ILocalizedString;
  images: IProductImage[];
  specifications: ISpecification[];
  featured: boolean;
  newArrival: boolean;
  offer?: IOffer;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};
