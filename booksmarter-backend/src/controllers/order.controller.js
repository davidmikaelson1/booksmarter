const orderService = require('../services/order.service');

class OrderController {
  async createOrder(req, res) {
    try {
      const { readerId, instanceId, rentDate, returnDeadline } = req.body;
      
      if (!readerId || !instanceId || !rentDate || !returnDeadline) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const order = await orderService.createOrder(readerId, instanceId, rentDate, returnDeadline);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getReaderOrders(req, res) {
    try {
      const { readerId } = req.params;
      const orders = await orderService.getReaderOrders(parseInt(readerId));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async approveOrder(req, res) {
    try {
      const { id } = req.params;
      const { librarianId } = req.body;
      
      if (!librarianId) {
        return res.status(400).json({ message: 'Librarian ID is required' });
      }
      
      const success = await orderService.approveOrder(parseInt(id), librarianId);
      
      if (!success) {
        return res.status(404).json({ message: 'Order not found or could not be updated' });
      }
      
      res.json({ message: 'Order approved successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async denyOrder(req, res) {
    try {
      const { id } = req.params;
      const { librarianId, reason } = req.body;
      
      if (!librarianId) {
        return res.status(400).json({ message: 'Librarian ID is required' });
      }
      
      const success = await orderService.denyOrder(parseInt(id), librarianId, reason || '');
      
      if (!success) {
        return res.status(404).json({ message: 'Order not found or could not be updated' });
      }
      
      res.json({ message: 'Order denied successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async initiateReturn(req, res) {
    try {
      const { id } = req.params;
      const success = await orderService.initiateReturn(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: 'Order not found or could not be updated' });
      }
      
      res.json({ message: 'Return initiated successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async approveReturn(req, res) {
    try {
      const { id } = req.params;
      const { librarianId, returnNotes } = req.body;
      
      if (!librarianId) {
        return res.status(400).json({ message: 'Librarian ID is required' });
      }
      
      const success = await orderService.approveReturn(parseInt(id), librarianId, returnNotes || '');
      
      if (!success) {
        return res.status(404).json({ message: 'Order not found or could not be updated' });
      }
      
      res.json({ message: 'Return approved successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const readerId = req.body.readerId || null; // Get reader ID from request
      await orderService.deleteOrder(parseInt(id), readerId);
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async getLibrarianOrders(req, res) {
    try {
      const { terminalId } = req.params;
      const { status } = req.query;
      
      const orders = await orderService.getLibrarianOrders(parseInt(terminalId), status);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getPendingApprovalOrders(req, res) {
    try {
      const { terminalId } = req.params;
      const orders = await orderService.getPendingApprovalOrders(parseInt(terminalId));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getPendingReturnOrders(req, res) {
    try {
      const { terminalId } = req.params;
      const orders = await orderService.getPendingReturnOrders(parseInt(terminalId));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  async getBookForInstance(req, res) {
    try {
      const { id } = req.params;
      const book = await orderService.getBookForInstance(parseInt(id));
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderController();