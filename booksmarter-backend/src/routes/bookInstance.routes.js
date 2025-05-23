const express = require('express');
const BookInstanceController = require('../controllers/bookInstance.controller');

const router = express.Router();

// IMPORTANT: Move specific routes before parameter routes
// Create a new book instance
router.post('/', BookInstanceController.createBookInstance);

// Create a new book instance for a specific terminal
router.post('/terminal/:terminalId', BookInstanceController.createBookInstanceForTerminal);

// Get instances by IDs
router.post('/batch', BookInstanceController.getInstancesByIds);

// Get all instances for a terminal (put this LAST)
router.get('/:terminalId', BookInstanceController.getAllBookInstances);

// Update instance total copies
router.patch('/:id', BookInstanceController.updateBookInstance);

// Delete instance
router.delete('/:id', BookInstanceController.deleteBookInstance);

module.exports = router;