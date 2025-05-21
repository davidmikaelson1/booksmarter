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
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';

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
    MatTabsModule
  ],
  templateUrl: './my-books.component.html',
  styleUrls: ['./my-books.component.scss']
})
export class MyBooksComponent implements OnInit {
  myBooks: OrderWithDetails[] = [];
  loading = false;
  today = new Date(); // Add near the top of the class

  // Columns to display in the table
  displayedColumns: string[] = ['book', 'status', 'rentDate', 'returnDeadline', 'actions'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMyBooks();
  }

  loadMyBooks(): void {
    this.loading = true;

    // Subscribe to the auth service's currentUser observable
    this.authService.currentUser.subscribe({
      next: (user) => {
        if (!user || !user.userId) {
          this.snackbarService.open('You need to be logged in to view your books', 'Close');
          this.loading = false;
          return;
        }

        this.orderService.getReaderRentedBooks(user.userId).subscribe({
          next: (books) => {
            this.myBooks = books;
            this.loading = false;
            this.logOrderStatuses(); // Add debugging
          },
          error: (error) => {
            console.error('Error loading books:', error);
            this.snackbarService.open('Could not load your books', 'Close');
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Authentication error:', error);
        this.snackbarService.open('Authentication error', 'Close');
        this.loading = false;
      }
    });
  }

  initiateReturn(book: OrderWithDetails): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Return Book',
        message: `Are you sure you want to return "${book.bookTitle || book.bookTitle}"?`,
        confirmButton: 'Return'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processReturn(book.rentId);
      }
    });
  }

  private processReturn(rentId: number): void {
    this.loading = true;

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
        console.error('Error initiating return:', error);
        this.snackbarService.open(error.message || 'Could not initiate return', 'Close');
        this.loading = false;
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
        message: `Are you sure you want to cancel your request for "${book.bookTitle || book.bookTitle}"?`,
        confirmButton: 'Cancel Request'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.orderService.deleteOrder(book.rentId).subscribe({
          next: () => {
            this.snackbarService.open('Book request cancelled successfully', 'Close', 3000);
            this.loadMyBooks(); // Refresh the list
          },
          error: (error) => {
            console.error('Error cancelling book request:', error);
            this.snackbarService.open(error.message || 'Could not cancel book request', 'Close');
            this.loading = false;
          }
        });
      }
    });
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

  canInitiateReturn(status: string): boolean {
    // Only allow returns for active rentals
    return status === 'ACTIVE';
  }

  // Add a method to filter books by status for UI organization
  filterBooksByStatus(status: string | string[]): OrderWithDetails[] {
    const statusArray = Array.isArray(status) ? status : [status];
    return this.myBooks.filter(book => statusArray.includes(book.status));
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

  // Add a debug method to help diagnose status issues
  logOrderStatuses(): void {
    if (this.myBooks.length > 0) {
      console.log('Order statuses in myBooks:');
      console.log(this.myBooks.map(book => book.status));
      console.log('Pending orders:', this.filterBooksByStatus(['PENDING_APPROVAL', 'PENDING_RETURN']));
    }
  }
}
