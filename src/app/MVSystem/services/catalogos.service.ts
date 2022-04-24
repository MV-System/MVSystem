import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { TipoTelefono } from "../interfaces/catalogo.interface";



@Injectable({
    providedIn: 'root'
})

export class CatalogosService {
    constructor(private http: HttpClient) { }

    getTipoTelefonoLista():Observable<TipoTelefono[]>{
      return this.http.get<TipoTelefono[]>(APIURL.tipoTelefonoLista);
    }

}