const ReaderRepository = require('../repositories/reader.repository');
const Reader = require('../models/reader.model');

class ReaderService {
  static async getAllReaders() {
    return await ReaderRepository.findAll();
  }

  static async getReaderById(readerId) {
    const reader = await ReaderRepository.findById(readerId);
    if (!reader) {
      throw new Error('Reader not found');
    }
    return reader;
  }

  static async createReader(userId, readerData) {
    const reader = new Reader(null, userId, readerData.pnc, readerData.address, readerData.phoneNumber);
    const readerId = await ReaderRepository.createReader(reader);
    reader.id = readerId;
    return reader;
  }

  static async updateReader(readerId, readerData) {
    const reader = new Reader(
      readerId,
      readerData.userId,
      readerData.pnc,
      readerData.address,
      readerData.phoneNumber
    );
    const success = await ReaderRepository.updateReader(readerId, reader);
    if (!success) {
      throw new Error('Reader not found');
    }
    return reader;
  }

  static async deleteReader(readerId) {
    const success = await ReaderRepository.deleteReader(readerId);
    if (!success) {
      throw new Error('Reader not found');
    }
    return success;
  }
}

module.exports = ReaderService;