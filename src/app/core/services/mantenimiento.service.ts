import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIURL } from "src/app/config/url";
import { Equipo, EquipoObjRetorno, EquipoModificarEstatus, EquipoModificarEstatusSet, EquipoRecepcion, EquipoEstadoUpdate, EquipoTransferencia, EquipoEliminadoResponse, RegistroReparaciones } from '../interfaces/equipo.interface';
import { Accesorio, FacturaFilter, FacturaRegistro, FacturaConsulta, DetalleFacturaList, AccesorioLista, FacturaRegistroRespuesta, FacturaEditaResponse, RebajaEquipoModel, DetallePagoMixto, NotaCreditoProveedor2Request, NotaCreditoProveedor2Respuesta } from '../interfaces/mantenimiento';
import { CierreCajaReporteResumen } from '../interfaces/catalogo.interface';
import { EquipoNumeroRegistro } from "../../MVSystem/pages/Equipo/Equipo-registro/equipo-registro.component";
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class MantenimientoService {
  constructor(private http: HttpClient) { }
//-- para buscar las reparaciones de un cliente y poder facturarla -------

  DetalleFacturaRebajaEquipo(model: RebajaEquipoModel): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(APIURL.Factura.Actualiza.DetalleFacturaRebajaEquipo, model);
  }
  // Post's
  postAccesorio(accesorio: Accesorio): Observable<AccesorioLista> {
    return this.http.post<AccesorioLista>(APIURL.Accesorio.Inserta.AccesorioInserta, accesorio);
  }
  postEquipo(equipo: Equipo): Observable<EquipoObjRetorno[]> {
    return this.http.post<EquipoObjRetorno[]>(APIURL.Equipo.Inserta.EquipoInserta, equipo);
  }
  postReparacion(Reparacion: RegistroReparaciones): Observable<RegistroReparaciones[]> {
    return this.http.post<RegistroReparaciones[]>(APIURL.Equipo.Inserta.EquipoInsertaReparacion, Reparacion);
  }
   //-- para buscar las reparaciones de un cliente y poder facturarla -------
  getReparacionesPendientes(filtro: { IdCliente?: number }) {
    // Solo agrega el parámetro si tiene valor
    const params: any = {};
    if (filtro.IdCliente) {
      params.IdCliente = filtro.IdCliente;
    }
    return this.http.get<any[]>(APIURL.Equipo.Consulta.EquiposReparaciones, { params });
  }

  // Consulta de reparaciones con filtros y paginación
  getReparacionesLista(filtros: any): Observable<any> {
    let queryParams = new HttpParams();

    if (filtros.criterio) queryParams = queryParams.append("Criterio", filtros.criterio);
    if (filtros.estatus) queryParams = queryParams.append("Estatus", filtros.estatus);
    if (filtros.fechaInicio) queryParams = queryParams.append("FechaInicio", filtros.fechaInicio);
    if (filtros.fechaFinal) queryParams = queryParams.append("FechaFinal", filtros.fechaFinal);
    queryParams = queryParams.append("PageIndex", filtros.pageIndex);
    queryParams = queryParams.append("PageSize", filtros.pageSize);

    return this.http.get<any>(APIURL.Equipo.Consulta.ReparacionesLista, { params: queryParams });
  }

  // Obtener detalle completo de una reparación
  getReparacionDetalle(idReparacion: number): Observable<any> {
    return this.http.get<any>(`${APIURL.Equipo.Consulta.ReparacionDetalle}/${idReparacion}`);
  }

  // Actualizar costo y precio de una reparación
  actualizarCostoPrecioReparacion(idReparacion: number, costo: number, precio: number, usuario: string): Observable<{ mensaje: string }> {
    const body = {
      ID_Reparacion: idReparacion,
      Costo: costo,
      Precio: precio,
      Usuario: usuario
    };
    return this.http.put<{ mensaje: string }>(APIURL.Equipo.Actualiza.ReparacionCostoPrecio, body);
  }
  postFactura(factura: FacturaRegistro): Observable<FacturaRegistroRespuesta> {
    return this.http.post<FacturaRegistroRespuesta>(APIURL.Factura.Inserta.FacturaInserta, factura);
  }
  exportFactura(factura: FacturaRegistro): Observable<Blob> {
    return this.http.post<Blob>(APIURL.Factura.Inserta.FacturacionReporte, factura, {
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
  postAnlaFactura(NumeroFactura: number,IDsucursal: string, Usuario:string): Observable<Blob> {
    const body = {
      NumeroFactura,
      IDsucursal,
      Usuario
  };

    return this.http.post<Blob>(APIURL.Factura.Inserta.AnulaFactura,body,{
      responseType: 'blob' as 'json'
    });
  }
  postNotaCreditoProveedor2(request: NotaCreditoProveedor2Request): Observable<NotaCreditoProveedor2Respuesta> {
    return this.http.post<NotaCreditoProveedor2Respuesta>(APIURL.Factura.Inserta.NotaCredito, request);
  }
  postNotaCreditoReport(request: NotaCreditoProveedor2Request): Observable<Blob> {
    return this.http.post<Blob>(APIURL.Factura.Inserta.NotaCreditoReporte, request, {
      responseType: 'blob' as 'json'
    });
  }
  // EditaDetalleFactura(EquipoActual: string, EquipoNuevo:string ,NumeroFactura: number,IDsucursal: string, Usuario:string): Observable<Blob> {
  //   const body = {
  //     NumeroFactura,
  //     IDsucursal,
  //     EquipoActual,
  //     EquipoNuevo,
  //     Usuario
  // };

  //   return this.http.post<Blob>(APIURL.Factura.Actualiza.DetalleFactura,body,{
  //     responseType: 'blob' as 'json'
  //   });
  // }
  EditaDetalleFactura(EquipoActual: string, EquipoNuevo:string ,NumeroFactura: number,IDsucursal: string, Usuario:string): Observable<FacturaEditaResponse> {
    const body = {
      NumeroFactura,
      IDsucursal,
      EquipoActual,
      EquipoNuevo,
      Usuario
  };

  return this.http.post<Blob>(APIURL.Factura.Actualiza.DetalleFactura, body, {
    responseType: 'blob' as 'json'
  }).pipe(
    // Transformar el blob a JSON
    switchMap((response: Blob) => {
      return new Observable<FacturaEditaResponse>((observer) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonResponse = JSON.parse(reader.result as string);
            observer.next(jsonResponse);
            observer.complete();
          } catch (err) {
            observer.error('Error al procesar la respuesta del servidor.');
          }
        };
        reader.onerror = () => {
          observer.error('Error al leer la respuesta del servidor.');
        };
        reader.readAsText(response);
      });
    })
  );
}
  postFacturaMiniReport(facturaReq: FacturaFilter,numeroFactura: number): Observable<Blob> {
    facturaReq.numeroFactura =numeroFactura;
    return this.http.post<Blob>(APIURL.Factura.Inserta.FacturaReporteMini, facturaReq, {
      responseType: 'blob' as 'json'
    });
  }
  postCotizacionReport(cotizacion: any): Observable<Blob> {
    return this.http.post<Blob>(APIURL.Factura.Inserta.ReportCotizacion, cotizacion, {
      responseType: 'blob' as 'json'
    });
  }
  getFacturas(facturaReq: FacturaFilter){
    let queryParams = new HttpParams();

    queryParams = queryParams.append("Criterio", facturaReq.criterio)
    queryParams = queryParams.append("Almacen", facturaReq.almacen)
    queryParams = queryParams.append("PageIndex", facturaReq.pageIndex)
    queryParams = queryParams.append("PageSize", facturaReq.pageSize)
    queryParams = queryParams.append("FechaInicio", facturaReq.fechaInicio)
    queryParams = queryParams.append("FechaFinal", facturaReq.fechaFinal)
    queryParams = queryParams.append("IdEmpresa", facturaReq.IdEmpresa)
    queryParams = queryParams.append("IdSucursal", facturaReq.IdSucursal)
    queryParams = queryParams.append("IdVendedor", facturaReq.IdVendedor)
    queryParams = queryParams.append("ComprobanteCheck", facturaReq.ComprobanteCheck)
    queryParams = queryParams.append("EstadoFactura", facturaReq.EstadoFactura)
    return this.http.get<FacturaConsulta[]>(`${APIURL.Factura.Consulta.Facturas}`,{  params: queryParams })

  }
  getDetalleFactura(numeroFactura: number, sucursal: number){
    return this.http.get<DetalleFacturaList[]>(`${APIURL.Factura.Consulta.DetalleFactura}/${numeroFactura}/${sucursal}`)
  }
  getDesglosePagos(numeroFactura: number): Observable<DetallePagoMixto[]> {
    return this.http.get<DetallePagoMixto[]>(`${APIURL.Factura.Consulta.GetDesglosePagos}/${numeroFactura}`);
  }
  modificarEstatusEquipo(equipo: EquipoModificarEstatusSet): Observable<void> {
    return this.http.put<void>(APIURL.Equipo.Modifica.ModificarEstatusEquipo, equipo);
  }

  recepcionEquipo(data: EquipoRecepcion): Observable<void>{
    return this.http.post<void>(APIURL.Equipo.Inserta.EquipoRecepcion, data);
  }
  //Get's

  getFacturaNumero():Observable<number> {
    return this.http.get<number>(APIURL.Factura.Consulta.FacturaNumero);
  }
  getEquipoNumeroRegistro(): Observable<EquipoNumeroRegistro[]> {
    return this.http.get<EquipoNumeroRegistro[]>(APIURL.Equipo.Consulta.EquipoNumeroRegistro)
  }

  getReporteEquiposRegistrados(numeroRegistro: number, idEmpresa: number, idSucursal: number): Observable<Blob> {
    const params = new HttpParams()
      .set('numeroRegistro', numeroRegistro)
      .set('idEmpresa', idEmpresa)
      .set('idSucursal', idSucursal);
    return this.http.get<Blob>(APIURL.Equipo.Accion.EquipoRegistradosReporte, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  PostEquipo_Delete(imei: string, Usuario:string): Observable<EquipoEliminadoResponse> {
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams()
      .set('imei', imei)       // ✅ Angular maneja automáticamente el & y otros caracteres especiales
      .set('Usuario', Usuario);

    return this.http.post<EquipoEliminadoResponse>(APIURL.Equipo.Accion.PostEquipo_Delete, null, { params });
  }
  getEquipoByImei(imei: string): Observable<EquipoModificarEstatus> {
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams().set('imei', imei); // ✅ Angular maneja automáticamente el & y otros caracteres especiales

    return this.http.get<EquipoModificarEstatus>(APIURL.Equipo.Consulta.EquipoModificarEstatus, { params });
  }

  consultaEquipoDisponible(imei: string): Observable<EquipoTransferencia> {
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams().set('imei', imei); // ✅ Angular maneja automáticamente el & y otros caracteres especiales

    return this.http.get<EquipoTransferencia>(APIURL.Equipo.Consulta.EquipoTransferencia, { params });
  }

  buscarEquipoDisponible(equipo: string, Id_Almacen: string): Observable<EquipoObjRetorno> {
    // Usar HttpParams para manejar automáticamente la codificación de caracteres especiales
    const params = new HttpParams()
      .set('Equipo', equipo)        // ✅ Angular maneja automáticamente el & y otros caracteres especiales
      .set('Id_Almacen', Id_Almacen);

    return this.http.get<EquipoObjRetorno>(APIURL.Equipo.Consulta.EquipoBuscaDisponible, { params });
  }

  equipoEstadoActualiza(dataActualizar: EquipoEstadoUpdate): Observable<void> {
    return this.http.post<void>(`${APIURL.Equipo.Modifica.EstadoActualiza}`, dataActualizar);
  }

  /**
   * Obtiene el reporte de cierre de caja segmentado por tipo de pago
   * @param filtro Parámetros de filtro (fechas, vendedor, almacén, etc.)
   * @returns Observable con el resumen de cierre de caja
   */
  getCierreCajaReport(filtro: FacturaFilter): Observable<CierreCajaReporteResumen> {
    return this.http.post<CierreCajaReporteResumen>(
      APIURL.Factura.Reporte.CierreCaja,
      filtro
    );
  }

  /**
   * Obtiene el catálogo de tipos de pago en formato combo
   * @returns Observable con la lista de tipos de pago
   */
  Tipos_Pagos_Cata_Consulta_Combo(): Observable<any[]> {
    return this.http.get<any[]>(APIURL.Catalogos.tipoPagoLista);
  }
}
