import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-edit-book-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-book-dialog.component.html',
  styleUrls: ['./edit-book-dialog.component.scss']
})
export class EditBookDialogComponent {
  bookForm: FormGroup;
  genres: string[] = ['Art', 'Biography', 'Fiction', 'History', 'Mystery', 'Psychology', 'Romance'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditBookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Book
  ) {
    this.bookForm = this.fb.group({
      title: [data.title, Validators.required],
      author: [data.author, Validators.required],
      genre: [data.genre, Validators.required],
      coverUrl: [data.coverUrl]
    });
  }

  submitBook(): void {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      const bookData: Partial<Omit<Book, 'bookId'>> = {
        title: formValue.title,
        author: formValue.author,
        genre: formValue.genre,
        coverUrl: formValue.coverUrl || undefined
      };
      this.dialogRef.close(bookData);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
