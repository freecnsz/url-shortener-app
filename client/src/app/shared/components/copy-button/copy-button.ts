// src/app/shared/components/copy-button/copy-button.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="copy-btn"
      (click)="copyToClipboard()"
      [class.copied]="isCopied"
      [title]="isCopied ? 'Copied!' : 'Copy to clipboard'">
      
      <!-- Copy Icon -->
      <svg *ngIf="!isCopied" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      
      <!-- Check Icon -->
      <svg *ngIf="isCopied" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M5 13l4 4L19 7"></path>
      </svg>
      
      <span class="copy-text">{{ isCopied ? 'Copied!' : 'Copy' }}</span>
    </button>
  `,
  styles: [`
    .copy-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .copy-btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .copy-btn.copied {
      background: #10b981;
    }

    .copy-btn svg {
      width: 1rem;
      height: 1rem;
      transition: transform 0.2s ease;
    }

    .copy-btn.copied svg {
      transform: scale(1.1);
    }

    .copy-text {
      transition: all 0.2s ease;
    }

    @media (max-width: 640px) {
      .copy-btn {
        padding: 0.5rem;
        justify-content: center;
        min-width: 2.5rem;
      }

      .copy-text {
        display: none;
      }
    }
  `]
})
export class CopyButtonComponent {
  @Input() textToCopy = '';
  
  isCopied = false;

  async copyToClipboard(): Promise<void> {
    if (!this.textToCopy) return;

    try {
      await navigator.clipboard.writeText(this.textToCopy);
      this.showCopiedState();
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(this.textToCopy);
    }
  }

  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopiedState();
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  private showCopiedState(): void {
    this.isCopied = true;
    setTimeout(() => {
      this.isCopied = false;
    }, 2000);
  }
}