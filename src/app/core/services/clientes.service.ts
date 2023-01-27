import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIURL } from 'src/app/config/url';
import { Observable, Subject } from 'rxjs';
import {  TipoCliente, ClienteRegistro, Cliente, ClienteConsultaCriterio } from '../interfaces/cliente.interface';

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
}
