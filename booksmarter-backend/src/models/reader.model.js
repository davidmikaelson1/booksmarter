class Reader {
  constructor(userId, pnc, address, phoneNumber) {
    this.userId = userId;
    this.pnc = pnc;
    this.address = address;
    this.phoneNumber = phoneNumber;
  }

  static fromDatabase(row) {
    return new Reader(
      row.userId, 
      row.pnc, 
      row.address, 
      row.phoneNumber
    );
  }
}

module.exports = Reader;