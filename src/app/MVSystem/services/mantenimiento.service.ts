import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/shared/url";
import { MarcaEquipo } from "../interfaces/catalogo.interface";
import { Equipo, EquipoObjRetorno, EquipoModificarEstatus, EquipoModificarEstatusSet, EquipoRecepcion, EquipoEstadoUpdate, EquipoTransferencia } from '../interfaces/equipo.interface';
import { Accesorio, FacturaFilter, FacturaRegistro, FacturaConsulta, DetalleFacturaList } from '../interfaces/mantenimiento';
import { EquipoNumeroRegistro } from "../pages/Equipo/Equipo-registro/equipo-registro.component";

@Injectable({
  providedIn: 'root'
})

export class MantenimientoService {
  constructor(private http: HttpClient) { }

  // Post's
  postAccesorio(accesorio: Accesorio): Observable<any> {
    return this.http.post<any>(APIURL.Accesorio.Inserta.AccesorioInserta, accesorio);
  }
  postEquipo(equipo: Equipo): Observable<EquipoObjRetorno[]> {
    return this.http.post<EquipoObjRetorno[]>(APIURL.Equipo.Inserta.EquipoInserta, equipo);
  }
  postFactura(factura: FacturaRegistro): Observable<Blob> {
    return this.http.post<Blob>(APIURL.Factura.Inserta.FacturaInserta, factura, {
      responseType: 'blob' as 'json'
    });
  }
  postFacturaConsultaReport(facturaReq: FacturaFilter): Observable<Blob> {
    return this.http.post<Blob>(APIURL.Factura.Inserta.FacturaReporteConsulta, facturaReq, {
      responseType: 'blob' as 'json'
    });
  }
  postFacturaReport(facturaReq: FacturaFilter,numeroFactura: number): Observable<Blob> {
    facturaReq.numeroFactura =numeroFactura;
    return this.http.post<Blob>(APIURL.Factura.Inserta.FacturaReporte, facturaReq, {
      responseType: 'blob' as 'json'
    });
  }
  getFacturas(facturaReq: FacturaFilter){
    let queryParams = new HttpParams();
    // queryParams = queryParams.append("NumeroFactura", facturaReq.numeroFactura)
    // queryParams = queryParams.append("Nombres", facturaReq.nombreCliente)
    // queryParams = queryParams.append("Vendedor", facturaReq.vendedor)
    // queryParams = queryParams.append("TipoFactura", facturaReq.tipoFactura )
    // queryParams = queryParams.append("Telefono", facturaReq.telefono )
    // queryParams = queryParams.append("TipoPago", facturaReq.tipoPago)
    queryParams = queryParams.append("Criterio", facturaReq.criterio)
    queryParams = queryParams.append("Almacen", facturaReq.almacen)
    queryParams = queryParams.append("TipoBusqueda", facturaReq.tipoBusqueda)
    queryParams = queryParams.append("PageIndex", facturaReq.pageIndex)
    queryParams = queryParams.append("PageSize", facturaReq.pageSize)
    queryParams = queryParams.append("FechaInicio", facturaReq.fechaInicio)
    queryParams = queryParams.append("FechaFinal", facturaReq.fechaFinal)
    return this.http.get<FacturaConsulta[]>(`${APIURL.Factura.Consulta.Facturas}`,{  params: queryParams })
    
  }
  getDetalleFactura(numeroFactura: number, sucursal: number){
    return this.http.get<DetalleFacturaList[]>(`${APIURL.Factura.Consulta.DetalleFactura}/${numeroFactura}/${sucursal}`)
  }
  modificarEstatusEquipo(equipo: EquipoModificarEstatusSet): Observable<void> {
    return this.http.put<void>(APIURL.Equipo.Modifica.ModificarEstatusEquipo, equipo);
  }

  recepcionEquipo(data: EquipoRecepcion): Observable<void>{
    return this.http.post<void>(APIURL.Equipo.Inserta.EquipoRecepcion, data);
  }

  //Get's

  getEquipoNumeroRegistro(): Observable<EquipoNumeroRegistro[]> {
    return this.http.get<EquipoNumeroRegistro[]>(APIURL.Equipo.Consulta.EquipoNumeroRegistro)
  }

  getEquipoByImei(imei: string): Observable<EquipoModificarEstatus> {
    return this.http.get<EquipoModificarEstatus>(`${APIURL.Equipo.Consulta.EquipoModificarEstatus}?imei=${imei}`)
  }

  consultaEquipoDisponible(imei: string): Observable<EquipoTransferencia> {
    return this.http.get<EquipoTransferencia>(`${APIURL.Equipo.Consulta.EquipoTransferencia}?imei=${imei}`)
  }

  buscarEquipoDisponible(equipo: string, Id_Almacen: string): Observable<EquipoObjRetorno> {
    return this.http.get<EquipoObjRetorno>(`${APIURL.Equipo.Consulta.EquipoBuscaDisponible}?Equipo=${equipo}&Id_Almacen=${Id_Almacen}`);
  }

  equipoEstadoActualiza(dataActualizar: EquipoEstadoUpdate): Observable<void> {
    return this.http.post<void>(`${APIURL.Equipo.Modifica.EstadoActualiza}`, dataActualizar);
  }
}
