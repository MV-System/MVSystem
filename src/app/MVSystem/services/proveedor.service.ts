import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { ProveedorRegistro } from "../interfaces/proveedor.interface";



@Injectable({
    providedIn: 'root'
})

export class ProveedorService {
    constructor(private http: HttpClient) { }

    // Get's
    getTipoProveedorLista():Observable<any[]>{
      return this.http.get<any[]>(APIURL.Proveedor.Consultas.tipoProveedorLista);
    }
    // Post's
    postProveedor(proveedor : ProveedorRegistro):Observable<any>{
      return this.http.post(APIURL.Proveedor.Inserta.ProveedorInserta, proveedor);
    }
}