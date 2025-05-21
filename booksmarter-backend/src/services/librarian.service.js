const LibrarianRepository = require('../repositories/librarian.repository');
const Librarian = require('../models/librarian.model');

class LibrarianService {
  static async getAllLibrarians() {
    return await LibrarianRepository.findAll();
  }

  static async getLibrarianById(librarianId) {
    const librarian = await LibrarianRepository.findById(librarianId);
    if (!librarian) {
      throw new Error('Librarian not found');
    }
    return librarian;
  }

  static async createLibrarian(userId, librarianData) {
    const librarian = new Librarian(
      userId, 
      librarianData.librarianId
    );
    const createdId = await LibrarianRepository.createLibrarian(librarian);
    return librarian;
  }

  static async updateLibrarian(librarianId, librarianData) {
    const librarian = new Librarian(
      librarianData.userId,
      librarianData.librarianId
    );
    const success = await LibrarianRepository.updateLibrarian(librarianId, librarian);
    if (!success) {
      throw new Error('Librarian not found');
    }
    return librarian;
  }

  static async deleteLibrarian(librarianId) {
    const success = await LibrarianRepository.deleteLibrarian(librarianId);
    if (!success) {
      throw new Error('Librarian not found');
    }
    return success;
  }
}

module.exports = LibrarianService;