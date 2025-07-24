// src/app/features/shortener/components/url-result/url-result.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UrlStats {
  clicks: number;
  created: Date;
  lastAccessed?: Date;
}

@Component({
  selector: 'app-url-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './url-result.html',
  styleUrl: './url-result.scss'
})
export class UrlResultComponent implements OnInit, OnChanges, OnDestroy {
  @Input() originalUrl: string = '';
  @Input() shortenedUrl: string = '';
  @Input() isLoading: boolean = false;
  @Input() stats: UrlStats | null = null;
  
  @Output() newUrlRequested = new EventEmitter<void>();
  @Output() shareRequested = new EventEmitter<string>();

  qrCodeUrl: string = '';
  isCopied: boolean = false;
  currentStep: string = 'validating';
  steps: string[] = [];

  private loadingSteps = ['validating', 'shortening', 'qr', 'complete'];
  private stepTimeouts: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Reset states on init
    this.isCopied = false;
    
    if (this.isLoading) {
      this.startLoadingSequence();
    }
    if (this.shortenedUrl) {
      this.generateQRCode();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Her değişiklikte copy state'ini sıfırla
    this.isCopied = false;
    
    if (changes['isLoading']) {
      if (changes['isLoading'].currentValue) {
        this.startLoadingSequence();
      } else {
        this.stopLoadingSequence();
      }
    }
    if (changes['shortenedUrl'] && this.shortenedUrl) {
      this.generateQRCode();
    }
  }

  ngOnDestroy() {
    this.stopLoadingSequence();
  }

  startLoadingSequence() {
    this.currentStep = 'validating';
    this.steps = [];
    
    // Clear any existing timeouts
    this.stopLoadingSequence();
    
    // Simulate realistic loading steps with varying durations
    this.stepTimeouts.push(
      setTimeout(() => {
        this.steps.push('validating');
        this.currentStep = 'shortening';
        this.cdr.detectChanges();
      }, 800)
    );
    
    this.stepTimeouts.push(
      setTimeout(() => {
        this.steps.push('shortening');
        this.currentStep = 'qr';
        this.cdr.detectChanges();
      }, 1600)
    );
    
    this.stepTimeouts.push(
      setTimeout(() => {
        this.steps.push('qr');
        this.currentStep = 'complete';
        this.cdr.detectChanges();
      }, 2200)
    );
    
    this.stepTimeouts.push(
      setTimeout(() => {
        this.steps.push('complete');
        this.cdr.detectChanges();
      }, 2600)
    );
  }

  stopLoadingSequence() {
    this.stepTimeouts.forEach(timeout => clearTimeout(timeout));
    this.stepTimeouts = [];
  }

  copyToClipboard() {
    if (this.shortenedUrl) {
      navigator.clipboard.writeText(this.shortenedUrl).then(() => {
        this.isCopied = true;
        
        // Reset copy button state after 2 seconds
        setTimeout(() => {
          this.isCopied = false;
          this.cdr.detectChanges();
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy URL:', err);
        // Fallback for older browsers
        this.fallbackCopyToClipboard(this.shortenedUrl);
      });
    }
  }

  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.isCopied = true;
      
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  createNewUrl() {
    this.newUrlRequested.emit();
  }

  shareUrl() {
    if (navigator.share && this.shortenedUrl) {
      navigator.share({
        title: 'Shortened URL',
        text: 'Check out this shortened link:',
        url: this.shortenedUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }

  private fallbackShare() {
    this.shareRequested.emit(this.shortenedUrl);
  }

  calculateSaved(): string {
    if (this.originalUrl && this.shortenedUrl) {
      const saved = this.originalUrl.length - this.shortenedUrl.length;
      return saved > 0 ? `${saved}` : '0';
    }
    return '0';
  }

  visitUrl(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private generateQRCode(): void {
    if (!this.shortenedUrl) return;
    
    // QR Server API kullanarak QR kod oluştur
    const encodedUrl = encodeURIComponent(this.shortenedUrl);
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
    
    this.cdr.detectChanges();
  }

  async downloadQR(): Promise<void> {
    if (!this.qrCodeUrl) return;

    try {
      // Fetch the image as blob
      const response = await fetch(this.qrCodeUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${Date.now()}.png`;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      // Fallback: open in new tab
      window.open(this.qrCodeUrl, '_blank');
    }
  }
}