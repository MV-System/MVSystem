import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HandleErrorsResponseService } from 'src/app/services/handle-errors-response.service';
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
    constructor(private handleErrorsResponseService:HandleErrorsResponseService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            retry(2),
            catchError((error : HttpErrorResponse)=>this.handleErrorsResponseService.handleError(error))
          );

    }
}
