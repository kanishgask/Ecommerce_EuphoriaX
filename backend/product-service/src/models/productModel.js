/**
 * DynamoDB item shape for the Products table.
 * Table: PRODUCTS_TABLE_NAME
 * PK: productId
 * GSI1 (CategoryIndex): category (HASH), createdAt (RANGE) — browse-by-category
 * GSI2 (SlugIndex): slug (HASH) — SEO-friendly product detail lookups
 *
 * {
 *   productId, slug, name, description, category, brand,
 *   price, currency, stockHint, images: string[], attributes: object,
 *   status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
 *   ratingAverage, ratingCount,
 *   createdAt, updatedAt, version
 * }
 */
const { v4: uuidv4 } = require('uuid');

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function newProduct(input) {
  const now = new Date().toISOString();
  const productId = uuidv4();
  return {
    productId,
    slug: `${slugify(input.name)}-${productId.slice(0, 8)}`,
    name: input.name,
    description: input.description,
    category: input.category,
    brand: input.brand || null,
    price: input.price,
    currency: input.currency || 'USD',
    stockHint: input.stockHint ?? 0,
    images: input.images || [],
    attributes: input.attributes || {},
    status: input.status || 'ACTIVE',
    ratingAverage: 0,
    ratingCount: 0,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

module.exports = { newProduct, slugify };
