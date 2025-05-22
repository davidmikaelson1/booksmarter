import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule,} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  isLibrarian = false;
  isAuthenticated = false;
  private authSubscription: Subscription | null = null;
  searchQuery: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isLibrarian = user?.userType === 'librarian';
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onSearch(): void {
    const query = this.searchQuery.trim();

    // Check authentication
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth']);
      return;
    }

    // Handle empty search
    if (!query) {
      this.snackbarService.open('Showing all available books', 'OK', 3000);
      this.router.navigate(['/discover']);
      return;
    }

    // Handle valid search
    this.router.navigate(['/discover'], { queryParams: { q: query } });
  }
}
