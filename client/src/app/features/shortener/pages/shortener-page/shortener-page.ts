// src/app/features/shortener/pages/shortener-page/shortener-page.component.ts
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrlFormComponent } from '../../components/url-form/url-form';
import { UrlResultComponent } from '../../components/url-result/url-result';
import { UrlService } from '../../services/url';

interface UrlStats {
  clicks: number;
  created: Date;
  lastAccessed?: Date;
}

@Component({
  selector: 'app-shortener-page',
  standalone: true,
  imports: [CommonModule, UrlFormComponent, UrlResultComponent],
  templateUrl: './shortener-page.html',
  styleUrl: './shortener-page.scss'
})
export class ShortenerPageComponent {
  @ViewChild(UrlFormComponent) urlFormComponent!: UrlFormComponent;
  
  currentState: string = 'state-initial';
  isLoading: boolean = false;
  hasResult: boolean = false;
  showResult: boolean = false;
  
  originalUrl: string = '';
  shortenedUrl: string = '';
  urlStats: UrlStats | null = null;

  constructor(
    private urlService: UrlService,
    private cdr: ChangeDetectorRef
  ) {}

  async onUrlSubmit(url: string) {
    this.originalUrl = url;
    this.isLoading = true;
    this.currentState = 'state-loading';
    this.showResult = true;
    
    try {
      // Call the actual API
      const result = await this.urlService.shortenUrl(url);
      
      this.shortenedUrl = result.shortUrl;
      this.urlStats = {
        clicks: 0,
        created: new Date()
      };
      
      this.isLoading = false;
      this.hasResult = true;
      this.currentState = 'state-success';
      
      // Notify form component of success
      this.urlFormComponent.onApiSuccess();
      
      this.cdr.detectChanges();
      
    } catch (error: any) {
      this.isLoading = false;
      this.showResult = false;
      this.currentState = 'state-initial';
      
      // Notify form component of error
      const errorMessage = error.message || 'Failed to shorten URL. Please try again.';
      this.urlFormComponent.onApiError(errorMessage);
      
      console.error('Error shortening URL:', error);
      this.cdr.detectChanges();
    }
  }

  onNewUrlRequest() {
    // Reset to initial state
    this.currentState = 'state-initial';
    this.isLoading = false;
    this.hasResult = false;
    this.showResult = false;
    this.originalUrl = '';
    this.shortenedUrl = '';
    this.urlStats = null;
    
    // Reset form component
    this.urlFormComponent.reset();
    
    this.cdr.detectChanges();
  }

  onShareRequest(url: string) {
    // Handle share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Shortened URL',
        text: 'Check out this shortened link:',
        url: url
      }).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare(url);
      });
    } else {
      this.fallbackShare(url);
    }
  }

  private fallbackShare(url: string) {
    // Fallback sharing method (copy to clipboard)
    navigator.clipboard.writeText(url).then(() => {
      // Show success message
      console.log('URL copied to clipboard for sharing');
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  }
}