import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import {Pagination} from "../interfaces/pagination.interfaces"
import { Observable } from 'rxjs';
import { Accesorio } from "../interfaces/accesorio.interface";
import { APIURL } from '../../shared/url';
@Injectable({
    providedIn:'root'
})
export class AccesoriosService{
  constructor(private http: HttpClient) { }

  getAllAccesorios(pagination:Pagination,accesorio: string, almacen: number):Observable<Accesorio[]>{
    const query =
    'PageIndex=' +
        pagination.pageIndex +
    '&PageSize=' +
        pagination.pageSize +
    '&accesorio=' +
        accesorio +
    '&almacen' +
        almacen;
        return this.http.get<Accesorio[]>(`${APIURL.Accesorio.Consulta.AccesorioConsulta}?` + query)
  }
  getAccesorioById(id: number):Observable<Accesorio>{
     return this.http.get<Accesorio>(APIURL.Accesorio.Consulta.AccesorioConsultaById + id)
  }
}