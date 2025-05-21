export interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: 'Art' | 'Biography' | 'Fiction' | 'History' | 'Mystery' | 'Psychology' | 'Romance';
  coverUrl?: string;
}
