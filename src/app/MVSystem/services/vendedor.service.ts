import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { VendedorRegistro } from "../interfaces/vendedor.interface";



@Injectable({
    providedIn: 'root'
})

export class VendedorService {
    constructor(private http: HttpClient) { }

 
    // Post's
    postVendedor(vendedor : any):Observable<VendedorRegistro>{
      return this.http.post<VendedorRegistro>(APIURL.Vendedor.Inserta.vendedorInserta,vendedor);
    }
}