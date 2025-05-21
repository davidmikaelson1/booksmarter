class BookCollection {
  constructor(collectionId, terminalId, totalBooks, totalRentedBooks) {
    this.collectionId = collectionId;
    this.terminalId = terminalId;
    this.totalBooks = totalBooks;
    this.totalRentedBooks = totalRentedBooks;
  }

  static fromDatabase(row) {
    return new BookCollection(
      row.collectionId,
      row.terminalId,
      row.totalBooks,
      row.totalRentedBooks
    );
  }
}

module.exports = BookCollection;