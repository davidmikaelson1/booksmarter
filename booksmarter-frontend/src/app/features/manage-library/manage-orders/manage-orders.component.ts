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
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

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
  allOrders: OrderWithDetails[] = []; // New property for all orders
  selectedTabIndex = 0;
  loadingRentals = false;
  loadingReturns = false;
  loadingAllOrders = false; // New loading state

  // Define columns for both tables
  rentalColumns: string[] = ['title', 'reader', 'requestDate', 'actions'];
  returnColumns: string[] = ['title', 'reader', 'requestDate', 'actions'];
  // Define columns for all orders table
  allOrdersColumns: string[] = ['title', 'reader', 'status', 'rentDate', 'returnDate', 'returnDeadline'];

  constructor(
    private orderService: OrderService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPendingRentals();
    this.loadPendingReturns();
    this.loadAllOrders(); // Add this new method call
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    if (event.index === 0) {
      this.loadPendingRentals();
    } else {
      this.loadPendingReturns();
    }
  }

  loadPendingRentals(): void {
    this.loadingRentals = true;
    this.orderService.getPendingRentals().subscribe({
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
    this.orderService.getPendingReturns().subscribe({
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

  // Add this new method to fetch all orders
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
        this.processRentalApproval(rental.rentId, true);
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
        this.processRentalApproval(rental.rentId, false, result.notes);
      }
    });
  }

  approveReturn(returnItem: PendingOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Approve Return',
        message: `Are you sure you want to approve the return of "${returnItem.bookTitle}" from ${returnItem.readerName}?`,
        confirmButton: 'Approve'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processReturnApproval(returnItem.rentId, true);
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
        penalty: true,
        confirmButton: 'Deny'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processReturnApproval(
          returnItem.rentId,
          false,
          result.notes,
          result.penalty
        );
      }
    });
  }

  // Helper method to display the status in a readable format
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

  // When actions are performed, refresh all related data
  refreshAllData(): void {
    this.loadPendingRentals();
    this.loadPendingReturns();
    this.loadAllOrders();
  }

  private processRentalApproval(rentId: number, approved: boolean, notes?: string): void {
    this.loadingRentals = true;

    const authorization: OrderAuthorization = {
      approved,
      notes
    };

    this.orderService.approveRental(rentId, authorization).subscribe({
      next: () => {
        this.loadingRentals = false;
        const message = approved
          ? 'Rental approved successfully'
          : 'Rental denied successfully';
        this.snackbarService.open(message, 'Close');
        this.refreshAllData(); // Replace loadPendingRentals with refreshAllData
      },
      error: (error) => {
        console.error('Error processing rental approval:', error);
        this.loadingRentals = false;
        this.snackbarService.open(error.message || 'Failed to process rental', 'Close');
      }
    });
  }

  private processReturnApproval(rentId: number, approved: boolean, notes?: string, penalty?: number): void {
    this.loadingReturns = true;

    const authorization: OrderAuthorization = {
      approved,
      notes,
      penalty
    };

    this.orderService.authorizeReturn(rentId, authorization).subscribe({
      next: () => {
        this.loadingReturns = false;
        const message = approved
          ? 'Return approved successfully'
          : 'Return denied successfully';
        this.snackbarService.open(message, 'Close');
        this.refreshAllData(); // Replace loadPendingReturns with refreshAllData
      },
      error: (error) => {
        console.error('Error processing return approval:', error);
        this.loadingReturns = false;
        this.snackbarService.open(error.message || 'Failed to process return', 'Close');
      }
    });
  }
}
