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

  constructor(
    private urlService: UrlService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (this.url.trim() && this.isValidUrl(this.url.trim())) {
      this.errorMessage = '';
      this.urlSubmitted.emit(this.url.trim());
      this.showSuccessAnimation();
    } else {
      this.errorMessage = 'Please enter a valid URL';
    }
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

  showSuccessAnimation() {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  reset() {
    this.url = '';
    this.errorMessage = '';
    this.showSuccess = false;
  }
}