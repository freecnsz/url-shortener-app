// src/app/features/shortener/components/url-form/url-form.component.ts
import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UrlService } from '../../services/url';

@Component({
  selector: 'app-url-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './url-form.html',
  styleUrl: './url-form.scss'
})
export class UrlFormComponent {
  @Input() isCompact: boolean = false;
  @Input() isLoading: boolean = false;
  
  @Output() urlSubmitted = new EventEmitter<string>();
  @Output() loadingStateChanged = new EventEmitter<boolean>();

  url: string = '';
  showSuccess: boolean = false;
  errorMessage: string = '';
  submitButtonText: string = 'Shorten URL';
  isSubmitting: boolean = false;

  constructor(
    private urlService: UrlService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (this.url.trim() && this.isValidUrl(this.url.trim())) {
      this.errorMessage = '';
      this.isSubmitting = true;
      this.submitButtonText = 'Shortening...';
      this.loadingStateChanged.emit(true);
      
      // Emit URL for parent component to handle
      this.urlSubmitted.emit(this.url.trim());
    } else {
      this.errorMessage = 'Please enter a valid URL (e.g., https://example.com)';
      this.resetSubmitState();
    }
  }

  // Method to be called by parent when API response is received
  onApiSuccess() {
    this.submitButtonText = 'Success!';
    this.showSuccess = true;
    this.isSubmitting = false;
    this.loadingStateChanged.emit(false);
    
    setTimeout(() => {
      this.resetSubmitState();
      this.cdr.detectChanges();
    }, 2000);
  }

  // Method to be called by parent when API fails
  onApiError(errorMessage?: string) {
    this.errorMessage = errorMessage || 'Failed to shorten URL. Please try again.';
    this.resetSubmitState();
    this.loadingStateChanged.emit(false);
  }

  private resetSubmitState() {
    this.submitButtonText = 'Shorten URL';
    this.showSuccess = false;
    this.isSubmitting = false;
  }

  private isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      // Try adding https:// if missing
      try {
        const url = new URL('https://' + string);
        this.url = url.toString();
        return true;
      } catch {
        return false;
      }
    }
  }

  reset() {
    this.url = '';
    this.errorMessage = '';
    this.resetSubmitState();
    this.loadingStateChanged.emit(false);
    this.cdr.detectChanges();
  }
}