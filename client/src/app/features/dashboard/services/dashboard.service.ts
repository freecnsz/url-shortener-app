import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { ApiResponse, ApiResponseHelper } from '../../../core/models/api-response';

export interface Link {
  id: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
  description?: string;
  folderId?: string;
  folder?: string; // folder name for display
  createdAt: Date;
  lastAccessed?: Date;
  clicks: number; // renamed from clickCount
  isActive: boolean;
  qrCode?: string;
  customAlias?: string;
  expiresAt?: Date;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  linkCount: number;
  createdAt: Date;
  isPublic: boolean;
}

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  totalFolders: number;
  linksCreatedToday: number;
  clicksToday: number;
  topPerformingLinks: Link[];
  recentActivity: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private linksSubject = new BehaviorSubject<Link[]>([]);
  private foldersSubject = new BehaviorSubject<Folder[]>([]);

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      // Load initial data when service is created
      await Promise.all([
        this.fetchLinks(),
        this.fetchFolders()
      ]);
    } catch (error) {
      console.error('Error loading initial dashboard data:', error);
    }
  }

  private async fetchLinks(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiResponse<Link[]>>(this.api.endpoints.URLS.USER_URLS)
      );

      if (ApiResponseHelper.isSuccess(response)) {
        const links = ApiResponseHelper.getData(response) || [];
        this.linksSubject.next(links);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      // Keep existing data or empty array
    }
  }

  private async fetchFolders(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiResponse<Folder[]>>(this.api.endpoints.DASHBOARD.FOLDERS)
      );

      if (ApiResponseHelper.isSuccess(response)) {
        const folders = ApiResponseHelper.getData(response) || [];
        this.foldersSubject.next(folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      // Keep existing data or empty array
    }
  }

  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);

  public links$ = this.linksSubject.asObservable();
  public folders$ = this.foldersSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  // Getter methods for components
  getStats(): Observable<DashboardStats | null> {
    return this.stats$;
  }

  getLinks(): Observable<Link[]> {
    return this.links$;
  }

  getFolders(): Observable<Folder[]> {
    return this.folders$;
  }

  getRecentLinks(limit: number = 5): Observable<Link[]> {
    return new Observable(observer => {
      this.links$.subscribe(links => {
        const recentLinks = links
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit);
        observer.next(recentLinks);
      });
    });
  }

  // Template methods - will be replaced with real API calls later
  async getUserLinks(): Promise<Link[]> {
    // Mock data for now
    const mockLinks: Link[] = [
      {
        id: '1',
        shortUrl: 'https://linkhub.ly/abc123',
        originalUrl: 'https://www.example.com/very-long-url-that-needs-shortening',
        title: 'Example Website',
        description: 'A sample website for testing',
        createdAt: new Date('2025-07-25'),
        lastAccessed: new Date('2025-07-29'),
        clicks: 127,
        isActive: true,
        tags: ['business', 'website']
      },
      {
        id: '2',
        shortUrl: 'https://linkhub.ly/xyz789',
        originalUrl: 'https://github.com/user/awesome-project',
        title: 'GitHub Project',
        description: 'Open source project repository',
        folderId: '1',
        folder: 'Work Projects',
        createdAt: new Date('2025-07-28'),
        lastAccessed: new Date('2025-07-30'),
        clicks: 45,
        isActive: true,
        tags: ['github', 'development']
      },
      {
        id: '3',
        shortUrl: 'https://linkhub.ly/blog456',
        originalUrl: 'https://medium.com/article/how-to-build-url-shortener',
        title: 'URL Shortener Tutorial',
        description: 'Step by step guide',
        folderId: '2',
        folder: 'Learning Resources',
        createdAt: new Date('2025-07-26'),
        clicks: 89,
        isActive: true,
        tags: ['tutorial', 'blog']
      }
    ];

    this.linksSubject.next(mockLinks);
    return mockLinks;
  }

  async getUserFolders(): Promise<Folder[]> {
    const mockFolders: Folder[] = [
      {
        id: '1',
        name: 'Work Projects',
        description: 'Links related to work and business',
        color: 'blue',
        icon: 'fas fa-briefcase',
        linkCount: 8,
        createdAt: new Date('2025-07-20'),
        isPublic: false
      },
      {
        id: '2',
        name: 'Learning Resources',
        description: 'Educational content and tutorials',
        color: 'green',
        icon: 'fas fa-graduation-cap',
        linkCount: 15,
        createdAt: new Date('2025-07-22'),
        isPublic: true
      },
      {
        id: '3',
        name: 'Personal',
        description: 'Personal bookmarks and links',
        color: 'orange',
        icon: 'fas fa-user',
        linkCount: 5,
        createdAt: new Date('2025-07-24'),
        isPublic: false
      }
    ];

    this.foldersSubject.next(mockFolders);
    return mockFolders;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const mockStats: DashboardStats = {
      totalLinks: 23,
      totalClicks: 1456,
      totalFolders: 3,
      linksCreatedToday: 2,
      clicksToday: 34,
      topPerformingLinks: [],
      recentActivity: [
        { type: 'link_created', message: 'New link created: Example Website', time: new Date() },
        { type: 'folder_created', message: 'New folder created: Work Projects', time: new Date() }
      ]
    };

    this.statsSubject.next(mockStats);
    return mockStats;
  }

  // Real API methods (templates for later implementation)
  createLink(linkData: Partial<Link>): Observable<Link> {
    return this.http.post<Link>(`${environment.apiUrl}/links`, linkData);
  }

  updateLink(id: string, linkData: Partial<Link>): Observable<Link> {
    return this.http.put<Link>(`${environment.apiUrl}/links/${id}`, linkData);
  }

  deleteLink(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/links/${id}`);
  }

  createFolder(folderData: Partial<Folder>): Observable<Folder> {
    return this.http.post<Folder>(`${environment.apiUrl}/folders`, folderData);
  }

  updateFolder(id: string, folderData: Partial<Folder>): Observable<Folder> {
    return this.http.put<Folder>(`${environment.apiUrl}/folders/${id}`, folderData);
  }

  deleteFolder(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/folders/${id}`);
  }

  getLinkStats(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/links/${id}/stats`);
  }

  private loadMockData() {
    this.getUserLinks();
    this.getUserFolders();
    this.getDashboardStats();
  }
}
