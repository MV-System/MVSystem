import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/config/url';
import { Utilidades, utilidadesFiltros } from '../interfaces/utilidades.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilidadesService {

  constructor(private http: HttpClient) {}
  //GET'S
  // GetUtilidades(utilidades: utilidadesFiltros): Observable<Utilidades[]> {
  //   return this.http.get<Utilidades[]>(APIURL.Utilidades.GetUtilidades, { params: utilidades });
  // }

  GetUtilidades(facturaReq: utilidadesFiltros){
    let queryParams = new HttpParams();

    queryParams = queryParams.append("FI", facturaReq.FI)
    queryParams = queryParams.append("FF", facturaReq.FF)
    queryParams = queryParams.append("sucursal", facturaReq.sucursal)
    return this.http.get<Utilidades>(`${APIURL.Utilidades.GetUtilidades}`,{  params: queryParams })

  }

}
