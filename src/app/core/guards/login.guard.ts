import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../../auth/login.service';

@Injectable({
    providedIn:'root'
})
export class LoginGuard implements CanActivate {

    constructor(private loginService: LoginService, private router:Router){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let user = this.loginService.getUserName();
        if (user) {
            this.router.navigate(['home']);
            return false
        }
        return true
    }

}
