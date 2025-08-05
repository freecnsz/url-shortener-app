import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response';

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  linkCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface FolderStats {
  totalFolders: number;
  totalLinks: number;
  recentActivity: {
    foldersCreated: number;
    linksAdded: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private foldersSubject = new BehaviorSubject<Folder[]>([]);
  public folders$ = this.foldersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all folders for the current user
   */
  getFolders(): Observable<Folder[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.get<ApiResponse<Folder[]>>('/folders').pipe(
      map(response => {
        if (response.success && response.data) {
          this.foldersSubject.next(response.data);
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch folders');
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to fetch folders';
        this.errorSubject.next(errorMessage);
        this.foldersSubject.next([]);
        return of([]);
      }),
      map(folders => {
        this.loadingSubject.next(false);
        return folders;
      })
    );
  }

  /**
   * Get a specific folder by ID
   */
  getFolderById(id: string): Observable<Folder | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.get<ApiResponse<Folder>>(`/folders/${id}`).pipe(
      map(response => {
        this.loadingSubject.next(false);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Folder not found');
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.message || error.message || 'Failed to fetch folder';
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Create a new folder
   */
  createFolder(folderData: CreateFolderRequest): Observable<Folder | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.post<ApiResponse<Folder>>('/folders', folderData).pipe(
      map(response => {
        this.loadingSubject.next(false);
        if (response.success && response.data) {
          // Add the new folder to the current list
          const currentFolders = this.foldersSubject.value;
          this.foldersSubject.next([...currentFolders, response.data]);
          return response.data;
        }
        throw new Error(response.message || 'Failed to create folder');
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.message || error.message || 'Failed to create folder';
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Update an existing folder
   */
  updateFolder(id: string, folderData: UpdateFolderRequest): Observable<Folder | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.put<ApiResponse<Folder>>(`/folders/${id}`, folderData).pipe(
      map(response => {
        this.loadingSubject.next(false);
        if (response.success && response.data) {
          // Update the folder in the current list
          const currentFolders = this.foldersSubject.value;
          const updatedFolders = currentFolders.map(folder => 
            folder.id === id ? response.data! : folder
          );
          this.foldersSubject.next(updatedFolders);
          return response.data;
        }
        throw new Error(response.message || 'Failed to update folder');
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.message || error.message || 'Failed to update folder';
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Delete a folder
   */
  deleteFolder(id: string): Observable<boolean> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.delete<ApiResponse<any>>(`/folders/${id}`).pipe(
      map(response => {
        this.loadingSubject.next(false);
        if (response.success) {
          // Remove the folder from the current list
          const currentFolders = this.foldersSubject.value;
          const updatedFolders = currentFolders.filter(folder => folder.id !== id);
          this.foldersSubject.next(updatedFolders);
          return true;
        }
        throw new Error(response.message || 'Failed to delete folder');
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.message || error.message || 'Failed to delete folder';
        this.errorSubject.next(errorMessage);
        return of(false);
      })
    );
  }

  /**
   * Get folder statistics
   */
  getFolderStats(): Observable<FolderStats | null> {
    this.errorSubject.next(null);

    return this.apiService.get<ApiResponse<FolderStats>>('/folders/stats').pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch folder statistics');
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to fetch folder statistics';
        this.errorSubject.next(errorMessage);
        return of(null);
      })
    );
  }

  /**
   * Move links to a different folder
   */
  moveLinksToFolder(linkIds: string[], targetFolderId: string): Observable<boolean> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const payload = {
      linkIds,
      targetFolderId
    };

    return this.apiService.post<ApiResponse<any>>('/folders/move-links', payload).pipe(
      map(response => {
        this.loadingSubject.next(false);
        if (response.success) {
          return true;
        }
        throw new Error(response.message || 'Failed to move links');
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.message || error.message || 'Failed to move links';
        this.errorSubject.next(errorMessage);
        return of(false);
      })
    );
  }

  /**
   * Get links within a specific folder
   */
  getFolderLinks(folderId: string, page: number = 1, limit: number = 10): Observable<any> {
    this.errorSubject.next(null);

    const params = {
      page: page.toString(),
      limit: limit.toString()
    };

    return this.apiService.get<ApiResponse<any>>(`/folders/${folderId}/links`, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch folder links');
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to fetch folder links';
        this.errorSubject.next(errorMessage);
        return of({ links: [], pagination: { total: 0, page: 1, pages: 0 } });
      })
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Refresh folders data
   */
  refreshFolders(): void {
    this.getFolders().subscribe();
  }

  /**
   * Get current folders value (synchronous)
   */
  getCurrentFolders(): Folder[] {
    return this.foldersSubject.value;
  }

  /**
   * Get folder by ID from current state (synchronous)
   */
  getCurrentFolderById(id: string): Folder | undefined {
    return this.foldersSubject.value.find(folder => folder.id === id);
  }
}
