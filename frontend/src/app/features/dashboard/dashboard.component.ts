import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/api.services';
import { DashboardStats } from '../../core/models/models';

interface StatCard {
  label: string; value: keyof DashboardStats;
  icon: string; color: string; bg: string; route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Library overview and quick statistics</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/borrowings" mat-stroked-button>
            <mat-icon>swap_horiz</mat-icon> Borrowings
          </a>
          <a routerLink="/books" mat-raised-button color="primary">
            <mat-icon>add</mat-icon> Add Book
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="loading-center">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (stats) {
        <!-- Stat Cards -->
        <div class="stats-grid">
          @for (card of statCards; track card.label) {
            <div class="stat-card" [routerLink]="card.route">
              <div class="stat-icon" [style.background]="card.bg" [style.color]="card.color">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats[card.value] | number }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Quick Status Rows -->
        <div class="two-col-grid mt-6">
          <!-- Book Status -->
          <div class="lib-card">
            <div class="section-header">
              <h3 class="section-title">Book Availability</h3>
              <a routerLink="/books" class="see-all">View all →</a>
            </div>
            <div class="progress-items">
              <div class="prog-item">
                <div class="prog-label">
                  <span>Available Books</span>
                  <strong>{{ stats.availableBooks }}</strong>
                </div>
                <div class="prog-bar-track">
                  <div class="prog-bar success"
                       [style.width.%]="pct(stats.availableBooks, stats.totalBooks)"></div>
                </div>
              </div>
              <div class="prog-item">
                <div class="prog-label">
                  <span>Out of Stock</span>
                  <strong>{{ stats.booksWithNoCopies }}</strong>
                </div>
                <div class="prog-bar-track">
                  <div class="prog-bar danger"
                       [style.width.%]="pct(stats.booksWithNoCopies, stats.totalBooks)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Member Status -->
          <div class="lib-card">
            <div class="section-header">
              <h3 class="section-title">Member Status</h3>
              <a routerLink="/members" class="see-all">View all →</a>
            </div>
            <div class="progress-items">
              <div class="prog-item">
                <div class="prog-label">
                  <span>Active Members</span>
                  <strong>{{ stats.activeMembers }}</strong>
                </div>
                <div class="prog-bar-track">
                  <div class="prog-bar success"
                       [style.width.%]="pct(stats.activeMembers, stats.totalMembers)"></div>
                </div>
              </div>
              <div class="prog-item">
                <div class="prog-label">
                  <span>Expired Memberships</span>
                  <strong>{{ stats.expiredMemberships }}</strong>
                </div>
                <div class="prog-bar-track">
                  <div class="prog-bar warning"
                       [style.width.%]="pct(stats.expiredMemberships, stats.totalMembers)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        @if (stats.overdueBorrowings > 0) {
          <div class="alert-banner mt-4">
            <mat-icon>warning_amber</mat-icon>
            <span>
              <strong>{{ stats.overdueBorrowings }} overdue borrowing(s)</strong> require attention.
            </span>
            <a routerLink="/borrowings/overdue" mat-stroked-button class="alert-action">View Overdue</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .stat-card { cursor: pointer; }
    .stat-card:hover { transform: translateY(-2px); }

    .mt-6 { margin-top: 1.5rem; }
    .two-col-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
    }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .section-title { font-size: 1rem; font-weight: 600; font-family: 'Inter', sans-serif; color: #0f172a; }
    .see-all { font-size: .8rem; color: #6366f1; text-decoration: none; font-weight: 500; }

    .progress-items { display: flex; flex-direction: column; gap: 1rem; }
    .prog-item { display: flex; flex-direction: column; gap: .4rem; }
    .prog-label {
      display: flex; justify-content: space-between; align-items: center;
      font-size: .82rem; color: #475569;
      strong { color: #0f172a; }
    }
    .prog-bar-track { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .prog-bar { height: 100%; border-radius: 10px; transition: width .6s ease; }
    .prog-bar.success { background: #059669; }
    .prog-bar.danger  { background: #dc2626; }
    .prog-bar.warning { background: #d97706; }

    .alert-banner {
      display: flex; align-items: center; gap: 1rem;
      background: #fef3c7; border: 1px solid #fcd34d;
      border-radius: 12px; padding: 1rem 1.25rem;
      color: #92400e;
      mat-icon { color: #d97706; }
      span { flex: 1; }
    }

    .loading-center {
      display: flex; justify-content: center; align-items: center;
      min-height: 300px;
    }

    @media (max-width: 768px) {
      .two-col-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  statCards: StatCard[] = [
    { label: 'Total Books',       value: 'totalBooks',       icon: 'menu_book',    color: '#3730a3', bg: '#ede9fe', route: '/books'      },
    { label: 'Available Books',   value: 'availableBooks',   icon: 'check_circle', color: '#059669', bg: '#d1fae5', route: '/books'      },
    { label: 'Total Members',     value: 'totalMembers',     icon: 'people',       color: '#0284c7', bg: '#dbeafe', route: '/members'    },
    { label: 'Active Members',    value: 'activeMembers',    icon: 'how_to_reg',   color: '#059669', bg: '#d1fae5', route: '/members'    },
    { label: 'Active Borrowings', value: 'activeBorrowings', icon: 'swap_horiz',   color: '#d97706', bg: '#fef3c7', route: '/borrowings' },
    { label: 'Overdue',           value: 'overdueBorrowings',icon: 'warning_amber',color: '#dc2626', bg: '#fee2e2', route: '/borrowings/overdue' },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: s  => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  pct(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }
}
