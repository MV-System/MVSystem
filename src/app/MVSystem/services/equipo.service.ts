import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import {  EquipoDisponibleQuery, EquipoDisponibleReporte, EquipoVendido, EquipoVendidoFilter, EquipoVendidoReporte, EquipoTransferencia, EquipoAlmacenTransferir, EquipoTransferenciaReporte } from '../interfaces/equipo.interface';
import { APIURL } from "src/app/shared/url";
import { Observable } from 'rxjs';
import { Pagination } from '../interfaces/pagination.interfaces';

@Injectable({
    providedIn:'root'
})
export class EquipoService{
    
    constructor(private http: HttpClient) {}
    //GET'S
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
        '&telefono='+
        EquipoVendido.telefono +
        '&imei='+
        EquipoVendido.imei +
        '&vendedor='+
        EquipoVendido.vendedor +
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
        EquipoVendido.fechaFinal +
        '&fechaInicioFactura=' +
        EquipoVendido.fechaInicioFactura +
        '&fechaFinalFactura='+
        EquipoVendido.fechaFinalFactura ;
        return this.http.get<EquipoVendido[]>(`${APIURL.Equipo.Consulta.EquipoVendido}?`+ search)
    }
    getEquipoByImei(imei: string):Observable<EquipoTransferencia[]>{
        return this.http.get<EquipoTransferencia[]>(`${APIURL.Equipo.Consulta.EquipoTransferencia}?imei=` + imei);
    } 
    getTransferenciaId():Observable<number>{
        return this.http.get<number>(APIURL.Equipo.Consulta.EquipoTransferenciaId);
    }
    //POST's
    postEquipoDisponible(Equipo: EquipoDisponibleReporte): Observable<any>{        
        return this.http.post<any>(APIURL.Equipo.Inserta.EquipoDisponibleReporteInserta, Equipo,{
            responseType: 'blob' as 'json'
          });   
    }
    postEquipoVendido(Equipo: EquipoVendidoReporte): Observable<any>{        
        return this.http.post<any>(APIURL.Equipo.Inserta.EquipoVendidoReporteInserta, Equipo,{
            responseType: 'blob' as 'json'
          });   
    }
    postEquipoTransferencia(Equipo: EquipoTransferenciaReporte): Observable<any>{        
        return this.http.post<any>(APIURL.Equipo.Inserta.EquipoTransferenciaReporteInserta, Equipo,{
            responseType: 'blob' as 'json'
          });   
    }
    postTransferenciaEquipo(equipo: EquipoAlmacenTransferir){
        return this.http.post(APIURL.Equipo.Inserta.EquipoTransferenciaInserta, equipo)
    }
}