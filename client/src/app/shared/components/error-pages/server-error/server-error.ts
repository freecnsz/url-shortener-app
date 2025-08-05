import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './server-error.html',
  styleUrl: './server-error.scss'
})
export class ServerErrorComponent {
  
  refreshPage() {
    window.location.reload();
  }

  goBack() {
    window.history.back();
  }

  getCurrentTimestamp(): string {
    return Date.now().toString().slice(-6);
  }
}
