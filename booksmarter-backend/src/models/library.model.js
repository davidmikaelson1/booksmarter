class Library {
    constructor(terminalId, name) {
      this.terminalId = terminalId;
      this.name = name;
    }
  
    static fromDatabase(row) {
      return new Library(
        row.terminalId,
        row.name
      );
    }
  }
  
  module.exports = Library;