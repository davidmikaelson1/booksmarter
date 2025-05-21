const pool = require('../connection');
const Librarian = require('../models/librarian.model');

class LibrarianRepository {
  static async findAll() {
    const query = 'SELECT * FROM Librarian';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Librarian.fromDatabase));
      });
    });
  }

  static async findById(userId) {
    const query = 'SELECT * FROM Librarian WHERE userId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? Librarian.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createLibrarian(librarian) {
    const query = `
      INSERT INTO Librarian (userId, librarianId)
      VALUES (?, ?)
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [librarian.userId, librarian.librarianId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  static async updateLibrarian(userId, librarian) {
    const query = `
      UPDATE Librarian
      SET librarianId = ?
      WHERE userId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [librarian.librarianId, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteLibrarian(librarianId) {
    const query = 'DELETE FROM Librarian WHERE librarianId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [librarianId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }
}

module.exports = LibrarianRepository;