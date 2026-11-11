import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from "rxjs";
import { LoadingService } from '../shared/components/r-loading/loading.service';
import { LoginService } from '../auth/login.service';
import { sesionVigente } from '../helpers/helper';

@Injectable({
    providedIn: 'root'
})
export class HandleErrorsResponseService {

    constructor(
      private toastr: ToastrService,
      private router:Router,
      private loadingService:LoadingService,
      private loginService:LoginService
    ) {}

    public handleErrors(response:HttpErrorResponse) {
            // Server error
        if( response.status == 500) {
            this.toastr.error("Server Error", "Contactar al Administrador");
            return;
        }
    }
   public handleError(error: HttpErrorResponse) {
        this.loadingService.hideLoading();

        if (error.status === 400) {
            const mensaje = this.extraerMensajeHttp400(error);
            return throwError(mensaje);
        }

        if (error.status === 0 && !sesionVigente()) {
            // Sin conexion pero con la sesion vencida: se trata como sesion expirada (no como falla de red)
            localStorage.clear();
            this.toastr.error('Sesión expirada o no autorizada. Inicie sesión nuevamente.', '');
            this.router.navigate(['/']);
        } else if (error.status === 0) {
            // Error de red o no se pudo conectar al API
            console.error('No se pudo conectar al API:', error.error);
            this.toastr.error('Error: Por favor verifique su conexión a internet, inténtelo de nuevo más tarde.', '');
            this.router.navigate(['**']);
        } else if (error.status === 401) {
            // No autorizado, sesión expirada o token inválido (o sesión cerrada por el administrador)
            const cerradaPorAdmin = error.headers?.get('X-Sesion-Cerrada') === '1';
            localStorage.clear();
            this.toastr.error(cerradaPorAdmin
                ? 'Su sesión fue cerrada por el administrador. Inicie sesión nuevamente.'
                : 'Sesión expirada o no autorizada. Inicie sesión nuevamente.', '');
            this.router.navigate(['/']);
        } else if (error.status === 404) {
            // No encontrado
            this.toastr.error('Recurso no encontrado.', '');
        } else if (error.status === 429) {
            // Demasiados intentos (login bloqueado temporalmente)
            const mensaje = this.extraerMensajeHttp400(error);
            this.toastr.warning(mensaje || 'Demasiados intentos. Intente en unos minutos.', '');
        } else if (error.status === 500) {
            // Error interno del servidor (el API devuelve una referencia para soporte)
            const referencia = error.error && typeof error.error.id === 'string' ? ` (Ref: ${error.error.id})` : '';
            this.toastr.error('Error interno del servidor. Contacte al administrador.' + referencia, '');
        } else if (error.status === 403) {
            // Prohibido
            this.toastr.error('No tiene permisos para realizar esta acción.', '');
        } else {
            // Otros errores
            this.toastr.error('Ocurrió un error inesperado. Inténtelo de nuevo más tarde.', '');
        }

        if (error.error instanceof Blob) {
            error.error.text()
                .then((blobText) => {
                    console.error(`Backend returned code ${error.status}, body text was:`, blobText);
                })
                .catch(() => {
                    console.error(`Backend returned code ${error.status}, body was: `, error.error);
                });
        } else {
            console.error(`Backend returned code ${error.status}, body was: `, error.error);
        }

        // Propagar el HttpErrorResponse original para no perder status/body.
        return throwError(error);
    }

    private extraerMensajeHttp400(error: HttpErrorResponse): string {
        const payload = error?.error;
        if (typeof payload === 'string' && payload.trim()) {
            return payload;
        }

        if (payload && typeof payload === 'object') {
            if (typeof payload.error === 'string' && payload.error.trim()) {
                return payload.error;
            }

            if (payload.error && typeof payload.error === 'object') {
                if (typeof payload.error.error === 'string' && payload.error.error.trim()) {
                    return payload.error.error;
                }

                if (typeof payload.error.message === 'string' && payload.error.message.trim()) {
                    return payload.error.message;
                }
            }

            if (typeof payload.message === 'string' && payload.message.trim()) {
                return payload.message;
            }
        }

        return 'Datos inválidos. Verifique la información enviada.';
    }
}
