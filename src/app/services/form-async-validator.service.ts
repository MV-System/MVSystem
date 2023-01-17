import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { APIURL } from 'src/app/config/url';
import { EquipoTransferencia } from '../core/interfaces/equipo.interface';

@Injectable({
  providedIn: 'root'
})
export class FormAsyncValidatorService implements AsyncValidator {

  constructor(private http: HttpClient) { }

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const imei = control.value
    if (imei.length > 0) {
      return this.http.get<EquipoTransferencia>(`${APIURL.Equipo.Consulta.EquipoTransferencia}?imei=${imei}`)
        .pipe(
          delay(1000),
          map(equipo => {
            if (equipo.imei != null) {
              return (equipo.imei.length) ? null : { noExisteNoDisponible: true }
            } else {
              return (equipo.imei) ? null : { noExisteNoDisponible: true }
            }
          })
        )
    } else {
      return of(null);
    }
  }

}
