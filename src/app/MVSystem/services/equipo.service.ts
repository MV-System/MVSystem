import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { EquipoDisponible, EquipoDisponibleQuery, EquipoVendido, EquipoVendidoFilter } from '../interfaces/equipo.interface';
import { APIURL } from "src/app/shared/url";
import { Observable } from 'rxjs';
import { Pagination } from '../interfaces/pagination.interfaces';

@Injectable({
    providedIn:'root'
})
export class EquipoService{
    
    constructor(private http: HttpClient) {}

    getEquipoDisponible( EquipoDisponibleQuery:EquipoDisponibleQuery):Observable<any>{
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
        EquipoDisponibleQuery.pageSize +
        '&fechaInicio=' +
        EquipoDisponibleQuery.fechaInicio +
        '&fechaFinal='+
        EquipoDisponibleQuery.fechaFinal ;
        
        return this.http.get<any>(`${APIURL.Equipo.Consulta.EquipoDisponible}?`+ search)
    }
    getEquipoVendido( EquipoVendido: EquipoVendidoFilter):Observable<EquipoVendido[]>{
        const search =
        'Almacen='+
        EquipoVendido.almacen +
        '&suplidor='+
        EquipoVendido.suplidor +
        '&fechaRegistro='+
        EquipoVendido.fechaRegistro +
        '&modelo='+
        EquipoVendido.modelo +
        '&pageIndex='+
        EquipoVendido.pageIndex +
        '&pageSize=' +
        EquipoVendido.pageSize +
        '&fechaInicio=' +
        EquipoVendido.fechaInicio +
        '&fechaFinal='+
        EquipoVendido.fechaFinal ;
        return this.http.get<EquipoVendido[]>(`${APIURL.Equipo.Consulta.EquipoVendido}?`+ search)
    }
}