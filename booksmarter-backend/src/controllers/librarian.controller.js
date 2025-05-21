const LibrarianService = require('../services/librarian.service');

class LibrarianController {
  static async getAllLibrarians(req, res) {
    try {
      const librarians = await LibrarianService.getAllLibrarians();
      res.status(200).json(librarians);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLibrarianById(req, res) {
    try {
      const librarian = await LibrarianService.getLibrarianById(req.params.id);
      res.status(200).json(librarian);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createLibrarian(req, res) {
    try {
      const librarian = await LibrarianService.createLibrarian(req.body);
      res.status(201).json({ message: 'Librarian created successfully', librarian });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateLibrarian(req, res) {
    try {
      const librarian = await LibrarianService.updateLibrarian(req.params.id, req.body);
      res.status(200).json({ message: 'Librarian updated successfully', librarian });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteLibrarian(req, res) {
    try {
      await LibrarianService.deleteLibrarian(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = LibrarianController;