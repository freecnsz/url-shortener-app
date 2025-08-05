import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="profile-section">
      <!-- Theme Toggle -->
      <app-theme-toggle></app-theme-toggle>
      
      <!-- Profile Dropdown -->
      <div class="profile-dropdown" [class.open]="isDropdownOpen">
        <button 
          class="profile-trigger" 
          (click)="toggleDropdown()"
          [attr.aria-expanded]="isDropdownOpen">
          <div class="profile-avatar">
            <img [src]="currentUser?.imageUrl" *ngIf="currentUser?.imageUrl" [alt]="currentUser?.name">
            <i class="fas fa-user" *ngIf="!currentUser?.imageUrl"></i>
          </div>
          <i class="fas fa-chevron-down dropdown-icon" [class.rotate]="isDropdownOpen"></i>
        </button>
        
        <div class="dropdown-menu" *ngIf="isDropdownOpen">
          <div class="dropdown-header">
            <div class="user-info">
              <div class="user-avatar-large">
                <img [src]="currentUser?.imageUrl" *ngIf="currentUser?.imageUrl" [alt]="currentUser?.name">
                <i class="fas fa-user" *ngIf="!currentUser?.imageUrl"></i>
              </div>
              <div class="user-details">
                <span class="user-name">{{ currentUser?.name }}</span>
                <span class="user-email">{{ currentUser?.email }}</span>
              </div>
            </div>
          </div>
          
          <div class="dropdown-body">
            <a class="dropdown-item" routerLink="/profile">
              <i class="fas fa-user-circle"></i>
              <span>My Profile</span>
            </a>
            <a class="dropdown-item" routerLink="/settings">
              <i class="fas fa-cog"></i>
              <span>Settings</span>
            </a>
            <a class="dropdown-item" routerLink="/billing">
              <i class="fas fa-credit-card"></i>
              <span>Billing</span>
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" routerLink="/help">
              <i class="fas fa-question-circle"></i>
              <span>Help & Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile-dropdown.scss']
})
export class ProfileDropdownComponent implements OnInit, OnDestroy {
  @Input() currentUser: User | null = null;
  
  isDropdownOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Get current user if not provided
    if (!this.currentUser) {
      this.authService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          this.currentUser = user;
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.profile-dropdown');
    
    if (!dropdown) {
      this.isDropdownOpen = false;
    }
  }
}
