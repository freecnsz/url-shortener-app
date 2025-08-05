import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ErrorHandlerService } from '../../../core/services/error-handler';

@Component({
  selector: 'app-error-test',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-test-page">
      <div class="error-test-container">
        <h1>Error Page Testing</h1>
        <p>Test different error scenarios and pages</p>
        
        <div class="error-buttons">
          <button class="btn btn-error" (click)="navigateToError(404)">
            <i class="fas fa-exclamation-triangle"></i>
            Test 404 Not Found
          </button>
          
          <button class="btn btn-error" (click)="navigateToError(500)">
            <i class="fas fa-server"></i>
            Test 500 Server Error
          </button>
          
          <button class="btn btn-error" (click)="navigateToError(403)">
            <i class="fas fa-ban"></i>
            Test 403 Access Denied
          </button>
          
          <button class="btn btn-maintenance" (click)="navigateToMaintenance()">
            <i class="fas fa-tools"></i>
            Test Maintenance Page
          </button>
        </div>
        
        <div class="back-home">
          <a routerLink="/" class="btn btn-primary">
            <i class="fas fa-home"></i>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-test-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: white;
    }
    
    .error-test-container {
      max-width: 500px;
      width: 100%;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(45deg, #ffffff, #e3f2fd);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      opacity: 0.9;
      margin-bottom: 30px;
    }
    
    .error-buttons {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      font-size: 1rem;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      &.btn-error {
        background: #ff4757;
        color: white;
        
        &:hover {
          background: #ff3838;
        }
      }
      
      &.btn-maintenance {
        background: #ffa502;
        color: white;
        
        &:hover {
          background: #ff9000;
        }
      }
      
      &.btn-primary {
        background: #3742fa;
        color: white;
        
        &:hover {
          background: #2f32e2;
        }
      }
    }
    
    @media (max-width: 480px) {
      .error-test-container {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class ErrorTestComponent {
  
  constructor(
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}
  
  navigateToError(errorCode: number): void {
    this.errorHandler.navigateToError(errorCode);
  }
  
  navigateToMaintenance(): void {
    this.errorHandler.redirectToMaintenance();
  }
}
