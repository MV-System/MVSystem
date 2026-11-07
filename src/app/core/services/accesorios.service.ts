import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

import {Pagination} from "../interfaces/pagination.interfaces"
import { Observable } from 'rxjs';
import { Accesorio, AccesorioMovimientosFiltro, AccesorioMovimientosRespuesta, AccesorioVendido } from "../interfaces/accesorio.interface";
import { APIURL } from '../../config/url';
@Injectable({
    providedIn:'root'
})
export class AccesoriosService{
  constructor(private http: HttpClient) { }

  getAccesorios(pagination:Pagination,accesorio: string, almacen: number):Observable<Accesorio[]>{
    const query =
    'PageIndex=' +
        pagination.pageIndex +
    '&PageSize=' +
        pagination.pageSize +
    '&accesorio=' +
        accesorio +
    '&almacen=' +
        almacen;
        return this.http.get<Accesorio[]>(`${APIURL.Accesorio.Consulta.Accesorio}?` + query)
  }
  getAccesoriosVendidos(pagination:Pagination,filter: string, almacen: number):Observable<AccesorioVendido[]>{
    let params = new HttpParams();

    params = params.append('pageIndex',pagination.pageIndex)
    params = params.append('pageSize',pagination.pageSize)
    params = params.append('filter',filter)
    params = params.append('almacen',almacen)
    params = params.append('fechaInicio',pagination.fechaInicio)
    params = params.append('fechaFinal',pagination.fechaFinal)

    return this.http.get<AccesorioVendido[]>(`${APIURL.Accesorio.Consulta.AccesorioVendidos}?` + params)
  }
  getAccesorioById(id: number):Observable<Accesorio>{
     return this.http.get<Accesorio>(APIURL.Accesorio.Consulta.AccesorioById + id)
  }
  /** Movimientos de stock de accesorios (requiere el permiso ACCESORIOS_MOVIMIENTOS). */
  getMovimientos(f: AccesorioMovimientosFiltro):Observable<AccesorioMovimientosRespuesta>{
    let params = new HttpParams()
      .set('fechaInicio', f.fechaInicio)
      .set('fechaFinal', f.fechaFinal)
      .set('sucursal', String(f.sucursal))
      .set('filtro', f.filtro || '')
      .set('motivo', f.motivo || '')
      .set('usuario', f.usuario || '')
      .set('pageIndex', String(f.pageIndex))
      .set('pageSize', String(f.pageSize));
    return this.http.get<AccesorioMovimientosRespuesta>(APIURL.Accesorio.Consulta.AccesorioMovimientos, { params })
  }
  putAccesorio(accesorio: Accesorio):Observable<Accesorio>{
    return this.http.put<Accesorio>(APIURL.Accesorio.Edita.AccesorioEdita , accesorio)
 }
}
