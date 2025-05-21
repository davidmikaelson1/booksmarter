const LibraryService = require('../services/library.service');

class LibraryController {
  static async getAllLibraries(req, res) {
    try {
      const libraries = await LibraryService.getAllLibraries();
      res.status(200).json(libraries);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getLibraryById(req, res) {
    try {
      const library = await LibraryService.getLibraryById(req.params.id);
      res.status(200).json(library);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createLibrary(req, res) {
    try {
      const library = await LibraryService.createLibrary(req.body);
      res.status(201).json({
        message: 'Library created successfully',
        library
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateLibrary(req, res) {
    try {
      const library = await LibraryService.updateLibrary(req.params.id, req.body);
      res.status(200).json({
        message: 'Library updated successfully',
        library
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteLibrary(req, res) {
    try {
      await LibraryService.deleteLibrary(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = LibraryController;