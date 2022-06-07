import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { Accesorio, Equipo } from '../interfaces/mantenimiento';


@Injectable({
    providedIn: 'root'
})

export class MantenimientoService{
    constructor(private http: HttpClient) { }

    // Post's
  postAccesorio(accesorio : Accesorio):Observable<any>{ 
    return this.http.post<any>(APIURL.Mantenimiento.Accesorio.Inserta.AccesorioInserta, accesorio);
  }
  postEquipo(equipo : Equipo):Observable<any>{ 
    return this.http.post<any>(APIURL.Mantenimiento.Equipo.Inserta.EquipoInserta, equipo);
  }

}