const pool = require('../connection');
const User = require('../models/user.model');

class AuthRepository {
  static async findByEmail(email) {
    const query = 'SELECT * FROM LibraryUser WHERE email = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? User.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createUser(userData) {
    const query = `
      INSERT INTO LibraryUser (name, email, passwordHash, terminalId, userType)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.terminalId,
      userData.userType,
    ];
    return new Promise((resolve, reject) => {
      pool.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.insertId); // Return the generated userId
      });
    });
  }

  static async createReader(userId, readerData) {
    const query = `
      INSERT INTO Reader (userId, pnc, address, phoneNumber)
      VALUES (?, ?, ?, ?)
    `;
    const params = [userId, readerData.pnc, readerData.address, readerData.phoneNumber];
    return new Promise((resolve, reject) => {
      pool.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      });
    });
  }

  static async createLibrarian(userId, userData) {
    const query = `
      INSERT INTO Librarian (userId, librarianId)
      VALUES (?, ?)
    `;
    const params = [userId, userData.librarianId];
    return new Promise((resolve, reject) => {
      pool.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      });
    });
  }

  static async updateReader(userId, readerData) {
    const query = `
      UPDATE Reader
      SET pnc = ?, address = ?, phoneNumber = ?
      WHERE userId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [readerData.pnc, readerData.address, readerData.phoneNumber, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async updateLibrarian(userId, librarianData) {
    const query = `
      UPDATE Librarian
      SET librarianId = ?
      WHERE userId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [librarianData.librarianId, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteReader(userId) {
    const query = 'DELETE FROM Reader WHERE userId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async deleteLibrarian(userId) {
    const query = 'DELETE FROM Librarian WHERE userId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
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

module.exports = AuthRepository;