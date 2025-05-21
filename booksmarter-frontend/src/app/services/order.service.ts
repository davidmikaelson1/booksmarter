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
    // Enhanced debugging
    console.log('Getting HTTP options, auth state:', {
      isAuthenticated: this.authService.isAuthenticated(),
      user: this.authService.currentUserValue
    });

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
   * Rent a book
   */
  rentBook(userId: number, bookId: number, terminalId: number = 1): Observable<Order> {
    const payload = {
      userId,
      instanceId: bookId,
      terminalId // Add terminalId to the payload
    };

    return this.http.post<Order>(
      `${this.apiUrl}/rent`,
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
  getPendingReturns(): Observable<PendingOrder[]> {
    return this.http.get<PendingOrder[]>(
      `${this.apiUrl}/pending/returns`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Authorize or deny a return (librarian function)
   */
  authorizeReturn(rentId: number, authorization: OrderAuthorization): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/${rentId}/authorize-return`, // FIXED: Changed from /authorize to /authorize-return
      authorization,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Create a new order (mostly used internally by rentBook)
   */
  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}`,
      order,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Update an order
   */
  updateOrder(rentId: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/${rentId}`,
      order,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Delete an order (admin function)
   */
  deleteOrder(rentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${rentId}`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get pending rental requests (librarian function)
   */
  getPendingRentals(): Observable<PendingOrder[]> {
    return this.http.get<PendingOrder[]>(
      `${this.apiUrl}/pending/rentals`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Approve or deny a rental request (librarian function)
   */
  approveRental(rentId: number, authorization: OrderAuthorization): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/${rentId}/authorize-rental`,
      authorization,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  /**
   * Mark an order as completed instead of deleting it
   */
  markOrderCompleted(rentId: number): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/${rentId}/complete`,
      {},
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
      if (typeof error.error === 'object' && error.error !== null && 'error' in error.error) {
        errorMessage = error.error.error;
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
