import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-folder-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-backdrop" *ngIf="isVisible" (click)="onBackdropClick()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3 class="dialog-title">
            {{ isEditing ? 'Edit Folder' : 'Create New Folder' }}
          </h3>
          <button class="close-btn" (click)="onCancel()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <form (ngSubmit)="onSubmit()" #folderForm="ngForm">
            <div class="form-group">
              <label for="folderName">Folder Name</label>
              <input
                type="text"
                id="folderName"
                name="folderName"
                class="form-control"
                [(ngModel)]="folderData.name"
                required
                maxlength="50"
                placeholder="Enter folder name"
                #nameInput="ngModel"
                autofocus>
              <div class="form-error" *ngIf="nameInput.invalid && nameInput.touched">
                <span *ngIf="nameInput.errors?.['required']">Folder name is required</span>
                <span *ngIf="nameInput.errors?.['maxlength']">Name must be less than 50 characters</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="folderDescription">Description (Optional)</label>
              <textarea
                id="folderDescription"
                name="folderDescription"
                class="form-control"
                [(ngModel)]="folderData.description"
                maxlength="200"
                placeholder="Enter folder description"
                rows="3">
              </textarea>
            </div>
            
            <div class="form-group">
              <label for="folderColor">Color</label>
              <div class="color-picker">
                <div 
                  *ngFor="let color of availableColors" 
                  class="color-option"
                  [class.selected]="folderData.color === color.value"
                  [style.backgroundColor]="color.value"
                  (click)="selectColor(color.value)"
                  [title]="color.name">
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="dialog-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn-confirm"
            [disabled]="folderForm.invalid || isSubmitting"
            (click)="onSubmit()">
            <span *ngIf="!isSubmitting">
              {{ isEditing ? 'Update' : 'Create' }} Folder
            </span>
            <span *ngIf="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./folder-dialog.scss']
})
export class FolderDialogComponent {
  @Input() isVisible = false;
  @Input() isEditing = false;
  @Input() initialData: any = null;
  
  @Output() folderCreated = new EventEmitter<any>();
  @Output() folderUpdated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  folderData = {
    name: '',
    description: '',
    color: '#3b82f6'
  };

  isSubmitting = false;

  availableColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Gray', value: '#6b7280' }
  ];

  ngOnChanges() {
    if (this.isVisible) {
      if (this.isEditing && this.initialData) {
        this.folderData = { ...this.initialData };
      } else {
        this.resetForm();
      }
    }
  }

  selectColor(color: string) {
    this.folderData.color = color;
  }

  onSubmit() {
    if (this.folderData.name.trim()) {
      this.isSubmitting = true;
      
      const folderToSave = {
        ...this.folderData,
        name: this.folderData.name.trim(),
        description: this.folderData.description?.trim() || ''
      };

      if (this.isEditing) {
        this.folderUpdated.emit(folderToSave);
      } else {
        this.folderCreated.emit(folderToSave);
      }
    }
  }

  onCancel() {
    this.cancelled.emit();
    this.resetForm();
  }

  onBackdropClick() {
    this.onCancel();
  }

  resetForm() {
    this.folderData = {
      name: '',
      description: '',
      color: '#3b82f6'
    };
    this.isSubmitting = false;
  }

  // Method to be called by parent when operation completes
  onOperationComplete() {
    this.isSubmitting = false;
    this.resetForm();
  }
}
