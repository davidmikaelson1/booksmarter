import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, ToolbarComponent, FooterComponent],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (!this.user) {
      this.router.navigate(['/auth']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  manageLibrary(): void {
    this.router.navigate(['/manage-library']);
  }
}
