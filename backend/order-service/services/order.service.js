const { v4: uuidv4 } = require('uuid');
const orderRepository = require('../repositories/order.repository');
const eventPublisher = require('../utils/publisher');
const AppError = require('../utils/AppError');

class OrderService {
  async createOrder(userId, orderData) {
    const { items, shippingAddress } = orderData;
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const order = {
      id: uuidv4(),
      userId,
      items,
      shippingAddress,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdOrder = await orderRepository.createOrder(order);

    // Publish event
    try {
      const topicArn = process.env.SNS_ORDER_EVENTS_TOPIC;
      if (topicArn) {
        await eventPublisher.publish(topicArn, 'OrderCreated', createdOrder);
      } else {
        console.warn('SNS_ORDER_EVENTS_TOPIC not set, skipping event publication');
      }
    } catch (e) {
      console.error('Failed to publish OrderCreated event', e);
      // In production, might want an outbox pattern here
    }

    return createdOrder;
  }

  async getOrderById(orderId, userId) {
    const order = await orderRepository.getOrderById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw new AppError('Unauthorized access to order', 403);
    }

    return order;
  }

  async getUserOrders(userId) {
    return await orderRepository.getOrdersByUser(userId);
  }

  async updateOrderStatus(orderId, status) {
    // This is typically called by an admin or by background SQS workers processing payment events
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return await orderRepository.updateOrderStatus(orderId, status);
  }

  async getAllOrders() {
    return await orderRepository.getAllOrders();
  }
}

module.exports = new OrderService();
