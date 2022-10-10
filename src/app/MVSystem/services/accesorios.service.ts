import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import {Pagination} from "../interfaces/pagination.interfaces"
import { Observable } from 'rxjs';
import { Accesorio, AccesorioVendido } from "../interfaces/accesorio.interface";
import { APIURL } from '../../shared/url';
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
  getAccesoriosVendidos(pagination:Pagination,accesorio: string, almacen: number):Observable<AccesorioVendido[]>{
    const query =
    'pageIndex=' +
        pagination.pageIndex +
    '&pageSize=' +
        pagination.pageSize +
    '&accesorio=' +
        accesorio +
    '&almacen=' +
        almacen
    '&fechaInicio=' +
       pagination.fechaInicio +
    '&fechaFinal='+
       pagination.fechaFinal ;
       
        return this.http.get<AccesorioVendido[]>(`${APIURL.Accesorio.Consulta.AccesorioVendidos}?` + query)
  }
  getAccesorioById(id: number):Observable<Accesorio>{
     return this.http.get<Accesorio>(APIURL.Accesorio.Consulta.AccesorioById + id)
  }
  putAccesorio(accesorio: Accesorio):Observable<Accesorio>{
    return this.http.put<Accesorio>(APIURL.Accesorio.Edita.AccesorioEdita , accesorio)
 }
}