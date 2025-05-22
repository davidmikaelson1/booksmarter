import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService, PendingOrder, OrderAuthorization, OrderWithDetails } from '../../../services/order.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ImagePathService } from '../../../services/image-path.service';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    FormsModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.scss']
})
export class ManageOrdersComponent implements OnInit {
  pendingRentals: PendingOrder[] = [];
  pendingReturns: PendingOrder[] = [];
  allOrders: OrderWithDetails[] = [];
  selectedTabIndex = 0;
  loadingRentals = false;
  loadingReturns = false;
  loadingAllOrders = false;
  currentTerminalId = 1; // Default, should be set from auth service
  currentLibrarianId = 1; // Default, should be set from auth service

  // Define columns for both tables
  rentalColumns: string[] = ['title', 'reader', 'requestDate', 'actions'];
  returnColumns: string[] = ['title', 'reader', 'requestDate', 'actions'];
  allOrdersColumns: string[] = ['title', 'reader', 'status', 'rentDate', 'returnDate', 'returnDeadline'];

  constructor(
    private orderService: OrderService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private dialog: MatDialog,
    private imagePathService: ImagePathService
  ) {}

  ngOnInit(): void {
    // Get terminal and librarian ID from auth service
    this.authService.currentUser.subscribe(user => {
      if (user && user.terminalId) {
        this.currentTerminalId = user.terminalId;
        this.currentLibrarianId = user.userId;

        this.loadPendingRentals();
        this.loadPendingReturns();
        this.loadAllOrders();
      } else {
        this.snackbarService.open('You must be logged in as a librarian to view this page', 'Close');
      }
    });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    if (event.index === 0) {
      this.loadPendingRentals();
    } else if (event.index === 1) {
      this.loadPendingReturns();
    } else {
      this.loadAllOrders();
    }
  }

  loadPendingRentals(): void {
    this.loadingRentals = true;
    this.orderService.getPendingRentals(this.currentTerminalId).subscribe({
      next: (rentals) => {
        this.pendingRentals = rentals;
        this.loadingRentals = false;
      },
      error: (error) => {
        console.error('Error loading pending rentals:', error);
        this.loadingRentals = false;
        this.snackbarService.open('Could not load pending rental requests', 'Close');
      }
    });
  }

  loadPendingReturns(): void {
    this.loadingReturns = true;
    this.orderService.getPendingReturns(this.currentTerminalId).subscribe({
      next: (returns) => {
        this.pendingReturns = returns;
        this.loadingReturns = false;
      },
      error: (error) => {
        console.error('Error loading pending returns:', error);
        this.loadingReturns = false;
        this.snackbarService.open('Could not load pending return requests', 'Close');
      }
    });
  }

  loadAllOrders(): void {
    this.loadingAllOrders = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.loadingAllOrders = false;
      },
      error: (error) => {
        console.error('Error loading all orders:', error);
        this.loadingAllOrders = false;
        this.snackbarService.open('Could not load all orders', 'Close');
      }
    });
  }

  approveRental(rental: PendingOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Approve Rental',
        message: `Are you sure you want to approve the rental of "${rental.bookTitle}" to ${rental.readerName}?`,
        confirmButton: 'Approve'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processRentalApproval(rental.rentId);
      }
    });
  }

  denyRental(rental: PendingOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Deny Rental',
        message: `Are you sure you want to deny the rental of "${rental.bookTitle}" to ${rental.readerName}?`,
        prompt: true,
        confirmButton: 'Deny'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processRentalDenial(rental.rentId, result.notes);
      }
    });
  }

  approveReturn(returnItem: PendingOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Approve Return',
        message: `Are you sure you want to approve the return of "${returnItem.bookTitle}" from ${returnItem.readerName}?`,
        prompt: true,
        promptLabel: 'Return Notes (optional)',
        confirmButton: 'Approve'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processReturnApproval(returnItem.rentId, result.notes);
      }
    });
  }

  denyReturn(returnItem: PendingOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Deny Return',
        message: `Are you sure you want to deny the return of "${returnItem.bookTitle}" from ${returnItem.readerName}?`,
        prompt: true,
        confirmButton: 'Deny'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processReturnDenial(returnItem.rentId, result.notes);
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
      default: return status;
    }
  }

  refreshAllData(): void {
    this.loadPendingRentals();
    this.loadPendingReturns();
    this.loadAllOrders();
  }

  private processRentalApproval(rentId: number): void {
    this.loadingRentals = true;

    this.orderService.approveRental(rentId, this.currentLibrarianId).subscribe({
      next: () => {
        this.loadingRentals = false;
        this.snackbarService.open('Rental approved successfully', 'Close', 3000);
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Error processing rental approval:', error);
        this.loadingRentals = false;
        this.snackbarService.open(error.message || 'Failed to approve rental', 'Close');
      }
    });
  }

  private processRentalDenial(rentId: number, reason: string): void {
    this.loadingRentals = true;

    this.orderService.denyRental(rentId, this.currentLibrarianId, reason).subscribe({
      next: () => {
        this.loadingRentals = false;
        this.snackbarService.open('Rental denied successfully', 'Close', 3000);
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Error processing rental denial:', error);
        this.loadingRentals = false;
        this.snackbarService.open(error.message || 'Failed to deny rental', 'Close');
      }
    });
  }

  private processReturnApproval(rentId: number, notes: string): void {
    this.loadingReturns = true;

    this.orderService.approveReturn(rentId, this.currentLibrarianId, notes).subscribe({
      next: () => {
        this.loadingReturns = false;
        this.snackbarService.open('Return approved successfully', 'Close', 3000);
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Error processing return approval:', error);
        this.loadingReturns = false;
        this.snackbarService.open(error.message || 'Failed to approve return', 'Close');
      }
    });
  }

  private processReturnDenial(rentId: number, reason: string): void {
    this.loadingReturns = true;

    this.orderService.denyRental(rentId, this.currentLibrarianId, reason).subscribe({
      next: () => {
        this.loadingReturns = false;
        this.snackbarService.open('Return denied successfully', 'Close', 3000);
        this.refreshAllData();
      },
      error: (error) => {
        console.error('Error processing return denial:', error);
        this.loadingReturns = false;
        this.snackbarService.open(error.message || 'Failed to deny return', 'Close');
      }
    });
  }

  getCoverImagePath(coverUrl: string | undefined): string {
    return this.imagePathService.getCoverImagePath(coverUrl);
  }
}
