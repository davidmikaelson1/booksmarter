export interface BookCollection {
  collectionId: number;
  terminalId: number; // Foreign key to Library
  totalBooks: number;
  totalRentedBooks: number;
}
