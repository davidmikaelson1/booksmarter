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
import { Book } from '../../../models/book.model';
import { BookService } from '../../../services/book.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { AddBookDialogComponent } from '../../../shared/dialogs/add-book-dialog/add-book-dialog.component';
import { EditBookDialogComponent } from '../../../shared/dialogs/edit-book-dialog/edit-book-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-books',
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
  ],
  templateUrl: './manage-books.component.html',
  styleUrls: ['./manage-books.component.scss']
})
export class ManageBooksComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchQuery: string = '';
  displayedColumns: string[] = ['title', 'author', 'genre', 'edit', 'delete'];

  private bookService = inject(BookService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
      },
      error: (err) => {
        console.error('Error fetching books:', err);
        this.snackbarService.open('Error loading books', 'Close', 3000);
      },
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredBooks = this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
    );
  }

  openAddBookDialog(): void {
    const dialogRef = this.dialog.open(AddBookDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bookService.addBook(result).subscribe({
          next: () => {
            this.snackbarService.open('Book added successfully', 'Close', 3000);
            this.fetchBooks();
          },
          error: (err) => {
            this.snackbarService.open(err.message, 'Close', 3000);
          },
        });
      }
    });
  }

  editBook(book: Book): void {
    const dialogRef = this.dialog.open(EditBookDialogComponent, {
      width: '600px',
      data: book
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookService.updateBook(book.bookId, result).subscribe({
          next: () => {
            this.snackbarService.open('Book updated successfully', 'Close', 3000);
            this.fetchBooks();
          },
          error: (error) => {
            this.snackbarService.open(error.message, 'Close', 3000);
          }
        });
      }
    });
  }

  deleteBook(book: Book): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${book.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookService.deleteBook(book.bookId).subscribe({
          next: () => {
            this.snackbarService.open('Book deleted successfully', 'Close', 3000);
            this.fetchBooks();
          },
          error: (error) => {
            console.error('Error deleting book:', error.message);
            this.snackbarService.open(error.message, 'Close', 3000);
          }
        });
      }
    });
  }
}
