const AuthService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

class AuthController {
  static async login(req, res, next) {
    try {
      const credentials = req.body;
      const response = await AuthService.login(credentials);

      // Set the auth token as a cookie
      res.cookie('authToken', response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only https in production
        sameSite: 'lax', // Changed from 'strict' to allow cross-site requests
        maxAge: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
      });

      // Send the token and user details in the response
      res.status(200).json(response);
    } catch (error) {
      next({ status: 401, message: error.message }); // Pass error to middleware
    }
  }

  static async signup(req, res, next) {
    try {
      const user = await AuthService.signup(req.body);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      next({ status: 400, message: error.message }); // Pass error to middleware
    }
  }

  static async logout(req, res) {
    res.clearCookie('authToken', { path: '/' });
    res.status(200).json({ message: 'Logged out successfully' });
  }

  static async getActiveUser(req, res) {
    try {
      const user = req.user; // Retrieved from `authenticateToken` middleware
      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ error: 'User not authenticated' });
    }
  }
}

module.exports = AuthController;