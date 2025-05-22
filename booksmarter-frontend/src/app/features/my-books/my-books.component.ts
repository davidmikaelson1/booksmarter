import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService, OrderWithDetails } from '../../services/order.service';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ImagePathService } from '../../services/image-path.service';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { BookInstance } from '../../models/book-instance.model';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    ToolbarComponent,
    FooterComponent,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './my-books.component.html',
  styleUrls: ['./my-books.component.scss']
})
export class MyBooksComponent implements OnInit {
  myBooks: OrderWithDetails[] = [];
  bookInstances: BookInstance[] = [];
  booksById: { [bookId: number]: Book } = {};
  instanceIdToBookId: { [instanceId: number]: number } = {}; // Add this property
  today = new Date();
  currentReaderId: number | null = null;

  // Columns to display in the table
  displayedColumns: string[] = ['book', 'status', 'rentDate', 'returnDeadline', 'actions'];

  constructor(
    private orderService: OrderService,
    private bookService: BookService, // Add BookService
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private imagePathService: ImagePathService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      if (user && user.userId) {
        this.currentReaderId = user.userId;
        this.loadMyBooks();
      }
    });
  }

  // Update loadMyBooks method to flatten the response object
  loadMyBooks(): void {
    if (!this.currentReaderId) {
      this.snackbarService.open('You must be logged in to view your books', 'Close');
      return;
    }

    this.orderService.getReaderRentedBooks(this.currentReaderId).subscribe({
      next: (response: any) => {
        // Flatten grouped response if needed
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          this.myBooks = [
            ...(response.active || []),
            ...(response.pending_approval || []),
            ...(response.pending_return || []),
            ...(response.denied || []),
            ...(response.returned || [])
          ];
        } else {
          this.myBooks = response;
        }

        // Get all unique book instance IDs from orders
        const instanceIds = Array.from(new Set(this.myBooks.map(order => order.rentedBookId).filter(Boolean)));

        if (instanceIds.length === 0) {
          return;
        }

        // Fetch all BookInstances, then fetch all Books by bookId
        this.bookService.getBookInstancesByIds(instanceIds).subscribe({
          next: (instances) => {
            console.log('Fetched instances:', instances); // <-- Add this
            this.bookInstances = instances;
            this.instanceIdToBookId = {};
            instances.forEach(inst => {
              console.log('Mapping:', inst.instanceId, inst.bookId); // <-- Add this
              this.instanceIdToBookId[Number(inst.instanceId)] = inst.bookId;
            });
            const bookIds = Array.from(new Set(instances.map(inst => inst.bookId)));
            this.bookService.getBooksByIds(bookIds).subscribe({
              next: (books) => {
                // Map books by their ID for quick lookup
                this.booksById = {};
                books.forEach(book => this.booksById[book.bookId] = book);
              },
              error: () => {
              }
            });
          },
          error: () => {
          }
        });
      },
      error: () => {
        this.snackbarService.open('Could not load your books', 'Close');
      }
    });
  }

  // Helper to get book title by order
  getBookTitle(order: OrderWithDetails): string {
    return order.bookTitle || 'Unknown';
  }

  initiateReturn(book: OrderWithDetails): void {
    const isResubmission = book.status === 'Denied';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: isResubmission ? 'Resubmit Return' : 'Return Book',
        message: isResubmission
          ? `Are you sure you want to resubmit "${book.bookTitle}" for return?`
          : `Are you sure you want to return "${book.bookTitle}"?`,
        confirmButton: isResubmission ? 'Resubmit' : 'Return'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processReturn(book.rentId);
      }
    });
  }

  private processReturn(rentId: number): void {
    this.orderService.initiateReturn(rentId).subscribe({
      next: () => {
        this.snackbarService.open(
          'Return initiated. Please return the book to the library for inspection.',
          'Close',
          5000
        );
        this.loadMyBooks(); // Refresh the list
      },
      error: (error) => {
        this.snackbarService.open(error.message || 'Could not initiate return', 'Close');
      }
    });
  }

  /**
   * Create a new book rental request
   */
  rentNewBook(instanceId: number): void {
    if (!this.currentReaderId) {
      this.snackbarService.open('You must be logged in to rent books', 'Close');
      return;
    }

    // Calculate rental period (default 14 days)
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 14);

    // Format dates for API
    const rentDate = this.formatDate(today);
    const returnDeadline = this.formatDate(returnDate);

    this.orderService.rentBook(
      this.currentReaderId,
      instanceId,
      rentDate,
      returnDeadline
    ).subscribe({
      next: () => {
        this.snackbarService.open('Book rental request submitted successfully', 'Close', 3000);
        this.loadMyBooks();
      },
      error: (error) => {
        console.error('Error renting book:', error);
        this.snackbarService.open(error.message || 'Could not rent book', 'Close');
      }
    });
  }

  /**
   * Cancel a pending book request
   */
  cancelRequest(book: OrderWithDetails): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Cancel Request',
        message: `Are you sure you want to cancel your request for "${book.bookTitle}"?`,
        confirmButton: 'Cancel Request'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.deleteOrder(book.rentId).subscribe({
          next: () => {
            this.snackbarService.open('Book request cancelled successfully', 'Close', 3000);
            this.loadMyBooks(); // Refresh the list
          },
          error: (error) => {
            console.error('Error cancelling book request:', error);
            this.snackbarService.open(error.message || 'Could not cancel book request', 'Close');
          }
        });
      }
    });
  }

  // Helper method to format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStatusDisplay(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'PENDING_APPROVAL': return 'Pending Approval';
      case 'PENDING_RETURN': return 'Pending Return';
      case 'RETURNED': return 'Returned';
      case 'DENIED': return 'Denied';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  // Update the canInitiateReturn method to allow DENIED books to be returned
  canInitiateReturn(status: string): boolean {
    // Allow returns for ACTIVE or DENIED status
    return status === 'ACTIVE' || status === 'DENIED';
  }

  isBookOverdue(returnDeadline: string): boolean {
    if (!returnDeadline) return false;
    const deadline = new Date(returnDeadline);
    return deadline < this.today;
  }

  getDaysUntilDue(returnDeadline: string): number {
    if (!returnDeadline) return 0;
    const deadline = new Date(returnDeadline);
    const diffTime = deadline.getTime() - this.today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Add this method to handle image paths consistently
  getCoverImagePath(coverUrl: string | undefined): string {
    return this.imagePathService.getCoverImagePath(coverUrl);
  }

  // Filter books by status for UI organization
  filterBooksByStatus(statuses: string[]): OrderWithDetails[] {
    return this.myBooks.filter(book => statuses.includes(book.status));
  }

  // Helper method to get appropriate action text based on status
  getActionText(status: string): string {
    switch (status) {
      case 'PENDING_APPROVAL': return 'Awaiting Approval';
      case 'PENDING_RETURN': return 'Return Processing';
      case 'ACTIVE': return 'Return Book';
      case 'RETURNED': return 'Returned';
      case 'COMPLETED': return 'Completed';
      case 'DENIED': return 'Request Denied';
      default: return '';
    }
  }
}
