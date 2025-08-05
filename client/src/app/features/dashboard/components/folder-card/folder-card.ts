import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../services/dashboard.service';

@Component({
  selector: 'app-folder-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folder-card.html',
  styleUrl: './folder-card.scss'
})
export class FolderCardComponent {
  @Input() folder!: Folder;
  @Output() folderClicked = new EventEmitter<Folder>();
  @Output() editClicked = new EventEmitter<Folder>();
  @Output() deleteClicked = new EventEmitter<string>();

  showOptions = false;

  onFolderClick() {
    this.folderClicked.emit(this.folder);
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editClicked.emit(this.folder);
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.deleteClicked.emit(this.folder.id);
  }

  toggleOptions(event: Event) {
    event.stopPropagation();
    this.showOptions = !this.showOptions;
  }

  getColorClass(): string {
    return `folder-${this.folder.color}`;
  }
}
