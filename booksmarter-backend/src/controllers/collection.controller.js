const CollectionService = require('../services/collection.service');

class CollectionController {
  static async getAllCollections(req, res) {
    try {
      const collections = await CollectionService.getAllCollections(req.user.libraryId);
      res.status(200).json(collections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCollectionById(req, res) {
    try {
      const collection = await CollectionService.getCollectionById(req.params.id, req.user.libraryId);
      res.status(200).json(collection);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createCollection(req, res) {
    try {
      const collection = await CollectionService.createCollection(req.body, req.user.libraryId);
      res.status(201).json({ message: 'Collection created successfully', collection });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateCollection(req, res) {
    try {
      const collection = await CollectionService.updateCollection(req.params.id, req.body);
      res.status(200).json({ message: 'Collection updated successfully', collection });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteCollection(req, res) {
    try {
      await CollectionService.deleteCollection(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = CollectionController;