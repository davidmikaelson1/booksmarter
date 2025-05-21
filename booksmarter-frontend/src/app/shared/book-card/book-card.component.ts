import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../../models/book.model';
import { BookDialogComponent } from '../dialogs/book-dialog/book-dialog.component';
import { BookWithInstance } from '../../services/book.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
})
export class BookCardComponent {
  @Input() book?: Book; // Keep for backward compatibility
  @Input() bookWithInstance?: BookWithInstance;

  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    // Use bookWithInstance if available, otherwise use book
    const dialogData = this.bookWithInstance || this.book;

    if (dialogData) {
      this.dialog.open(BookDialogComponent, {
        data: dialogData,
        width: '600px',
      });
    }
  }
}
