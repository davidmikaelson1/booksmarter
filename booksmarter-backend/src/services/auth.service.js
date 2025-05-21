const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AuthRepository = require('../repositories/auth.repository');
const ReaderService = require('../services/reader.service');
const LibrarianService = require('../services/librarian.service');
require('dotenv').config();

class AuthService {
  static async signup(userData) {
    try {
      console.log('Signup data received:', JSON.stringify(userData));
      
      // Validate required fields
      if (!userData.name || !userData.email || !userData.password || 
          !userData.terminalId || !userData.userType) {
        throw new Error('Missing required fields');
      }
      
      if (userData.userType !== 'reader' && userData.userType !== 'librarian') {
        throw new Error('Invalid user type');
      }

      // Check specific fields based on user type
      if (userData.userType === 'reader' && 
          (!userData.pnc || !userData.address || !userData.phoneNumber)) {
        throw new Error('Missing required reader fields');
      }
      
      if (userData.userType === 'librarian' && !userData.librarianId) {
        throw new Error('Missing librarian ID');
      }

      const existingUser = await AuthRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      
      // Replace plain password with hash
      userData.passwordHash = passwordHash;
      delete userData.password;

      // Create base user
      const userId = await AuthRepository.createUser(userData);
      
      // Create role-specific record
      if (userData.userType === 'reader') {
        await AuthRepository.createReader(userId, userData);
      } else if (userData.userType === 'librarian') {
        await AuthRepository.createLibrarian(userId, userData);
      }
      
      return { userId, name: userData.name, email: userData.email, userType: userData.userType };
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const user = await AuthRepository.findByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare password using bcrypt
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign(
        { 
          userId: user.userId,
          email: user.email, 
          userType: user.userType,
          terminalId: user.terminalId
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '8h' }
      );

      return {
        token,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          userType: user.userType,
          terminalId: user.terminalId,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;