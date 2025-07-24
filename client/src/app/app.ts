// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ThemeToggleComponent],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <h2>ShortLink</h2>
          </div>
          
          <div class="header-actions">
            <div class="auth-buttons">
              <button class="btn-secondary" routerLink="/auth/login">Login</button>
              <button class="btn-secondary" routerLink="/auth/register">Sign Up</button>
            </div>
            <app-theme-toggle></app-theme-toggle>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background-color: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo h2 {
      color: var(--primary-color);
      font-weight: 700;
      font-size: 1.5rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .auth-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background-color: var(--surface-color);
      color: var(--text-primary);
      border-color: var(--border-hover);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 640px) {
      .header-content {
        padding: 0 0.5rem;
      }
      
      .auth-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .auth-buttons button {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'url-shortener';
}