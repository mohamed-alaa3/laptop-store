import "../config/dns-fix";

import mongoose, { Types } from "mongoose";
import { env } from "../config/env";
import { Category } from "../models/Category.model";
import { Product, type ProductCondition } from "../models/Product.model";
import { logger } from "../utils/logger";

interface ProductSeed {
  name: { en: string; ar: string };
  slug: string;
  brand: string;
  categorySlug: string;
  condition: ProductCondition;
  price: number;
  oldPrice?: number;
  stock: number;
  description: { en: string; ar: string };
  specifications: Array<{
    name: { en: string; ar: string };
    value: { en: string; ar: string };
  }>;
  featured: boolean;
  newArrival: boolean;
  tags: string[];
}

const products: ProductSeed[] = [
  // ── Laptops ──────────────────────────────────────────────
  {
    name: {
      en: "Lenovo LOQ 15 Gaming Laptop",
      ar: "لينوفو LOQ 15 لابتوب جيمنج",
    },
    slug: "lenovo-loq-15",
    brand: "Lenovo",
    categorySlug: "laptops",
    condition: "new",
    price: 45000,
    oldPrice: 52000,
    stock: 8,
    description: {
      en: "Powerful gaming laptop with RTX 4060, ideal for modern titles and creative work.",
      ar: "لابتوب جيمنج قوي مع RTX 4060، مثالي للألعاب الحديثة والعمل الإبداعي.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Intel Core i7-13650HX", ar: "إنتل كور i7-13650HX" },
      },
      {
        name: { en: "Graphics", ar: "كرت الشاشة" },
        value: { en: "NVIDIA RTX 4060 8GB", ar: "NVIDIA RTX 4060 8 جيجا" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "16GB DDR5", ar: "16 جيجا DDR5" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "512GB NVMe SSD", ar: "512 جيجا SSD NVMe" },
      },
      {
        name: { en: "Display", ar: "الشاشة" },
        value: { en: '15.6" FHD 144Hz', ar: "15.6 بوصة FHD 144Hz" },
      },
      {
        name: { en: "Operating System", ar: "نظام التشغيل" },
        value: { en: "Windows 11 Home", ar: "ويندوز 11 هوم" },
      },
    ],
    featured: true,
    newArrival: true,
    tags: ["gaming", "laptop", "lenovo", "rtx"],
  },
  {
    name: { en: "ASUS ROG Strix G16", ar: "أسوس ROG Strix G16" },
    slug: "asus-rog-strix-g16",
    brand: "ASUS",
    categorySlug: "laptops",
    condition: "new",
    price: 68000,
    stock: 5,
    description: {
      en: "High-end gaming laptop with RTX 4070 and 165Hz display.",
      ar: "لابتوب جيمنج راقي مع RTX 4070 وشاشة 165Hz.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Intel Core i9-13980HX", ar: "إنتل كور i9-13980HX" },
      },
      {
        name: { en: "Graphics", ar: "كرت الشاشة" },
        value: { en: "NVIDIA RTX 4070 8GB", ar: "NVIDIA RTX 4070 8 جيجا" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "32GB DDR5", ar: "32 جيجا DDR5" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "1TB NVMe SSD", ar: "1 تيرا SSD NVMe" },
      },
      {
        name: { en: "Display", ar: "الشاشة" },
        value: { en: '16" QHD+ 240Hz', ar: "16 بوصة QHD+ 240Hz" },
      },
    ],
    featured: true,
    newArrival: false,
    tags: ["gaming", "laptop", "asus", "rog"],
  },
  {
    name: { en: "Dell XPS 15", ar: "ديل XPS 15" },
    slug: "dell-xps-15",
    brand: "Dell",
    categorySlug: "laptops",
    condition: "new",
    price: 75000,
    stock: 3,
    description: {
      en: "Premium ultrabook for professionals with stunning 4K OLED display.",
      ar: "ألترابوك متميز للمحترفين مع شاشة 4K OLED مذهلة.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Intel Core i7-13700H", ar: "إنتل كور i7-13700H" },
      },
      {
        name: { en: "Graphics", ar: "كرت الشاشة" },
        value: { en: "NVIDIA RTX 4050 6GB", ar: "NVIDIA RTX 4050 6 جيجا" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "16GB DDR5", ar: "16 جيجا DDR5" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "1TB NVMe SSD", ar: "1 تيرا SSD NVMe" },
      },
      {
        name: { en: "Display", ar: "الشاشة" },
        value: { en: '15.6" 4K OLED Touch', ar: "15.6 بوصة 4K OLED لمس" },
      },
    ],
    featured: false,
    newArrival: true,
    tags: ["laptop", "dell", "ultrabook", "oled"],
  },
  {
    name: { en: "HP Pavilion 15 (Imported)", ar: "HP Pavilion 15 (استيراد)" },
    slug: "hp-pavilion-15-imported",
    brand: "HP",
    categorySlug: "laptops",
    condition: "imported",
    price: 18500,
    oldPrice: 22000,
    stock: 12,
    description: {
      en: "Reliable everyday laptop, imported — excellent value for money.",
      ar: "لابتوب يومي موثوق، استيراد — قيمة ممتازة مقابل السعر.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Intel Core i5-1235U", ar: "إنتل كور i5-1235U" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "8GB DDR4", ar: "8 جيجا DDR4" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "256GB SSD", ar: "256 جيجا SSD" },
      },
      {
        name: { en: "Display", ar: "الشاشة" },
        value: { en: '15.6" FHD IPS', ar: "15.6 بوصة FHD IPS" },
      },
    ],
    featured: false,
    newArrival: false,
    tags: ["laptop", "hp", "imported", "budget"],
  },
  {
    name: { en: "Apple MacBook Air M3", ar: "آبل ماك بوك إير M3" },
    slug: "apple-macbook-air-m3",
    brand: "Apple",
    categorySlug: "laptops",
    condition: "new",
    price: 62000,
    stock: 6,
    description: {
      en: "Ultra-thin, silent, all-day battery life. The M3 chip is a beast.",
      ar: "نحيف جداً، صامت، بطارية تدوم طوال اليوم. شريحة M3 وحش.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Apple M3", ar: "Apple M3" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "16GB Unified", ar: "16 جيجا موحدة" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "512GB SSD", ar: "512 جيجا SSD" },
      },
      {
        name: { en: "Display", ar: "الشاشة" },
        value: { en: '13.6" Liquid Retina', ar: "13.6 بوصة Liquid Retina" },
      },
      {
        name: { en: "Battery", ar: "البطارية" },
        value: { en: "Up to 18 hours", ar: "حتى 18 ساعة" },
      },
    ],
    featured: true,
    newArrival: true,
    tags: ["laptop", "apple", "macbook", "m3"],
  },

  // ── Desktop PCs ──────────────────────────────────────────
  {
    name: {
      en: "Custom Gaming PC — RTX 4070",
      ar: "كمبيوتر جيمنج مخصص — RTX 4070",
    },
    slug: "custom-gaming-pc-rtx-4070",
    brand: "Custom Build",
    categorySlug: "desktop-pcs",
    condition: "new",
    price: 85000,
    stock: 4,
    description: {
      en: "Custom-built gaming rig with RTX 4070 and Ryzen 7.",
      ar: "كمبيوتر جيمنج مخصص مع RTX 4070 و Ryzen 7.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "AMD Ryzen 7 7800X3D", ar: "AMD Ryzen 7 7800X3D" },
      },
      {
        name: { en: "Graphics", ar: "كرت الشاشة" },
        value: { en: "NVIDIA RTX 4070 12GB", ar: "NVIDIA RTX 4070 12 جيجا" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "32GB DDR5 6000MHz", ar: "32 جيجا DDR5 6000" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "2TB NVMe SSD", ar: "2 تيرا SSD NVMe" },
      },
      {
        name: { en: "Power Supply", ar: "مزود الطاقة" },
        value: { en: "850W Gold", ar: "850 واط Gold" },
      },
    ],
    featured: true,
    newArrival: true,
    tags: ["desktop", "gaming", "custom", "rtx"],
  },
  {
    name: { en: "Office Mini PC", ar: "كمبيوتر مكتبي صغير" },
    slug: "office-mini-pc",
    brand: "Intel",
    categorySlug: "desktop-pcs",
    condition: "new",
    price: 12000,
    stock: 15,
    description: {
      en: "Compact and silent mini PC — perfect for office work.",
      ar: "كمبيوتر صغير ومضغوط — مثالي للعمل المكتبي.",
    },
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Intel Core i5-1240P", ar: "إنتل كور i5-1240P" },
      },
      {
        name: { en: "RAM", ar: "الذاكرة العشوائية" },
        value: { en: "16GB DDR4", ar: "16 جيجا DDR4" },
      },
      {
        name: { en: "Storage", ar: "التخزين" },
        value: { en: "512GB SSD", ar: "512 جيجا SSD" },
      },
    ],
    featured: false,
    newArrival: false,
    tags: ["desktop", "office", "mini", "intel"],
  },

  // ── Monitors ─────────────────────────────────────────────
  {
    name: { en: 'Samsung Odyssey G7 27"', ar: "سامسونج أوديسي G7 27 بوصة" },
    slug: "samsung-odyssey-g7-27",
    brand: "Samsung",
    categorySlug: "monitors",
    condition: "new",
    price: 28000,
    oldPrice: 32000,
    stock: 7,
    description: {
      en: "Curved QHD gaming monitor with 240Hz refresh rate.",
      ar: "شاشة جيمنج منحنية QHD بمعدل تحديث 240Hz.",
    },
    specifications: [
      {
        name: { en: "Size", ar: "الحجم" },
        value: { en: "27 inches", ar: "27 بوصة" },
      },
      {
        name: { en: "Resolution", ar: "الدقة" },
        value: { en: "2560x1440 QHD", ar: "2560x1440 QHD" },
      },
      {
        name: { en: "Refresh Rate", ar: "معدل التحديث" },
        value: { en: "240Hz", ar: "240Hz" },
      },
      {
        name: { en: "Panel Type", ar: "نوع اللوحة" },
        value: { en: "VA Curved", ar: "VA منحنية" },
      },
      {
        name: { en: "Response Time", ar: "زمن الاستجابة" },
        value: { en: "1ms", ar: "1ms" },
      },
    ],
    featured: true,
    newArrival: false,
    tags: ["monitor", "samsung", "gaming", "curved"],
  },
  {
    name: { en: 'LG UltraFine 32" 4K', ar: "LG UltraFine 32 بوصة 4K" },
    slug: "lg-ultrafine-32-4k",
    brand: "LG",
    categorySlug: "monitors",
    condition: "new",
    price: 35000,
    stock: 5,
    description: {
      en: "Professional 4K IPS monitor with USB-C — designer favorite.",
      ar: "شاشة 4K IPS احترافية مع USB-C — مفضلة المصممين.",
    },
    specifications: [
      {
        name: { en: "Size", ar: "الحجم" },
        value: { en: "32 inches", ar: "32 بوصة" },
      },
      {
        name: { en: "Resolution", ar: "الدقة" },
        value: { en: "3840x2160 4K", ar: "3840x2160 4K" },
      },
      {
        name: { en: "Refresh Rate", ar: "معدل التحديث" },
        value: { en: "60Hz", ar: "60Hz" },
      },
      {
        name: { en: "Panel Type", ar: "نوع اللوحة" },
        value: { en: "IPS", ar: "IPS" },
      },
      {
        name: { en: "Ports", ar: "المنافذ" },
        value: { en: "USB-C, HDMI, DP", ar: "USB-C, HDMI, DP" },
      },
    ],
    featured: false,
    newArrival: true,
    tags: ["monitor", "lg", "4k", "professional"],
  },

  // ── Accessories ──────────────────────────────────────────
  {
    name: { en: "Logitech MX Master 3S", ar: "لوجيتك MX ماستر 3S" },
    slug: "logitech-mx-master-3s",
    brand: "Logitech",
    categorySlug: "accessories",
    condition: "new",
    price: 4500,
    stock: 25,
    description: {
      en: "Premium wireless mouse for productivity professionals.",
      ar: "ماوس لاسلكي متميز للمحترفين.",
    },
    specifications: [
      {
        name: { en: "Type", ar: "النوع" },
        value: { en: "Wireless Mouse", ar: "ماوس لاسلكي" },
      },
      {
        name: { en: "Connectivity", ar: "الاتصال" },
        value: { en: "Bluetooth + USB Receiver", ar: "بلوتوث + USB" },
      },
      {
        name: { en: "Battery", ar: "البطارية" },
        value: { en: "Up to 70 days", ar: "حتى 70 يوم" },
      },
    ],
    featured: false,
    newArrival: false,
    tags: ["mouse", "logitech", "wireless", "productivity"],
  },
  {
    name: {
      en: "Keychron K8 Pro Mechanical Keyboard",
      ar: "كيبورد ميكانيكي Keychron K8 Pro",
    },
    slug: "keychron-k8-pro",
    brand: "Keychron",
    categorySlug: "accessories",
    condition: "new",
    price: 3800,
    oldPrice: 4500,
    stock: 18,
    description: {
      en: "Wireless mechanical keyboard with hot-swappable switches.",
      ar: "كيبورد ميكانيكي لاسلكي بمفاتيح قابلة للتبديل.",
    },
    specifications: [
      {
        name: { en: "Type", ar: "النوع" },
        value: { en: "Mechanical Keyboard", ar: "كيبورد ميكانيكي" },
      },
      {
        name: { en: "Connectivity", ar: "الاتصال" },
        value: { en: "Bluetooth + USB-C", ar: "بلوتوث + USB-C" },
      },
      {
        name: { en: "Layout", ar: "التخطيط" },
        value: { en: "TKL 80%", ar: "TKL 80%" },
      },
    ],
    featured: false,
    newArrival: true,
    tags: ["keyboard", "keychron", "mechanical", "wireless"],
  },

  // ── Gaming ───────────────────────────────────────────────
  {
    name: { en: "Razer BlackWidow V4 Pro", ar: "ريزر بلاك ويدو V4 برو" },
    slug: "razer-blackwidow-v4-pro",
    brand: "Razer",
    categorySlug: "gaming",
    condition: "new",
    price: 6500,
    stock: 10,
    description: {
      en: "Flagship gaming keyboard with Razer Green switches and RGB.",
      ar: "كيبورد جيمنج رائد مع مفاتيح Razer Green وإضاءة RGB.",
    },
    specifications: [
      {
        name: { en: "Type", ar: "النوع" },
        value: {
          en: "Mechanical Gaming Keyboard",
          ar: "كيبورد جيمنج ميكانيكي",
        },
      },
      {
        name: { en: "Connectivity", ar: "الاتصال" },
        value: { en: "Wired USB-C", ar: "USB-C سلكي" },
      },
      {
        name: { en: "RGB", ar: "إضاءة RGB" },
        value: { en: "Chroma RGB", ar: "Chroma RGB" },
      },
    ],
    featured: true,
    newArrival: false,
    tags: ["gaming", "keyboard", "razer", "rgb"],
  },
  {
    name: {
      en: "Logitech G Pro X Superlight 2",
      ar: "لوجيتك G Pro X سوبرلايت 2",
    },
    slug: "logitech-g-pro-x-superlight-2",
    brand: "Logitech",
    categorySlug: "gaming",
    condition: "new",
    price: 5800,
    stock: 14,
    description: {
      en: "Ultra-lightweight wireless gaming mouse — used by esports pros.",
      ar: "ماوس جيمنج لاسلكي فائق الخفة — يستخدمه محترفو الإسبورتس.",
    },
    specifications: [
      {
        name: { en: "Type", ar: "النوع" },
        value: { en: "Wireless Gaming Mouse", ar: "ماوس جيمنج لاسلكي" },
      },
      {
        name: { en: "Weight", ar: "الوزن" },
        value: { en: "60g", ar: "60 جرام" },
      },
      {
        name: { en: "Sensor", ar: "المستشعر" },
        value: { en: "HERO 2 25K DPI", ar: "HERO 2 25K DPI" },
      },
    ],
    featured: true,
    newArrival: true,
    tags: ["gaming", "mouse", "logitech", "wireless", "esports"],
  },
];

