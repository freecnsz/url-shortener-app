import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterData } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  registerError = '';
  registerSuccess = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyLoggedIn();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      acceptMarketing: [false]
    }, {
      validators: this.passwordMatchValidator
    });

    // Password field değişikliklerini dinle
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  private checkIfAlreadyLoggedIn(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Custom validator for password matching
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Clear the error if passwords match
    if (confirmPassword.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.loading = true;
      this.registerError = '';
      this.registerSuccess = false;

      const formValue = this.registerForm.value;
      const registerData: RegisterData = {
        name: formValue.name.trim(),
        email: formValue.email.toLowerCase().trim(),
        password: formValue.password,
        acceptTerms: formValue.acceptTerms,
        acceptMarketing: formValue.acceptMarketing
      };

      try {
        await this.authService.register(registerData);
        this.loading = false;
        this.registerSuccess = true;
        
        // Registration successful, redirect to login for email confirmation
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { 
              email: registerData.email,
              message: 'registration-success',
              confirmEmail: 'true'
            }
          });
        }, 3000);
      } catch (error: any) {
        this.loading = false;
        this.handleRegisterError(error);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleRegisterError(error: any): void {
    // AuthService artık tüm error handling'i yapıyor, sadece mesajı göster
    this.registerError = error?.message || 'An error occurred during registration. Please try again';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Password strength methods
  getPasswordStrengthWidth(): number {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    return (strength / 4) * 100;
  }

  getPasswordStrengthClass(): string {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'fair';
    if (strength <= 3) return 'good';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    
    // Lowercase letter
    if (/[a-z]/.test(password)) strength++;
    
    // Uppercase letter
    if (/[A-Z]/.test(password)) strength++;
    
    // Number
    if (/\d/.test(password)) strength++;
    
    // Special character
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    return Math.min(strength, 4);
  }

  // Social registration methods
  async registerWithGoogle(): Promise<void> {
    try {
      this.loading = true;
      this.registerError = '';
      
      await this.authService.registerWithGoogle();
      this.loading = false;
      
      // Kayıt başarılı, dashboard'a yönlendir
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.loading = false;
      // AuthService'den gelen spesifik error mesajını kullan
      this.registerError = error?.message || 'An error occurred with Google registration';
      console.error('Google register error:', error);
    }
  }

  // Keyboard navigation
  async onKeyPress(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Enter' && this.registerForm.valid) {
      await this.onSubmit();
    }
  }

  // Password validation helpers
  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(password);
  }

  hasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }
}