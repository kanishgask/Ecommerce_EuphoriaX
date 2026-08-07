const productService = require('../services/product.service');
const { 
  createProductSchema, 
  updateProductSchema, 
  searchSchema 
} = require('../validators/product.validator');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const value = await createProductSchema.validateAsync(req.body);
      const product = await productService.createProduct(value);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const value = await updateProductSchema.validateAsync(req.body);
      const updatedProduct = await productService.updateProduct(req.params.id, value);
      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async searchProducts(req, res, next) {
    try {
      const { limit = 20, lastEvaluatedKey, ...filters } = req.query;
      const value = await searchSchema.validateAsync(filters);
      
      const parsedLimit = parseInt(limit, 10);
      const result = await productService.searchProducts(value, parsedLimit, lastEvaluatedKey);
      
      res.status(200).json({ 
        success: true, 
        data: result.items,
        meta: {
          lastEvaluatedKey: result.lastEvaluatedKey,
          limit: parsedLimit
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
