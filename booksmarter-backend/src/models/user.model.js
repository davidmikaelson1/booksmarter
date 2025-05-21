class User {
  constructor(userId, name, email, passwordHash, terminalId, userType) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.terminalId = terminalId;
    this.userType = userType;
  }

  // Factory method to create a User instance from database results
  static fromDatabase(row) {
    return new User(
      row.userId,
      row.name,
      row.email,
      row.passwordHash,
      row.terminalId,
      row.userType
    );
  }
}

module.exports = User;