const pool = require('../connection');
const OrderService = require('../services/order.service');

class OrderController {
  static async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOrderById(req, res) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      res.status(200).json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createOrder(req, res) {
    try {
      const order = await OrderService.createOrder(req.body);
      res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateOrder(req, res) {
    try {
      const order = await OrderService.updateOrder(req.params.id, req.body);
      res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteOrder(req, res) {
    try {
      await OrderService.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const { rentId } = req.params;
      const { status } = req.body;
      const updatedOrder = await OrderService.updateOrderStatus(rentId, status);
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Rent a book
   */
  static async rentBook(req, res) {
    try {
      const { userId, instanceId, terminalId = 1 } = req.body;
      
      console.log('Rent book request received:', { userId, instanceId, terminalId });
      
      // Add initial validation
      if (!userId || !instanceId) {
        return res.status(400).json({ message: 'User ID and instance ID are required' });
      }
      
      // FIX: Proper handling of database result without destructuring
      const userResult = await pool.query(
        'SELECT userId, name, email, userType FROM LibraryUser WHERE userId = ?',
        [userId]
      );
      
      // Handle different pool implementations (mysql vs mysql2)
      const userRows = Array.isArray(userResult[0]) ? userResult[0] : userResult[0];
      
      if (!userRows || userRows.length === 0) {
        console.log(`User ID ${userId} does not exist in the database`); // <--- THIS LINE
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = userRows[0];
      
      // ENFORCE ROLE LOGIC: Only readers can rent books
      if (user.userType === 'librarian') {
        return res.status(403).json({ 
          message: 'Librarians cannot rent books - they can only approve rental requests'
        });
      }
      
      // Verify user exists in the Reader table - FIX: Remove destructuring here too
      const readerResult = await pool.query(
        'SELECT userId FROM Reader WHERE userId = ?',
        [userId]
      );
      
      const readerRows = Array.isArray(readerResult[0]) ? readerResult[0] : readerResult[0];
      
      if (!readerRows || readerRows.length === 0) {
        console.log(`User ID ${userId} not found in Reader table`);
        return res.status(400).json({ message: 'User must be a registered reader to rent books' });
      }
      
      // Continue with rent operation for readers only
      const rental = await OrderService.rentBook(userId, instanceId, terminalId);
      res.status(201).json(rental);
    } catch (error) {
      console.error('Error renting book:', error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get reader's rented books
   */
  static async getReaderRentedBooks(req, res) {
    try {
      const readerId = parseInt(req.params.readerId);
      
      // Security check: either the reader themselves or a librarian can view
      if (req.user.userType !== 'librarian' && req.user.userId !== readerId) {
        return res.status(403).json({ error: 'Unauthorized to view this reader\'s books' });
      }

      const books = await OrderService.getReaderRentedBooks(readerId);
      res.status(200).json(books);
    } catch (error) {
      console.error('Error fetching reader rented books:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Initiate a book return
   */
  static async initiateReturn(req, res) {
    try {
      const { rentId } = req.params;
      const readerId = req.user.userId; // From auth middleware
      
      const order = await OrderService.initiateReturn(rentId, readerId);
      res.status(200).json({ 
        message: 'Return initiated successfully. Please return the book to the library for inspection.', 
        order 
      });
    } catch (error) {
      console.error('Error initiating return:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Authorize a book return
   */
  static async authorizeReturn(req, res) {
    try {
      const { rentId } = req.params;
      const { approved, notes, penalty } = req.body;
      const librarianId = req.user.userId; // From auth middleware
      
      // Verify user is a librarian
      if (req.user.userType !== 'librarian') {
        return res.status(403).json({ error: 'Only librarians can authorize returns' });
      }

      const order = await OrderService.authorizeReturn(
        rentId,
        librarianId,
        approved,
        notes,
        penalty || 0
      );
      
      const actionResult = approved ? 'approved' : 'denied';
      res.status(200).json({ 
        message: `Return ${actionResult} successfully`, 
        order 
      });
    } catch (error) {
      console.error('Error authorizing return:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get returns pending approval
   */
  static async getPendingReturns(req, res) {
    try {
      // Verify user is a librarian
      if (req.user.userType !== 'librarian') {
        return res.status(403).json({ error: 'Only librarians can view pending returns' });
      }

      const terminalId = req.user.terminalId; // From auth middleware
      const pendingReturns = await OrderService.getPendingReturns(terminalId);
      
      res.status(200).json(pendingReturns);
    } catch (error) {
      console.error('Error fetching pending returns:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Approve or deny a rental request
   */
  static async approveRental(req, res) {
    try {
      const { rentId } = req.params;
      const { approved, notes } = req.body;
      const librarianId = req.user.userId; // From auth middleware
      
      // Verify user is a librarian
      if (req.user.userType !== 'librarian') {
        return res.status(403).json({ error: 'Only librarians can approve rentals' });
      }

      const order = await OrderService.approveRental(
        rentId,
        librarianId,
        approved,
        notes
      );
      
      const actionResult = approved ? 'approved' : 'denied';
      res.status(200).json({ 
        message: `Rental ${actionResult} successfully`, 
        order 
      });
    } catch (error) {
      console.error('Error approving rental:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get pending rental requests
   */
  static async getPendingRentals(req, res) {
    try {
      // Verify user is a librarian
      if (req.user.userType !== 'librarian') {
        return res.status(403).json({ error: 'Only librarians can view pending rentals' });
      }

      const terminalId = req.user.terminalId; // From auth middleware
      const pendingRentals = await OrderService.getPendingRentalRequests(terminalId);
      
      res.status(200).json(pendingRentals);
    } catch (error) {
      console.error('Error fetching pending rentals:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Mark order as completed (instead of deleting)
   */
  static async markOrderCompleted(req, res) {
    try {
      const rentId = parseInt(req.params.rentId);
      await OrderService.markOrderCompleted(rentId);
      res.status(200).json({ message: 'Order marked as completed' });
    } catch (error) {
      console.error('Error marking order as completed:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

// Helper function to get the terminal ID for a user
async function getUserTerminal(userId) {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT terminalId FROM LibraryUser WHERE userId = ?',
      [userId],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        resolve(results[0].terminalId);
      }
    );
  });
}

module.exports = OrderController;