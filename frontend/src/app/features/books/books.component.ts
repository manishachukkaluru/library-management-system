import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { BookService } from '../../core/services/api.services';
import { Book, PagedResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { BookFormDialogComponent } from './book-form-dialog.component';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatTooltipModule, MatChipsModule,
    MatProgressSpinnerModule, MatMenuModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Books</h1>
          <p class="page-subtitle">{{ totalElements }} books in catalog</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Add Book
        </button>
      </div>

      <!-- Toolbar -->
      <div class="lib-toolbar">
        <mat-form-field appearance="outline" class="lib-search">
          <mat-label>Search books…</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Title, author or ISBN"/>
          @if (searchTerm) {
            <button matSuffix mat-icon-button (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:160px">
          <mat-label>Genre</mat-label>
          <mat-select [(ngModel)]="genreFilter" (ngModelChange)="onSearch()">
            <mat-option value="">All genres</mat-option>
            @for (g of genres; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:150px">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()">
            <mat-option value="">All</mat-option>
            <mat-option value="AVAILABLE">Available</mat-option>
            <mat-option value="UNAVAILABLE">Unavailable</mat-option>
            <mat-option value="DISCONTINUED">Discontinued</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Table -->
      <div class="lib-table-container">
        @if (loading) {
          <div class="table-loading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }
        <table mat-table [dataSource]="dataSource" class="lib-table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title / Author</th>
            <td mat-cell *matCellDef="let b">
              <div class="book-info">
                <div class="book-cover">{{ b.title[0] }}</div>
                <div>
                  <div class="book-title">{{ b.title }}</div>
                  <div class="book-author">{{ b.author }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="isbn">
            <th mat-header-cell *matHeaderCellDef>ISBN</th>
            <td mat-cell *matCellDef="let b"><code class="isbn">{{ b.isbn }}</code></td>
          </ng-container>

          <ng-container matColumnDef="genre">
            <th mat-header-cell *matHeaderCellDef>Genre</th>
            <td mat-cell *matCellDef="let b">
              <span class="badge badge-info">{{ b.genre || '—' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="copies">
            <th mat-header-cell *matHeaderCellDef>Copies</th>
            <td mat-cell *matCellDef="let b">
              <span [class]="b.availableCopies === 0 ? 'text-danger' : 'text-success'" style="font-weight:600">
                {{ b.availableCopies }}
              </span>
              <span class="text-muted"> / {{ b.totalCopies }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let b">
              <span [class]="statusBadge(b.status)">{{ b.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let b" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openDialog(b)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="discontinue(b)" [disabled]="b.status === 'DISCONTINUED'">
                  <mat-icon>block</mat-icon> Discontinue
                </button>
                @if (auth.isAdmin()) {
                  <button mat-menu-item (click)="delete(b)" class="text-danger">
                    <mat-icon color="warn">delete</mat-icon> Delete
                  </button>
                }
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              <mat-icon>search_off</mat-icon>
              <p>No books found</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Paginator -->
      <mat-paginator
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5,10,20,50]"
        (page)="onPage($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .book-info { display: flex; align-items: center; gap: .75rem; }
    .book-cover {
      width: 36px; height: 44px; border-radius: 4px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .book-title  { font-weight: 600; color: #0f172a; font-size: .875rem; }
    .book-author { font-size: .78rem; color: #64748b; }
    .isbn { font-family: monospace; font-size: .8rem; background: #f1f5f9; padding: .15rem .4rem; border-radius: 4px; }
    .table-loading { display: flex; justify-content: center; padding: 3rem; }
    .no-data { text-align: center; padding: 3rem; color: #94a3b8;
      mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; display: block; margin: 0 auto .5rem; }
    }
  `]
})
export class BooksComponent implements OnInit {
  displayedColumns = ['title','isbn','genre','copies','status','actions'];
  dataSource = new MatTableDataSource<Book>([]);
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;
  searchTerm = '';
  genreFilter = '';
  statusFilter = '';
  genres = ['Fiction','Dystopian Fiction','Technology','Science','History','Biography','Mystery','Self-Help','Other'];

  private searchTimeout: any;

  constructor(
    private bookService: BookService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const obs = (this.searchTerm || this.genreFilter || this.statusFilter)
      ? this.bookService.search(this.searchTerm, this.genreFilter, this.statusFilter, this.currentPage, this.pageSize)
      : this.bookService.getAll(this.currentPage, this.pageSize);

    obs.subscribe({
      next: (res: PagedResponse<Book>) => {
        this.dataSource.data = res.content;
        this.totalElements   = res.totalElements;
        this.loading         = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.currentPage = 0; this.load(); }, 400);
  }

  clearSearch(): void { this.searchTerm = ''; this.onSearch(); }

  onPage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize    = e.pageSize;
    this.load();
  }

  openDialog(book?: Book): void {
    const ref = this.dialog.open(BookFormDialogComponent, {
      width: '700px', data: { book }, disableClose: true
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  discontinue(book: Book): void {
    if (!confirm(`Discontinue "${book.title}"?`)) return;
    this.bookService.discontinue(book.id!).subscribe({
      next: () => { this.snack.open('Book discontinued', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.load(); },
      error: () => this.snack.open('Failed to discontinue book', 'Close', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  delete(book: Book): void {
    if (!confirm(`Permanently delete "${book.title}"? This cannot be undone.`)) return;
    this.bookService.delete(book.id!).subscribe({
      next: () => { this.snack.open('Book deleted', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.load(); },
      error: () => this.snack.open('Failed to delete book', 'Close', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  statusBadge(status: string): string {
    const map: Record<string,string> = { AVAILABLE: 'badge badge-success', UNAVAILABLE: 'badge badge-warning', DISCONTINUED: 'badge badge-default' };
    return map[status] ?? 'badge badge-default';
  }
}
