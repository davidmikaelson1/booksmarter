const pool = require('../connection');
const Book = require('../models/book.model');

class BookRepository {
  static async findAll() {
    const query = 'SELECT * FROM Book';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Book.fromDatabase));
      });
    });
  }

  static async findById(bookId) {
    const query = 'SELECT * FROM Book WHERE bookId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [bookId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? Book.fromDatabase(results[0]) : null);
      });
    });
  }

  static async findByIds(bookIds) {
    if (bookIds.length === 0) return [];
    const query = `SELECT * FROM Book WHERE bookId IN (?)`;
    return new Promise((resolve, reject) => {
      pool.query(query, [bookIds], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Book.fromDatabase));
      });
    });
  }

  static async createBook(book) {
    const query = `
      INSERT INTO Book (title, author, genre, coverUrl)
      VALUES (?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [book.title, book.author, book.genre, book.coverUrl],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  static async updateBook(bookId, book) {
    const query = `
      UPDATE Book
      SET title = ?, author = ?, genre = ?, coverUrl = ?
      WHERE bookId = ?
    `;

    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [book.title, book.author, book.genre, book.coverUrl, bookId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteBook(bookId) {
    // First check if book has any instances
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM BookInstance 
      WHERE bookId = ?
    `;

    return new Promise((resolve, reject) => {
      pool.query(checkQuery, [bookId], (err, results) => {
        if (err) return reject(err);
        
        // If book has instances, we can safely delete due to CASCADE
        const query = 'DELETE FROM Book WHERE bookId = ?';
        pool.query(query, [bookId], (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        });
      });
    });
  }

  static async findInstanceCounts(bookId) {
    const query = `
      SELECT b.bookId, b.title, 
             COUNT(bi.instanceId) as totalInstances,
             SUM(bi.totalCopies) as totalCopies
      FROM Book b
      LEFT JOIN BookInstance bi ON b.bookId = bi.bookId
      WHERE b.bookId = ?
      GROUP BY b.bookId`;

    return new Promise((resolve, reject) => {
      pool.query(query, [bookId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }
}

module.exports = BookRepository;