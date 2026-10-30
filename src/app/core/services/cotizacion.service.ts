import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { APIURL } from '../../config/url';
import { CotizacionAmount, CotizacionConsulta, CotizacionConsultaFiltro, CotizacionDetalle } from '../interfaces/cotizacion.interface';
import { Observable, Subject } from 'rxjs';
import { Articulo } from '../interfaces/mantenimiento';

@Injectable({
    providedIn:'root'
})
export class CotizacionService{
    constructor(private http:HttpClient){}
    isOpeningForm$: Subject<boolean>= new Subject<boolean>();
    getDetalleCotizacionConsulta(numeroRegistro:number, sucursal:number):Observable<Articulo[]>{
        return this.http.get<Articulo[]>(`${APIURL.Cotizacion.Consulta.DetalleCotizacionConsulta}/${numeroRegistro}/${sucursal}`);
    }

    getCotizacionFacturaConsulta(telefono:string):Observable<CotizacionAmount[]>{
        return this.http.get<CotizacionAmount[]>(`${APIURL.Cotizacion.Consulta.CotizacionFacturaConsulta}/${telefono}`);
    }

    getCotizaciones(filtro: CotizacionConsultaFiltro): Observable<CotizacionConsulta[]> {
        let params = new HttpParams()
            .set('PageIndex', filtro.pageIndex.toString())
            .set('PageSize', filtro.pageSize.toString())
            .set('Criterio', filtro.criterio || '')
            .set('Sucursal', filtro.sucursal.toString())
            .set('Vendedor', filtro.vendedor.toString())
            .set('IdTipoPago', filtro.idTipoPago.toString())
            .set('Estado', filtro.estado || '')
            .set('FechaInicio', filtro.fechaInicio)
            .set('FechaFinal', filtro.fechaFinal);

        return this.http.get<CotizacionConsulta[]>(APIURL.Cotizacion.Consulta.Cotizaciones, { params });
    }

    getDetallePorCodigo(codigo: number): Observable<CotizacionDetalle[]> {
        return this.http.get<CotizacionDetalle[]>(`${APIURL.Cotizacion.Consulta.CotizacionDetalle}/${codigo}`);
    }

    cancelar(codigo: number, usuario: string): Observable<any> {
        return this.http.put<any>(APIURL.Cotizacion.Consulta.CotizacionCancelar, { codigo, usuario });
    }

    reimprimir(codigo: number, idEmpresa: number): Observable<Blob> {
        return this.http.get(`${APIURL.Cotizacion.Consulta.CotizacionReimpresion}/${codigo}/${idEmpresa}`, {
            responseType: 'blob'
        });
    }
}
