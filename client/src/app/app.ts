import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog';
import { AuthService, User } from './core/services/auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ThemeToggleComponent, ConfirmationDialogComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'LinkHub';
  isErrorPage = false;
  currentUser: User | null = null;
  isDashboardPage = false;
  showLogoutDialog = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Listen to user state changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Listen to route changes to detect error pages and dashboard
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfErrorPage(event.url);
      this.isDashboardPage = event.url.startsWith('/dashboard');
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkIfErrorPage(url: string): void {
    // Check if current route is an error page
    this.isErrorPage = url.includes('/error/') || 
                      url.includes('/maintenance') || 
                      url === '/error-test';
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