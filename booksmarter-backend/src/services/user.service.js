const UserRepository = require('../repositories/user.repository');
const ReaderRepository = require('../repositories/reader.repository');
const LibrarianRepository = require('../repositories/librarian.repository');
const User = require('../models/user.model');

class UserService {
  static async getAllUsers() {
    try {
      const users = await UserRepository.findAll();
      
      // Enhance with reader/librarian specific info if needed
      const enhancedUsers = await Promise.all(users.map(async (user) => {
        if (user.userType === 'reader') {
          const readerDetails = await ReaderRepository.findById(user.userId);
          if (readerDetails) {
            return {
              ...user,
              readerDetails
            };
          }
        } else if (user.userType === 'librarian') {
          const librarianDetails = await LibrarianRepository.findById(user.userId);
          if (librarianDetails) {
            return {
              ...user,
              librarianDetails
            };
          }
        }
        return user;
      }));
      
      return enhancedUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  static async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async createUser(userData) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = new User(
      null,
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.libraryId,
      userData.userType
    );

    const userId = await UserRepository.createUser(user);
    user.id = userId;

    if (user.userType === 'reader') {
      await ReaderService.createReader(userId, userData);
    } else if (user.userType === 'librarian') {
      await LibrarianService.createLibrarian(userId, userData);
    } else {
      throw new Error('Invalid user type');
    }

    return user;
  }

  static async updateUser(userId, userData) {
    const user = new User(
      userId,
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.libraryId,
      userData.userType
    );

    const success = await UserRepository.updateUser(userId, user);
    if (!success) {
      throw new Error('User not found');
    }
    return user;
  }

  static async deleteUser(userId, userType) {
    if (userType === 'reader') {
      await ReaderService.deleteReader(userId);
    } else if (userType === 'librarian') {
      await LibrarianService.deleteLibrarian(userId);
    } else {
      throw new Error('Invalid user type');
    }

    const success = await UserRepository.deleteUser(userId);
    if (!success) {
      throw new Error('User not found');
    }
    return success;
  }
}

module.exports = UserService;