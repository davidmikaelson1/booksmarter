const pool = require('../connection');
const User = require('../models/user.model');

class UserRepository {
  static async findByEmail(email) {
    const query = 'SELECT * FROM LibraryUser WHERE email = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? User.fromDatabase(results[0]) : null);
      });
    });
  }

  static async findAll() {
    const query = 'SELECT * FROM LibraryUser';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        // Map the results to User objects, excluding passwordHash
        const users = results.map(row => {
          const user = User.fromDatabase(row);
          delete user.passwordHash; // Don't send passwords to client
          return user;
        });
        resolve(users);
      });
    });
  }

  static async findById(userId) {
    const query = 'SELECT * FROM LibraryUser WHERE userId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? User.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createUser(user) {
    const query = `
      INSERT INTO LibraryUser (name, email, passwordHash, terminalId, userType)
      VALUES (?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [user.name, user.email, user.passwordHash, user.terminalId, user.userType],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  static async updateUser(userId, user) {
    const query = `
      UPDATE LibraryUser
      SET name = ?, email = ?, passwordHash = ?, terminalId = ?, userType = ?
      WHERE userId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [user.name, user.email, user.passwordHash, user.terminalId, user.userType, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteUser(userId) {
    const query = 'DELETE FROM LibraryUser WHERE userId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }
}

module.exports = UserRepository;