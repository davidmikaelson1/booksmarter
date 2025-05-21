const pool = require('../connection');
const Collection = require('../models/collection.model');

class CollectionRepository {
  static async findAll(terminalId) {
    const query = 'SELECT * FROM BookCollection WHERE terminalId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [terminalId], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Collection.fromDatabase));
      });
    });
  }

  static async findById(collectionId, libraryId) {
    const query = 'SELECT * FROM BookCollection WHERE collectionId = ? AND terminalId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [collectionId, libraryId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? Collection.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createCollection(collection, terminalId) {
    const query = 'INSERT INTO BookCollection (terminalId, totalBooks, totalRentedBooks) VALUES (?, 0, 0)';
    return new Promise((resolve, reject) => {
      pool.query(query, [terminalId], (err, results) => {
        if (err) return reject(err);
        resolve(results.insertId);
      });
    });
  }

  static async updateCollection(collectionId, collection) {
    const query = `
      UPDATE BookCollection
      SET totalBooks = ?, totalRentedBooks = ?
      WHERE collectionId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query, 
        [collection.totalBooks, collection.totalRentedBooks, collectionId], 
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteCollection(collectionId) {
    const query = 'DELETE FROM BookCollection WHERE collectionId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [collectionId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async updateTotalCopies(collectionId, additionalCopies) {
    const query = `
      UPDATE BookCollection
      SET totalCopies = totalCopies + ?
      WHERE collectionId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(query, [additionalCopies, collectionId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async findCollectionStats(collectionId) {
    const query = `
      SELECT 
        bc.collectionId,
        bc.terminalId,
        bc.totalBooks,
        bc.totalRentedBooks,
        COUNT(DISTINCT bi.bookId) as uniqueBooks
      FROM BookCollection bc
      LEFT JOIN BookInstance bi ON bc.collectionId = bi.collectionId
      WHERE bc.collectionId = ?
      GROUP BY bc.collectionId`;

    return new Promise((resolve, reject) => {
      pool.query(query, [collectionId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  static async updateCollectionCounts(collectionId) {
    const query = `
      UPDATE BookCollection bc
      SET 
        totalBooks = (
          SELECT COALESCE(SUM(bi.totalCopies), 0)
          FROM BookInstance bi
          WHERE bi.collectionId = bc.collectionId
        ),
        totalRentedBooks = (
          SELECT COALESCE(SUM(bi.totalCopies - bi.availableCopies), 0)
          FROM BookInstance bi
          WHERE bi.collectionId = bc.collectionId
        )
      WHERE bc.collectionId = ?`;

    return new Promise((resolve, reject) => {
      pool.query(query, [collectionId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }
}

module.exports = CollectionRepository;