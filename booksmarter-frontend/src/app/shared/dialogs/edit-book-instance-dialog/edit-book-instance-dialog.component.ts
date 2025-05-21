import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BookWithInstance } from '../../../services/book.service';

@Component({
  selector: 'app-edit-book-instance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-book-instance-dialog.component.html',
  styleUrls: ['./edit-book-instance-dialog.component.scss']
})
export class EditBookInstanceDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditBookInstanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookWithInstance
  ) {
    // Add null check and default value
    const currentCopies = data?.instance?.totalCopies || 1;

    this.form = this.fb.group({
      totalCopies: [currentCopies, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.totalCopies);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
