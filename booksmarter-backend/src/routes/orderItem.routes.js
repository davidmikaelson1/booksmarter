const express = require('express');
const OrderItemController = require('../controllers/orderItem.controller');

const router = express.Router();

router.get('/', OrderItemController.getAllOrderItems);
router.get('/:id', OrderItemController.getOrderItemById);
router.post('/', OrderItemController.createOrderItem);
router.put('/:id', OrderItemController.updateOrderItem);
router.delete('/:id', OrderItemController.deleteOrderItem);

module.exports = router;