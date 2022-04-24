import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";



@Injectable({
    providedIn: 'root'
})

export class VendedorService {
    constructor(private http: HttpClient) { }

    // Get's
 
    // Post's
    postVendedor(vendedor : any):Observable<any>{
      return this.http.post(APIURL.Vendedor.Inserta.vendedorInserta,vendedor);
    }
}