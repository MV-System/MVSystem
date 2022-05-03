import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { Accesorio } from '../interfaces/mantenimiento';


@Injectable({
    providedIn: 'root'
})

export class MantenimientoService{
    constructor(private http: HttpClient) { }

    // Post's
  postAccesorio(accesorio : Accesorio):Observable<any>{ //! verificar que retorna y colocar en el observable//
    return this.http.post(APIURL.Mantenimiento.Accesorio.Inserta.AccesorioInserta, accesorio);
  }

}