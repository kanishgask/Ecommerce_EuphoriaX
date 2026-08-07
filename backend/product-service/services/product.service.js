const { v4: uuidv4 } = require('uuid');
const productRepository = require('../repositories/product.repository');

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
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
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

  async searchProducts(filters) {
    let products = await productRepository.getAllProducts({ category: filters.category });
    
    // In-memory text search fallback for prototype
    if (filters.query) {
      const query = filters.query.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    return products;
  }
}

module.exports = new ProductService();
