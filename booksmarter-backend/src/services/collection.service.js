const CollectionRepository = require('../repositories/collection.repository');
const Collection = require('../models/collection.model');

class CollectionService {
  static async getAllCollections(libraryId) {
    return await CollectionRepository.findAll(libraryId);
  }

  static async getCollectionById(collectionId, libraryId) {
    const collection = await CollectionRepository.findById(collectionId, libraryId);
    if (!collection) {
      throw new Error('Collection not found');
    }
    return collection;
  }

  static async createCollection(collectionData, libraryId) {
    const collectionId = await CollectionRepository.createCollection(collectionData, libraryId);
    return { id: collectionId, ...collectionData };
  }

  static async updateCollection(collectionId, collectionData) {
    const collection = new Collection(collectionId, collectionData.name, collectionData.description);
    const success = await CollectionRepository.updateCollection(collectionId, collection);
    if (!success) {
      throw new Error('Collection not found');
    }
    return collection;
  }

  static async deleteCollection(collectionId) {
    const success = await CollectionRepository.deleteCollection(collectionId);
    if (!success) {
      throw new Error('Collection not found');
    }
    return success;
  }
}

module.exports = CollectionService;