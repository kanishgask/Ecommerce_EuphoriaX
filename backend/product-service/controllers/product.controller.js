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
      const value = await searchSchema.validateAsync(req.query);
      const products = await productService.searchProducts(value);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
