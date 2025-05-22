const express = require('express');
const BookInstanceController = require('../controllers/bookInstance.controller');

const router = express.Router();

// Get all instances for a terminal
router.get('/:terminalId', BookInstanceController.getAllBookInstances);

// Create a new book instance
router.post('/', BookInstanceController.createBookInstance);

// Update instance total copies
router.patch('/:id', BookInstanceController.updateBookInstance);

// Delete instance
router.delete('/:id', BookInstanceController.deleteBookInstance);

// Get instances by IDs
router.post('/batch', BookInstanceController.getInstancesByIds);

module.exports = router;