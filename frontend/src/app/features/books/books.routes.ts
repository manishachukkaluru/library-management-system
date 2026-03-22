import { Routes } from '@angular/router';

export const booksRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./books.component').then(m => m.BooksComponent)
  }
];