async function seedProducts(): Promise<void> {
  try {
    logger.info("🔌 Connecting to MongoDB...");
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ Connected");

    // Build a map of category slug → ObjectId
    const categories = await Category.find().lean();
    const categoryMap = new Map<string, Types.ObjectId>(
      categories.map((c) => [c.slug, c._id]),
    );

    if (categoryMap.size === 0) {
      logger.error(
        '❌ No categories found. Run "npm run seed:categories" first.',
      );
      await mongoose.disconnect();
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;

    for (const p of products) {
      const categoryId = categoryMap.get(p.categorySlug);

      if (!categoryId) {
        logger.warn(
          `⚠️  Category "${p.categorySlug}" not found — skipping product "${p.slug}"`,
        );
        skipped++;
        continue;
      }

      const existing = await Product.findOne({ slug: p.slug });
      if (existing) {
        logger.warn(`⚠️  Product "${p.slug}" already exists — skipping`);
        skipped++;
        continue;
      }

      const { categorySlug: _categorySlug, ...rest } = p;

      await Product.create({
        ...rest,
        category: categoryId,
        images: [], // No images yet — admin uploads them via UI
        offer: undefined,
      });

      logger.info(`✅ Created product: ${p.name.en} (${p.slug})`);
      created++;
    }

    logger.info("");
    logger.info(`📊 Summary: ${created} created, ${skipped} skipped`);

    await mongoose.disconnect();
    logger.info("👋 Done");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Failed to seed products:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void seedProducts();
