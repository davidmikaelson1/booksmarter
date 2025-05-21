import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Book } from '../../../models/book.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { Router } from '@angular/router';
import { BookWithInstance } from '../../../services/book.service';
import { BookInstance } from '../../../models/book-instance.model';

@Component({
  selector: 'app-book-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './book-dialog.component.html',
  styleUrls: ['./book-dialog.component.scss'],
})
export class BookDialogComponent {
  isRenting = false;

  constructor(
    public dialogRef: MatDialogRef<BookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Book | BookWithInstance,
    private dialog: MatDialog,
    private orderService: OrderService,
    protected authService: AuthService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  get book(): Book {
    return 'instance' in this.data ? this.data : this.data as Book;
  }

  get instance(): BookInstance | undefined {
    return 'instance' in this.data ? this.data.instance : undefined;
  }

  get availableCopies(): number {
    return this.instance?.availableCopies || 0;
  }

  get totalCopies(): number {
    return this.instance?.totalCopies || 0;
  }

  get hasAvailableCopies(): boolean {
    return this.availableCopies > 0;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  rentBook(): void {
    const currentUser = this.authService.currentUserValue;

    console.log('Current user before rental:', currentUser);

    if (!currentUser) {
      this.snackbarService.open('You must be logged in to rent books', 'Close');
      return;
    }

    // Check if user is a librarian
    if (currentUser.userType === 'librarian') {
      this.snackbarService.open('As a librarian, you cannot rent books. Librarians can only approve rental requests.', 'Close');
      return;
    }

    // Check if the book has available copies
    if (this.instance && !this.hasAvailableCopies) {
      this.snackbarService.open('Sorry, this book is currently unavailable', 'Close');
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Rental',
        message: `Are you sure you want to rent "${this.book.title}"?`,
        confirmButton: 'Rent Book'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitRental(currentUser.userId);
      }
    });
  }

  private submitRental(userId: number): void {
    this.isRenting = true;

    // Add debug logging
    console.log('Submitting rental with user ID:', userId);

    // Make sure we have a valid user
    if (!userId) {
      this.snackbarService.open('User authentication error, please log in again', 'Close');
      this.isRenting = false;
      return;
    }

    // Get the terminal ID (default to 1 if not available)
    const terminalId = 1; // Either hardcode or get from a service

    // Use instance ID if available
    const bookId = this.instance ? this.instance.instanceId : this.book.bookId;

    this.orderService.rentBook(userId, bookId, terminalId).subscribe({
      next: (response) => {
        this.isRenting = false;

        // Different message for librarians (instant approval) vs readers (needs approval)
        const userType = this.authService.currentUserValue?.userType;
        const message = userType === 'librarian'
          ? 'Book successfully rented.'
          : 'Rental request submitted! Waiting for librarian approval.';

        this.snackbarService.open(message, 'Close');
        this.dialogRef.close();
        this.router.navigate(['/my-books']);
      },
      error: (error) => {
        this.isRenting = false;
        console.error('Error renting book:', error);
        this.snackbarService.open(error.message || 'Failed to rent book', 'Close');
      }
    });
  }
}
