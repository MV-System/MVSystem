import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/config/url';
import { EquipoConfiguracion, LaptopAccesorio, LaptopCambioHistorial, LaptopCambioPiezaRequest, LaptopCustodiaAccion, LaptopCustodiaConfig, LaptopCustodiaPendiente, LaptopEquipo, TipoPieza } from '../interfaces/laptop.interface';

@Injectable({
  providedIn: 'root'
})
export class LaptopsService {

  constructor(private http: HttpClient) { }

  guardarConfiguracion(configuracion: EquipoConfiguracion): Observable<EquipoConfiguracion[]> {
    return this.http.post<EquipoConfiguracion[]>(APIURL.Laptops.Configuracion, configuracion);
  }

  consultarConfiguracion(imei: string): Observable<EquipoConfiguracion[]> {
    const params = new HttpParams().set('imei', imei);
    return this.http.get<EquipoConfiguracion[]>(APIURL.Laptops.Configuracion, { params });
  }

  consultarEquipo(imei: string): Observable<LaptopEquipo[]> {
    const params = new HttpParams().set('imei', imei);
    return this.http.get<LaptopEquipo[]>(APIURL.Laptops.Equipo, { params });
  }

  consultarAccesorios(idAlmacen: number, tipoPieza: TipoPieza, soloConStock: boolean, filtro: string = ''): Observable<LaptopAccesorio[]> {
    const params = new HttpParams()
      .set('idAlmacen', String(idAlmacen))
      .set('tipoPieza', tipoPieza)
      .set('filtro', filtro)
      .set('soloConStock', String(soloConStock));
    return this.http.get<LaptopAccesorio[]>(APIURL.Laptops.Accesorios, { params });
  }

  registrarCambioPieza(cambio: LaptopCambioPiezaRequest): Observable<any[]> {
    return this.http.post<any[]>(APIURL.Laptops.CambioPieza, cambio);
  }

  consultarConfiguracionCustodia(): Observable<LaptopCustodiaConfig> {
    return this.http.get<LaptopCustodiaConfig>(APIURL.Laptops.CustodiaConfiguracion);
  }

  /** Si no se indica horasMax, el API usa el límite de appsettings (Laptops:HorasMaxCustodia). */
  consultarPendientes(tecnico: string | null, idAlmacen: number | null, horasMax: number | null = null): Observable<LaptopCustodiaPendiente[]> {
    let params = new HttpParams();
    if (horasMax) { params = params.set('horasMax', String(horasMax)); }
    if (tecnico) { params = params.set('tecnico', tecnico); }
    if (idAlmacen) { params = params.set('idAlmacen', String(idAlmacen)); }
    return this.http.get<LaptopCustodiaPendiente[]>(APIURL.Laptops.CustodiaPendientes, { params });
  }

  recibirPieza(accion: LaptopCustodiaAccion): Observable<any[]> {
    return this.http.post<any[]>(APIURL.Laptops.CustodiaRecibir, accion);
  }

  entregarPiezaCliente(accion: LaptopCustodiaAccion): Observable<any[]> {
    return this.http.post<any[]>(APIURL.Laptops.CustodiaEntregarCliente, accion);
  }

  consultarHistorial(imei: string): Observable<LaptopCambioHistorial[]> {
    const params = new HttpParams().set('imei', imei);
    return this.http.get<LaptopCambioHistorial[]>(APIURL.Laptops.Historial, { params });
  }
}
