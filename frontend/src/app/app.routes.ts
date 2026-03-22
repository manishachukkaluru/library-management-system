import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'books',
        loadChildren: () => import('./features/books/books.routes').then(m => m.booksRoutes)
      },
      {
        path: 'members',
        loadChildren: () => import('./features/members/members.routes').then(m => m.membersRoutes)
      },
      {
        path: 'borrowings',
        loadChildren: () => import('./features/borrowings/borrowings.routes').then(m => m.borrowingsRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
