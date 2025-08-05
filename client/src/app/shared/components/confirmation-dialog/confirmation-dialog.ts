import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-backdrop" *ngIf="isVisible" (click)="onBackdropClick()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div class="dialog-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <h3 class="dialog-title">{{ title }}</h3>
        </div>
        
        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>
        </div>
        
        <div class="dialog-actions">
          <button class="btn-cancel" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="btn-confirm" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./confirmation-dialog.scss']
})
export class ConfirmationDialogComponent {
  @Input() isVisible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Yes';
  @Input() cancelText = 'Cancel';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
    // Parent component state'ini sıfırlamak için emit yapmayalım
  }

  onCancel() {
    this.cancelled.emit();
    // Parent component state'ini sıfırlamak için emit yapmayalım
  }

  onBackdropClick() {
    this.onCancel();
  }
}
