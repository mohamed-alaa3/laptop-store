/**
 * Generate a URL-safe slug from a string.
 * Handles both English and Arabic (transliterates Arabic to Latin).
 * Falls back to a random suffix if the result is empty.
 */
export function slugify(input: string): string {
  if (!input || typeof input !== "string") {
    return generateRandomSlug();
  }

  const slug = input
    .toString()
    .normalize("NFKD") // decompose accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // keep only a-z, 0-9, space, dash
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

  if (!slug) {
    return generateRandomSlug();
  }

  return slug;
}

function generateRandomSlug(): string {
  return `item-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}
