import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { SidebarComponent } from '../../components/sidebar/sidebar';
import { LinkCardComponent } from '../../components/link-card/link-card';
import { FolderCardComponent } from '../../components/folder-card/folder-card';
import { ProfileDropdownComponent } from '../../components/profile-dropdown/profile-dropdown';
import { UrlFormComponent } from '../../../shortener/components/url-form/url-form';
import { FolderDialogComponent } from '../../../../shared/components/folder-dialog/folder-dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { SettingsComponent } from '../settings/settings';
import { ProfileComponent } from '../profile/profile';
import { DashboardService, Link, Folder, DashboardStats } from '../../services/dashboard.service';
import { FolderService, Folder as FolderModel, CreateFolderRequest, UpdateFolderRequest } from '../../services/folder.service';
import { UrlService } from '../../../shortener/services/url';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { AuthService, User } from '../../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, LinkCardComponent, FolderCardComponent, ProfileDropdownComponent, UrlFormComponent, FolderDialogComponent, ConfirmationDialogComponent, SettingsComponent, ProfileComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('urlFormRef') urlFormRef!: UrlFormComponent;
  
  private destroy$ = new Subject<void>();
  
  currentView = 'overview';
  stats: DashboardStats | null = null;
  recentLinks: Link[] = [];
  folders: Folder[] = [];
  allLinks: Link[] = [];
  selectedFolder: Folder | null = null;
  showUrlForm = false;
  currentUser: User | null = null;
  
  // Folder dialog properties
  showFolderDialog = false;
  folderDialogMode: 'create' | 'edit' = 'create';
  editingFolder: FolderModel | null = null;
  
  // Confirmation dialog properties
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmDialogAction: (() => void) | null = null;
  
  // Error handling
  statsError = '';
  linksError = '';
  foldersError = '';
  folderActionError = '';
  
  constructor(
    private dashboardService: DashboardService,
    private folderService: FolderService,
    private router: Router,
    private urlService: UrlService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    // Load stats
    this.dashboardService.getStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Stats loading error:', error);
          this.statsError = this.errorHandler.getInlineErrorMessage(error);
          return of(null);
        })
      )
      .subscribe((stats: DashboardStats | null) => {
        this.stats = stats;
        if (stats) this.statsError = '';
      });

    // Load recent links
    this.dashboardService.getRecentLinks()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Recent links loading error:', error);
          this.linksError = this.errorHandler.getInlineErrorMessage(error);
          return of([]);
        })
      )
      .subscribe((links: Link[]) => {
        this.recentLinks = links;
        if (links.length > 0 || links.length === 0) this.linksError = '';
      });

    // Load folders
    this.dashboardService.getFolders()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Folders loading error:', error);
          this.foldersError = this.errorHandler.getInlineErrorMessage(error);
          return of([]);
        })
      )
      .subscribe((folders: Folder[]) => {
        this.folders = folders;
        if (folders.length > 0 || folders.length === 0) this.foldersError = '';
      });

    // Load all links
    this.dashboardService.getLinks()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('All links loading error:', error);
          this.linksError = this.errorHandler.getInlineErrorMessage(error);
          return of([]);
        })
      )
      .subscribe((links: Link[]) => {
        this.allLinks = links;
        if (links.length > 0 || links.length === 0) this.linksError = '';
      });
  }

  onMenuItemSelected(item: string) {
    this.currentView = item;
    this.selectedFolder = null;
  }

  onLinkClicked(link: Link) {
    window.open(link.shortUrl, '_blank');
  }

  onCopyClicked(shortUrl: string) {
    // Show copy success notification
    console.log('Copied to clipboard:', shortUrl);
  }

  onEditLinkClicked(link: Link) {
    console.log('Edit link:', link);
    // TODO: Implement edit modal/form
  }

  onDeleteLinkClicked(linkId: string) {
    if (confirm('Are you sure you want to delete this link?')) {
      this.dashboardService.deleteLink(linkId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadDashboardData();
        });
    }
  }

  onQrClicked(link: Link) {
    console.log('Show QR code for:', link);
    // TODO: Implement QR code modal
  }

  onFolderClicked(folder: Folder) {
    this.selectedFolder = folder;
    this.currentView = 'folder-links';
  }

  onEditFolderClicked(folder: Folder) {
    // Convert dashboard folder to folder model for editing
    this.editingFolder = {
      id: folder.id || '',
      name: folder.name,
      description: folder.description || '',
      color: folder.color || '#ff6b35',
      linkCount: folder.linkCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: this.currentUser?.id || ''
    };
    this.folderDialogMode = 'edit';
    this.showFolderDialog = true;
  }

  onDeleteFolderClicked(folderId: string) {
    this.confirmDialogTitle = 'Delete Folder';
    this.confirmDialogMessage = 'Are you sure you want to delete this folder? All links in this folder will be moved to "Uncategorized".';
    this.confirmDialogAction = () => this.deleteFolderConfirmed(folderId);
    this.showConfirmDialog = true;
  }

  private deleteFolderConfirmed(folderId: string) {
    this.folderService.deleteFolder(folderId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Delete folder error:', error);
          this.folderActionError = this.errorHandler.getInlineErrorMessage(error);
          return of(false);
        })
      )
      .subscribe((success: boolean) => {
        if (success) {
          this.loadDashboardData();
          this.currentView = 'overview';
          this.selectedFolder = null;
          this.folderActionError = '';
        }
      });
  }

  createNewLink() {
    this.showUrlForm = true;
  }

  createNewFolder() {
    this.editingFolder = null;
    this.folderDialogMode = 'create';
    this.showFolderDialog = true;
  }

  // Folder dialog event handlers
  onFolderDialogClosed() {
    this.showFolderDialog = false;
    this.editingFolder = null;
    this.folderActionError = '';
  }

  onFolderCreated(folderData: any) {
    this.createFolder(folderData);
  }

  onFolderUpdated(folderData: any) {
    if (this.editingFolder) {
      this.updateFolder(this.editingFolder.id, folderData);
    }
  }

  private createFolder(folderData: CreateFolderRequest) {
    this.folderService.createFolder(folderData)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Create folder error:', error);
          this.folderActionError = this.errorHandler.getInlineErrorMessage(error);
          return of(null);
        })
      )
      .subscribe((folder: FolderModel | null) => {
        if (folder) {
          this.loadDashboardData();
          this.showFolderDialog = false;
          this.editingFolder = null;
          this.folderActionError = '';
        }
      });
  }

  private updateFolder(folderId: string, folderData: UpdateFolderRequest) {
    this.folderService.updateFolder(folderId, folderData)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Update folder error:', error);
          this.folderActionError = this.errorHandler.getInlineErrorMessage(error);
          return of(null);
        })
      )
      .subscribe((folder: FolderModel | null) => {
        if (folder) {
          this.loadDashboardData();
          this.showFolderDialog = false;
          this.editingFolder = null;
          this.folderActionError = '';
        }
      });
  }

  // Confirmation dialog event handlers
  onConfirmDialogClosed() {
    this.showConfirmDialog = false;
    this.confirmDialogAction = null;
  }

  onConfirmDialogConfirmed() {
    if (this.confirmDialogAction) {
      this.confirmDialogAction();
    }
    this.showConfirmDialog = false;
    this.confirmDialogAction = null;
  }

  async onUrlSubmitted(url: string) {
    try {
      const result = await this.urlService.shortenUrl(url);
      console.log('URL shortened successfully:', result);
      
      // Reset the URL form
      if (this.urlFormRef) {
        this.urlFormRef.onApiSuccess();
        setTimeout(() => {
          this.urlFormRef.reset();
        }, 2000);
      }
      
      // Refresh the dashboard data
      this.loadDashboardData();
      
      // Hide the URL form after success
      setTimeout(() => {
        this.showUrlForm = false;
      }, 2500);
    } catch (error) {
      console.error('Error shortening URL:', error);
      if (this.urlFormRef) {
        this.urlFormRef.onApiError('Failed to shorten URL. Please try again.');
      }
    }
  }

  onCancelUrlForm() {
    this.showUrlForm = false;
  }

  getFolderLinks(): Link[] {
    if (!this.selectedFolder) return [];
    return this.allLinks.filter(link => link.folder === this.selectedFolder!.name);
  }

  getLinksForView(): Link[] {
    switch (this.currentView) {
      case 'all-links':
        return this.allLinks;
      case 'folder-links':
        return this.getFolderLinks();
      default:
        return this.recentLinks;
    }
  }

  getPageTitle(): string {
    switch (this.currentView) {
      case 'overview': return 'Dashboard Overview';
      case 'all-links': return 'All Links';
      case 'folders': return 'Folders';
      case 'profile': return 'Profile';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  }

  getPageSubtitle(): string {
    switch (this.currentView) {
      case 'overview': return 'Welcome back! Here\'s what\'s happening with your links.';
      case 'all-links': return 'Manage all your shortened links in one place.';
      case 'folders': return 'Organize your links with custom folders.';
      case 'profile': return 'Manage your account information and view statistics.';
      case 'settings': return 'Configure your account preferences and settings.';
      default: return '';
    }
  }
}
