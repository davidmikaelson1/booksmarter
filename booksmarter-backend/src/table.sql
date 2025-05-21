-- Library
CREATE TABLE Library (
  terminalId    INT          PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL
);

-- Base Users
CREATE TABLE LibraryUser (
  userId        INT          PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  passwordHash  VARCHAR(255) NOT NULL,
  terminalId    INT          NOT NULL, 
  userType      ENUM('reader', 'librarian') NOT NULL,
  FOREIGN KEY (terminalId)
    REFERENCES Library(terminalId)
    ON DELETE CASCADE
);

-- Readers (extends LibraryUser)
CREATE TABLE Reader (
  userId        INT          PRIMARY KEY,
  pnc           VARCHAR(20)  NOT NULL,
  address       VARCHAR(255) NOT NULL,
  phoneNumber   VARCHAR(20)  NOT NULL,
  FOREIGN KEY (userId)
    REFERENCES LibraryUser(userId)
    ON DELETE CASCADE
);

-- Librarians (extends LibraryUser)
CREATE TABLE Librarian (
  userId        INT          PRIMARY KEY,
  librarianId   INT          NOT NULL UNIQUE,
  FOREIGN KEY (userId)
    REFERENCES LibraryUser(userId)
    ON DELETE CASCADE
);

-- Books
CREATE TABLE Book (
  bookId        INT          PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(200) NOT NULL,
  author        VARCHAR(150) NOT NULL,
  genre         ENUM('Art','Biography','Fiction','History','Mystery','Psychology','Romance') NOT NULL,
  coverUrl      VARCHAR(255) NULL -- Added coverUrl for book cover images
);

-- Collections per Library
CREATE TABLE BookCollection (
  collectionId    INT        PRIMARY KEY AUTO_INCREMENT,
  terminalId      INT        NOT NULL,
  totalBooks      INT        NOT NULL DEFAULT 0,
  totalRentedBooks INT       NOT NULL DEFAULT 0,
  FOREIGN KEY (terminalId)
    REFERENCES Library(terminalId)
    ON DELETE CASCADE
);

-- Instances per Collection
CREATE TABLE BookInstance (
  instanceId     INT          PRIMARY KEY AUTO_INCREMENT,
  bookId         INT          NOT NULL,
  collectionId   INT          NOT NULL,
  totalCopies    INT          NOT NULL,
  availableCopies INT         NOT NULL,
  FOREIGN KEY (bookId)
    REFERENCES Book(bookId)
    ON DELETE CASCADE,
  FOREIGN KEY (collectionId)
    REFERENCES BookCollection(collectionId)
    ON DELETE CASCADE
);

-- Orders (one book per order)
CREATE TABLE `Order` (
  rentId          INT PRIMARY KEY AUTO_INCREMENT,
  rentedBookId    INT NOT NULL,
  rentDate        DATE NOT NULL,
  returnDeadline  DATE NOT NULL,
  returnDate      DATE NULL,
  readerId        INT NOT NULL,
  status          ENUM('WAITING', 'DENIED', 'APPROVED', 'ACTIVE', 'PENDING_APPROVAL', 'PENDING_RETURN', 'RETURNED', 'COMPLETED') NOT NULL DEFAULT 'WAITING',
  returnNotes     TEXT NULL,
  librarianId     INT NULL,
  FOREIGN KEY (rentedBookId)
    REFERENCES BookInstance(instanceId)
    ON DELETE RESTRICT,
  FOREIGN KEY (readerId)
    REFERENCES Reader(userId)
    ON DELETE RESTRICT,
  FOREIGN KEY (librarianId)
    REFERENCES Librarian(userId)
    ON DELETE SET NULL
);

-- Order Items (if multi-book orders needed)
CREATE TABLE OrderItem (
  orderItemId    INT          PRIMARY KEY AUTO_INCREMENT,
  orderId        INT          NOT NULL,
  bookId         INT          NOT NULL,
  quantity       INT          NOT NULL,
  FOREIGN KEY (orderId)
    REFERENCES `Order`(rentId)
    ON DELETE CASCADE,
  FOREIGN KEY (bookId)
    REFERENCES Book(bookId)
    ON DELETE RESTRICT
);
