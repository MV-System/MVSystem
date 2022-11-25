import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { TipoTelefono, MarcaEquipo, ModeloEquipo, Almacen, TipoFactura, TipoPago, TipoComprobante, AccesorioLista, Garantia, Desbloqueo, CondicionEquipo, Tecnologia, Suplidor, AsumeITBIS } from '../interfaces/catalogo.interface';
import { Equipo } from "../interfaces/equipo.interface";



@Injectable({
  providedIn: 'root'
})

export class CatalogosService {
  constructor(private http: HttpClient) { }

  getTipoTelefonoLista(): Observable<TipoTelefono[]> {
    return this.http.get<TipoTelefono[]>(APIURL.Catalogos.tipoTelefonoLista);
  }
  getMarcasLista(): Observable<MarcaEquipo[]> {
    return this.http.get<MarcaEquipo[]>(APIURL.Catalogos.marcasLista);
  }
  getModeloByMarcaLista(idMarca?: number): Observable<ModeloEquipo[]> {
    return this.http.get<ModeloEquipo[]>(`${APIURL.Catalogos.modeloLista}?ID_Marca=` + idMarca);
  }
  getModeloLista(): Observable<ModeloEquipo[]> {
    return this.http.get<ModeloEquipo[]>(`${APIURL.Catalogos.modeloLista}`);
  }
  getAlmaceLista(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(APIURL.Catalogos.almacenLista);
  }
  getSucursales(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(APIURL.Catalogos.sucursales);
  }
  getTipoFacturaLista(): Observable<TipoFactura[]> {
    return this.http.get<TipoFactura[]>(APIURL.Catalogos.tipoFacturasLista);
  }
  getTipoPagoLista(): Observable<TipoPago[]> {
    return this.http.get<TipoPago[]>(APIURL.Catalogos.tipoPagoLista);
  }
  getTipoComprobanteLista(): Observable<TipoComprobante[]> {
    return this.http.get<TipoComprobante[]>(APIURL.Catalogos.tipoComprobanteLista);
  }
  getAccesorioLista(): Observable<AccesorioLista[]> {
    return this.http.get<AccesorioLista[]>(APIURL.Catalogos.accesorioLista);
  }
  getAsumeITBIS(): Observable<AsumeITBIS> {
    return this.http.get<AsumeITBIS>(APIURL.Catalogos.AsumeITBIS);
  }
  getGarantiaLista(): Observable<Garantia[]> {
    return this.http.get<Garantia[]>(APIURL.Catalogos.garantiaLista);
  }
  getDesbloqueoLista(): Observable<Desbloqueo[]> {
    return this.http.get<Desbloqueo[]>(APIURL.Catalogos.desbloqueadoLista);
  }
  getCondicionEquipoLista(): Observable<CondicionEquipo[]> {
    return this.http.get<CondicionEquipo[]>(APIURL.Catalogos.condicionEquipoLista);
  }
  getTecnologiaLista(): Observable<Tecnologia[]> {
    return this.http.get<Tecnologia[]>(APIURL.Catalogos.tecnologiasComboLista);
  }
  getSuplidorLista(): Observable<Suplidor[]> {
    return this.http.get<Suplidor[]>(APIURL.Catalogos.suplidorComboLista);
  }

  buscarEquipoDisponible(equipo: string, Id_Almacen: string): Observable<Equipo> {
    return this.http.get<Equipo>(`${APIURL.Equipo.Consulta.EquipoDisponibleFT}?Equipo=${equipo}&Id_Almacen=${Id_Almacen}`);
  }
}
