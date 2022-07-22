import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { SuplidorRegistro } from "../interfaces/suplidor.interface";



@Injectable({
    providedIn: 'root'
})

export class SuplidorService {
    constructor(private http: HttpClient) { }

    // Get's
    getTipoSuplidorLista():Observable<any[]>{
      return this.http.get<any[]>(APIURL.Suplidor.Consultas.tipoSuplidorLista);
    }
    // Post's
    postSuplidor(Suplidor : SuplidorRegistro):Observable<SuplidorRegistro>{
      return this.http.post<SuplidorRegistro>(APIURL.Suplidor.Inserta.SuplidorInserta, Suplidor);
    }
}
