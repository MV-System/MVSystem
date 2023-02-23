import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { throwError } from "rxjs";
import { LoadingService } from '../shared/components/r-loading/loading.service';

@Injectable({
    providedIn: 'root'
})
export class HandleErrorsResponseService {

    constructor(private toastr: ToastrService,private router:Router,private loadingService:LoadingService) {
        
    }
    public handleErrors(response:HttpErrorResponse) {
            // Server error
            console.log(response.status);
            
        if( response.status == 500) {
            this.toastr.error("Server Error", "Contactar al Administrador");
            // console.log(response.error.errors)
            return;
        }
    }
    public handleError(error: HttpErrorResponse) {
        console.log(error.status);
        if(error.status === 401){
          this.loadingService.hideLoading();
          console.log('boob');
        }
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          this.loadingService.hideLoading();

          console.error('An error occurred:', error.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }
}