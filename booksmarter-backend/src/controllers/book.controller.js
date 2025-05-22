const BookService = require('../services/book.service');
const Book = require('../models/book.model');

class BookController {
  static async getAllBooks(req, res) {
    try {
      const books = await BookService.getAllBooks();
      res.status(200).json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getBookById(req, res) {
    try {
      const book = await BookService.getBookById(req.params.id);
      res.status(200).json(book);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createBook(req, res) {
    try {
      const bookData = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        coverUrl: req.body.coverUrl
      };

      const book = await BookService.createBook(bookData);
      
      res.status(201).json({ 
        message: 'Book created successfully', 
        book 
      });
    } catch (error) {
      console.error('Error in createBook controller:', error);
      res.status(400).json({ 
        error: error.message || 'Error creating book'
      });
    }
  }

  static async updateBook(req, res) {
    try {
      const bookData = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        coverUrl: req.body.coverUrl
      };

      const book = await BookService.updateBook(req.params.id, bookData);
      
      res.status(200).json({ 
        message: 'Book updated successfully', 
        book 
      });
    } catch (error) {
      console.error('Error in updateBook controller:', error);
      res.status(400).json({ 
        error: error.message || 'Error updating book'
      });
    }
  }

  static async deleteBook(req, res) {
    try {
      await BookService.deleteBook(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getBooksByIds(req, res) {
    const { bookIds } = req.body;

    try {
      const books = await BookService.getBooksByIds(bookIds);
      res.status(200).json(books);
    } catch (error) {
      console.error('Error fetching books by IDs:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BookController;