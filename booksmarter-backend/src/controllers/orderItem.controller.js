const OrderItemService = require('../services/orderItem.service');

class OrderItemController {
  static async getAllOrderItems(req, res) {
    try {
      const orderItems = await OrderItemService.getAllOrderItems();
      res.status(200).json(orderItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOrderItemById(req, res) {
    try {
      const orderItem = await OrderItemService.getOrderItemById(req.params.id);
      res.status(200).json(orderItem);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createOrderItem(req, res) {
    try {
      const orderItem = await OrderItemService.createOrderItem(req.body);
      res.status(201).json({ message: 'OrderItem created successfully', orderItem });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateOrderItem(req, res) {
    try {
      const orderItem = await OrderItemService.updateOrderItem(req.params.id, req.body);
      res.status(200).json({ message: 'OrderItem updated successfully', orderItem });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteOrderItem(req, res) {
    try {
      await OrderItemService.deleteOrderItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = OrderItemController;