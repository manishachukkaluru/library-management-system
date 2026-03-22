import { Routes } from '@angular/router';

export const membersRoutes: Routes = [
  { path: '', loadComponent: () => import('./members.component').then(m => m.MembersComponent) }
];
