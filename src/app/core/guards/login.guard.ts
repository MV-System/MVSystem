import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../../auth/login.service';
import { sesionVigente } from '../../helpers/helper';

@Injectable({
    providedIn:'root'
})
export class LoginGuard implements CanActivate {

    constructor(private loginService: LoginService, private router:Router){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (sesionVigente()) {
            this.router.navigate(['home']);
            return false
        }
        // Un token vencido no cuenta: se limpia y se muestra el login
        localStorage.clear();
        return true
    }

}
