const BookInstanceService = require('../services/bookInstance.service');
const CollectionRepository = require('../repositories/collection.repository'); // Assuming the path

class BookInstanceController {
  static async getAllBookInstances(req, res) {
    try {
      const terminalId = req.params.terminalId;
      if (!terminalId) {
        return res.status(400).json({ error: 'Terminal ID is required' });
      }

      const bookInstances = await BookInstanceService.getAllBookInstances(parseInt(terminalId));
      
      res.status(200).json(bookInstances);
    } catch (error) {
      console.error('Error in getAllBookInstances:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getBookInstanceById(req, res) {
    try {
      const bookInstance = await BookInstanceService.getBookInstanceById(req.params.id);
      res.status(200).json(bookInstance);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createBookInstance(req, res) {
    try {
      const { bookId, totalCopies, collectionId } = req.body;
      
      // Fix: Pass the terminalId parameter to findById
      const collection = await CollectionRepository.findById(collectionId, null);
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      
      if (!bookId || !totalCopies || !collectionId) {
        return res.status(400).json({ error: 'Book ID, total copies, and collection ID are required' });
      }
      
      if (totalCopies < 1) {
        return res.status(400).json({ error: 'Total copies must be at least 1' });
      }

      const bookInstanceData = {
        bookId,
        collectionId,
        totalCopies,
        availableCopies: totalCopies
      };

      const bookInstance = await BookInstanceService.createBookInstance(bookInstanceData);
      
      // Update collection counts after creating instance
      await CollectionRepository.updateCollectionCounts(collectionId);
      
      res.status(201).json({ 
        message: 'Book added to collection successfully', 
        bookInstance 
      });
    } catch (error) {
      console.error('Error creating book instance:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async createBookInstanceForTerminal(req, res) {
    try {
      const { bookId, totalCopies } = req.body;
      const terminalId = parseInt(req.params.terminalId);
      
      if (!bookId || !totalCopies) {
        return res.status(400).json({ error: 'Book ID and total copies are required' });
      }
      
      if (totalCopies < 1) {
        return res.status(400).json({ error: 'Total copies must be at least 1' });
      }

      const bookInstance = await BookInstanceService.createBookInstanceForTerminal(
        bookId, 
        totalCopies, 
        terminalId
      );
      
      res.status(201).json({ 
        message: 'Book added to collection successfully', 
        bookInstance 
      });
    } catch (error) {
      console.error('Error creating book instance:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateBookInstance(req, res) {
    try {
      const { totalCopies } = req.body;
      
      if (totalCopies === undefined || totalCopies < 0) {
        return res.status(400).json({ error: 'Valid total copies count is required (must be positive)' });
      }

      try {
        const bookInstance = await BookInstanceService.updateTotalCopies(
          req.params.id,
          totalCopies
        );
        
        res.status(200).json({ 
          message: 'Book copies updated successfully', 
          bookInstance 
        });
      } catch (error) {
        // Check if this is a business rule error
        if (error.message.includes('Cannot reduce total copies')) {
          return res.status(400).json({ error: error.message });
        }
        throw error; // re-throw other errors
      }
    } catch (error) {
      console.error('Error updating book copies:', error);
      res.status(500).json({ error: error.message || 'Error updating book copies' });
    }
  }

  static async deleteBookInstance(req, res) {
    try {
      await BookInstanceService.deleteBookInstance(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting book instance:', error);
      res.status(404).json({ error: error.message });
    }
  }

  static async getInstancesByIds(req, res) {
    const { instanceIds } = req.body;
    // Query all BookInstances with those IDs and return them
  }
}

module.exports = BookInstanceController;