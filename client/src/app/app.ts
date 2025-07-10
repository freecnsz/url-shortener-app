import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('500ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class App {
  protected readonly title = signal('client');

  demoUrl = 'https://www.example.com/very/long/url';
  demoShortUrl = 'linkhub.app/xyz123';
  demoState: 'idle' | 'animating' | 'done' = 'idle';

  shortenDemoUrl() {
    if (this.demoState !== 'idle') return;
    this.demoState = 'animating';
    setTimeout(() => {
      this.demoState = 'done';
    }, 1200);
  }

  copyDemoShortUrl() {
    navigator.clipboard.writeText(this.demoShortUrl);
    // Optionally, show a copied tooltip/feedback
  }
}
