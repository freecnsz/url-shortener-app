import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss'
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  private timeInterval: any;
  
  ngOnInit() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }
  
  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
  
  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleString();
  }
  
  refreshPage() {
    window.location.reload();
  }
}
