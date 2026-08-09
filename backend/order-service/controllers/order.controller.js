const orderService = require('../services/order.service');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const userId = req.user.sub;
      const value = await createOrderSchema.validateAsync(req.body);
      const order = await orderService.createOrder(userId, value);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const userId = req.user.sub;
      const orderId = req.params.id;
      const order = await orderService.getOrderById(orderId, userId);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.sub;
      const orders = await orderService.getUserOrders(userId);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      // Typically protected by admin middleware or internal VPC invocation
      const orderId = req.params.id;
      const value = await updateOrderStatusSchema.validateAsync(req.body);
      const order = await orderService.updateOrderStatus(orderId, value.status);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
