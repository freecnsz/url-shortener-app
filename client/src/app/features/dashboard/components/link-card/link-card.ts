import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Link } from '../../services/dashboard.service';

@Component({
  selector: 'app-link-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link-card.html',
  styleUrl: './link-card.scss'
})
export class LinkCardComponent {
  @Input() link!: Link;
  @Input() showFolder = true;
  @Output() linkClicked = new EventEmitter<Link>();
  @Output() copyClicked = new EventEmitter<string>();
  @Output() editClicked = new EventEmitter<Link>();
  @Output() deleteClicked = new EventEmitter<string>();
  @Output() qrClicked = new EventEmitter<Link>();

  showOptions = false;

  onLinkClick() {
    this.linkClicked.emit(this.link);
  }

  onCopyClick(event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(this.link.shortUrl);
    this.copyClicked.emit(this.link.shortUrl);
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editClicked.emit(this.link);
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.deleteClicked.emit(this.link.id);
  }

  onQrClick(event: Event) {
    event.stopPropagation();
    this.qrClicked.emit(this.link);
  }

  toggleOptions(event: Event) {
    event.stopPropagation();
    this.showOptions = !this.showOptions;
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  truncateUrl(url: string, maxLength: number = 40): string {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  }
}
