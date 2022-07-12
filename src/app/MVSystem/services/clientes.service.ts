import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIURL } from 'src/app/shared/url';
import { Observable } from 'rxjs';
import {  TipoCliente, ClienteRegistro, Cliente, ClienteConsultaCriterio } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }

  // Get's

  getTipoClienteLista():Observable<TipoCliente[]>{
    return this.http.get<TipoCliente[]>(APIURL.Clientes.Consultas.tipoClienteLista);
  }

  // Post's
  postCliente(cliente : ClienteRegistro):Observable<Cliente>{
    return this.http.post<Cliente>(APIURL.Clientes.Inserta.ClienteInserta, cliente);
  }

  getClientesPorNombreTelefono(criterio: any):Observable<ClienteConsultaCriterio[]>{
    return this.http.get<ClienteConsultaCriterio[]>(`${APIURL.Clientes.Consultas.ClienteLista}?criterio=${criterio}`)
  }

  getClientes(){
    return this.http.get(`${APIURL.Clientes.Consultas.ClienteLista}`)
  }
}
