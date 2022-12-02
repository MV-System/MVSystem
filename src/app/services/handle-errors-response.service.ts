import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from 'ngx-toastr';
import { throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HandleErrorsResponseService {

    constructor(private toastr: ToastrService) {
        
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
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          
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