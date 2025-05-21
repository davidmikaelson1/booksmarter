const express = require('express');
const UserController = require('../controllers/user.controller');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users
router.get('/', UserController.getAllUsers);

// Get specific user
router.get('/:id', UserController.getUserById);

// Update user
router.put('/:id', UserController.updateUser);

// Delete user
router.delete('/:id', UserController.deleteUser);

module.exports = router;