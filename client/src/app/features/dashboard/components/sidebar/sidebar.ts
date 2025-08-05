import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationDialogComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() currentView = 'overview';
  @Output() menuItemSelected = new EventEmitter<string>();

  isCollapsed = false;
  showLogoutDialog = false;
  private destroy$ = new Subject<void>();

  menuItems = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line' },
    { id: 'all-links', label: 'All Links', icon: 'fas fa-link' },
    { id: 'folders', label: 'Folders', icon: 'fas fa-folder' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Sidebar artık kullanıcı bilgilerini yönetmiyor
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectSection(sectionId: string) {
    this.currentView = sectionId;
    this.menuItemSelected.emit(sectionId);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    // Dialog'ı göster
    this.showLogoutDialog = true;
  }

  async onLogoutConfirmed() {
    this.showLogoutDialog = false;
    try {
      await this.authService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  onLogoutCancelled() {
    this.showLogoutDialog = false;
  }
}
