import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { Book } from '../models/book.model';
import { AuthService } from './auth.service';

/**
 * Extended Order interface to include book details for display
 */
export interface OrderWithDetails extends Order {
  book?: Book;
  readerName?: string;
  bookTitle?: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
}

/**
 * Interface for pending returns or rental requests that need librarian approval
 */
export interface PendingOrder extends Order {
  readerName: string;
  book?: Book;
  bookTitle?: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
}

/**
 * Interface for authorizing a return or rental
 */
export interface OrderAuthorization {
  approved: boolean;
  notes?: string;
  penalty?: number; // Only for returns
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  private authService=inject(AuthService);

  constructor(private http: HttpClient) { }

  // Get HTTP options with credentials
  private getHttpOptions() {
    const options = {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return options;
  }

  /**
   * Get all orders (admin/librarian function)
   */
  getAllOrders(): Observable<OrderWithDetails[]> {
    return this.http.get<OrderWithDetails[]>(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   * Get order by ID
   */
  getOrderById(rentId: number): Observable<OrderWithDetails> {
    return this.http.get<OrderWithDetails>(`${this.apiUrl}/${rentId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all rented books for a reader
   */
  getReaderRentedBooks(readerId: number): Observable<OrderWithDetails[]> {
    return this.http.get<OrderWithDetails[]>(`${this.apiUrl}/reader/${readerId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   * Rent a book (create rental request)
   */
  rentBook(readerId: number, instanceId: number, rentDate: string, returnDeadline: string): Observable<Order> {
    const payload = {
      readerId,
      instanceId,
      rentDate,
      returnDeadline
    };

    return this.http.post<Order>(
      `${this.apiUrl}`,
      payload,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Initiate a book return
   */
  initiateReturn(rentId: number): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/${rentId}/return`,
      {},
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get pending returns (librarian function)
   */
  getPendingReturns(terminalId: number): Observable<PendingOrder[]> {
    return this.http.get<PendingOrder[]>(
      `${this.apiUrl}/terminal/${terminalId}/pending-return`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get pending rentals (librarian function)
   */
  getPendingRentals(terminalId: number): Observable<PendingOrder[]> {
    return this.http.get<PendingOrder[]>(
      `${this.apiUrl}/terminal/${terminalId}/pending-approval`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Approve rental request (librarian function)
   */
  approveRental(rentId: number, librarianId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${rentId}/approve`,
      { librarianId },
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Deny rental request (librarian function)
   */
  denyRental(rentId: number, librarianId: number, reason: string = ''): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${rentId}/deny`,
      { librarianId, reason },
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Approve return request (librarian function)
   */
  approveReturn(rentId: number, librarianId: number, returnNotes: string = ''): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${rentId}/return/approve`,
      { librarianId, returnNotes },
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Delete an order (only denied orders can be deleted)
   */
  deleteOrder(rentId: number): Observable<void> {
    const readerId = this.authService.currentUserValue?.userId;
    return this.http.delete<void>(
      `${this.apiUrl}/${rentId}`,
      {
        ...this.getHttpOptions(),
        body: { readerId }
      }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get book details for an order by book instance ID
   */
  getBookDetailsForOrder(instanceId: number): Observable<Book> {
    return this.http.get<Book>(
      `${this.apiUrl}/book-instances/${instanceId}/book`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Map backend status to frontend status enum
   */
  mapOrderStatus(backendStatus: string): 'Waiting' | 'Denied' | 'Approved' {
    switch (backendStatus) {
      case 'ACTIVE':
        return 'Approved';
      case 'PENDING_APPROVAL':
        return 'Waiting';
      case 'PENDING_RETURN':
        return 'Waiting';
      case 'RETURNED':
        return 'Approved';
      case 'DENIED':
        return 'Denied';
      default:
        return 'Waiting';
    }
  }

  /**
   * Generic error handler
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (typeof error.error === 'object' && error.error !== null && 'message' in error.error) {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `Server error (${error.status}): ${error.statusText}`;
      }
    }
    console.error('Order service error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
