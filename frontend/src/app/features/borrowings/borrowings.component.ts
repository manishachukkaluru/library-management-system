import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { BorrowingService, BookService, MemberService } from '../../core/services/api.services';
import { Borrowing } from '../../core/models/models';
import { BorrowDialogComponent } from './borrow-dialog.component';

@Component({
  selector: 'app-borrowings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule, MatMenuModule,
    MatProgressSpinnerModule, MatDialogModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ overdueMode ? 'Overdue Borrowings' : 'Borrowings' }}</h1>
          <p class="page-subtitle">{{ totalElements }} record(s)</p>
        </div>
        @if (!overdueMode) {
          <button mat-raised-button color="primary" (click)="openBorrowDialog()">
            <mat-icon>add</mat-icon> Issue Book
          </button>
        }
      </div>

      @if (overdueMode) {
        <div class="alert-banner mb-4">
          <mat-icon>warning_amber</mat-icon>
          <span>Showing overdue borrowings. Fine rate: <strong>₹5 per day</strong>.</span>
        </div>
      }

      <div class="lib-table-container">
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:3rem">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }
        <table mat-table [dataSource]="dataSource" class="lib-table">

          <ng-container matColumnDef="member">
            <th mat-header-cell *matHeaderCellDef>Member</th>
            <td mat-cell *matCellDef="let b">
              <div class="font-semibold">{{ b.memberName }}</div>
              <div class="text-muted" style="font-size:.78rem">{{ b.membershipNumber }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="book">
            <th mat-header-cell *matHeaderCellDef>Book</th>
            <td mat-cell *matCellDef="let b">
              <div class="font-semibold">{{ b.bookTitle }}</div>
              <div class="text-muted" style="font-size:.78rem">{{ b.bookIsbn }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="borrowDate">
            <th mat-header-cell *matHeaderCellDef>Issued</th>
            <td mat-cell *matCellDef="let b">{{ b.borrowDate | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="dueDate">
            <th mat-header-cell *matHeaderCellDef>Due Date</th>
            <td mat-cell *matCellDef="let b">
              <span [class]="b.overdue ? 'text-danger' : ''">
                {{ b.dueDate | date:'mediumDate' }}
              </span>
              @if (b.overdue) { <span class="badge badge-danger" style="margin-left:.4rem">OVERDUE</span> }
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let b">
              <span [class]="statusBadge(b.status)">{{ b.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="fine">
            <th mat-header-cell *matHeaderCellDef>Fine</th>
            <td mat-cell *matCellDef="let b">
              @if (b.fineAmount > 0) {
                <span class="text-danger font-semibold">₹{{ b.fineAmount | number:'1.2-2' }}</span>
              } @else {
                <span class="text-muted">—</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="renewals">
            <th mat-header-cell *matHeaderCellDef>Renewals</th>
            <td mat-cell *matCellDef="let b">{{ b.renewalCount }} / 2</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let b" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="returnBook(b)"
                        [disabled]="b.status === 'RETURNED'">
                  <mat-icon>assignment_return</mat-icon> Return
                </button>
                <button mat-menu-item (click)="renew(b)"
                        [disabled]="b.status !== 'BORROWED' || b.renewalCount >= 2">
                  <mat-icon>autorenew</mat-icon> Renew
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.overdue-row]="row.overdue"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              <mat-icon>swap_horiz</mat-icon><p>No borrowings found</p>
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator [length]="totalElements" [pageSize]="pageSize"
        [pageSizeOptions]="[5,10,20,50]" (page)="onPage($event)" showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .font-semibold { font-weight:600; font-size:.875rem; color:#0f172a; }
    .mb-4 { margin-bottom:1rem; }
    .overdue-row { background:#fff7f7; }
    .alert-banner {
      display:flex; align-items:center; gap:1rem;
      background:#fef3c7; border:1px solid #fcd34d;
      border-radius:12px; padding:1rem 1.25rem; color:#92400e;
      mat-icon { color:#d97706; }
    }
    .no-data { text-align:center; padding:3rem; color:#94a3b8;
      mat-icon { font-size:2.5rem; width:2.5rem; height:2.5rem; display:block; margin:0 auto .5rem; }
    }
  `]
})
export class BorrowingsComponent implements OnInit {
  displayedColumns = ['member','book','borrowDate','dueDate','status','fine','renewals','actions'];
  dataSource = new MatTableDataSource<Borrowing>([]);
  totalElements = 0; pageSize = 10; currentPage = 0;
  loading = false; overdueMode = false;

  constructor(
    private borrowingService: BorrowingService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.overdueMode = this.route.snapshot.url.some(s => s.path === 'overdue');
    this.load();
  }

  load(): void {
    this.loading = true;
    const obs = this.overdueMode
      ? this.borrowingService.getOverdue(this.currentPage, this.pageSize)
      : this.borrowingService.getAll(this.currentPage, this.pageSize);

    obs.subscribe({
      next: r => { this.dataSource.data = r.content; this.totalElements = r.totalElements; this.loading = false; },
      error: () => (this.loading = false)
    });
  }

  onPage(e: PageEvent): void { this.currentPage = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openBorrowDialog(): void {
    const ref = this.dialog.open(BorrowDialogComponent, { width: '550px', disableClose: true });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  returnBook(b: Borrowing): void {
    if (!confirm(`Return "${b.bookTitle}" borrowed by ${b.memberName}?`)) return;
    this.borrowingService.returnBook(b.id!).subscribe({
      next: () => { this.snack.open('Book returned successfully', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.load(); },
      error: (e) => this.snack.open(e?.error?.message ?? 'Failed to return', 'Close', { duration: 4000, panelClass: 'error-snack' })
    });
  }

  renew(b: Borrowing): void {
    this.borrowingService.renew(b.id!).subscribe({
      next: () => { this.snack.open('Borrowing renewed — 14 more days', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.load(); },
      error: (e) => this.snack.open(e?.error?.message ?? 'Failed to renew', 'Close', { duration: 4000, panelClass: 'error-snack' })
    });
  }

  statusBadge(s: string): string {
    const map: any = { BORROWED:'badge badge-info', RETURNED:'badge badge-success', OVERDUE:'badge badge-danger', RENEWED:'badge badge-warning', LOST:'badge badge-default' };
    return map[s] ?? 'badge badge-default';
  }
}
