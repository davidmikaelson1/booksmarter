const pool = require('../connection');
const Reader = require('../models/reader.model');

class ReaderRepository {
  static async findAll() {
    const query = 'SELECT * FROM Reader';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Reader.fromDatabase));
      });
    });
  }

  static async findById(userId) {
    const query = 'SELECT * FROM Reader WHERE userId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? Reader.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createReader(reader) {
    const query = `
      INSERT INTO Reader (userId, pnc, address, phoneNumber)
      VALUES (?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [reader.userId, reader.pnc, reader.address, reader.phoneNumber],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  static async updateReader(userId, reader) {
    const query = `
      UPDATE Reader
      SET pnc = ?, address = ?, phoneNumber = ?
      WHERE userId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [reader.pnc, reader.address, reader.phoneNumber, userId],
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
}

module.exports = ReaderRepository;