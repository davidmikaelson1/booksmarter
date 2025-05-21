const pool = require('../connection');
const OrderItem = require('../models/orderItem.model');

class OrderItemRepository {
  static async findAll() {
    const query = 'SELECT * FROM OrderItem';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(OrderItem.fromDatabase));
      });
    });
  }

  static async findById(orderItemId) {
    const query = 'SELECT * FROM OrderItem WHERE orderItemId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [orderItemId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? OrderItem.fromDatabase(results[0]) : null);
      });
    });
  }

  static async createOrderItem(orderItem) {
    // Ensure the order and book exist
    const orderQuery = 'SELECT * FROM `Order` WHERE rentId = ?';
    const bookQuery = 'SELECT * FROM Book WHERE bookId = ?';

    return new Promise((resolve, reject) => {
      pool.query(orderQuery, [orderItem.orderId], (err, orderResults) => {
        if (err || orderResults.length === 0) {
          return reject(new Error('Order does not exist'));
        }

        pool.query(bookQuery, [orderItem.bookId], (err, bookResults) => {
          if (err || bookResults.length === 0) {
            return reject(new Error('Book does not exist'));
          }

          // Insert the OrderItem
          const query = `
            INSERT INTO OrderItem (orderId, bookId, quantity)
            VALUES (?, ?, ?)
          `;
          pool.query(
            query,
            [orderItem.orderId, orderItem.bookId, orderItem.quantity],
            (err, results) => {
              if (err) return reject(err);
              resolve(results.insertId);
            }
          );
        });
      });
    });
  }

  static async updateOrderItem(orderItemId, orderItem) {
    const query = `
      UPDATE OrderItem
      SET orderId = ?, bookId = ?, quantity = ?
      WHERE orderItemId = ?
    `;
    return new Promise((resolve, reject) => {
      pool.query(
        query,
        [orderItem.orderId, orderItem.bookId, orderItem.quantity, orderItemId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }

  static async deleteOrderItem(orderItemId) {
    const query = 'DELETE FROM OrderItem WHERE orderItemId = ?';
    return new Promise((resolve, reject) => {
      pool.query(query, [orderItemId], (err, results) => {
        if (err) return reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }
}

module.exports = OrderItemRepository;