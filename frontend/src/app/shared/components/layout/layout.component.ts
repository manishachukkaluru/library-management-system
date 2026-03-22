import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="app-shell">

      <!-- ── Sidebar ── -->
      <mat-sidenav mode="side" opened class="sidebar">
        <div class="sidebar-brand">
          <mat-icon class="brand-icon">local_library</mat-icon>
          <div>
            <div class="brand-name">LibraryMS</div>
            <div class="brand-tagline">Management System</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" class="nav-item">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ initials }}</div>
            <div class="user-details">
              <div class="user-name">{{ auth.currentUser()?.fullName }}</div>
              <div class="user-role">{{ auth.currentUser()?.role }}</div>
            </div>
          </div>
          <button mat-icon-button (click)="auth.logout()" matTooltip="Logout" class="logout-btn">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <!-- ── Main ── -->
      <mat-sidenav-content class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h1 class="header-title">{{ pageTitle }}</h1>
          </div>
          <div class="header-right">
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <div class="avatar-sm">{{ initials }}</div>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="menu-header">
                <strong>{{ auth.currentUser()?.fullName }}</strong>
                <small>{{ auth.currentUser()?.email }}</small>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          </div>
        </header>

        <div class="content-area">
          <router-outlet/>
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .app-shell { height: 100vh; }

    /* ── Sidebar ── */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
      color: #fff;
      border-right: none !important;
      display: flex; flex-direction: column;
    }

    .sidebar-brand {
      display: flex; align-items: center; gap: .75rem;
      padding: 1.5rem 1.25rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .brand-icon {
      font-size: 2rem; width: 2rem; height: 2rem;
      color: #a5b4fc;
    }
    .brand-name {
      font-size: 1.1rem; font-weight: 700;
      font-family: 'Playfair Display', serif;
      color: #fff;
    }
    .brand-tagline {
      font-size: .7rem; color: #a5b4fc;
      text-transform: uppercase; letter-spacing: .08em;
    }

    .sidebar-nav {
      flex: 1; padding: 1rem .75rem; overflow-y: auto;
      display: flex; flex-direction: column; gap: .2rem;
    }
    .nav-item {
      display: flex; align-items: center; gap: .75rem;
      padding: .7rem 1rem;
      border-radius: 10px;
      color: #c7d2fe;
      text-decoration: none;
      font-size: .875rem; font-weight: 500;
      transition: all .15s ease;
      mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    }
    .nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
    .nav-item.active { background: rgba(165,180,252,.2); color: #fff;
      box-shadow: inset 3px 0 0 #a5b4fc; }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,.1);
      display: flex; align-items: center; gap: .75rem;
    }
    .user-info { flex: 1; display: flex; align-items: center; gap: .75rem; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      font-size: .8rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .user-name { font-size: .8rem; font-weight: 600; color: #fff; }
    .user-role { font-size: .7rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: .05em; }
    .logout-btn { color: #a5b4fc !important; }

    /* ── Main Content ── */
    .main-content { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    .top-header {
      height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.75rem; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .header-title {
      font-size: 1.2rem; font-weight: 600; color: #0f172a;
      font-family: 'Inter', sans-serif;
    }

    .avatar-sm {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #3730a3, #6366f1);
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 700; color: #fff;
    }

    .menu-header {
      padding: .75rem 1rem;
      display: flex; flex-direction: column; gap: .15rem;
      strong { font-size: .875rem; color: #0f172a; }
      small  { font-size: .75rem;  color: #64748b;  }
    }

    .content-area { flex: 1; overflow-y: auto; background: #f8fafc; }
  `]
})
export class LayoutComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',       route: '/dashboard'  },
    { label: 'Books',      icon: 'menu_book',        route: '/books'      },
    { label: 'Members',    icon: 'people',           route: '/members'    },
    { label: 'Borrowings', icon: 'swap_horiz',       route: '/borrowings' },
    { label: 'Overdue',    icon: 'warning_amber',    route: '/borrowings/overdue' },
  ];

  get initials(): string {
    const name = this.auth.currentUser()?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get pageTitle(): string {
    const route = window.location.pathname.split('/')[1] ?? '';
    return route.charAt(0).toUpperCase() + route.slice(1) || 'Dashboard';
  }

  constructor(readonly auth: AuthService) {}
}
