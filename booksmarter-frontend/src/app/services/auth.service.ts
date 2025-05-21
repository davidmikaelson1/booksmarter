import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    let user = null;
    try {
      const currentUserCookie = this.cookieService.get('currentUser');
      user = currentUserCookie ? JSON.parse(currentUserCookie) : null;
    } catch (error) {
      user = null;
    }

    this.currentUserSubject = new BehaviorSubject<any>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true } // Important: include cookies
    ).pipe(
      map((response) => {
        const user = response.user;

        // Only store user details (not the token - it will be in httpOnly cookie)
        this.cookieService.set('currentUser', JSON.stringify(user), {
          path: '/',
          sameSite: 'Lax', // Changed from Strict to allow cross-site
          secure: true
        });

        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  register(userData: any): Observable<any> {
    // Make sure to include withCredentials for consistent CORS behavior
    return this.http.post<any>(
      `${this.apiUrl}/signup`,
      userData,
      { withCredentials: true }
    );
  }

  logout(): void {
    // Call the backend to clear the httpOnly cookie
    this.http.post<any>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).subscribe();

    // Clear local cookie and user state
    this.cookieService.delete('currentUser', '/');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  // Add this method to debug the current user
  getCurrentUserDebug(): void {
    const user = this.currentUserSubject.getValue();
    console.log('Current user from auth service:', user);

    // Also check localStorage
    const storedUser = localStorage.getItem('currentUser');
    console.log('User stored in localStorage:', storedUser);

    return user;
  }

  // Add a method to get the authentication token
  getAuthToken(): string | null {
    // If you're using httpOnly cookies, you don't need to manually send the token
    // But make sure cookies are being sent with requests
    return null; // For httpOnly cookies, return null as the token is in the cookie
  }
}
