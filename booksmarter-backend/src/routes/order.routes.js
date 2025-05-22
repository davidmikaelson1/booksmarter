const express = require('express');
const orderController = require('../controllers/order.controller');
const router = express.Router();

// Reader order routes
router.get('/', orderController.getAllOrders); // Add this line
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.get('/reader/:readerId', orderController.getReaderOrders);
router.post('/:id/return', orderController.initiateReturn);

// Librarian order management routes
router.put('/:id/approve', orderController.approveOrder);
router.put('/:id/deny', orderController.denyOrder);
router.delete('/:id', orderController.deleteOrder);
router.put('/:id/return/approve', orderController.approveReturn);

// Library terminal routes (for librarians)
router.get('/terminal/:terminalId', orderController.getLibrarianOrders);
router.get('/terminal/:terminalId/pending-approval', orderController.getPendingApprovalOrders);
router.get('/terminal/:terminalId/pending-return', orderController.getPendingReturnOrders);

// Add this route to your order routes
router.get('/book-instances/:id/book', orderController.getBookForInstance);

module.exports = router;