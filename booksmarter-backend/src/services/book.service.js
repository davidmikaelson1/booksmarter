const BookRepository = require('../repositories/book.repository');
const BookInstanceRepository = require('../repositories/bookInstance.repository');
const CollectionRepository = require('../repositories/collection.repository');
const Book = require('../models/book.model');

class BookService {
  static async getAllBooks() {
    try {
      const books = await BookRepository.findAll();
      return books;
    } catch (error) {
      console.error('Error in getAllBooks service:', error);
      throw error;
    }
  }

  static async getBookById(bookId) {
    const book = await BookRepository.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  static async createBook(bookData) {
    // Validate book data
    if (!bookData.title || !bookData.author || !bookData.genre) {
      throw new Error('Title, author and genre are required');
    }

    const book = new Book(
      null,
      bookData.title,
      bookData.author,
      bookData.genre,
      bookData.coverUrl
    );

    const bookId = await BookRepository.createBook(book);
    book.bookId = bookId;
    return book;
  }

  static async updateBook(bookId, bookData) {
    const existingBook = await BookRepository.findById(bookId);
    if (!existingBook) {
      throw new Error('Book not found');
    }

    const book = new Book(
      bookId,
      bookData.title,
      bookData.author,
      bookData.genre,
      bookData.coverUrl
    );

    await BookRepository.updateBook(bookId, book);
    return book;
  }

  static async deleteBook(bookId) {
    const success = await BookRepository.deleteBook(bookId);
    if (!success) {
      throw new Error('Book not found');
    }
    return success;
  }
}

module.exports = BookService;