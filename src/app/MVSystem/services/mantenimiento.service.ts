import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { MarcaEquipo } from "../interfaces/catalogo.interface";
import { Equipo, EquipoObjRetorno } from "../interfaces/equipo.interface";
import { Accesorio, FacturaRegistro } from '../interfaces/mantenimiento';
import { EquipoNumeroRegistro } from "../pages/Equipo/Equipo-registro/equipo-registro.component";

@Injectable({
  providedIn: 'root'
})

export class MantenimientoService {
  constructor(private http: HttpClient) { }

  // Post's
  postAccesorio(accesorio: Accesorio): Observable<any> {
    return this.http.post<any>(APIURL.Accesorio.Inserta.AccesorioInserta, accesorio);
  }
  postEquipo(equipo: Equipo): Observable<EquipoObjRetorno[]> {
    return this.http.post<EquipoObjRetorno[]>(APIURL.Equipo.Inserta.EquipoInserta, equipo);
  }
  postFactura(factura: FacturaRegistro): Observable<any> {
    return this.http.post<any>(APIURL.Factura.Inserta.FacturaInserta, factura, {
      responseType: 'blob' as 'json'
    });
  }

  //Get's

  getEquipoNumeroRegistro(): Observable<EquipoNumeroRegistro[]> {
    return this.http.get<EquipoNumeroRegistro[]>(APIURL.Equipo.Consulta.EquipoNumeroRegistro)
  }
}
