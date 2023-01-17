import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/config/url";
import { VendedorLista, VendedorRegistro } from "../interfaces/vendedor.interface";



@Injectable({
    providedIn: 'root'
})

export class VendedorService {
    constructor(private http: HttpClient) { }


    // Post's
    postVendedor(vendedor : any):Observable<VendedorRegistro>{
      return this.http.post<VendedorRegistro>(APIURL.Vendedor.Inserta.vendedorInserta,vendedor);
    }
    // GET'S
    getVendedorLista():Observable<VendedorLista[]>{
      return this.http.get<VendedorLista[]>(APIURL.Vendedor.Consultas.vendedoresLista);
    }

  }
