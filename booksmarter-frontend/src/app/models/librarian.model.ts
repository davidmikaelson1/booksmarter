import { LibraryUser } from './library-user.model';

export interface Librarian extends LibraryUser {
  librarianId: number; // Unique identifier for librarians
}
