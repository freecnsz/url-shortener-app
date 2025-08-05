import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AuthRoutingModule } from './auth-routing-module';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { AuthService } from './services/auth.service';

// Shared components that might be used
import { CopyButtonComponent } from '../shared/components/copy-button/copy-button';

@NgModule({
  declarations: [
  ],
  imports: [
    RegisterComponent,
    LoginComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AuthRoutingModule,
    // Shared components
    CopyButtonComponent
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule { }