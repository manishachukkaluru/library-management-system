import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { BorrowingService, BookService, MemberService } from '../../core/services/api.services';
import { Book, Member } from '../../core/models/models';

@Component({
  selector: 'app-borrow-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatAutocompleteModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div style="display:flex;align-items:center;gap:.75rem">
          <mat-icon style="color:#d97706">swap_horiz</mat-icon>
          <h2 mat-dialog-title>Issue Book to Member</h2>
        </div>
        <button mat-icon-button (click)="close()"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content>
        <p class="hint-text">Search for a member and a book to issue. Loan period is <strong>14 days</strong>.</p>

        <form [formGroup]="form" class="borrow-form">
          <!-- Member search -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Member (search by name or email)</mat-label>
            <mat-icon matPrefix>person_search</mat-icon>
            <input matInput formControlName="memberSearch"
                   [matAutocomplete]="memberAuto"
                   placeholder="Start typing…"/>
            <mat-autocomplete #memberAuto="matAutocomplete"
                              [displayWith]="displayMember"
                              (optionSelected)="onMemberSelected($event.option.value)">
              @for (m of members; track m.id) {
                <mat-option [value]="m">
                  <strong>{{ m.firstName }} {{ m.lastName }}</strong>
                  <span class="option-sub"> — {{ m.membershipNumber }} ({{ m.status }})</span>
                </mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>

          @if (selectedMember) {
            <div class="selected-card member-card">
              <mat-icon>how_to_reg</mat-icon>
              <div>
                <div class="selected-name">{{ selectedMember.firstName }} {{ selectedMember.lastName }}</div>
                <div class="selected-sub">{{ selectedMember.email }} · {{ selectedMember.membershipType }}</div>
              </div>
              <button mat-icon-button (click)="clearMember()"><mat-icon>close</mat-icon></button>
            </div>
          }

          <!-- Book search -->
          <mat-form-field appearance="outline" class="full-width" style="margin-top:.75rem">
            <mat-label>Book (search by title, author or ISBN)</mat-label>
            <mat-icon matPrefix>menu_book</mat-icon>
            <input matInput formControlName="bookSearch"
                   [matAutocomplete]="bookAuto"
                   placeholder="Start typing…"/>
            <mat-autocomplete #bookAuto="matAutocomplete"
                              [displayWith]="displayBook"
                              (optionSelected)="onBookSelected($event.option.value)">
              @for (b of books; track b.id) {
                <mat-option [value]="b" [disabled]="b.availableCopies === 0">
                  <strong>{{ b.title }}</strong>
                  <span class="option-sub"> — {{ b.author }}</span>
                  <span [class]="b.availableCopies === 0 ? 'copies-none' : 'copies-ok'">
                    ({{ b.availableCopies }}/{{ b.totalCopies }} available)
                  </span>
                </mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>

          @if (selectedBook) {
            <div class="selected-card book-card">
              <mat-icon>auto_stories</mat-icon>
              <div>
                <div class="selected-name">{{ selectedBook.title }}</div>
                <div class="selected-sub">{{ selectedBook.author }} · ISBN: {{ selectedBook.isbn }}</div>
              </div>
              <button mat-icon-button (click)="clearBook()"><mat-icon>close</mat-icon></button>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="close()" [disabled]="saving">Cancel</button>
        <button mat-raised-button color="primary"
                (click)="issue()"
                [disabled]="!selectedMember || !selectedBook || saving">
          @if (saving) { <mat-spinner diameter="18" color="accent"></mat-spinner> }
          @else { <mat-icon>send</mat-icon> Issue Book }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { display:flex; flex-direction:column; }
    .dialog-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0;
    }
    h2[mat-dialog-title] { margin:0; font-size:1.1rem; font-family:'Inter',sans-serif; font-weight:600; }
    mat-dialog-content { padding:1.5rem !important; }
    mat-dialog-actions { padding:1rem 1.5rem !important; border-top:1px solid #e2e8f0; gap:.75rem; }

    .hint-text { font-size:.85rem; color:#64748b; margin-bottom:1.25rem;
      strong { color:#0f172a; } }

    .borrow-form { display:flex; flex-direction:column; }

    .option-sub { font-size:.8rem; color:#64748b; margin-left:.25rem; }
    .copies-ok   { font-size:.78rem; color:#059669; margin-left:.25rem; }
    .copies-none { font-size:.78rem; color:#dc2626; margin-left:.25rem; }

    .selected-card {
      display:flex; align-items:center; gap:.75rem;
      padding:.75rem 1rem; border-radius:10px; margin-top:.25rem;
      mat-icon { flex-shrink:0; }
      button { margin-left:auto; }
    }
    .member-card { background:#ede9fe; mat-icon { color:#6366f1; } }
    .book-card   { background:#dbeafe; mat-icon { color:#0284c7; } }
    .selected-name { font-weight:600; font-size:.875rem; color:#0f172a; }
    .selected-sub  { font-size:.78rem; color:#475569; }
  `]
})
export class BorrowDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  members: Member[] = [];
  books:   Book[]   = [];
  selectedMember: Member | null = null;
  selectedBook:   Book   | null = null;

  constructor(
    private fb: FormBuilder,
    private borrowingService: BorrowingService,
    private bookService: BookService,
    private memberService: MemberService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<BorrowDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      memberSearch: [''],
      bookSearch:   ['']
    });

    // Member autocomplete
    this.form.get('memberSearch')!.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(),
      switchMap(v => typeof v === 'string' && v.length > 1
        ? this.memberService.search(v, 'ACTIVE', '', 0, 10)
        : of({ content: [] as Member[] }))
    ).subscribe(r => this.members = r.content);

    // Book autocomplete
    this.form.get('bookSearch')!.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(),
      switchMap(v => typeof v === 'string' && v.length > 1
        ? this.bookService.search(v, '', 'AVAILABLE', 0, 10)
        : of({ content: [] as Book[] }))
    ).subscribe(r => this.books = r.content);
  }

  displayMember = (m: Member) => m ? `${m.firstName} ${m.lastName}` : '';
  displayBook   = (b: Book)   => b ? b.title : '';

  onMemberSelected(m: Member): void { this.selectedMember = m; }
  onBookSelected(b: Book):     void { this.selectedBook   = b; }
  clearMember(): void { this.selectedMember = null; this.form.get('memberSearch')!.setValue(''); }
  clearBook():   void { this.selectedBook   = null; this.form.get('bookSearch')!.setValue(''); }

  issue(): void {
    if (!this.selectedMember || !this.selectedBook) return;
    this.saving = true;
    this.borrowingService.borrow({ memberId: this.selectedMember.id!, bookId: this.selectedBook.id! }).subscribe({
      next: () => {
        this.snack.open('Book issued successfully!', 'Close', { duration: 3000, panelClass: 'success-snack' });
        this.ref.close(true);
      },
      error: (e) => {
        this.snack.open(e?.error?.message ?? 'Failed to issue book', 'Close', { duration: 4000, panelClass: 'error-snack' });
        this.saving = false;
      }
    });
  }

  close(): void { this.ref.close(false); }
}
