const BookInstanceRepository = require('../repositories/bookInstance.repository');
const BookInstance = require('../models/bookInstance.model');
const CollectionRepository = require('../repositories/collection.repository');
const BookRepository = require('../repositories/book.repository');
const pool = require('../connection'); // Add this import

class BookInstanceService {
  static async getAllBookInstances(terminalId) {
    try {
      // 1. Get collection for this terminal
      const collections = await CollectionRepository.findAll(terminalId);
      if (!collections || collections.length === 0) {
        return [];
      }

      // 2. Get instances with book data
      const collectionIds = collections.map(c => c.collectionId);
      
      // For empty collections, return early
      if (collectionIds.length === 0) {
        return [];
      }
      
      // Format for IN clause - handle single ID case differently
      let query;
      let queryParams;
      
      if (collectionIds.length === 1) {
        query = `
          SELECT b.*, bi.instanceId, bi.collectionId, bi.totalCopies, bi.availableCopies
          FROM Book b
          INNER JOIN BookInstance bi ON b.bookId = bi.bookId
          WHERE bi.collectionId = ?
        `;
        queryParams = [collectionIds[0]];
      } else {
        const placeholders = collectionIds.map(() => '?').join(',');
        query = `
          SELECT b.*, bi.instanceId, bi.collectionId, bi.totalCopies, bi.availableCopies
          FROM Book b
          INNER JOIN BookInstance bi ON b.bookId = bi.bookId
          WHERE bi.collectionId IN (${placeholders})
        `;
        queryParams = collectionIds;
      }

      const instances = await new Promise((resolve, reject) => {
        pool.query(query, queryParams, (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return reject(err);
          }
          resolve(results);
        });
      });

      // 3. Format the response to match frontend expectations
      const formattedInstances = instances.map(row => ({
        bookId: row.bookId,
        title: row.title,
        author: row.author,
        genre: row.genre,
        coverUrl: row.coverUrl,
        instance: {
          instanceId: row.instanceId,
          bookId: row.bookId,
          collectionId: row.collectionId,
          totalCopies: row.totalCopies,
          availableCopies: row.availableCopies
        }
      }));

      return formattedInstances;
    } catch (error) {
      console.error('Error in getAllBookInstances:', error);
      throw error;
    }
  }

  static async getBookInstanceById(instanceId, libraryId) {
    const bookInstance = await BookInstanceRepository.findById(instanceId, libraryId);
    if (!bookInstance) {
      throw new Error('BookInstance not found');
    }
    return bookInstance;
  }

  static async createBookInstance(bookInstanceData) {
    const bookInstance = new BookInstance(
      null,
      bookInstanceData.bookId,
      bookInstanceData.collectionId,
      bookInstanceData.totalCopies,
      bookInstanceData.availableCopies
    );
    const instanceId = await BookInstanceRepository.createBookInstance(bookInstance);
    bookInstance.instanceId = instanceId;
    return bookInstance;
  }

  static async updateBookInstance(instanceId, bookInstanceData) {
    const bookInstance = new BookInstance(
      instanceId,
      bookInstanceData.bookId,
      bookInstanceData.collectionId,
      bookInstanceData.totalCopies,
      bookInstanceData.availableCopies
    );
    const success = await BookInstanceRepository.updateBookInstance(instanceId, bookInstance);
    if (!success) {
      throw new Error('BookInstance not found');
    }
    return bookInstance;
  }

  static async updateTotalCopies(instanceId, totalCopies) {
    try {
      // Get current instance data
      const currentInstance = await BookInstanceRepository.findById(instanceId);
      if (!currentInstance) {
        throw new Error('Book instance not found');
      }

      // Calculate rented books (total - available)
      const rentedBooks = currentInstance.totalCopies - currentInstance.availableCopies;
      
      // Check if new totalCopies is valid
      if (totalCopies < rentedBooks) {
        throw new Error(`Cannot reduce total copies below ${rentedBooks}. There are currently ${rentedBooks} books checked out.`);
      }

      // Calculate new availableCopies
      const newAvailableCopies = totalCopies - rentedBooks;
      
      // Update instance with new values
      await BookInstanceRepository.updateTotalAndAvailableCopies(
        instanceId, 
        totalCopies, 
        newAvailableCopies
      );
      
      // Update collection counts
      await CollectionRepository.updateCollectionCounts(currentInstance.collectionId);

      // Get and return the updated instance
      const updatedInstance = await BookInstanceRepository.findById(instanceId);
      return updatedInstance;
    } catch (error) {
      console.error('Error updating total copies:', error);
      throw error;
    }
  }

  static async deleteBookInstance(instanceId) {
    try {
      // Get instance before deletion for collection update
      const instance = await BookInstanceRepository.findById(instanceId);
      if (!instance) {
        throw new Error('Book instance not found');
      }

      // Delete the instance
      const success = await BookInstanceRepository.deleteBookInstance(instanceId);
      if (!success) {
        throw new Error('Failed to delete book instance');
      }

      // Update collection counts
      await CollectionRepository.updateCollectionCounts(instance.collectionId);

      return true;
    } catch (error) {
      console.error('Error deleting book instance:', error);
      throw error;
    }
  }

  static async createBookInstanceForTerminal(bookId, totalCopies, terminalId) {
    try {
      // Get or create collection for this terminal
      const collection = await CollectionRepository.getOrCreateCollectionForTerminal(terminalId);
      
      const bookInstanceData = {
        bookId,
        collectionId: collection.collectionId,
        totalCopies,
        availableCopies: totalCopies
      };

      const bookInstance = new BookInstance(
        null,
        bookInstanceData.bookId,
        bookInstanceData.collectionId,
        bookInstanceData.totalCopies,
        bookInstanceData.availableCopies
      );
      
      const instanceId = await BookInstanceRepository.createBookInstance(bookInstance);
      bookInstance.instanceId = instanceId;
      
      // Update collection counts
      await CollectionRepository.updateCollectionCounts(collection.collectionId);
      
      return bookInstance;
    } catch (error) {
      console.error('Error creating book instance for terminal:', error);
      throw error;
    }
  }
}

module.exports = BookInstanceService;