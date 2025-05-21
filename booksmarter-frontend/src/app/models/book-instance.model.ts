export interface BookInstance {
  instanceId: number;
  bookId: number; // Foreign key to Book
  collectionId: number; // Foreign key to BookCollection
  totalCopies: number;
  availableCopies: number;
}
