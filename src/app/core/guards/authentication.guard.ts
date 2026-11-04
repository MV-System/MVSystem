import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { sesionVigente } from 'src/app/helpers/helper';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  constructor(private loginService: LoginService, private router:Router){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(sesionVigente()){
      return true;
    }

    // Token ausente o vencido: se limpia y se va al login
    localStorage.clear();
    this.router.navigate(['auth/login']);
    
    return false;

  }
  
}
