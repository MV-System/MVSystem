import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LoginService } from 'src/app/auth/login.service';

@Injectable({ providedIn: 'root' })
export class ModoDesarrolladorGuard implements CanActivate {
  private readonly permisoRequerido = 'ModoDesarrollador';

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.loginService.getUserRoles().includes(this.permisoRequerido)) return true;

    return this.router.createUrlTree(['/home']);
  }
}
