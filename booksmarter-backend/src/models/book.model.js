class Book {
  constructor(bookId, title, author, genre, coverUrl) {
    this.bookId = bookId;
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.coverUrl = coverUrl; // New field
  }

  static fromDatabase(row) {
    return new Book(row.bookId, row.title, row.author, row.genre, row.coverUrl);
  }
}

module.exports = Book;