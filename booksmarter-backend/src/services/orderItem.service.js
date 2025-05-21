const OrderItemRepository = require('../repositories/orderItem.repository');
const OrderItem = require('../models/orderItem.model');

class OrderItemService {
  static async getAllOrderItems() {
    return await OrderItemRepository.findAll();
  }

  static async getOrderItemById(orderItemId) {
    const orderItem = await OrderItemRepository.findById(orderItemId);
    if (!orderItem) {
      throw new Error('OrderItem not found');
    }
    return orderItem;
  }

  static async createOrderItem(orderItemData) {
    const orderItem = new OrderItem(
      null,
      orderItemData.orderId,
      orderItemData.bookId,
      orderItemData.quantity
    );
    const orderItemId = await OrderItemRepository.createOrderItem(orderItem);
    orderItem.id = orderItemId;
    return orderItem;
  }

  static async updateOrderItem(orderItemId, orderItemData) {
    const orderItem = new OrderItem(
      orderItemId,
      orderItemData.orderId,
      orderItemData.bookId,
      orderItemData.quantity
    );
    const success = await OrderItemRepository.updateOrderItem(orderItemId, orderItem);
    if (!success) {
      throw new Error('OrderItem not found');
    }
    return orderItem;
  }

  static async deleteOrderItem(orderItemId) {
    const success = await OrderItemRepository.deleteOrderItem(orderItemId);
    if (!success) {
      throw new Error('OrderItem not found');
    }
    return success;
  }
}

module.exports = OrderItemService;