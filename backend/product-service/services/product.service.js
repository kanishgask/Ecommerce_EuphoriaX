const { v4: uuidv4 } = require('uuid');
const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

class ProductService {
  async createProduct(data) {
    const product = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await productRepository.createProduct(product);
  }

  async getProductById(id) {
    const product = await productRepository.getProductById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id, data) {
    // Verify existence
    await this.getProductById(id);
    return await productRepository.updateProduct(id, data);
  }

  async deleteProduct(id) {
    // Verify existence
    await this.getProductById(id);
    await productRepository.deleteProduct(id);
  }

  async searchProducts(filters, limit, lastEvaluatedKey) {
    let result = await productRepository.getAllProducts({ category: filters.category }, limit, lastEvaluatedKey);
    
    // In-memory text search fallback for prototype
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result.items = result.items.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    return result;
  }
}

module.exports = new ProductService();
