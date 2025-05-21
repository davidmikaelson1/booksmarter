import { BookService, BookWithInstance } from './../../services/book.service';
import { Component, OnInit, inject } from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { BookCarouselComponent } from '../../shared/book-carousel/book-carousel.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Book } from '../../models/book.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent, ToolbarComponent, FooterComponent, BookCarouselComponent, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  bookInstances: BookWithInstance[] = [];
  loading = true; // Track loading state
  private bookService = inject(BookService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.getTerminalBooks();
  }

  getTerminalBooks(): void {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.terminalId) {
      this.bookService.getBookInstancesByTerminal(currentUser.terminalId).subscribe({
        next: (books) => {
          this.bookInstances = books;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading terminal books:', err);
          this.loading = false;
          // Fallback to all books if there's an error
          this.getAllBooks();
        },
      });
    } else {
      // If not logged in or terminal ID is missing, fetch all books
      this.getAllBooks();
    }
  }

  getAllBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        // Convert to BookWithInstance format with null instance
        this.bookInstances = books.map(book => ({
          ...book,
          instance: {
            instanceId: 0,
            bookId: book.bookId,
            collectionId: 0,
            totalCopies: 0,
            availableCopies: 0
          }
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading all books:', err);
        this.loading = false;
      },
    });
  }
}
