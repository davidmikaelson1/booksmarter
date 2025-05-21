import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCardComponent } from '../book-card/book-card.component';
import { Book } from '../../models/book.model';
import { BookWithInstance } from '../../services/book.service';

@Component({
  selector: 'app-book-carousel',
  standalone: true,
  imports: [CommonModule, BookCardComponent],
  templateUrl: './book-carousel.component.html',
  styleUrls: ['./book-carousel.component.scss']
})
export class BookCarouselComponent implements OnInit {
  @Input() title?: string;
  @Input() bookInstances: BookWithInstance[] = [];
  @Input() books: Book[] = []; // Keep for backward compatibility

  visibleBookInstances: BookWithInstance[] = [];
  currentIndex = 0;

  ngOnInit(): void {
    // If bookInstances input is provided, use that
    if (this.bookInstances && this.bookInstances.length > 0) {
      this.updateVisibleBooks();
    }
    // Fallback to books input for backward compatibility
    else if (this.books && this.books.length > 0) {
      this.bookInstances = this.books.map(book => ({
        ...book,
        instance: {
          instanceId: 0,
          bookId: book.bookId,
          collectionId: 0,
          totalCopies: 0,
          availableCopies: 0
        }
      }));
      this.updateVisibleBooks();
    }
  }

  updateVisibleBooks(): void {
    // Show 3 books at a time
    this.visibleBookInstances = this.bookInstances.slice(this.currentIndex, this.currentIndex + 3);
  }

  next(): void {
    if (this.currentIndex + 1 < this.bookInstances.length) {
      this.currentIndex += 1; // Move by one book
      this.updateVisibleBooks();
    }
  }

  prev(): void {
    if (this.currentIndex - 1 >= 0) {
      this.currentIndex -= 1; // Move by one book
      this.updateVisibleBooks();
    }
  }
}
