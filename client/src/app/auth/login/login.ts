import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  loginError = '';
  showPassword = false;
  confirmationMessage = '';
  emailFromRegistration = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyLoggedIn();
    this.checkQueryParams();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.emailFromRegistration = params['email'];
        this.loginForm.patchValue({ email: params['email'] });
      }
      
      if (params['confirmEmail'] === 'true') {
        this.confirmationMessage = 'Registration successful! Please check your email to confirm your account before logging in.';
      }
    });
  }

  private checkIfAlreadyLoggedIn(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      this.loginError = '';

      const { email, password, rememberMe } = this.loginForm.value;

      try {
        await this.authService.login(email, password, rememberMe);
        this.loading = false;
        // Login başarılı, dashboard'a yönlendir - setTimeout ile async navigation
        setTimeout(() => {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }, 100);
      } catch (error: any) {
        this.loading = false;
        this.handleLoginError(error);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleLoginError(error: any): void {
    // AuthService artık tüm error handling'i yapıyor, sadece mesajı göster
    this.loginError = error?.message || 'An error occurred during login. Please try again';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async loginWithGoogle(): Promise<void> {
    try {
      this.loading = true;
      this.loginError = '';
      
      await this.authService.loginWithGoogle();
      this.loading = false;
      
      // Login başarılı, dashboard'a yönlendir - setTimeout ile async navigation
      setTimeout(() => {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }, 100);
    } catch (error: any) {
      this.loading = false;
      // AuthService'den gelen spesifik error mesajını kullan
      this.loginError = error?.message || 'An error occurred with Google login';
      console.error('Google login error:', error);
    }
  }

  // Keyboard navigation için
  async onKeyPress(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Enter' && this.loginForm.valid) {
      await this.onSubmit();
    }
  }
}