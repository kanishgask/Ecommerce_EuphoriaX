const orderController = require('../controllers/order.controller');
const orderService = require('../services/order.service');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');

jest.mock('../services/order.service');
jest.mock('../validators/order.validator', () => ({
  createOrderSchema: { validateAsync: jest.fn() },
  updateOrderStatusSchema: { validateAsync: jest.fn() }
}));

describe('OrderController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { sub: 'user-123' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      req.body = { items: [{ id: 1 }] };
      createOrderSchema.validateAsync.mockResolvedValue(req.body);
      orderService.createOrder.mockResolvedValue({ id: 'order-1' });

      await orderController.createOrder(req, res, next);

      expect(createOrderSchema.validateAsync).toHaveBeenCalledWith(req.body);
      expect(orderService.createOrder).toHaveBeenCalledWith('user-123', req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'order-1' } });
    });

    it('should call next with error if validation fails', async () => {
      const error = new Error('Validation Error');
      createOrderSchema.validateAsync.mockRejectedValue(error);

      await orderController.createOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getOrderById', () => {
    it('should return an order successfully', async () => {
      req.params.id = 'order-1';
      orderService.getOrderById.mockResolvedValue({ id: 'order-1', userId: 'user-123' });

      await orderController.getOrderById(req, res, next);

      expect(orderService.getOrderById).toHaveBeenCalledWith('order-1', 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'order-1', userId: 'user-123' } });
    });

    it('should call next with error if service throws', async () => {
      req.params.id = 'order-1';
      const error = new Error('Not found');
      orderService.getOrderById.mockRejectedValue(error);

      await orderController.getOrderById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders successfully', async () => {
      orderService.getUserOrders.mockResolvedValue([{ id: 'order-1' }]);

      await orderController.getUserOrders(req, res, next);

      expect(orderService.getUserOrders).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'order-1' }] });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      req.params.id = 'order-1';
      req.body = { status: 'SHIPPED' };
      updateOrderStatusSchema.validateAsync.mockResolvedValue(req.body);
      orderService.updateOrderStatus.mockResolvedValue({ id: 'order-1', status: 'SHIPPED' });

      await orderController.updateOrderStatus(req, res, next);

      expect(updateOrderStatusSchema.validateAsync).toHaveBeenCalledWith(req.body);
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', 'SHIPPED');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'order-1', status: 'SHIPPED' } });
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders successfully', async () => {
      orderService.getAllOrders.mockResolvedValue([{ id: 'order-1' }, { id: 'order-2' }]);

      await orderController.getAllOrders(req, res, next);

      expect(orderService.getAllOrders).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'order-1' }, { id: 'order-2' }] });
    });
  });
});
