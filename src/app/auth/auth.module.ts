import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { PasswordChangePageComponent } from './password-change-page/password-change-page.component';
import { PasswordStrengthMeterComponent } from './password-strength-meter/password-strength-meter.component';
import { SharedModule } from '../shared/shared.module';


const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
];

@NgModule({
  declarations: [
    LoginComponent,
    PasswordChangePageComponent,
    PasswordStrengthMeterComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    AuthRoutingModule,
  ],
  exports: [
    RouterModule
  ],
})
export class AuthModule {}
