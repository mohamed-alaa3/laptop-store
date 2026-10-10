import "../config/dns-fix";

import mongoose from "mongoose";
import { env } from "../config/env";
import { Category } from "../models/Category.model";
import { logger } from "../utils/logger";

interface CategorySeed {
  name: { en: string; ar: string };
  slug: string;
  description: { en: string; ar: string };
  icon: string;
  specificationTemplate: Array<{ nameEn: string; nameAr: string }>;
  order: number;
}

const categories: CategorySeed[] = [
  {
    name: { en: "Laptops", ar: "لابتوبات" },
    slug: "laptops",
    description: {
      en: "High-performance laptops for work, gaming, and creativity.",
      ar: "لابتوبات عالية الأداء للعمل والألعاب والإبداع.",
    },
    icon: "laptop",
    order: 1,
    specificationTemplate: [
      { nameEn: "Processor", nameAr: "المعالج" },
      { nameEn: "Graphics", nameAr: "كرت الشاشة" },
      { nameEn: "RAM", nameAr: "الذاكرة العشوائية" },
      { nameEn: "Storage", nameAr: "التخزين" },
      { nameEn: "Display", nameAr: "الشاشة" },
      { nameEn: "Operating System", nameAr: "نظام التشغيل" },
      { nameEn: "Battery", nameAr: "البطارية" },
      { nameEn: "Weight", nameAr: "الوزن" },
    ],
  },
  {
    name: { en: "Desktop PCs", ar: "كمبيوترات مكتبية" },
    slug: "desktop-pcs",
    description: {
      en: "Custom-built desktop computers for every need.",
      ar: "كمبيوترات مكتبية مخصصة لكل الاحتياجات.",
    },
    icon: "desktop",
    order: 2,
    specificationTemplate: [
      { nameEn: "Processor", nameAr: "المعالج" },
      { nameEn: "Graphics", nameAr: "كرت الشاشة" },
      { nameEn: "RAM", nameAr: "الذاكرة العشوائية" },
      { nameEn: "Storage", nameAr: "التخزين" },
      { nameEn: "Motherboard", nameAr: "اللوحة الأم" },
      { nameEn: "Power Supply", nameAr: "مزود الطاقة" },
      { nameEn: "Case", nameAr: "الكيس" },
    ],
  },
  {
    name: { en: "Monitors", ar: "شاشات" },
    slug: "monitors",
    description: {
      en: "Crystal-clear monitors for gaming, design, and productivity.",
      ar: "شاشات عالية الوضوح للألعاب والتصميم والإنتاجية.",
    },
    icon: "monitor",
    order: 3,
    specificationTemplate: [
      { nameEn: "Size", nameAr: "الحجم" },
      { nameEn: "Resolution", nameAr: "الدقة" },
      { nameEn: "Refresh Rate", nameAr: "معدل التحديث" },
      { nameEn: "Panel Type", nameAr: "نوع اللوحة" },
      { nameEn: "Response Time", nameAr: "زمن الاستجابة" },
      { nameEn: "Ports", nameAr: "المنافذ" },
    ],
  },
  {
    name: { en: "Accessories", ar: "ملحقات" },
    slug: "accessories",
    description: {
      en: "Keyboards, mice, headsets, and everything in between.",
      ar: "لوحات مفاتيح، ماوسات، سماعات، وكل ما بينهما.",
    },
    icon: "headphones",
    order: 4,
    specificationTemplate: [
      { nameEn: "Type", nameAr: "النوع" },
      { nameEn: "Connectivity", nameAr: "الاتصال" },
      { nameEn: "Compatibility", nameAr: "التوافق" },
      { nameEn: "Warranty", nameAr: "الضمان" },
    ],
  },
  {
    name: { en: "Gaming", ar: "جيمنج" },
    slug: "gaming",
    description: {
      en: "Premium gaming gear built for competitive performance.",
      ar: "معدات جيمنج متميزة مصممة للأداء التنافسي.",
    },
    icon: "gamepad",
    order: 5,
    specificationTemplate: [
      { nameEn: "Type", nameAr: "النوع" },
      { nameEn: "Connectivity", nameAr: "الاتصال" },
      { nameEn: "RGB", nameAr: "إضاءة RGB" },
      { nameEn: "Compatibility", nameAr: "التوافق" },
    ],
  },
];

async function seedCategories(): Promise<void> {
  try {
    logger.info("🔌 Connecting to MongoDB...");
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ Connected");

    let created = 0;
    let skipped = 0;

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });

      if (existing) {
        logger.warn(`⚠️  Category "${cat.slug}" already exists — skipping`);
        skipped++;
        continue;
      }

      await Category.create(cat);
      logger.info(`✅ Created category: ${cat.name.en} (${cat.slug})`);
      created++;
    }

    logger.info("");
    logger.info(`📊 Summary: ${created} created, ${skipped} skipped`);

    await mongoose.disconnect();
    logger.info("👋 Done");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Failed to seed categories:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void seedCategories();
