const cartService = require('../services/cart.service');
const { addItemSchema, updateQuantitySchema } = require('../validators/cart.validator');

class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user.sub;
      const cart = await cartService.getCart(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const userId = req.user.sub;
      const value = await addItemSchema.validateAsync(req.body);
      const cart = await cartService.addItem(userId, value.productId, value.quantity);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  async updateQuantity(req, res, next) {
    try {
      const userId = req.user.sub;
      const productId = req.params.productId;
      const value = await updateQuantitySchema.validateAsync(req.body);
      const cart = await cartService.updateQuantity(userId, productId, value.quantity);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const userId = req.user.sub;
      const productId = req.params.productId;
      const cart = await cartService.removeItem(userId, productId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const userId = req.user.sub;
      const cart = await cartService.clearCart(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
