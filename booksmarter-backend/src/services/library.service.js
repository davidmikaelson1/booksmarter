const LibraryRepository = require('../repositories/library.repository');
const Library = require('../models/library.model');

class LibraryService {
  static async getAllLibraries() {
    try {
      return await LibraryRepository.findAll();
    } catch (error) {
      console.error('Error in getAllLibraries service:', error);
      throw error;
    }
  }

  static async getLibraryById(terminalId) {
    const library = await LibraryRepository.findById(terminalId);
    if (!library) {
      throw new Error('Library not found');
    }
    return library;
  }

  static async createLibrary(libraryData) {
    if (!libraryData.name) {
      throw new Error('Library name is required');
    }

    const library = new Library(null, libraryData.name);
    const terminalId = await LibraryRepository.create(library);
    library.terminalId = terminalId;
    return library;
  }

  static async updateLibrary(terminalId, libraryData) {
    const existingLibrary = await LibraryRepository.findById(terminalId);
    if (!existingLibrary) {
      throw new Error('Library not found');
    }

    const library = new Library(terminalId, libraryData.name);
    await LibraryRepository.update(terminalId, library);
    return library;
  }

  static async deleteLibrary(terminalId) {
    const success = await LibraryRepository.delete(terminalId);
    if (!success) {
      throw new Error('Library not found');
    }
    return success;
  }
}

module.exports = LibraryService;