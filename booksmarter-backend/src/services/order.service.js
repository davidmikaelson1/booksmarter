const OrderRepository = require('../repositories/order.repository');
const BookInstanceRepository = require('../repositories/bookInstance.repository');
const Order = require('../models/order.model');
const pool = require('../connection');

class OrderService {
  static async getAllOrders() {
    return await OrderRepository.findAll();
  }

  static async getOrderById(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  static async createOrder(orderData) {
    const order = new Order(
      null,
      orderData.userId,
      orderData.bookId,
      orderData.orderDate,
      orderData.returnDate,
      orderData.status
    );
    const orderId = await OrderRepository.createOrder(order);
    order.id = orderId;
    return order;
  }

  static async updateOrder(orderId, orderData) {
    const order = new Order(
      orderId,
      orderData.userId,
      orderData.bookId,
      orderData.orderDate,
      orderData.returnDate,
      orderData.status
    );
    const success = await OrderRepository.updateOrder(orderId, order);
    if (!success) {
      throw new Error('Order not found');
    }
    return order;
  }

  static async deleteOrder(orderId) {
    const success = await OrderRepository.deleteOrder(orderId);
    if (!success) {
      throw new Error('Order not found');
    }
    return success;
  }

  static async updateOrderStatus(rentId, status) {
    const success = await OrderRepository.updateOrderStatus(rentId, status);
    if (!success) {
      throw new Error('Order not found');
    }
    return { rentId, status };
  }

  /**
   * Request to rent a book (now allows librarians too)
   * @param {number} userId - The ID of the user (reader or librarian)
   * @param {number} instanceId - The ID of the book instance
   * @param {number} terminalId - The terminal where the rental occurs
   * @returns {Promise<Object>} - The created rental request
   */
  static async rentBook(userId, instanceId, terminalId) {
    try {
      // Add debug logging
      console.log('Processing rent book request:', { userId, instanceId, terminalId });
      
      // FIX: Proper handling of database result without destructuring
      const userResult = await pool.query(
        'SELECT * FROM LibraryUser WHERE userId = ?',
        [userId]
      );
      
      // Handle different pool implementations (mysql vs mysql2)
      const userRows = Array.isArray(userResult[0]) ? userResult[0] : userResult[0];
      
      if (!userRows || userRows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userRows[0];
      console.log('User found:', { 
        userId: user.userId,
        name: user.name,
        email: user.email,
        userType: user.userType
      });
      
      const userType = user.userType;
      // Important: For rentals, we always use the userId as readerId
      // This is because the Order table uses readerId field for all users
      let readerId = userId;
      
      // Check if book instance exists and has available copies
      const instanceResult = await pool.query(
        'SELECT * FROM BookInstance WHERE instanceId = ?',
        [instanceId]
      );
      
      const instanceRows = Array.isArray(instanceResult[0]) ? instanceResult[0] : instanceResult[0];
      
      if (!instanceRows || instanceRows.length === 0) {
        throw new Error('Book instance not found');
      }
      
      const instance = instanceRows[0];
      
      if (instance.availableCopies <= 0) {
        throw new Error('No copies available for this book');
      }
      
      // If librarian, they can directly checkout books without approval
      const initialStatus = userType === 'librarian' ? 'ACTIVE' : 'PENDING_APPROVAL';
      
      // Get default rental period (14 days)
      const rentDate = new Date();
      const returnDeadline = new Date();
      returnDeadline.setDate(returnDeadline.getDate() + 14);
      
      // Create the rental request
      const [orderResults] = await pool.query(
        `INSERT INTO \`Order\` (readerId, rentedBookId, rentDate, returnDeadline, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [readerId, instanceId, rentDate, returnDeadline, initialStatus]
      );
      
      const rentId = orderResults.insertId;
      
      // If librarian is renting, immediately reduce available copies
      if (initialStatus === 'ACTIVE') {
        await pool.query(
          'UPDATE BookInstance SET availableCopies = availableCopies - 1 WHERE instanceId = ?',
          [instanceId]
        );
        
        // Update collection statistics
        await pool.query(
          `UPDATE BookCollection bc
           SET totalRentedBooks = (
             SELECT COALESCE(SUM(bi.totalCopies - bi.availableCopies), 0)
             FROM BookInstance bi
             WHERE bi.collectionId = bc.collectionId
           )
           WHERE bc.collectionId = ?`,
          [instance.collectionId]
        );
      }
      
      return { rentId, status: initialStatus };
    } catch (error) {
      console.error('Error in rentBook service:', error);
      throw error;
    }
  }

  /**
   * Approve or deny a rental request by a librarian
   * @param {number} rentId - The ID of the rental
   * @param {number} librarianId - The ID of the librarian approving the rental
   * @param {boolean} approved - Whether the rental is approved
   * @param {string} [notes] - Optional notes explaining a denial
   * @returns {Promise<Object>} - Updated order
   */
  static async approveRental(rentId, librarianId, approved, notes = null) {
    // Start a transaction
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });

    try {
      connection.beginTransaction();

      // 1. Verify the order exists and is in PENDING_APPROVAL status
      const order = await OrderRepository.getOrderWithInstanceData(rentId);

      if (order.status !== 'PENDING_APPROVAL') {
        throw new Error(`Cannot approve a rental with status: ${order.status}`);
      }

      // 2. Check if there are still copies available (only needed for approval)
      if (approved && order.availableCopies <= 0) {
        throw new Error('No copies available for this book anymore');
      }

      // 3. Update the order based on approval
      const status = approved ? 'ACTIVE' : 'DENIED';
      
      await OrderRepository.updateOrderStatusByLibrarian(rentId, status, notes, librarianId);

      // 4. If approved, decrease available copies
      if (approved) {
        await OrderRepository.updateBookInstanceAvailability(order.rentedBookId, false);
        
        // 5. Update collection counts
        await OrderRepository.updateCollectionRentalCount(order.collectionId, false);
      }

      await new Promise((resolve, reject) => {
        connection.commit(err => {
          if (err) return reject(err);
          resolve();
        });
      });

      return {
        rentId,
        readerId: order.readerId,
        instanceId: order.rentedBookId,
        rentDate: order.rentDate,
        returnDeadline: order.returnDeadline,
        status,
        returnNotes: notes,
        librarianId
      };
    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => resolve());
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get pending rental requests for a specific terminal
   * @param {number} terminalId - The terminal ID
   * @returns {Promise<Array>} - List of pending rental requests with details
   */
  static async getPendingRentalRequests(terminalId) {
    try {
      return await OrderRepository.getPendingRentalRequests(terminalId);
    } catch (error) {
      console.error('Error fetching pending rental requests:', error);
      throw error;
    }
  }

  /**
   * Get all books rented by a reader (including history)
   */
  static async getReaderRentedBooks(readerId) {
    try {
      const orders = await OrderRepository.findAllByReaderWithHistory(readerId);
      
      return orders.map(order => ({
        rentId: order.rentId,
        readerId: order.readerId,
        readerName: order.readerName,
        rentedBookId: order.rentedBookId,
        rentDate: order.rentDate,
        returnDate: order.returnDate,
        returnDeadline: order.returnDeadline,
        status: order.status,
        returnNotes: order.returnNotes,
        librarianId: order.librarianId,
        bookTitle: order.title,
        author: order.author,
        genre: order.genre,
        coverUrl: order.coverUrl
      }));
    } catch (error) {
      console.error('Error getting rented books:', error);
      throw error;
    }
  }

  /**
   * Initiate a book return request by a reader
   * @param {number} rentId - The ID of the rental
   * @param {number} readerId - The ID of the reader (for verification)
   * @returns {Promise<Object>} - Updated order
   */
  static async initiateReturn(rentId, readerId) {
    // Start a transaction
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });

    try {
      connection.beginTransaction();

      // 1. Verify the order exists and belongs to the reader
      const order = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT * FROM `Order` WHERE rentId = ? AND readerId = ?',
          [rentId, readerId],
          (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
              return reject(new Error('Order not found or does not belong to this reader'));
            }
            resolve(results[0]);
          }
        );
      });

      // 2. Verify the order is in ACTIVE status
      if (order.status !== 'ACTIVE') {
        throw new Error(`Cannot return a book with status: ${order.status}`);
      }

      // 3. Update the order status to PENDING_RETURN
      const returnDate = new Date();
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE `Order` SET status = ?, returnDate = ? WHERE rentId = ?',
          ['PENDING_RETURN', returnDate, rentId],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        connection.commit(err => {
          if (err) return reject(err);
          resolve();
        });
      });

      return {
        rentId,
        readerId,
        instanceId: order.rentedBookId,
        rentDate: order.rentDate,
        returnDeadline: order.returnDeadline,
        returnDate,
        status: 'PENDING_RETURN'
      };
    } catch (error) {
      await new Promise((resolve) => {
        connection.rollback(() => resolve());
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Approve or deny a return by a librarian
   * @param {number} rentId - The ID of the rental
   * @param {number} librarianId - The ID of the librarian authorizing the return
   * @param {boolean} approved - Whether the return is approved
   * @param {string} [notes] - Optional notes explaining a denial
   * @param {number} [penalty] - Optional penalty amount for damaged/late books
   * @returns {Promise<Object>} - Updated order
   */
  static async authorizeReturn(rentId, librarianId, approved, notes = null, penalty = null) {
    return new Promise((resolve, reject) => {
      // Get a connection from the pool using callbacks
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          return reject(err);
        }

        // Start a transaction
        connection.beginTransaction(async (err) => {
          if (err) {
            connection.release();
            console.error('Error beginning transaction:', err);
            return reject(err);
          }

          try {
            // Get the order details
            connection.query(
              'SELECT * FROM `Order` WHERE rentId = ?',
              [rentId],
              (err, orderResult) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    reject(err);
                  });
                }

                if (orderResult.length === 0) {
                  return connection.rollback(() => {
                    connection.release();
                    reject(new Error('Order not found'));
                  });
                }

                const order = orderResult[0];

                if (order.status !== 'PENDING_RETURN') {
                  return connection.rollback(() => {
                    connection.release();
                    reject(new Error('Order is not pending return'));
                  });
                }

                // Update status based on approval
                const newStatus = approved ? 'COMPLETED' : 'ACTIVE';

                // Update order status, return date and notes
                connection.query(
                  'UPDATE `Order` SET status = ?, returnDate = ?, returnNotes = ?, librarianId = ? WHERE rentId = ?',
                  [newStatus, approved ? new Date() : null, notes, librarianId, rentId],
                  (err) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        reject(err);
                      });
                    }

                    // If approved, increase available copies for the book
                    if (approved) {
                      connection.query(
                        'UPDATE BookInstance SET availableCopies = availableCopies + 1 WHERE instanceId = ?',
                        [order.rentedBookId],
                        (err) => {
                          if (err) {
                            return connection.rollback(() => {
                              connection.release();
                              reject(err);
                            });
                          }

                          // Get collection ID to update collection counts
                          connection.query(
                            'SELECT collectionId FROM BookInstance WHERE instanceId = ?',
                            [order.rentedBookId],
                            (err, instanceResult) => {
                              if (err) {
                                return connection.rollback(() => {
                                  connection.release();
                                  reject(err);
                                });
                              }

                              if (instanceResult.length > 0) {
                                // Update collection counts
                                connection.query(
                                  `UPDATE BookCollection bc
                                  SET totalRentedBooks = (
                                    SELECT COALESCE(SUM(bi.totalCopies - bi.availableCopies), 0)
                                    FROM BookInstance bi
                                    WHERE bi.collectionId = bc.collectionId
                                  )
                                  WHERE bc.collectionId = ?`,
                                  [instanceResult[0].collectionId],
                                  (err) => {
                                    if (err) {
                                      return connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                      });
                                    }

                                    // Commit the transaction
                                    connection.commit((err) => {
                                      if (err) {
                                        return connection.rollback(() => {
                                          connection.release();
                                          reject(err);
                                        });
                                      }

                                      connection.release();
                                      resolve({ rentId, status: newStatus });
                                    });
                                  }
                                );
                              } else {
                                // No collection ID found, just commit
                                connection.commit((err) => {
                                  if (err) {
                                    return connection.rollback(() => {
                                      connection.release();
                                      reject(err);
                                    });
                                  }

                                  connection.release();
                                  resolve({ rentId, status: newStatus });
                                });
                              }
                            }
                          );
                        }
                      );
                    } else {
                      // Not approved, just commit
                      connection.commit((err) => {
                        if (err) {
                          return connection.rollback(() => {
                            connection.release();
                            reject(err);
                          });
                        }

                        connection.release();
                        resolve({ rentId, status: newStatus });
                      });
                    }
                  }
                );
              }
            );
          } catch (error) {
            connection.rollback(() => {
              connection.release();
              reject(error);
            });
          }
        });
      });
    });
  }

  /**
   * Get returns pending approval at a specific terminal
   * @param {number} terminalId - The terminal ID
   * @returns {Promise<Array>} - List of pending returns with details
   */
  static async getPendingReturns(terminalId) {
    try {
      const pendingReturns = await OrderRepository.getPendingReturns(terminalId);

      return pendingReturns.map(rental => ({
        rentId: rental.rentId,
        readerId: rental.readerId,
        readerName: rental.readerName,
        instanceId: rental.rentedBookId,
        bookId: rental.bookId,
        title: rental.title,
        author: rental.author,
        genre: rental.genre,
        coverUrl: rental.coverUrl,
        rentDate: rental.rentDate,
        returnDeadline: rental.returnDeadline,
        returnDate: rental.returnDate,
        status: rental.status
      }));
    } catch (error) {
      console.error('Error fetching pending returns:', error);
      throw error;
    }
  }

  /**
   * Mark an order as completed instead of deleting it
   * @param {number} rentId - The ID of the rental to mark as completed
   * @returns {Promise<Object>} - Updated order with COMPLETED status
   */
  static async markOrderCompleted(rentId) {
    try {
      // Check if order exists
      const [orderResult] = await pool.query(
        'SELECT * FROM `Order` WHERE rentId = ?',
        [rentId]
      );
      
      if (orderResult.length === 0) {
        throw new Error('Order not found');
      }

      // Update the status to COMPLETED
      await pool.query(
        'UPDATE `Order` SET status = ? WHERE rentId = ?',
        ['COMPLETED', rentId]
      );
      
      return { rentId, status: 'COMPLETED' };
    } catch (error) {
      console.error('Error marking order as completed:', error);
      throw error;
    }
  }
}

module.exports = OrderService;