// src/app/shared/components/theme-toggle/theme-toggle.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle" 
      (click)="toggleTheme()"
      [attr.aria-label]="currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
      [title]="currentTheme === 'light' ? 'Dark theme' : 'Light theme'">
      <!-- Moon icon for light theme (click to go dark) -->
      <svg 
        *ngIf="currentTheme === 'light'" 
        class="icon moon-icon" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <!-- Sun icon for dark theme (click to go light) -->
      <svg 
        *ngIf="currentTheme === 'dark'" 
        class="icon sun-icon" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-primary);
      position: relative;
      overflow: hidden;
    }

    .theme-toggle:hover {
      background: var(--card-color);
      border-color: var(--border-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .theme-toggle:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    .icon {
      width: 1.5rem;
      height: 1.5rem;
      transition: all 0.3s ease;
    }

    .moon-icon {
      color: #6366f1;
      animation: fadeIn 0.3s ease;
    }

    .sun-icon {
      color: #f59e0b;
      animation: fadeIn 0.3s ease;
    }

    .theme-toggle:hover .moon-icon {
      color: #4f46e5;
      transform: rotate(-15deg);
    }

    .theme-toggle:hover .sun-icon {
      color: #d97706;
      transform: rotate(15deg);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (max-width: 640px) {
      .theme-toggle {
        padding: 0.625rem;
      }
      
      .icon {
        width: 1.25rem;
        height: 1.25rem;
      }
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  currentTheme: Theme = 'light';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}