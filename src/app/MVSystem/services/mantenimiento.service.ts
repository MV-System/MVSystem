import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { Accesorio, Equipo, EquipoObjRetorno, FacturaRegistro } from '../interfaces/mantenimiento';
import { EquipoNumeroRegistro } from "../pages/Equipo/Equipo-registro/equipo-registro.component";


@Injectable({
  providedIn: 'root'
})

export class MantenimientoService {
  constructor(private http: HttpClient) { }

  // Post's
  postAccesorio(accesorio: Accesorio): Observable<any> {
    return this.http.post<any>(APIURL.Mantenimiento.Accesorio.Inserta.AccesorioInserta, accesorio);
  }
  postEquipo(equipo: Equipo): Observable<EquipoObjRetorno[]> {
    return this.http.post<EquipoObjRetorno[]>(APIURL.Mantenimiento.Equipo.Inserta.EquipoInserta, equipo);
  }
  postFactura(factura: FacturaRegistro): Observable<any> {
    return this.http.post<any>(APIURL.Mantenimiento.Factura.Inserta.FacturaInserta, factura);
  }
  //Get's

  getEquipoNumeroRegistro(): Observable<EquipoNumeroRegistro[]> {
    return this.http.get<EquipoNumeroRegistro[]>(APIURL.Mantenimiento.Equipo.Consulta.EquipoNumeroRegistro)
  }
}