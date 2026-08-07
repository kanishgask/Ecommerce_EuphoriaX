const cartRepository = require('../repositories/cart.repository');

class CartService {
  async getCart(userId) {
    return await cartRepository.getCart(userId);
  }

  async addItem(userId, productId, quantity) {
    const cart = await cartRepository.getCart(userId);
    
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    return await cartRepository.saveCart(cart);
  }

  async updateQuantity(userId, productId, quantity) {
    const cart = await cartRepository.getCart(userId);
    
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      const error = new Error('Item not found in cart');
      error.statusCode = 404;
      throw error;
    }

    cart.items[itemIndex].quantity = quantity;
    return await cartRepository.saveCart(cart);
  }

  async removeItem(userId, productId) {
    const cart = await cartRepository.getCart(userId);
    
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    return await cartRepository.saveCart(cart);
  }

  async clearCart(userId) {
    await cartRepository.clearCart(userId);
    return { userId, items: [], updatedAt: new Date().toISOString() };
  }
}

module.exports = new CartService();
