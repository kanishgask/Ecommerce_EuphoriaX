const repo = require('../repositories/productRepository');
const { newProduct } = require('../models/productModel');
const { publishProductEvent } = require('./eventPublisher');
const { AppError } = require('../middleware/errorHandler');

async function createProduct(input) {
  const product = newProduct(input);
  await repo.create(product);
  await publishProductEvent('ProductCreated', product);
  return product;
}

async function getProduct(productId) {
  const product = await repo.getById(productId);
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

async function getProductBySlug(slug) {
  const product = await repo.getBySlug(slug);
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

async function updateProduct(productId, patch) {
  const { version, ...rest } = patch;
  try {
    const updated = await repo.update(productId, rest, version);
    await publishProductEvent('ProductUpdated', updated);
    return updated;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new AppError('Product was modified elsewhere. Please refresh and retry.', 409);
    }
    throw err;
  }
}

async function deleteProduct(productId) {
  const existing = await repo.getById(productId);
  if (!existing) throw new AppError('Product not found', 404);
  await repo.remove(productId);
  await publishProductEvent('ProductDeleted', { productId });
  return true;
}

async function listProducts({ category, limit, cursor }) {
  if (category) return repo.listByCategory(category, { limit, cursor });
  return repo.listAll({ limit, cursor });
}

async function searchProducts(keyword) {
  if (!keyword || keyword.trim().length === 0) throw new AppError('Search query is required', 422);
  return repo.searchByKeyword(keyword.trim());
}

module.exports = { createProduct, getProduct, getProductBySlug, updateProduct, deleteProduct, listProducts, searchProducts };
