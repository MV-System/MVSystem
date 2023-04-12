import { Injectable } from "@angular/core";

import { LoginService } from '../../auth/login.service';

@Injectable({
    providedIn:'root'
})
export class ValidatorPermissionService{
    
    constructor(private readonly loadingService:LoginService){}

    validateUserRole(role: string){
      const hasRole= this.loadingService.getUserRoles().includes(role);
      return  hasRole
    }
}