import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss'
})
export class AccessDeniedComponent {
  
  goBack() {
    window.history.back();
  }
}
