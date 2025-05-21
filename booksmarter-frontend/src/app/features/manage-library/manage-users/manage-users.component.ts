import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryUser } from '../../../models/library-user.model';
import { UserService } from '../../../services/user.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  users: LibraryUser[] = [];
  filteredUsers: LibraryUser[] = [];
  searchQuery: string = '';
  displayedColumns: string[] = ['name', 'email', 'userType', 'terminalId', 'delete'];
  currentUserId: number | null = null;

  private userService = inject(UserService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.fetchUsers();
    this.currentUserId = this.authService.currentUserValue?.userId || null;
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.snackbarService.open('Error loading users', 'Close', 3000);
      },
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.userType.toLowerCase().includes(query)
    );
  }

  isCurrentUser(user: LibraryUser): boolean {
    return user.userId === this.currentUserId;
  }

  deleteUser(user: LibraryUser): void {
    // Prevent deletion of current user
    if (this.isCurrentUser(user)) {
      this.snackbarService.open('You cannot delete your own account', 'Close', 3000);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete user "${user.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.userId).subscribe({
          next: () => {
            this.snackbarService.open('User deleted successfully', 'Close', 3000);
            this.fetchUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error.message);
            this.snackbarService.open(error.message, 'Close', 3000);
          }
        });
      }
    });
  }
}
