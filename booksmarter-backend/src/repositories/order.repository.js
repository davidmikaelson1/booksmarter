const pool = require('../connection');
const Order = require('../models/order.model');

class OrderRepository {
  static async findAll() {
    const query = 'SELECT * FROM `Order`';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Order.fromDatabase));
      });
    });
  }

  static async findById(rentId) {
    const query = 'SELECT * FROM `Order` WHERE rentId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [rentId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? Order.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createOrder(order) {
    const query = `
      INSERT INTO \`Order\` (readerId, rentedBookId, rentDate, returnDeadline, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [order.readerId, order.instanceId, order.rentDate, order.returnDeadline, order.status],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  static async updateOrder(rentId, order) {
    const query = `
      UPDATE \`Order\`
      SET readerId = ?, rentedBookId = ?, rentDate = ?, returnDeadline = ?, 
          returnDate = ?, status = ?, returnNotes = ?, librarianId = ?
      WHERE rentId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [
          order.readerId, 
          order.instanceId, 
          order.rentDate, 
          order.returnDeadline, 
          order.returnDate,
          order.status,
          order.returnNotes,
          order.librarianId,
          rentId
        ],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteOrder(rentId) {
    const query = 'DELETE FROM `Order` WHERE rentId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [rentId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  static async findAllByReader(readerId) {
    const query = 'SELECT * FROM `Order` WHERE readerId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [readerId], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(Order.fromDatabase));
      });
    });
  }

  static async updateOrderStatus(rentId, status) {
    const query = 'UPDATE `Order` SET status = ? WHERE rentId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [status, rentId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  /**
   * Get book instance data for rental
   */
  static async getBookInstanceForRental(instanceId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT bi.*, b.title, b.author, b.genre, b.coverUrl FROM BookInstance bi ' +
        'JOIN Book b ON bi.bookId = b.bookId ' +
        'WHERE bi.instanceId = ?',
        [instanceId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  }

  /**
   * Count pending rental requests for a book instance
   */
  static async countPendingRequests(instanceId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT COUNT(*) as count FROM `Order` WHERE rentedBookId = ? AND status = "PENDING_APPROVAL"',
        [instanceId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0].count);
        }
      );
    });
  }

  /**
   * Create a rental request
   */
  static async createRentalRequest(readerId, instanceId, rentDate, returnDeadline, status) {
    return new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO `Order` (readerId, rentedBookId, rentDate, returnDeadline, status) VALUES (?, ?, ?, ?, ?)',
        [readerId, instanceId, rentDate, returnDeadline, status],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  /**
   * Get order with book instance data
   */
  static async getOrderWithInstanceData(rentId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT o.*, bi.collectionId, bi.availableCopies FROM `Order` o ' +
        'JOIN BookInstance bi ON o.rentedBookId = bi.instanceId ' +
        'WHERE o.rentId = ?',
        [rentId],
        (err, results) => {
          if (err) return reject(err);
          if (results.length === 0) {
            return reject(new Error('Order not found'));
          }
          resolve(results[0]);
        }
      );
    });
  }

  /**
   * Update order status and notes by librarian
   */
  static async updateOrderStatusByLibrarian(rentId, status, notes, librarianId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'UPDATE `Order` SET status = ?, returnNotes = ?, librarianId = ? WHERE rentId = ?',
        [status, notes, librarianId, rentId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  /**
   * Update book instance availability
   */
  static async updateBookInstanceAvailability(instanceId, increment) {
    const operation = increment ? '+' : '-';
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE BookInstance SET availableCopies = availableCopies ${operation} 1 WHERE instanceId = ?`,
        [instanceId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  /**
   * Update collection rental count
   */
  static async updateCollectionRentalCount(collectionId, increment) {
    const operation = increment ? '-' : '+';
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE BookCollection SET totalRentedBooks = totalRentedBooks ${operation} 1 WHERE collectionId = ?`,
        [collectionId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  /**
   * Record penalty for late/damaged return
   */
  static async recordPenalty(rentId, amount, reason) {
    return new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO Penalty (rentId, amount, reason) VALUES (?, ?, ?)',
        [rentId, amount, reason],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }

  /**
   * Get pending rental requests for a terminal
   */
  static async getPendingRentalRequests(terminalId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT o.*, b.bookId, b.title, b.author, b.genre, b.coverUrl, u.name as readerName
         FROM \`Order\` o
         JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
         JOIN BookCollection bc ON bi.collectionId = bc.collectionId
         JOIN Book b ON bi.bookId = b.bookId
         JOIN LibraryUser u ON o.readerId = u.userId
         WHERE bc.terminalId = ? AND o.status = 'PENDING_APPROVAL'
         ORDER BY o.rentDate ASC`,
        [terminalId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  /**
   * Get reader's active rentals
   */
  static async getReaderRentedBooks(readerId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT o.*, b.bookId, b.title, b.author, b.genre, b.coverUrl
         FROM \`Order\` o
         JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
         JOIN Book b ON bi.bookId = b.bookId
         WHERE o.readerId = ? AND o.status IN ('ACTIVE', 'PENDING_RETURN')
         ORDER BY o.rentDate DESC`,
        [readerId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  /**
   * Get pending returns for a terminal
   */
  static async getPendingReturns(terminalId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT o.*, b.bookId, b.title, b.author, b.genre, b.coverUrl, u.name as readerName
         FROM \`Order\` o
         JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
         JOIN BookCollection bc ON bi.collectionId = bc.collectionId
         JOIN Book b ON bi.bookId = b.bookId
         JOIN LibraryUser u ON o.readerId = u.userId
         WHERE bc.terminalId = ? AND o.status = 'PENDING_RETURN'
         ORDER BY o.returnDate ASC`,
        [terminalId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  /**
   * Find all orders for a reader, including history
   */
  static async findAllByReaderWithHistory(readerId) {
    const query = `
      SELECT o.*, b.title, b.author, b.genre, b.coverUrl,
             bi.availableCopies, bi.totalCopies,
             u.name as readerName
      FROM \`Order\` o
      JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
      JOIN Book b ON bi.bookId = b.bookId
      JOIN LibraryUser u ON o.readerId = u.userId
      WHERE o.readerId = ?
      ORDER BY 
        CASE
          WHEN o.status = 'ACTIVE' THEN 1
          WHEN o.status = 'PENDING_APPROVAL' THEN 2
          WHEN o.status = 'PENDING_RETURN' THEN 3
          ELSE 4
        END,
        o.rentDate DESC
    `;
    
    return new Promise((resolve, reject) => {
      pool.query(query, [readerId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = OrderRepository;