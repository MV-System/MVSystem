import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../../config/url';
import { CotizacionAmount } from '../interfaces/cotizacion.interface';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class CotizacionService{
    constructor(private http:HttpClient){}
    isOpeningForm$: Subject<boolean>= new Subject<boolean>();
    getDetalleCotizacionConsulta(numeroRegistro:number, sucursal:number){
        return this.http.get(`${APIURL.Cotizacion.Consulta.DetalleCotizacionConsulta}/${numeroRegistro}/${sucursal}`);
    }

    getCotizacionFacturaConsulta(telefono:string):Observable<CotizacionAmount[]>{
        return this.http.get<CotizacionAmount[]>(`${APIURL.Cotizacion.Consulta.CotizacionFacturaConsulta}/${telefono}`);
    }
}