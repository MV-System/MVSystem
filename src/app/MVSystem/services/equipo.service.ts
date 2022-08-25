import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { EquipoDisponible,EquipoDisponibleQuery } from "../interfaces/equipo.interface";
import { APIURL } from "src/app/shared/url";
import { Observable } from 'rxjs';
import { Pagination } from '../interfaces/pagination.interfaces';

@Injectable({
    providedIn:'root'
})
export class EquipoService{
    
    constructor(private http: HttpClient) {}

    getEquipoDisponible( EquipoDisponibleQuery:EquipoDisponibleQuery):Observable<EquipoDisponible[]>{
        const search =
        'Almacen='+
        EquipoDisponibleQuery.almacen +
        '&suplidor='+
        EquipoDisponibleQuery.suplidor +
        '&imei='+
        EquipoDisponibleQuery.imei +
        '&modelo='+
        EquipoDisponibleQuery.modelo +
        '&pageIndex='+
        EquipoDisponibleQuery.pageIndex +
        '&pageSize=' +
        EquipoDisponibleQuery.pageSize;
        return this.http.get<EquipoDisponible[]>(`${APIURL.Equipo.Consulta.EquipoDisponible}?`+ search)
    }
}