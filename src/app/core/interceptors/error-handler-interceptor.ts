import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HandleErrorsResponseService } from 'src/app/services/handle-errors-response.service';
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
    constructor(private handleErrorsResponseService:HandleErrorsResponseService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // Solo reintentar en peticiones GET de consulta. Los endpoints de reportes PDF
        // pueden fallar de forma determinista (500) y no conviene triplicar la carga.
        const normalizedUrl = (req.urlWithParams || req.url || '').toLowerCase();
        const isReciboAbonoReport = normalizedUrl.includes('/clientesreporte/reciboabono');
        const retryCount = req.method === 'GET' && !isReciboAbonoReport ? 2 : 0;

        return next.handle(req).pipe(
            retry(retryCount),
            catchError((error : HttpErrorResponse)=>this.handleErrorsResponseService.handleError(error))
          );

    }
}
