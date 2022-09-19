import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import {Pagination} from "../interfaces/pagination.interfaces"
import { Observable } from 'rxjs';
import { AccesorioAll } from "../interfaces/accesorio.interface";
import { APIURL } from '../../shared/url';
@Injectable({
    providedIn:'root'
})
export class AccesoriosService{
  constructor(private http: HttpClient) { }

  getAllAccesorios(pagination:Pagination,accesorio: string, almacen: number):Observable<AccesorioAll[]>{
    const query =
    'PageNumber=' +
        pagination.pageIndex +
    'PageSize=' +
        pagination.pageSize +
    'accesorio=' +
        accesorio +
    'almacen' +
        almacen;
        return this.http.get<AccesorioAll[]>(`${APIURL.Accesorio.Consulta.AccesorioConsulta}?` + query)
  }

}