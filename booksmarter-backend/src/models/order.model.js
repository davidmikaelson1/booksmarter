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
    return new Order(
      row.rentId,
      row.readerId,
      row.rentedBookId, // Map from rentedBookId in DB to instanceId in model
      row.rentDate,
      row.returnDeadline,
      row.returnDate,
      row.status,
      row.returnNotes,
      row.librarianId
    );
  }
}

module.exports = Order;