import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { throwError } from "rxjs";
import { LoadingService } from '../shared/components/r-loading/loading.service';
import { LoginService } from '../auth/login.service';
import { RDialogService } from '../shared/components/r-dialog/r-dialog.service';

@Injectable({
    providedIn: 'root'
})
export class HandleErrorsResponseService {

    constructor(private toastr: ToastrService,
            private router:Router,
            private loadingService:LoadingService,
            private loginService:LoginService) {

    }
    public handleErrors(response:HttpErrorResponse) {
            // Server error
        if( response.status == 500) {
            this.toastr.error("Server Error", "Contactar al Administrador");
            return;
        }
    }
    public handleError(error: HttpErrorResponse) {
        if(error.status === 401){
          localStorage.clear();
          this.router.navigate(['/'])
          this.loadingService.hideLoading();
        }
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          this.loadingService.hideLoading();
          console.error('An error occurred:', error.error);
          this.router.navigate(['**']);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          // this.router.navigate(['**']);
          console.error(`Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        this.toastr.error('Algo malo sucedio; Por favor, inténtelo de nuevo más tarde.','')
        return throwError('Algo malo sucedio; Por favor, inténtelo de nuevo más tarde.');
      }
}
