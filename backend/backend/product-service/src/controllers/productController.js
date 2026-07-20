const service = require('../services/productService');
const { success } = require('../utils/response');

async function create(req, res, next) {
  try {
    const product = await service.createProduct(req.body);
    return success(res, 201, product, 'Product created');
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const product = await service.getProduct(req.params.productId);
    return success(res, 200, product);
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const product = await service.getProductBySlug(req.params.slug);
    return success(res, 200, product);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateProduct(req.params.productId, req.body);
    return success(res, 200, updated, 'Product updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.deleteProduct(req.params.productId);
    return success(res, 200, null, 'Product deleted');
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { category, limit, cursor } = req.query;
    const result = await service.listProducts({ category, limit: limit ? Number(limit) : undefined, cursor });
    return success(res, 200, result);
  } catch (err) { next(err); }
}

async function search(req, res, next) {
  try {
    const results = await service.searchProducts(req.query.q);
    return success(res, 200, { items: results, count: results.length });
  } catch (err) { next(err); }
}

module.exports = { create, getById, getBySlug, update, remove, list, search };
