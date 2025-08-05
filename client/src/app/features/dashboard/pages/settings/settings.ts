import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { HttpErrorResponse } from '@angular/common/http';

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  linkExpiration: 'never' | '1day' | '7days' | '30days' | '1year';
  customDomain: string;
  analyticsEnabled: boolean;
  autoDeleteExpired: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  settings: UserSettings = {
    theme: 'auto',
    emailNotifications: true,
    linkExpiration: 'never',
    customDomain: '',
    analyticsEnabled: true,
    autoDeleteExpired: false
  };

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  expirationOptions = [
    { value: 'never', label: 'Never expire' },
    { value: '1day', label: '1 Day' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '1year', label: '1 Year' }
  ];

  themeOptions = [
    { value: 'light', label: 'Light', icon: 'fas fa-sun' },
    { value: 'dark', label: 'Dark', icon: 'fas fa-moon' },
    { value: 'auto', label: 'Auto', icon: 'fas fa-adjust' }
  ];

  constructor(
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadSettings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadSettings() {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Implement API call to load user settings
    // For now, load from localStorage or use defaults
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.warn('Failed to parse saved settings:', error);
      }
    }

    this.isLoading = false;
  }

  onSaveSettings() {
    if (!this.currentUser) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // TODO: Implement API call to save settings
    // For now, save to localStorage
    try {
      localStorage.setItem('userSettings', JSON.stringify(this.settings));
      
      // Simulate API delay
      setTimeout(() => {
        this.isSaving = false;
        this.successMessage = 'Settings saved successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }, 1000);

    } catch (error) {
      this.isSaving = false;
      this.errorMessage = 'Failed to save settings. Please try again.';
    }
  }

  onResetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      this.settings = {
        theme: 'auto',
        emailNotifications: true,
        linkExpiration: 'never',
        customDomain: '',
        analyticsEnabled: true,
        autoDeleteExpired: false
      };
      this.onSaveSettings();
    }
  }

  onExportData() {
    // TODO: Implement data export functionality
    console.log('Export user data');
    alert('Export feature coming soon!');
  }

  onDeleteAccount() {
    const confirmMessage = 'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your links and data.';
    
    if (confirm(confirmMessage)) {
      const doubleConfirm = confirm('This is your final warning. Type "DELETE" to confirm account deletion.');
      if (doubleConfirm) {
        // TODO: Implement account deletion
        console.log('Delete account');
        alert('Account deletion feature will be implemented with proper confirmation flow.');
      }
    }
  }

  getThemeIcon(theme: string): string {
    const option = this.themeOptions.find(opt => opt.value === theme);
    return option?.icon || 'fas fa-adjust';
  }

  selectTheme(theme: string) {
    this.settings.theme = theme as 'light' | 'dark' | 'auto';
  }

  getCurrentDate(): Date {
    return new Date();
  }
}
