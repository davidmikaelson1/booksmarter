class Librarian {
  constructor(userId, librarianId) {
    this.userId = userId;
    this.librarianId = librarianId;
  }

  static fromDatabase(row) {
    return new Librarian(
      row.userId,
      row.librarianId
    );
  }
}

module.exports = Librarian;