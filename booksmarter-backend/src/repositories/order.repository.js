const Order = require('../models/order.model');
const pool = require('../connection');

class OrderRepository {
  create(order) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO \`Order\` 
        (rentedBookId, rentDate, returnDeadline, readerId, status, librarianId) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      pool.query(query, [
        order.instanceId,
        order.rentDate,
        order.returnDeadline,
        order.readerId,
        order.status,
        order.librarianId
      ], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  getById(rentId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM \`Order\` WHERE rentId = ?`;
      
      pool.query(query, [rentId], (err, rows) => {
        if (err) return reject(err);
        if (rows.length === 0) return resolve(null);
        resolve(Order.fromDatabase(rows[0]));
      });
    });
  }

  getOrdersByReaderId(readerId, status = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT o.*, bi.bookId, b.title as bookTitle, b.coverUrl
        FROM \`Order\` o
        JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
        JOIN Book b ON bi.bookId = b.bookId
        WHERE o.readerId = ?
      `;
      const params = [readerId];

      if (status) {
        if (Array.isArray(status)) {
          query += ` AND o.status IN (?)`;
          params.push(status);
        } else {
          query += ` AND o.status = ?`;
          params.push(status);
        }
      }

      pool.query(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => {
          const order = Order.fromDatabase(row);
          order.bookId = row.bookId; // optional, for completeness
          order.bookTitle = row.bookTitle;
          order.coverUrl = row.coverUrl;
          return order;
        }));
      });
    });
  }
  
  updateStatus(rentId, status, librarianId = null, returnNotes = null, returnDate = null) {
    return new Promise((resolve, reject) => {
      let query = `UPDATE \`Order\` SET status = ?`;
      const params = [status];
      
      if (librarianId !== null) {
        query += `, librarianId = ?`;
        params.push(librarianId);
      }
      
      if (returnNotes !== null) {
        query += `, returnNotes = ?`;
        params.push(returnNotes);
      }
      
      if (returnDate !== null) {
        query += `, returnDate = ?`;
        params.push(returnDate);
      }
      
      query += ` WHERE rentId = ?`;
      params.push(rentId);
      
      pool.query(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
  
  delete(rentId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM \`Order\` WHERE rentId = ?`;
      
      pool.query(query, [rentId], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
  
  getOrdersForLibrarian(terminalId, status = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT o.*, u.name as readerName, b.title as bookTitle, b.author as bookAuthor
        FROM \`Order\` o
        JOIN Reader r ON o.readerId = r.userId
        JOIN LibraryUser u ON r.userId = u.userId
        JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
        JOIN Book b ON bi.bookId = b.bookId
        WHERE u.terminalId = ?
      `;
      
      const params = [terminalId];
      
      if (status) {
        if (Array.isArray(status)) {
          query += ` AND o.status IN (?)`;
          params.push(status);
        } else {
          query += ` AND o.status = ?`;
          params.push(status);
        }
      }
      
      pool.query(query, params, (err, rows) => {
        if (err) return reject(err);
        
        resolve(rows.map(row => {
          const order = Order.fromDatabase(row);
          order.readerName = row.readerName;
          order.bookTitle = row.bookTitle;
          order.bookAuthor = row.bookAuthor;
          return order;
        }));
      });
    });
  }
  
  updateBookAvailability(instanceId, increment) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE BookInstance 
        SET availableCopies = availableCopies + ? 
        WHERE instanceId = ?
      `;
      
      pool.query(query, [increment, instanceId], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.name as readerName, b.title as bookTitle, b.author as bookAuthor, b.coverUrl
        FROM \`Order\` o
        JOIN Reader r ON o.readerId = r.userId
        JOIN LibraryUser u ON r.userId = u.userId
        JOIN BookInstance bi ON o.rentedBookId = bi.instanceId
        JOIN Book b ON bi.bookId = b.bookId
      `;
      
      pool.query(query, (err, rows) => {
        if (err) return reject(err);
        
        resolve(rows.map(row => {
          const order = Order.fromDatabase(row);
          order.readerName = row.readerName;
          order.bookTitle = row.bookTitle;
          order.bookAuthor = row.bookAuthor;
          order.coverUrl = row.coverUrl;
          return order;
        }));
      });
    });
  }
}

module.exports = new OrderRepository();