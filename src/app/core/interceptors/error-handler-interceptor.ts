import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HandleErrorsResponseService } from 'src/app/services/handle-errors-response.service';
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
    constructor(private handleErrorsResponseService:HandleErrorsResponseService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // Solo reintentar en peticiones GET (lectura), nunca en POST/PUT/DELETE
        const retryCount = req.method === 'GET' ? 2 : 0;

        return next.handle(req).pipe(
            retry(retryCount),
            catchError((error : HttpErrorResponse)=>this.handleErrorsResponseService.handleError(error))
          );

    }
}
