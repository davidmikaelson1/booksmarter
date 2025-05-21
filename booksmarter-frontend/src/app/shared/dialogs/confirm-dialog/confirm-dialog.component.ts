import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogData {
  title: string;
  message: string;
  prompt?: boolean; // Whether to show a text field for notes
  penalty?: boolean; // Whether to show a number field for penalty
  confirmButton?: string; // Custom confirm button text
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>

      <mat-form-field *ngIf="data.prompt" appearance="outline" class="full-width">
        <mat-label>Notes</mat-label>
        <textarea matInput [(ngModel)]="notes" placeholder="Enter reason or notes"></textarea>
      </mat-form-field>

      <mat-form-field *ngIf="data.penalty" appearance="outline" class="full-width">
        <mat-label>Penalty Amount</mat-label>
        <input matInput type="number" [(ngModel)]="penalty" min="0" placeholder="Enter penalty amount (if any)">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-button color="primary"
              [mat-dialog-close]="data.prompt || data.penalty ? { notes: notes, penalty: penalty } : true">
        {{ data.confirmButton || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class ConfirmDialogComponent {
  notes: string = '';
  penalty: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
