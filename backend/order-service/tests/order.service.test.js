const orderService = require('../services/order.service');
const orderRepository = require('../repositories/order.repository');
const eventPublisher = require('../utils/publisher');

jest.mock('../repositories/order.repository');
jest.mock('../utils/publisher');

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const userId = 'user-123';
      const orderData = {
        items: [{ price: 100, quantity: 2 }, { price: 50, quantity: 1 }],
        shippingAddress: '123 Main St'
      };

      const expectedTotalAmount = 250;
      
      const mockCreatedOrder = {
        id: 'mock-uuid',
        userId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        totalAmount: expectedTotalAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      orderRepository.createOrder.mockResolvedValue(mockCreatedOrder);
      
      process.env.SNS_ORDER_EVENTS_TOPIC = 'arn:aws:sns:us-east-1:123456789012:test-topic';
      
      const result = await orderService.createOrder(userId, orderData);

      expect(orderRepository.createOrder).toHaveBeenCalledTimes(1);
      expect(orderRepository.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        totalAmount: expectedTotalAmount,
        status: 'PENDING',
      }));
      
      expect(eventPublisher.publish).toHaveBeenCalledTimes(1);
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        process.env.SNS_ORDER_EVENTS_TOPIC,
        'OrderCreated',
        mockCreatedOrder
      );
      
      expect(result).toEqual(mockCreatedOrder);
    });

    it('should not publish event if topic ARN is not set', async () => {
      const userId = 'user-123';
      const orderData = {
        items: [],
        shippingAddress: '123 Main St'
      };

      const mockCreatedOrder = {
        id: 'mock-uuid',
        userId,
        items: [],
        shippingAddress: '123 Main St',
        totalAmount: 0,
        status: 'PENDING'
      };

      orderRepository.createOrder.mockResolvedValue(mockCreatedOrder);
      
      delete process.env.SNS_ORDER_EVENTS_TOPIC;
      
      const result = await orderService.createOrder(userId, orderData);

      expect(orderRepository.createOrder).toHaveBeenCalledTimes(1);
      expect(eventPublisher.publish).not.toHaveBeenCalled();
      
      expect(result).toEqual(mockCreatedOrder);
    });
  });

  describe('getOrderById', () => {
    it('should return order if found and userId matches', async () => {
      const mockOrder = { id: 'order-1', userId: 'user-123' };
      orderRepository.getOrderById.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order-1', 'user-123');

      expect(orderRepository.getOrderById).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(mockOrder);
    });

    it('should throw error if order not found', async () => {
      orderRepository.getOrderById.mockResolvedValue(null);

      await expect(orderService.getOrderById('order-1', 'user-123')).rejects.toThrow('Order not found');
    });

    it('should throw error if userId does not match', async () => {
      const mockOrder = { id: 'order-1', userId: 'user-456' };
      orderRepository.getOrderById.mockResolvedValue(mockOrder);

      await expect(orderService.getOrderById('order-1', 'user-123')).rejects.toThrow('Unauthorized access to order');
    });
  });

  describe('getUserOrders', () => {
    it('should return list of orders for the user', async () => {
      const mockOrders = [{ id: 'order-1', userId: 'user-123' }];
      orderRepository.getOrdersByUser.mockResolvedValue(mockOrders);

      const result = await orderService.getUserOrders('user-123');

      expect(orderRepository.getOrdersByUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status if order exists', async () => {
      const mockOrder = { id: 'order-1', status: 'PENDING' };
      const updatedOrder = { id: 'order-1', status: 'SHIPPED' };
      orderRepository.getOrderById.mockResolvedValue(mockOrder);
      orderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus('order-1', 'SHIPPED');

      expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith('order-1', 'SHIPPED');
      expect(result).toEqual(updatedOrder);
    });

    it('should throw error if order does not exist', async () => {
      orderRepository.getOrderById.mockResolvedValue(null);

      await expect(orderService.updateOrderStatus('order-1', 'SHIPPED')).rejects.toThrow('Order not found');
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const mockOrders = [{ id: 'order-1' }, { id: 'order-2' }];
      orderRepository.getAllOrders.mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(orderRepository.getAllOrders).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });
});
