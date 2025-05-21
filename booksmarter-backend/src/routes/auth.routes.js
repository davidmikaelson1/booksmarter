const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout); // Logout route
router.get('/me', authenticateToken, AuthController.getActiveUser); // Get active user route

module.exports = router;