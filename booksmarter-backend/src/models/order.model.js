class Order {
  constructor(rentId, readerId, instanceId, rentDate, returnDeadline, returnDate, status, returnNotes, librarianId) {
    this.rentId = rentId;
    this.readerId = readerId;
    this.instanceId = instanceId; // This is mapped to rentedBookId in DB
    this.rentDate = rentDate;
    this.returnDeadline = returnDeadline;
    this.returnDate = returnDate;
    this.status = status; 
    this.returnNotes = returnNotes;
    this.librarianId = librarianId;
  }

  static fromDatabase(row) {
    return {
      rentId: row.rentId,
      rentedBookId: row.rentedBookId, // <-- Make sure this is present!
      rentDate: row.rentDate,
      returnDeadline: row.returnDeadline,
      returnDate: row.returnDate,
      readerId: row.readerId,
      status: row.status,
      // ...any other fields
    };
  }
}

module.exports = Order;