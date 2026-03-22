import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-shell">
      <div class="login-left">
        <div class="brand-block">
          <mat-icon class="hero-icon">local_library</mat-icon>
          <h1>Library<br>Management<br>System</h1>
          <p>Organise, track, and manage your library with ease.</p>
        </div>
        <div class="decoration">
          <div class="circle c1"></div>
          <div class="circle c2"></div>
          <div class="circle c3"></div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <div class="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person_outline</mat-icon>
              <input matInput formControlName="username" autocomplete="username"/>
              @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock_outline</mat-icon>
              <input matInput [type]="showPw ? 'text' : 'password'" formControlName="password"/>
              <button mat-icon-button matSuffix type="button" (click)="showPw = !showPw">
                <mat-icon>{{ showPw ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (error) {
              <div class="error-alert">
                <mat-icon>error_outline</mat-icon> {{ error }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="loading || form.invalid" class="submit-btn">
              @if (loading) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="login-hint">
            <p><strong>Demo credentials:</strong></p>
            <p>Admin: <code>admin / Admin&#64;123</code></p>
            <p>Librarian: <code>librarian / Lib&#64;12345</code></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh; display: flex;
    }

    /* Left Panel */
    .login-left {
      flex: 1; background: linear-gradient(145deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 3rem; position: relative; overflow: hidden;
    }
    .brand-block {
      position: relative; z-index: 2; color: #fff; max-width: 340px;
    }
    .hero-icon {
      font-size: 4rem; width: 4rem; height: 4rem;
      color: #a5b4fc; margin-bottom: 1.5rem; display: block;
    }
    .brand-block h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem; line-height: 1.15; color: #fff; margin-bottom: 1.25rem;
    }
    .brand-block p {
      font-size: 1rem; color: #c7d2fe; line-height: 1.7;
    }
    .decoration { position: absolute; inset: 0; pointer-events: none; }
    .circle {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,.04);
    }
    .c1 { width: 500px; height: 500px; bottom: -200px; right: -150px; }
    .c2 { width: 300px; height: 300px; top: -100px; right: -80px; background: rgba(255,255,255,.06); }
    .c3 { width: 180px; height: 180px; top: 40%; left: -60px; }

    /* Right Panel */
    .login-right {
      width: 480px; display: flex; align-items: center; justify-content: center;
      padding: 3rem 2.5rem; background: #f8fafc;
    }
    .login-card { width: 100%; }
    .login-header {
      margin-bottom: 2rem;
      h2 { font-family: 'Playfair Display', serif; font-size: 1.9rem; color: #1e1b4b; margin-bottom: .3rem; }
      p  { color: #64748b; font-size: .9rem; }
    }

    .login-form { display: flex; flex-direction: column; gap: 1rem; }

    .error-alert {
      display: flex; align-items: center; gap: .5rem;
      background: #fee2e2; color: #991b1b;
      border-radius: 8px; padding: .75rem 1rem;
      font-size: .875rem;
      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    }

    .submit-btn {
      height: 48px; font-size: .95rem; font-weight: 600;
      border-radius: 10px !important; margin-top: .5rem;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
    }

    .login-hint {
      margin-top: 1.5rem; padding: 1rem;
      background: #ede9fe; border-radius: 10px;
      font-size: .8rem; color: #4c1d95;
      p { margin-bottom: .2rem; }
      code { background: rgba(0,0,0,.08); padding: .1rem .3rem; border-radius: 4px; }
    }

    @media (max-width: 768px) {
      .login-left { display: none; }
      .login-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPw  = false;
  error   = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error   = '';
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error   = err?.error?.message ?? 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }
}
