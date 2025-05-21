const express = require('express');
const OrderController = require('../controllers/order.controller');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Existing routes
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

// Rental and Return routes
router.post('/rent', OrderController.rentBook);
router.get('/reader/:readerId', OrderController.getReaderRentedBooks);
router.post('/:rentId/return', OrderController.initiateReturn);
router.post('/:rentId/authorize-return', OrderController.authorizeReturn);
router.post('/:rentId/authorize-rental', OrderController.approveRental); // New endpoint
router.get('/pending/returns', OrderController.getPendingReturns);
router.get('/pending/rentals', OrderController.getPendingRentals); // New endpoint
router.put('/:rentId/complete', OrderController.markOrderCompleted); // Mark order as completed

module.exports = router;