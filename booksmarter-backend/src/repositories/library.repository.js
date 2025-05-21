const pool = require('../connection');
const Library = require('../models/library.model');

class LibraryRepository {
  static async findAll() {
    const query = 'SELECT * FROM Library';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Library.fromDatabase));
      });
    });
  }

  static async findById(terminalId) {
    const query = 'SELECT * FROM Library WHERE terminalId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [terminalId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? Library.fromDatabase(results[0]) : null);
      });
    });
  }

  static async create(library) {
    const query = 'INSERT INTO Library (name) VALUES (?)';
    return new Promise((resolve, reject) => {
      pool.query(query, [library.name], (err, results) => {
        if (err) return reject(err);
        resolve(results.insertId);
      });
    });
  }

  static async update(terminalId, library) {
    const query = 'UPDATE Library SET name = ? WHERE terminalId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [library.name, terminalId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async delete(terminalId) {
    const query = 'DELETE FROM Library WHERE terminalId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [terminalId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }
}

module.exports = LibraryRepository;