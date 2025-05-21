const ReaderService = require('../services/reader.service');

class ReaderController {
  static async getAllReaders(req, res) {
    try {
      const readers = await ReaderService.getAllReaders();
      res.status(200).json(readers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getReaderById(req, res) {
    try {
      const reader = await ReaderService.getReaderById(req.params.id);
      res.status(200).json(reader);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createReader(req, res) {
    try {
      const reader = await ReaderService.createReader(req.body.userId, req.body);
      res.status(201).json({ message: 'Reader created successfully', reader });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateReader(req, res) {
    try {
      const reader = await ReaderService.updateReader(req.params.id, req.body);
      res.status(200).json({ message: 'Reader updated successfully', reader });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteReader(req, res) {
    try {
      await ReaderService.deleteReader(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = ReaderController;