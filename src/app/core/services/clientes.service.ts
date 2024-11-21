import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIURL } from 'src/app/config/url';
import { Observable, Subject } from 'rxjs';
import {  TipoCliente, ClienteRegistro, Cliente, ClienteConsultaCriterio, ClientesConFacturasPendientesFiltros, ClientesConFacturasPendientesRetorn, FacturasPorClienteRetorn } from '../interfaces/cliente.interface';

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

  getClientesPorNombreTelefono(criterio: any):Observable<Cliente[]>{
    return this.http.get<Cliente[]>(`${APIURL.Clientes.Consultas.ClienteLista}?criterio=${criterio}`)
  }

  getClientes(){
    return this.http.get(`${APIURL.Clientes.Consultas.ClienteLista}`)
  }
  getClientesConFacturasPendientes(FechaInicio: string,FechaFinal: string,NombreCliente: string, NumeroTelefono: string):Observable<ClientesConFacturasPendientesRetorn[]>{
const filtros =
'FechaInicio='+
FechaInicio +
 '&Sucursal_Destino='+
 FechaFinal +
 '&NombreCliente='+
 NombreCliente +
 '&NumeroTelefono='+
 NumeroTelefono
    return this.http.get<ClientesConFacturasPendientesRetorn[]>(`${APIURL.Clientes.Consultas.ClientesConFacturasPendientes}?`+filtros)
  }

  getFacturasPendientesPorCliente(cliente: number):Observable<FacturasPorClienteRetorn[]>{
    const search =
    '&cliente='+
    cliente
    return this.http.get<FacturasPorClienteRetorn[]>(`${APIURL.Clientes.Consultas.FacturasPendientesPorCliente}?`+search)
  }
}
