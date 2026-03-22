import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './core/services/api.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressBarModule, CommonModule],
  template: `
    @if (loading.loading()) {
      <mat-progress-bar mode="indeterminate" class="global-loader"></mat-progress-bar>
    }
    <router-outlet/>
  `,
  styles: [`
    .global-loader {
      position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
    }
  `]
})
export class AppComponent {
  constructor(readonly loading: LoadingService) {}
}
