import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { TipoTelefono, MarcaEquipo, ModeloEquipo, Almacen, TipoFactura, TipoPago, TipoComprobante } from '../interfaces/catalogo.interface';



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
    getModeloLista(idMarca: number):Observable<ModeloEquipo[]>{
      return this.http.get<ModeloEquipo[]>(`${APIURL.Catalogos.modeloLista}?ID_Marca=`+ idMarca );
    }
    getAlmaceLista():Observable<Almacen[]>{
      return this.http.get<Almacen[]>(APIURL.Catalogos.almacenLista);
    }  
    getTipoFacturaLista():Observable<TipoFactura[]>{
      return this.http.get<TipoFactura[]>(APIURL.Catalogos.tipoFacturasLista);
    }
    getTipoPagoLista():Observable<TipoPago[]>{
      return this.http.get<TipoPago[]>(APIURL.Catalogos.tipoPagoLista);
    }
    getTipoComprobanteLista():Observable<TipoComprobante[]>{
      return this.http.get<TipoComprobante[]>(APIURL.Catalogos.tipoComprobanteLista);
    }
 
}