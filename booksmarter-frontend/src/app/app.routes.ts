import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'discover',
    loadComponent: () => import('./features/discover/discover.component').then((m) => m.DiscoverComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-books',
    loadComponent: () => import('./features/my-books/my-books.component').then((m) => m.MyBooksComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'manage-library',
    loadComponent: () => import('./features/manage-library/manage-library.component').then((m) => m.ManageLibraryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
