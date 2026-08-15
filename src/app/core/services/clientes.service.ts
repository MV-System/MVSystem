import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { APIURL } from 'src/app/config/url';
import { Observable, Subject } from 'rxjs';
import {  TipoCliente, ClienteRegistro, Cliente, ClienteConsultaCriterio, ClientesConFacturasPendientesFiltros, ClientesConFacturasPendientesRetorn, FacturasPorClienteRetorn, AbonoFacturaParam, AbonoFacturaResponse, ClienteActualizacion, HistorialAbonoDTO } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }
  isOpeningForm$: Subject<boolean>= new Subject<boolean>();
  // Get's

  getTipoClienteLista():Observable<TipoCliente[]>{
    return this.http.get<TipoCliente[]>(APIURL.Clientes.Consultas.tipoClienteLista);
  }

  // Post's
  postCliente(cliente : ClienteRegistro):Observable<Cliente>{
    return this.http.post<Cliente>(APIURL.Clientes.Inserta.ClienteInserta, cliente);
  }

  // Put's
  putCliente(cliente: ClienteActualizacion): Observable<any> {
    return this.http.put(APIURL.Clientes.Edita.ClienteUpdate, cliente);
  }
  // Post's
  postAbonoFactura(Param : AbonoFacturaParam):Observable<AbonoFacturaResponse>{
    return this.http.post<AbonoFacturaResponse>(APIURL.Clientes.Inserta.AbonoFactura, Param);
  }
  // Post's
  postAbonoGeneral(Param : AbonoFacturaParam):Observable<AbonoFacturaResponse>{
    return this.http.post<AbonoFacturaResponse>(APIURL.Clientes.Inserta.AbonoGeneral, Param);
  }

  getReciboAbono(idCliente: number, numeroFactura: number, idSucursal: string, idEmpresa: string): Observable<Blob> {
    const params = new HttpParams()
      .set('idCliente', idCliente.toString())
      .set('numeroFactura', numeroFactura.toString())
      .set('idSucursal', idSucursal)
      .set('idEmpresa', idEmpresa);

    return this.http.get(APIURL.Clientes.Accion.ReciboAbono,
      { params, responseType: 'blob' }
    );
  }

  getReciboAbonoGeneral(idLoteAbono: string, idSucursal: string, idEmpresa: string): Observable<Blob> {
    const params = new HttpParams()
      .set('idLoteAbono', idLoteAbono)
      .set('idSucursal', idSucursal)
      .set('idEmpresa', idEmpresa);

    return this.http.get(APIURL.Clientes.Accion.ReciboAbonoGeneral,
      { params, responseType: 'blob' }
    );
  }

  getClientesPorNombreTelefono(criterio: any):Observable<Cliente[]>{
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams().set('criterio', criterio); // ✅ Angular maneja automáticamente el & y otros caracteres especiales

    return this.http.get<Cliente[]>(APIURL.Clientes.Consultas.ClienteLista, { params });
  }

  getClientes(){
    return this.http.get(`${APIURL.Clientes.Consultas.ClienteLista}`)
  }
  getClientesConFacturasPendientes(FechaInicio: string, FechaFinal: string, Criterio: string):Observable<ClientesConFacturasPendientesRetorn[]>{
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams()
      .set('FechaInicio', FechaInicio)
      .set('FechaFin', FechaFinal)
      .set('Criterio', Criterio); // ✅ Angular maneja automáticamente el & y otros caracteres especiales

    return this.http.get<ClientesConFacturasPendientesRetorn[]>(APIURL.Clientes.Consultas.ClientesConFacturasPendientes, { params });
  }

  getFacturasPendientesPorCliente(cliente: number):Observable<FacturasPorClienteRetorn[]>{
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams().set('cliente', cliente.toString()); // ✅ Angular maneja automáticamente el & y otros caracteres especiales

    return this.http.get<FacturasPorClienteRetorn[]>(APIURL.Clientes.Consultas.FacturasPendientesPorCliente, { params });
  }

  getHistorialAbonos(idCliente: number, fechaInicio?: string, fechaFinal?: string): Observable<HistorialAbonoDTO[]> {
    let params = new HttpParams().set('idCliente', idCliente.toString());

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFinal) {
      params = params.set('fechaFinal', fechaFinal);
    }

    return this.http.get<HistorialAbonoDTO[]>(APIURL.Clientes.Consultas.HistorialAbonos, { params });
  }
}
