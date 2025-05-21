class BookInstance {
  constructor(instanceId, bookId, collectionId, totalCopies, availableCopies) {
    this.instanceId = instanceId;
    this.bookId = bookId;
    this.collectionId = collectionId;
    this.totalCopies = totalCopies;
    this.availableCopies = availableCopies;
  }

  static fromDatabase(row) {
    return new BookInstance(
      row.instanceId,
      row.bookId,
      row.collectionId,
      row.totalCopies,
      row.availableCopies
    );
  }
}

module.exports = BookInstance;