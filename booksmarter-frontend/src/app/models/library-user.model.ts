export interface LibraryUser {
  userId: number;
  name: string;
  email: string;
  passwordHash: string;
  terminalId: number; // Foreign key to Library
  userType: 'reader' | 'librarian';
}
