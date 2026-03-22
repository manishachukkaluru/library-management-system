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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MemberService } from '../../core/services/api.services';
import { Member } from '../../core/models/models';

@Component({
  selector: 'app-member-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div style="display:flex;align-items:center;gap:.75rem">
          <mat-icon style="color:#0284c7">{{ isEdit ? 'edit' : 'person_add' }}</mat-icon>
          <h2 mat-dialog-title>{{ isEdit ? 'Edit Member' : 'New Member' }}</h2>
        </div>
        <button mat-icon-button (click)="close()"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>First Name *</mat-label>
              <input matInput formControlName="firstName"/>
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name *</mat-label>
              <input matInput formControlName="lastName"/>
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Email *</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email"/>
              <mat-error>Valid email required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input matInput formControlName="phone"/>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Membership Type *</mat-label>
              <mat-select formControlName="membershipType">
                <mat-option value="STANDARD">Standard</mat-option>
                <mat-option value="PREMIUM">Premium</mat-option>
                <mat-option value="STUDENT">Student</mat-option>
                <mat-option value="SENIOR">Senior</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date of Birth</mat-label>
              <input matInput formControlName="dateOfBirth" placeholder="YYYY-MM-DD"/>
            </mat-form-field>

            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="2"></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="close()" [disabled]="saving">Cancel</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
          @if (saving) { <mat-spinner diameter="18" color="accent"></mat-spinner> }
          @else { {{ isEdit ? 'Update' : 'Create' }} Member }
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
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
    .span-2 { grid-column:span 2; }
  `]
})
export class MemberFormDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<MemberFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member?: Member }
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.member;
    const m = this.data?.member;
    this.form = this.fb.group({
      firstName:      [m?.firstName      ?? '', Validators.required],
      lastName:       [m?.lastName       ?? '', Validators.required],
      email:          [m?.email          ?? '', [Validators.required, Validators.email]],
      phone:          [m?.phone          ?? ''],
      address:        [m?.address        ?? ''],
      dateOfBirth:    [m?.dateOfBirth    ?? ''],
      membershipType: [m?.membershipType ?? 'STANDARD', Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.isEdit
      ? this.memberService.update(this.data.member!.id!, this.form.value)
      : this.memberService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snack.open(`Member ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 3000, panelClass: 'success-snack' });
        this.ref.close(true);
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Failed to save', 'Close', { duration: 4000, panelClass: 'error-snack' });
        this.saving = false;
      }
    });
  }

  close(): void { this.ref.close(false); }
}
