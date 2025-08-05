import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { HttpErrorResponse } from '@angular/common/http';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone: string;
}

export interface ProfileStats {
  totalLinks: number;
  totalClicks: number;
  totalFolders: number;
  accountAge: number; // in days
  mostUsedDevice: string;
  topLocation: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  profile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    timezone: 'UTC'
  };

  stats: ProfileStats = {
    totalLinks: 0,
    totalClicks: 0,
    totalFolders: 0,
    accountAge: 0,
    mostUsedDevice: 'Unknown',
    topLocation: 'Unknown'
  };

  isLoading = false;
  isSaving = false;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';

  timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  constructor(
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadProfile();
    this.loadStats();
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
        if (user) {
          this.profile = {
            ...this.profile,
            firstName: (user as any).firstName || user.name?.split(' ')[0] || '',
            lastName: (user as any).lastName || user.name?.split(' ')[1] || '',
            email: user.email
          };
        }
      });
  }

  private loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Implement API call to load user profile
    // For now, load from localStorage or use defaults
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        this.profile = { ...this.profile, ...parsedProfile };
      } catch (error) {
        console.warn('Failed to parse saved profile:', error);
      }
    }

    this.isLoading = false;
  }

  private loadStats() {
    // TODO: Implement API call to load profile statistics
    // For now, use mock data
    this.stats = {
      totalLinks: Math.floor(Math.random() * 100) + 10,
      totalClicks: Math.floor(Math.random() * 1000) + 50,
      totalFolders: Math.floor(Math.random() * 20) + 3,
      accountAge: Math.floor(Math.random() * 365) + 30,
      mostUsedDevice: 'Desktop',
      topLocation: 'United States'
    };
  }

  onEditProfile() {
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onCancelEdit() {
    this.isEditMode = false;
    this.loadProfile(); // Reset to original values
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSaveProfile() {
    if (!this.validateProfile()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // TODO: Implement API call to save profile
    // For now, save to localStorage
    try {
      localStorage.setItem('userProfile', JSON.stringify(this.profile));
      
      // Simulate API delay
      setTimeout(() => {
        this.isSaving = false;
        this.isEditMode = false;
        this.successMessage = 'Profile updated successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }, 1000);

    } catch (error) {
      this.isSaving = false;
      this.errorMessage = 'Failed to save profile. Please try again.';
    }
  }

  private validateProfile(): boolean {
    if (!this.profile.firstName.trim()) {
      this.errorMessage = 'First name is required.';
      return false;
    }
    if (!this.profile.lastName.trim()) {
      this.errorMessage = 'Last name is required.';
      return false;
    }
    if (!this.profile.email.trim()) {
      this.errorMessage = 'Email is required.';
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profile.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    // Validate website URL if provided
    if (this.profile.website && this.profile.website.trim()) {
      try {
        new URL(this.profile.website);
      } catch {
        this.errorMessage = 'Please enter a valid website URL.';
        return false;
      }
    }

    return true;
  }

  onAvatarFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement avatar upload
      console.log('Avatar file selected:', file);
      
      // For now, just show a preview using FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profile.avatar = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onAvatarUpload() {
    const input = document.getElementById('avatarInput') as HTMLInputElement;
    input?.click();
  }

  onRemoveAvatar() {
    this.profile.avatar = undefined;
  }

  getFullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  getInitials(): string {
    const firstName = this.profile.firstName.trim();
    const lastName = this.profile.lastName.trim();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getAccountAgeText(): string {
    const days = this.stats.accountAge;
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getCurrentDate(): Date {
    return new Date();
  }
}
