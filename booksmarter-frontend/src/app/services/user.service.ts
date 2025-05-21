import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { LibraryUser } from '../models/library-user.model';
import { Reader } from '../models/reader.model';
import { Librarian } from '../models/librarian.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get HTTP options with auth token
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true // Include credentials
    };
  }

  getAllUsers(): Observable<LibraryUser[]> {
    return this.http.get<LibraryUser[]>(`${this.apiUrl}/users`)
      .pipe(catchError(this.handleError));
  }

  getUserById(userId: number): Observable<LibraryUser> {
    return this.http.get<LibraryUser>(`${this.apiUrl}/users/${userId}`)
      .pipe(catchError(this.handleError));
  }

  createUser(userData: Omit<LibraryUser, 'userId'>): Observable<LibraryUser> {
    return this.http.post<LibraryUser>(
      `${this.apiUrl}/auth/signup`,
      userData,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  updateUser(userId: number, userData: Partial<LibraryUser>): Observable<LibraryUser> {
    return this.http.put<LibraryUser>(
      `${this.apiUrl}/users/${userId}`,
      userData,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/users/${userId}`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  // Helper methods for specific user types
  getReaderDetails(userId: number): Observable<Reader> {
    return this.http.get<Reader>(
      `${this.apiUrl}/readers/${userId}`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  getLibrarianDetails(userId: number): Observable<Librarian> {
    return this.http.get<Librarian>(
      `${this.apiUrl}/librarians/${userId}`,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);

    if (error.status === 401 || error.status === 403) {
      return throwError(() => new Error('Authentication error. Please login again.'));
    }

    return throwError(() => new Error(error.error?.error || error.message || 'Server error'));
  }
}
