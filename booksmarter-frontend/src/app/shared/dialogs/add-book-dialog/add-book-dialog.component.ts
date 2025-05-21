import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-add-book-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, // Add MatSelectModule to imports
    ReactiveFormsModule,
  ],
  templateUrl: './add-book-dialog.component.html',
  styleUrls: ['./add-book-dialog.component.scss'],
})
export class AddBookDialogComponent {
  bookForm: FormGroup;
  genres: string[] = ['Art', 'Biography', 'Fiction', 'History', 'Mystery', 'Psychology', 'Romance'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddBookDialogComponent>
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genre: ['', Validators.required],
      coverUrl: ['']
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitBook(): void {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      const bookData: Omit<Book, 'bookId'> = {
        title: formValue.title,
        author: formValue.author,
        genre: formValue.genre,
        coverUrl: formValue.coverUrl || undefined
      };
      this.dialogRef.close(bookData);
    } else {
      console.error('Form is invalid:', this.bookForm.errors);
    }
  }
}
