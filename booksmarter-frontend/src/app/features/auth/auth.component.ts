import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';
import { MatRadioModule } from '@angular/material/radio';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule,
    FormsModule,
    MatRadioModule,
    ToolbarComponent,
    FooterComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  loading = false;
  error: string | null = null;
  activeTab = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbarService: SnackbarService, // Inject SnackbarService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();

    // If user is already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      userType: ['reader', Validators.required], // Renamed from accountType to userType
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terminalId: ['', Validators.required], // Matches terminalId in LibraryUser table
      pnc: [''], // Reader-specific
      address: [''], // Reader-specific
      phoneNumber: [''], // Reader-specific
      librarianId: [''], // Librarian-specific
    });
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    this.error = null;
  }

  submitLogin(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (user) => {
          console.log('Login successful, user:', user);
          this.snackbarService.open('Login successful!', 'Close');

          // Use setTimeout to ensure state is updated before navigation
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 100);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.error = err.error?.message || 'Login failed. Please check your credentials.';
          this.snackbarService.open(this.error, 'Close');
        }
      });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) return;

    const formData = { ...this.registerForm.value };

    // Remove confirmPassword as it's not needed by the backend
    delete formData.confirmPassword;

    // Remove unnecessary fields based on userType
    if (formData.userType === 'reader') {
      delete formData.librarianId;
    } else if (formData.userType === 'librarian') {
      delete formData.pnc;
      delete formData.address;
      delete formData.phoneNumber;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(formData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.snackbarService.open('Registration successful! Please log in.', 'Close');

          // Either redirect to login tab or automatically log in the user
          this.activeTab = 0; // Switch to login tab

          // If you want to auto-login after registration, uncomment this:
          // this.autoLoginAfterRegistration(formData.email, formData.password);

          // Or directly navigate to home page if auto-login not needed
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 100);
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.error = err.error?.message || 'Registration failed. Please try again.';
          this.snackbarService.open(this.error, 'Close');
        }
      });
  }

  // Optional: Auto-login after registration
  private autoLoginAfterRegistration(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackbarService.open('You have been automatically logged in!', 'Close');
        this.router.navigate(['/home']);
      },
      error: () => {
        this.snackbarService.open('Registration successful! Please log in.', 'Close');
        this.activeTab = 0; // Switch to login tab
      }
    });
  }
}
