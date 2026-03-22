import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookService } from '../../core/services/api.services';
import { Book } from '../../core/models/models';

@Component({
  selector: 'app-book-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, MatDatepickerModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="dialog-title-row">
          <mat-icon class="dialog-icon">{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon>
          <h2 mat-dialog-title>{{ isEdit ? 'Edit Book' : 'Add New Book' }}</h2>
        </div>
        <button mat-icon-button (click)="close()"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="book-form">
          <div class="form-section">
            <h3 class="form-section-title">Basic Information</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Title *</mat-label>
                <input matInput formControlName="title"/>
                <mat-error>Title is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Author *</mat-label>
                <input matInput formControlName="author"/>
                <mat-error>Author is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>ISBN *</mat-label>
                <input matInput formControlName="isbn"/>
                <mat-error>ISBN is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Publisher</mat-label>
                <input matInput formControlName="publisher"/>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Genre</mat-label>
                <mat-select formControlName="genre">
                  @for (g of genres; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section-title">Details</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Total Copies *</mat-label>
                <input matInput type="number" formControlName="totalCopies" min="1"/>
                <mat-error>Must be at least 1</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Pages</mat-label>
                <input matInput type="number" formControlName="pages" min="1"/>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Price (₹)</mat-label>
                <input matInput type="number" formControlName="price" min="0"/>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Publish Date</mat-label>
                <input matInput formControlName="publishDate" placeholder="YYYY-MM-DD"/>
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Cover Image URL</mat-label>
                <input matInput formControlName="coverImageUrl"/>
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="close()" [disabled]="saving">Cancel</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) { <mat-spinner diameter="18" color="accent"></mat-spinner> }
          @else { {{ isEdit ? 'Update' : 'Create' }} Book }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { display: flex; flex-direction: column; max-height: 90vh; }
    .dialog-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
    }
    .dialog-title-row { display: flex; align-items: center; gap: .75rem; }
    .dialog-icon { color: #6366f1; }
    h2[mat-dialog-title] { margin: 0; font-size: 1.1rem; font-family: 'Inter', sans-serif; font-weight: 600; }
    mat-dialog-content { padding: 1.5rem !important; overflow-y: auto; flex: 1; }
    mat-dialog-actions { padding: 1rem 1.5rem !important; border-top: 1px solid #e2e8f0; gap: .75rem; }

    .form-section { margin-bottom: 1.5rem; }
    .form-section-title {
      font-size: .8rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: .08em; color: #64748b; margin-bottom: 1rem;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .span-2 { grid-column: span 2; }
  `]
})
export class BookFormDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  isEdit = false;
  genres = ['Fiction','Dystopian Fiction','Technology','Science','History','Biography','Mystery','Self-Help','Poetry','Other'];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<BookFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book?: Book }
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.book;
    const b = this.data?.book;
    this.form = this.fb.group({
      title:        [b?.title       ?? '', Validators.required],
      author:       [b?.author      ?? '', Validators.required],
      isbn:         [b?.isbn        ?? '', Validators.required],
      publisher:    [b?.publisher   ?? ''],
      genre:        [b?.genre       ?? ''],
      description:  [b?.description ?? ''],
      totalCopies:  [b?.totalCopies ?? 1, [Validators.required, Validators.min(1)]],
      pages:        [b?.pages       ?? null],
      price:        [b?.price       ?? null],
      publishDate:  [b?.publishDate ?? ''],
      coverImageUrl:[b?.coverImageUrl ?? '']
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.isEdit
      ? this.bookService.update(this.data.book!.id!, this.form.value)
      : this.bookService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snack.open(`Book ${this.isEdit ? 'updated' : 'created'} successfully`, 'Close',
          { duration: 3000, panelClass: 'success-snack' });
        this.ref.close(true);
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Failed to save book', 'Close',
          { duration: 4000, panelClass: 'error-snack' });
        this.saving = false;
      }
    });
  }

  close(): void { this.ref.close(false); }
}
