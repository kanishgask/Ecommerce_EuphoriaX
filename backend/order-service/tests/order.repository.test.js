const orderRepository = require('../repositories/order.repository');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

jest.mock('../config/aws', () => ({
  ddbDocClient: {
    send: jest.fn()
  }
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn(),
  GetCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  QueryCommand: jest.fn(),
  ScanCommand: jest.fn()
}));

jest.mock('../config/config', () => ({
  aws: {
    dynamodb: {
      ordersTable: 'OrdersTable'
    }
  }
}));

describe('OrderRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order in dynamodb', async () => {
      const order = { id: 'order-1', userId: 'user-1' };
      ddbDocClient.send.mockResolvedValue({});
      
      const result = await orderRepository.createOrder(order);
      
      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'OrdersTable',
        Item: order
      });
      expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(order);
    });
  });

  describe('getOrderById', () => {
    it('should get an order by id from dynamodb', async () => {
      const order = { id: 'order-1', userId: 'user-1' };
      ddbDocClient.send.mockResolvedValue({ Item: order });
      
      const result = await orderRepository.getOrderById('order-1');
      
      expect(GetCommand).toHaveBeenCalledWith({
        TableName: 'OrdersTable',
        Key: { id: 'order-1' }
      });
      expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(order);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update an order status in dynamodb', async () => {
      const updatedOrder = { id: 'order-1', status: 'SHIPPED' };
      ddbDocClient.send.mockResolvedValue({ Attributes: updatedOrder });
      
      const result = await orderRepository.updateOrderStatus('order-1', 'SHIPPED');
      
      expect(UpdateCommand).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'OrdersTable',
        Key: { id: 'order-1' },
        ExpressionAttributeValues: expect.objectContaining({
          ':status': 'SHIPPED'
        })
      }));
      expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('getOrdersByUser', () => {
    it('should query orders by user id', async () => {
      const orders = [{ id: 'order-1', userId: 'user-1' }];
      ddbDocClient.send.mockResolvedValue({ Items: orders });
      
      const result = await orderRepository.getOrdersByUser('user-1');
      
      expect(QueryCommand).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'OrdersTable',
        IndexName: 'UserIdIndex',
        ExpressionAttributeValues: { ':userId': 'user-1' }
      }));
      expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(orders);
    });

    it('should return empty array on failure', async () => {
      ddbDocClient.send.mockRejectedValue(new Error('Index not found'));
      
      const result = await orderRepository.getOrdersByUser('user-1');
      
      expect(result).toEqual([]);
    });
  });

  describe('getAllOrders', () => {
    it('should scan all orders', async () => {
      const orders = [{ id: 'order-1' }, { id: 'order-2' }];
      ddbDocClient.send.mockResolvedValue({ Items: orders });
      
      const result = await orderRepository.getAllOrders();
      
      expect(ScanCommand).toHaveBeenCalledWith({ TableName: 'OrdersTable' });
      expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(orders);
    });
    
    it('should return empty array on failure', async () => {
      ddbDocClient.send.mockRejectedValue(new Error('Table not found'));
      
      const result = await orderRepository.getAllOrders();
      
      expect(result).toEqual([]);
    });
  });
});
