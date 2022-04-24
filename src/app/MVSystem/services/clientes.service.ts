import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIURL } from 'src/app/shared/url';
import { Observable } from 'rxjs';
import { Cliente, TipoCliente, TipoTelefono, ClienteRegistro } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }


  getTipoTelefonoLista():Observable<TipoTelefono[]>{
    return this.http.get<TipoTelefono[]>(APIURL.Clientes.Consultas.tipoTelefonoLista);
  }
  getTipoClienteLista():Observable<TipoCliente[]>{
    return this.http.get<TipoCliente[]>(APIURL.Clientes.Consultas.tipoClienteLista);
  }


  postCliente(cliente : ClienteRegistro):Observable<any>{
    return this.http.post<ClienteRegistro>(APIURL.Clientes.Inserta.ClienteInserta, cliente);
  }
}
