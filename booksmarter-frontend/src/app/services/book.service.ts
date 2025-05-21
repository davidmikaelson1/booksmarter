import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Book } from '../models/book.model';
import { AuthService } from './auth.service';
import { BookInstance } from '../models/book-instance.model';

export interface BookWithInstance extends Book {
  instance: BookInstance;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Add the getHttpOptions method
  private getHttpOptions() {
    return {
      withCredentials: true
    };
  }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`)
      .pipe(catchError(this.handleError));
  }

  addBook(bookData: Omit<Book, 'bookId'>): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/books`, bookData)
      .pipe(catchError(this.handleError));
  }

  updateBook(bookId: number, bookData: Partial<Omit<Book, 'bookId'>>): Observable<Book> {
    const terminalId = this.authService.currentUserValue?.terminalId;

    if (!terminalId) {
      return throwError(() => new Error('Terminal ID is missing'));
    }

    return this.http.put<Book>(`${this.apiUrl}/books/${bookId}?terminalId=${terminalId}`, bookData)
      .pipe(catchError(this.handleError));
  }

  deleteBook(bookId: number): Observable<void> {
    const terminalId = this.authService.currentUserValue?.terminalId;

    if (!terminalId) {
      return throwError(() => new Error('Terminal ID is missing'));
    }

    return this.http.delete<void>(`${this.apiUrl}/books/${bookId}?terminalId=${terminalId}`)
      .pipe(catchError(this.handleError));
  }

  getBookInstancesByTerminal(terminalId: number): Observable<BookWithInstance[]> {
    // Fix the type issue by using the correct HttpClient options
    return this.http.get<BookWithInstance[]>(
      `${this.apiUrl}/instances/terminal/${terminalId}`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  updateBookInstance(instanceId: number, totalCopies: number): Observable<BookInstance> {
    // Add HTTP options for consistency
    return this.http.patch<BookInstance>(
      `${this.apiUrl}/book-instances/${instanceId}`,
      { totalCopies },
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  deleteBookInstance(instanceId: number): Observable<void> {
    // Add HTTP options for consistency
    return this.http.delete<void>(
      `${this.apiUrl}/book-instances/${instanceId}`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  addBookToCollection(data: { bookId: number, totalCopies: number, collectionId: number }): Observable<BookInstance> {
    // Add HTTP options for consistency
    return this.http.post<BookInstance>(
      `${this.apiUrl}/book-instances`,
      data,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
  }
}
