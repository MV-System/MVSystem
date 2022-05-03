import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { TipoTelefono, MarcaEquipo, ModeloEquipo, Almacen } from '../interfaces/catalogo.interface';



@Injectable({
    providedIn: 'root'
})

export class CatalogosService {
    constructor(private http: HttpClient) { }

    getTipoTelefonoLista():Observable<TipoTelefono[]>{
      return this.http.get<TipoTelefono[]>(APIURL.Catalogos.tipoTelefonoLista);
    }
    getMarcasLista():Observable<MarcaEquipo[]>{
      return this.http.get<MarcaEquipo[]>(APIURL.Catalogos.marcasLista);
    }
    getModeloLista():Observable<ModeloEquipo[]>{
      return this.http.get<ModeloEquipo[]>(APIURL.Catalogos.modeloLista);
    }
    getAlmaceLista():Observable<Almacen[]>{
      return this.http.get<Almacen[]>(APIURL.Catalogos.almacenLista);
    }

}