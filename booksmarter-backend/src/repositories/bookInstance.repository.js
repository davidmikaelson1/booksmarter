const pool = require('../connection');
const BookInstance = require('../models/bookInstance.model');

class BookInstanceRepository {
  static async findAll(libraryId) {
    const query = `
      SELECT * FROM BookInstance
      JOIN BookCollection ON BookInstance.collectionId = BookCollection.collectionId
      WHERE BookCollection.terminalId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(query, [libraryId], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(BookInstance.fromDatabase));
      });
    });
  }

  static async findById(instanceId) {
    const query = 'SELECT * FROM BookInstance WHERE instanceId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [instanceId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? BookInstance.fromDatabase(results[0]) : null);
      });
    });
  }

  static async findByCollectionIds(collectionIds) {
    if (!collectionIds || !Array.isArray(collectionIds) || collectionIds.length === 0) {
      return [];
    }

    // Create the correct number of placeholders
    const placeholders = collectionIds.map(() => '?').join(',');
    
    const query = `
      SELECT bi.*, b.title, b.author, b.genre, b.coverUrl, bc.totalBooks, bc.totalRentedBooks
      FROM BookInstance bi
      JOIN Book b ON bi.bookId = b.bookId
      JOIN BookCollection bc ON bi.collectionId = bc.collectionId
      WHERE bi.collectionId IN (${placeholders})
    `;

    return new Promise((resolve, reject) => {
      // Pass the array values directly, not as a nested array
      pool.query(query, collectionIds, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err);
        }
        console.log('Query results:', results);
        resolve(results.map(row => ({
          instanceId: row.instanceId,
          bookId: row.bookId,
          collectionId: row.collectionId,
          totalCopies: row.totalCopies,
          availableCopies: row.availableCopies,
          title: row.title,
          author: row.author,
          genre: row.genre,
          coverUrl: row.coverUrl
        })));
      });
    });
  }

  static async createBookInstance(bookInstance) {
    const query = `
      INSERT INTO BookInstance (bookId, collectionId, totalCopies, availableCopies)
      VALUES (?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [bookInstance.bookId, bookInstance.collectionId, bookInstance.totalCopies, bookInstance.availableCopies],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  static async updateBookInstance(instanceId, bookInstance) {
    const query = `
      UPDATE BookInstance
      SET bookId = ?, collectionId = ?, totalCopies = ?, availableCopies = ?
      WHERE instanceId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [bookInstance.bookId, bookInstance.collectionId, bookInstance.totalCopies, bookInstance.availableCopies, instanceId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteBookInstance(instanceId) {
    const query = 'DELETE FROM BookInstance WHERE instanceId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [instanceId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async findByBookId(bookId) {
    const query = `
      SELECT bi.*, bc.terminalId
      FROM BookInstance bi
      JOIN BookCollection bc ON bi.collectionId = bc.collectionId
      WHERE bi.bookId = ?`;

    return new Promise((resolve, reject) => {
      pool.query(query, [bookId], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(BookInstance.fromDatabase));
      });
    });
  }

  static async updateAvailableCopies(instanceId, change) {
    const query = `
      UPDATE BookInstance 
      SET availableCopies = availableCopies + ?
      WHERE instanceId = ? 
      AND (availableCopies + ?) >= 0 
      AND (availableCopies + ?) <= totalCopies`;

    return new Promise((resolve, reject) => {
      pool.query(query, [change, instanceId, change, change], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async updateTotalCopies(instanceId, totalCopies) {
    const query = `
      UPDATE BookInstance 
      SET totalCopies = ?,
          availableCopies = GREATEST(0, ? - (totalCopies - availableCopies))
      WHERE instanceId = ?`;

    return new Promise((resolve, reject) => {
      pool.query(query, [totalCopies, totalCopies, instanceId], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows === 0) {
          return reject(new Error('Book instance not found'));
        }
        resolve(true);
      });
    });
  }

  static async updateTotalAndAvailableCopies(instanceId, totalCopies, availableCopies) {
    const query = `
      UPDATE BookInstance 
      SET totalCopies = ?,
          availableCopies = ?
      WHERE instanceId = ?`;

    return new Promise((resolve, reject) => {
      pool.query(query, [totalCopies, availableCopies, instanceId], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows === 0) {
          return reject(new Error('Book instance not found'));
        }
        resolve(true);
      });
    });
  }
}

module.exports = BookInstanceRepository;