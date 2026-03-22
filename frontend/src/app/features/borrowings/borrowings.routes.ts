import { Routes } from '@angular/router';

export const borrowingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./borrowings.component').then(m => m.BorrowingsComponent)
  },
  {
    path: 'overdue',
    loadComponent: () => import('./borrowings.component').then(m => m.BorrowingsComponent)
  }
];
