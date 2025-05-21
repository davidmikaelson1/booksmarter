import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Book } from '../../../models/book.model';
import { Library } from '../../../models/library.model';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-add-book-instance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-book-instance-dialog.component.html',
  styleUrls: ['./add-book-instance-dialog.component.scss'],
})
export class AddBookInstanceDialogComponent implements OnInit {
  instanceForm: FormGroup;
  books: Book[] = [];
  filteredBooks: Book[] = [];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    public dialogRef: MatDialogRef<AddBookInstanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { terminalId: number, terminalName: string }
  ) {
    this.instanceForm = this.fb.group({
      bookId: ['', Validators.required],
      totalCopies: [1, [Validators.required, Validators.min(1)]],
      searchTerm: ['']
    });

    // Filter books when search changes
    this.instanceForm.get('searchTerm')?.valueChanges.subscribe(value => {
      this.filterBooks(value);
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
      },
      error: (err) => {
        console.error('Error loading books:', err);
      }
    });
  }

  filterBooks(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredBooks = this.books;
      return;
    }

    searchTerm = searchTerm.toLowerCase();
    this.filteredBooks = this.books.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    if (this.instanceForm.valid) {
      const formValue = this.instanceForm.value;
      this.dialogRef.close({
        bookId: formValue.bookId,
        totalCopies: formValue.totalCopies,
        collectionId: this.data.terminalId
      });
    } else {
      console.error('Form is invalid:', this.instanceForm.errors);
    }
  }
}
