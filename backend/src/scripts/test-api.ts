/**
 * Comprehensive API test suite.
 *
 * Run with: npm run test:api
 *
 * WARNING: This script wipes and reseeds the database.
 * It refuses to run if NODE_ENV=production.
 */

import "../config/dns-fix";

import mongoose, { Types } from "mongoose";
import { env } from "../config/env";
import { Category } from "../models/Category.model";
import { Product } from "../models/Product.model";

// ──────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────

const BASE_URL = `http://localhost:${env.PORT}/api`;
const ADMIN_USERNAME = env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD ?? "ChangeMe123!";

let authToken = "";
let categoryId = "";
let productId = "";

// ──────────────────────────────────────────────────────────────
// Test tracking
// ──────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration });
    console.log(`✅ ${name} ${"·".repeat(Math.max(1, 50 - name.length))} PASS`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, message, duration });
    console.log(`❌ ${name} ${"·".repeat(Math.max(1, 50 - name.length))} FAIL`);
    console.log(`   → ${message}`);
  }
}

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function expectEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message} — expected ${expected}, got ${actual}`);
  }
}

// ──────────────────────────────────────────────────────────────
// HTTP helper
// ──────────────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}

async function request<T = unknown>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });

  let body: unknown;
  const text = await response.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { status: response.status, body: body as T };
}

// ──────────────────────────────────────────────────────────────
// Reset & seed
// ──────────────────────────────────────────────────────────────

async function resetAndSeed(): Promise<void> {
  console.log("\n🧹 Resetting database...");

  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log("   ✅ Cleared products and categories");

  console.log("🌱 Seeding categories...");

  const laptops = await Category.create({
    name: { en: "Laptops", ar: "لابتوبات" },
    slug: "laptops",
    description: {
      en: "High-performance laptops",
      ar: "لابتوبات عالية الأداء",
    },
    specificationTemplate: [
      { nameEn: "Processor", nameAr: "المعالج" },
      { nameEn: "RAM", nameAr: "الذاكرة العشوائية" },
    ],
    order: 1,
  });

  const monitors = await Category.create({
    name: { en: "Monitors", ar: "شاشات" },
    slug: "monitors",
    specificationTemplate: [
      { nameEn: "Size", nameAr: "الحجم" },
      { nameEn: "Resolution", nameAr: "الدقة" },
    ],
    order: 2,
  });

  await Category.create({
    name: { en: "Gaming", ar: "جيمنج" },
    slug: "gaming",
    specificationTemplate: [],
    order: 3,
  });

  categoryId = laptops._id.toString();

  console.log("🌱 Seeding products...");

  const laptop = await Product.create({
    name: { en: "Test Lenovo LOQ 15", ar: "لينوفو LOQ 15 تجريبي" },
    slug: "test-lenovo-loq-15",
    brand: "Lenovo",
    category: laptops._id,
    condition: "new",
    price: 45000,
    oldPrice: 52000,
    stock: 10,
    description: {
      en: "Gaming laptop with RTX 4060",
      ar: "لابتوب جيمنج مع RTX 4060",
    },
    images: [],
    specifications: [
      {
        name: { en: "Processor", ar: "المعالج" },
        value: { en: "Intel i7-13650HX", ar: "إنتل i7-13650HX" },
      },
      {
        name: { en: "Graphics", ar: "كرت الشاشة" },
        value: { en: "NVIDIA RTX 4060", ar: "NVIDIA RTX 4060" },
      },
    ],
    featured: true,
    newArrival: true,
    tags: ["gaming", "laptop", "lenovo"],
  });

  productId = laptop._id.toString();

  await Product.create({
    name: { en: "Test Samsung Monitor", ar: "شاشة سامسونج تجريبية" },
    slug: "test-samsung-monitor",
    brand: "Samsung",
    category: monitors._id,
    condition: "imported",
    price: 15000,
    stock: 5,
    description: {
      en: "A test monitor",
      ar: "شاشة تجريبية",
    },
    images: [],
    specifications: [
      {
        name: { en: "Size", ar: "الحجم" },
        value: { en: "27 inch", ar: "27 بوصة" },
      },
    ],
    featured: false,
    newArrival: false,
    tags: ["monitor", "samsung"],
  });

  console.log("   ✅ Seeded 3 categories + 2 products\n");
}

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────

async function runTests(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  API Test Suite");
  console.log("═══════════════════════════════════════════════════════\n");

  // ─── Health ──────────────────────────────────────────────
  await test("Health check returns 200", async () => {
    const res = await request("GET", "/health");
    expectEqual(res.status, 200, "Health status");
  });

  // ─── Auth ────────────────────────────────────────────────
  await test("Login with valid credentials returns token", async () => {
    const res = await request<{
      success: boolean;
      data: { token: string };
    }>("POST", "/admin/login", {
      body: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    });
    expectEqual(res.status, 200, "Login status");
    expect(!!res.body.data?.token, "Token present");
    authToken = res.body.data.token;
  });

  await test("Login with wrong password returns 401", async () => {
    const res = await request("POST", "/admin/login", {
      body: { username: ADMIN_USERNAME, password: "wrong-password" },
    });
    expectEqual(res.status, 401, "Status");
  });

  await test("Login with missing password returns 400", async () => {
    const res = await request("POST", "/admin/login", {
      body: { username: ADMIN_USERNAME },
    });
    expectEqual(res.status, 400, "Status");
  });

  // ─── Categories (public) ─────────────────────────────────
  await test("List categories returns 3 items", async () => {
    const res = await request<{
      success: boolean;
      data: unknown[];
    }>("GET", "/categories");
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.data.length, 3, "Categories count");
  });

  await test("Get category by slug works", async () => {
    const res = await request<{
      data: { slug: string };
    }>("GET", "/categories/slug/laptops");
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.data.slug, "laptops", "Slug");
  });

  await test("Get category by ID works", async () => {
    const res = await request("GET", `/categories/${categoryId}`);
    expectEqual(res.status, 200, "Status");
  });

  await test("Get non-existent category returns 404", async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request("GET", `/categories/${fakeId}`);
    expectEqual(res.status, 404, "Status");
  });

  // ─── Categories (protected) ──────────────────────────────
  await test("Create category without auth returns 401", async () => {
    const res = await request("POST", "/categories", {
      body: { name: { en: "Test", ar: "اختبار" } },
    });
    expectEqual(res.status, 401, "Status");
  });

  await test("Create category with auth returns 201", async () => {
    const res = await request<{ data: { _id: string; slug: string } }>(
      "POST",
      "/categories",
      {
        token: authToken,
        body: {
          name: { en: "Accessories", ar: "ملحقات" },
          slug: "accessories",
          order: 10,
        },
      },
    );
    expectEqual(res.status, 201, "Status");
    expectEqual(res.body.data.slug, "accessories", "Slug");
  });

  await test("Create duplicate category returns 409", async () => {
    const res = await request("POST", "/categories", {
      token: authToken,
      body: { name: { en: "Laptops", ar: "لابتوبات" } },
    });
    expectEqual(res.status, 409, "Status");
  });

  await test("Create category with invalid body returns 400", async () => {
    const res = await request("POST", "/categories", {
      token: authToken,
      body: { order: 5 }, // missing name
    });
    expectEqual(res.status, 400, "Status");
  });

  // ─── Products (public) ───────────────────────────────────
  await test("List products returns pagination", async () => {
    const res = await request<{
      data: unknown[];
      pagination: { total: number; page: number; limit: number };
    }>("GET", "/products");
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.pagination.total, 2, "Total products");
    expectEqual(res.body.pagination.page, 1, "Page");
  });

  await test("Get product by slug works", async () => {
    const res = await request<{ data: { slug: string } }>(
      "GET",
      "/products/slug/test-lenovo-loq-15",
    );
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.data.slug, "test-lenovo-loq-15", "Slug");
  });

  await test("Get product by ID works", async () => {
    const res = await request("GET", `/products/${productId}`);
    expectEqual(res.status, 200, "Status");
  });

  await test("Get non-existent product returns 404", async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request("GET", `/products/${fakeId}`);
    expectEqual(res.status, 404, "Status");
  });

  await test("Filter products by category", async () => {
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      `/products?category=${categoryId}`,
    );
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.pagination.total, 1, "Total");
  });

  await test("Filter products by featured", async () => {
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      "/products?featured=true",
    );
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.pagination.total, 1, "Total");
  });

  await test("Filter products by onSale", async () => {
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      "/products?onSale=true",
    );
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.pagination.total, 1, "Total");
  });

  await test("Sort products by price ascending", async () => {
    const res = await request<{ data: Array<{ price: number }> }>(
      "GET",
      "/products?sort=price-asc",
    );
    expectEqual(res.status, 200, "Status");
    const prices = res.body.data.map((p) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(
      JSON.stringify(prices) === JSON.stringify(sorted),
      `Prices not sorted: ${prices.join(", ")}`,
    );
  });

  // ─── Products (protected) ────────────────────────────────
  await test("Create product without auth returns 401", async () => {
    const res = await request("POST", "/products", {
      body: {
        name: { en: "X", ar: "س" },
        brand: "X",
        category: categoryId,
        condition: "new",
        price: 100,
        description: { en: "x", ar: "س" },
      },
    });
    expectEqual(res.status, 401, "Status");
  });

  await test("Create product with auth returns 201", async () => {
    const res = await request<{ data: { _id: string; slug: string } }>(
      "POST",
      "/products",
      {
        token: authToken,
        body: {
          name: { en: "Test ASUS ROG", ar: "أسوس ROG تجريبي" },
          brand: "ASUS",
          category: categoryId,
          condition: "new",
          price: 68000,
          stock: 3,
          description: {
            en: "High-end laptop",
            ar: "لابتوب راقي",
          },
          specifications: [
            {
              name: { en: "GPU", ar: "كرت الشاشة" },
              value: { en: "RTX 4070", ar: "RTX 4070" },
            },
          ],
          tags: ["gaming", "asus"],
        },
      },
    );
    expectEqual(res.status, 201, "Status");
    expect(!!res.body.data._id, "Has ID");
  });

  await test("Create product with invalid category returns 400", async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request("POST", "/products", {
      token: authToken,
      body: {
        name: { en: "Test", ar: "اختبار" },
        brand: "Test",
        category: fakeId,
        condition: "new",
        price: 100,
        description: { en: "test", ar: "اختبار" },
      },
    });
    expectEqual(res.status, 400, "Status");
  });

  await test("Create product with missing fields returns 400", async () => {
    const res = await request("POST", "/products", {
      token: authToken,
      body: { name: { en: "Test", ar: "اختبار" } },
    });
    expectEqual(res.status, 400, "Status");
  });

  // ─── Search ──────────────────────────────────────────────
  await test("Search by English name", async () => {
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      "/search?q=lenovo",
    );
    expectEqual(res.status, 200, "Status");
    expect(res.body.pagination.total >= 1, "Has results");
  });

  await test("Search by brand", async () => {
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      "/search?q=samsung",
    );
    expectEqual(res.status, 200, "Status");
    expect(res.body.pagination.total >= 1, "Has results");
  });

  await test("Search by specs (RTX 4060)", async () => {
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      "/search?q=RTX%204060",
    );
    expectEqual(res.status, 200, "Status");
    expect(res.body.pagination.total >= 1, "Has results");
  });

  await test("Search by Arabic name", async () => {
    const encoded = encodeURIComponent("لينوفو");
    const res = await request<{ pagination: { total: number } }>(
      "GET",
      `/search?q=${encoded}`,
    );
    expectEqual(res.status, 200, "Status");
    expect(res.body.pagination.total >= 1, "Has results");
  });

  await test("Search with missing q returns 400", async () => {
    const res = await request("GET", "/search");
    expectEqual(res.status, 400, "Status");
  });

  await test("Search with no results returns empty array", async () => {
    const res = await request<{ data: unknown[] }>(
      "GET",
      "/search?q=zzzznotexist",
    );
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.data.length, 0, "No results");
  });

  // ─── Update & Delete ─────────────────────────────────────
  await test("Update product with auth works", async () => {
    const res = await request<{ data: { price: number; stock: number } }>(
      "PUT",
      `/products/${productId}`,
      {
        token: authToken,
        body: { price: 42000, stock: 5 },
      },
    );
    expectEqual(res.status, 200, "Status");
    expectEqual(res.body.data.price, 42000, "Price updated");
    expectEqual(res.body.data.stock, 5, "Stock updated");
  });

  await test("Update product without auth returns 401", async () => {
    const res = await request("PUT", `/products/${productId}`, {
      body: { price: 999 },
    });
    expectEqual(res.status, 401, "Status");
  });

  await test("Delete category with products returns 409", async () => {
    const res = await request("DELETE", `/categories/${categoryId}`, {
      token: authToken,
    });
    expectEqual(res.status, 409, "Status");
  });
}

// ──────────────────────────────────────────────────────────────
// Report
// ──────────────────────────────────────────────────────────────

function printReport(): void {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Test Report");
  console.log("═══════════════════════════════════════════════════════\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  if (failed > 0) {
    console.log("❌ Failed tests:\n");
    for (const r of results.filter((x) => !x.passed)) {
      console.log(`   ✗ ${r.name}`);
      console.log(`     ${r.message}\n`);
    }
  }

  console.log("───────────────────────────────────────────────────────");
  console.log(`  Total:  ${total}`);
  console.log(`  Passed: ${passed} ✅`);
  console.log(`  Failed: ${failed} ${failed > 0 ? "❌" : ""}`);
  console.log(`  Time:   ${results.reduce((sum, r) => sum + r.duration, 0)}ms`);
  console.log("───────────────────────────────────────────────────────\n");
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (env.isProd) {
    console.error("❌ Cannot run tests in production environment");
    process.exit(1);
  }

  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ Connected\n");

    await resetAndSeed();
    await runTests();
    printReport();

    await mongoose.disconnect();
    console.log("👋 Disconnected\n");

    const failed = results.filter((r) => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Test suite crashed:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void main();
