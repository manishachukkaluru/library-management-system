import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MemberService } from '../../core/services/api.services';
import { Member } from '../../core/models/models';
import { MemberFormDialogComponent } from './member-form-dialog.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule,
    MatMenuModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Members</h1>
          <p class="page-subtitle">{{ totalElements }} registered members</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon> Add Member
        </button>
      </div>

      <div class="lib-toolbar">
        <mat-form-field appearance="outline" class="lib-search">
          <mat-label>Search members…</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Name, email or membership no."/>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:160px">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()">
            <mat-option value="">All statuses</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="SUSPENDED">Suspended</mat-option>
            <mat-option value="EXPIRED">Expired</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:160px">
          <mat-label>Membership</mat-label>
          <mat-select [(ngModel)]="typeFilter" (ngModelChange)="onSearch()">
            <mat-option value="">All types</mat-option>
            <mat-option value="STANDARD">Standard</mat-option>
            <mat-option value="PREMIUM">Premium</mat-option>
            <mat-option value="STUDENT">Student</mat-option>
            <mat-option value="SENIOR">Senior</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="lib-table-container">
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:3rem">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }
        <table mat-table [dataSource]="dataSource" class="lib-table">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Member</th>
            <td mat-cell *matCellDef="let m">
              <div class="member-info">
                <div class="member-avatar">{{ m.firstName[0] }}{{ m.lastName[0] }}</div>
                <div>
                  <div class="member-name">{{ m.firstName }} {{ m.lastName }}</div>
                  <div class="member-email">{{ m.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="membershipNumber">
            <th mat-header-cell *matHeaderCellDef>Membership #</th>
            <td mat-cell *matCellDef="let m"><code class="isbn">{{ m.membershipNumber }}</code></td>
          </ng-container>

          <ng-container matColumnDef="membershipType">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let m">
              <span [class]="typeBadge(m.membershipType)">{{ m.membershipType }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="expiry">
            <th mat-header-cell *matHeaderCellDef>Expires</th>
            <td mat-cell *matCellDef="let m">
              <span [class]="isExpired(m.membershipExpiryDate) ? 'text-danger' : ''">
                {{ m.membershipExpiryDate | date:'mediumDate' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let m">
              <span [class]="statusBadge(m.status)">{{ m.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let m" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openDialog(m)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="suspend(m)"   [disabled]="m.status === 'SUSPENDED'">
                  <mat-icon>block</mat-icon> Suspend
                </button>
                <button mat-menu-item (click)="activate(m)"  [disabled]="m.status === 'ACTIVE'">
                  <mat-icon>check_circle</mat-icon> Activate
                </button>
                @if (auth.isAdmin()) {
                  <button mat-menu-item (click)="delete(m)">
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
              <mat-icon>people_outline</mat-icon><p>No members found</p>
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
    .member-info { display:flex; align-items:center; gap:.75rem; }
    .member-avatar {
      width:36px; height:36px; border-radius:50%;
      background:linear-gradient(135deg,#0284c7,#38bdf8);
      display:flex; align-items:center; justify-content:center;
      font-size:.75rem; font-weight:700; color:#fff; flex-shrink:0;
    }
    .member-name  { font-weight:600; font-size:.875rem; color:#0f172a; }
    .member-email { font-size:.78rem; color:#64748b; }
    .isbn { font-family:monospace; font-size:.8rem; background:#f1f5f9; padding:.15rem .4rem; border-radius:4px; }
    .no-data { text-align:center; padding:3rem; color:#94a3b8;
      mat-icon { font-size:2.5rem; width:2.5rem; height:2.5rem; display:block; margin:0 auto .5rem; }
    }
  `]
})
export class MembersComponent implements OnInit {
  displayedColumns = ['name','membershipNumber','membershipType','expiry','status','actions'];
  dataSource = new MatTableDataSource<Member>([]);
  totalElements = 0; pageSize = 10; currentPage = 0;
  loading = false; searchTerm = ''; statusFilter = ''; typeFilter = '';
  private st: any;

  constructor(
    private memberService: MemberService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const obs = (this.searchTerm || this.statusFilter || this.typeFilter)
      ? this.memberService.search(this.searchTerm, this.statusFilter, this.typeFilter, this.currentPage, this.pageSize)
      : this.memberService.getAll(this.currentPage, this.pageSize);

    obs.subscribe({ next: r => { this.dataSource.data = r.content; this.totalElements = r.totalElements; this.loading = false; }, error: () => (this.loading = false) });
  }

  onSearch(): void { clearTimeout(this.st); this.st = setTimeout(() => { this.currentPage = 0; this.load(); }, 400); }
  onPage(e: PageEvent): void { this.currentPage = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openDialog(member?: Member): void {
    const ref = this.dialog.open(MemberFormDialogComponent, { width: '650px', data: { member }, disableClose: true });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  suspend(m: Member): void {
    this.memberService.suspend(m.id!).subscribe({ next: () => { this.snack.open('Member suspended','Close',{duration:3000,panelClass:'success-snack'}); this.load(); } });
  }
  activate(m: Member): void {
    this.memberService.activate(m.id!).subscribe({ next: () => { this.snack.open('Member activated','Close',{duration:3000,panelClass:'success-snack'}); this.load(); } });
  }
  delete(m: Member): void {
    if (!confirm(`Delete member ${m.firstName} ${m.lastName}?`)) return;
    this.memberService.delete(m.id!).subscribe({ next: () => { this.snack.open('Member deleted','Close',{duration:3000,panelClass:'success-snack'}); this.load(); } });
  }

  statusBadge(s: string): string { return ({ACTIVE:'badge badge-success',SUSPENDED:'badge badge-danger',EXPIRED:'badge badge-warning',CANCELLED:'badge badge-default'} as any)[s] ?? 'badge badge-default'; }
  typeBadge(t: string): string   { return ({PREMIUM:'badge badge-info',STANDARD:'badge badge-default',STUDENT:'badge badge-success',SENIOR:'badge badge-warning'} as any)[t] ?? 'badge badge-default'; }
  isExpired(d: string): boolean  { return !!d && new Date(d) < new Date(); }
}
