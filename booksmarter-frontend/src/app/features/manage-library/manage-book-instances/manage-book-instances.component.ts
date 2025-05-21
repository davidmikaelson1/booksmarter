import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { Library } from '../../../models/library.model';
import { BookService, BookWithInstance } from '../../../services/book.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { TerminalService } from '../../../services/terminal.service';
import { AddBookInstanceDialogComponent } from '../../../shared/dialogs/add-book-instance-dialog/add-book-instance-dialog.component';
import { EditBookInstanceDialogComponent } from '../../../shared/dialogs/edit-book-instance-dialog/edit-book-instance-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-book-instances',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './manage-book-instances.component.html',
  styleUrls: ['./manage-book-instances.component.scss']
})
export class ManageBookInstancesComponent implements OnInit {
  terminals: Library[] = [];
  selectedTerminalId?: number;
  bookInstances: BookWithInstance[] = [];
  instanceColumns: string[] = ['title', 'author', 'genre', 'availableCopies', 'totalCopies', 'edit', 'delete'];

  private bookService = inject(BookService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);
  private terminalService = inject(TerminalService);

  ngOnInit(): void {
    this.fetchTerminals();
  }

  fetchTerminals(): void {
    this.terminalService.getAllTerminals().subscribe({
      next: (terminals) => {
        this.terminals = terminals;
      },
      error: (err) => {
        console.error('Error fetching terminals:', err);
        this.snackbarService.open('Error loading terminals', 'Close', 3000);
      }
    });
  }

  onTerminalChange(): void {
    if (this.selectedTerminalId) {
      this.fetchBookInstances();
    }
  }

  fetchBookInstances(): void {
    if (!this.selectedTerminalId) return;

    this.bookService.getBookInstancesByTerminal(this.selectedTerminalId).subscribe({
      next: (books) => {
        this.bookInstances = books;
      },
      error: (err) => {
        console.error('Error fetching book instances:', err);
        this.snackbarService.open('Error loading books', 'Close', 3000);
      }
    });
  }

  openAddBookInstanceDialog(): void {
    const selectedTerminal = this.terminals.find(t => t.terminalId === this.selectedTerminalId);

    if (!selectedTerminal) {
      this.snackbarService.open('Please select a terminal first', 'Close', 3000);
      return;
    }

    const dialogRef = this.dialog.open(AddBookInstanceDialogComponent, {
      width: '600px',
      data: {
        terminalId: this.selectedTerminalId,
        terminalName: selectedTerminal.name
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bookService.addBookToCollection(result).subscribe({
          next: () => {
            this.snackbarService.open('Book added to collection successfully', 'Close', 3000);
            this.fetchBookInstances();
          },
          error: (err) => {
            this.snackbarService.open(err.message, 'Close', 3000);
          },
        });
      }
    });
  }

  editInstance(bookWithInstance: BookWithInstance): void {
    if (!bookWithInstance?.instance) {
      console.error('Invalid book instance data:', bookWithInstance);
      this.snackbarService.open('Error: Book instance data is missing', 'Close', 3000);
      return;
    }

    const dialogRef = this.dialog.open(EditBookInstanceDialogComponent, {
      width: '400px',
      data: bookWithInstance
    });

    dialogRef.afterClosed().subscribe(totalCopies => {
      if (totalCopies) {
        this.bookService.updateBookInstance(
          bookWithInstance.instance.instanceId,
          totalCopies
        ).subscribe({
          next: () => {
            this.snackbarService.open('Book copies updated successfully', 'Close', 3000);
            this.fetchBookInstances();
          },
          error: (error) => {
            console.error('Error updating book copies:', error);
            const errorMessage = error.message || 'Error updating book copies';
            this.snackbarService.open(errorMessage, 'Close', 5000);
          }
        });
      }
    });
  }

  deleteInstance(bookWithInstance: BookWithInstance): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to remove "${bookWithInstance.title}" from this collection?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookService.deleteBookInstance(bookWithInstance.instance.instanceId)
          .subscribe({
            next: () => {
              this.snackbarService.open('Book removed from collection', 'Close', 3000);
              this.fetchBookInstances();
            },
            error: (error) => {
              console.error('Error deleting book instance:', error);
              this.snackbarService.open(error.message, 'Close', 3000);
            }
          });
      }
    });
  }
}
