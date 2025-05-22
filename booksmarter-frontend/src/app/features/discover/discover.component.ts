import { Component, OnInit } from '@angular/core';
import { BookService, BookWithInstance } from '../../services/book.service';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book.model';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    FooterComponent,
    BookCardComponent,
    MatPaginatorModule,
  ],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  books: BookWithInstance[] = [];
  pagedBooks: BookWithInstance[] = [];
  pageSize = 30;
  pageIndex = 0;
  totalBooks = 0;
  searchQuery: string = '';
  noResults: boolean = false;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService // Inject SnackbarService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = (params['q'] || '').toLowerCase();
      this.bookService.getAllBooks().subscribe({
        next: (books: Book[]) => {
          // Convert Book[] to BookWithInstance[] with a dummy instance (like home.component.ts)
          let mappedBooks = books.map(book => ({
            ...book,
            instance: {
              instanceId: 0,
              bookId: book.bookId,
              collectionId: 0,
              totalCopies: 0,
              availableCopies: 0
            }
          }));
          // Filter if searchQuery is present
          if (this.searchQuery) {
            mappedBooks = mappedBooks.filter(book =>
              (book.title?.toLowerCase().includes(this.searchQuery) ||
               book.author?.toLowerCase().includes(this.searchQuery) ||
               book.genre?.toLowerCase().includes(this.searchQuery))
            );
          }
          this.books = mappedBooks;
          this.totalBooks = this.books.length;
          this.pageIndex = 0;
          this.updatePagedBooks();
          this.noResults = this.books.length === 0 && !!this.searchQuery;
          if (this.noResults) {
            this.snackbarService.open('No books found for your search.', 'Close', 3000);
          }
        }
      });
    });
  }

  updatePagedBooks(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedBooks = this.books.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedBooks();
  }

  getRows(): BookWithInstance[][] {
    const rows: BookWithInstance[][] = [];
    for (let i = 0; i < this.pagedBooks.length; i += 3) {
      rows.push(this.pagedBooks.slice(i, i + 3));
    }
    return rows;
  }
}
