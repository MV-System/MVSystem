import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/config/url';

export interface PreFactura {
  Numero_PreFactura?: number;
  ID_Cliente: number;
  ID_Tipo_Factura: number;
  ID_Vendedor?: number;
  ID_Tipo_Pagos?: number;
  ID_Sucursal: number;
  SubTotal: number;
  Descuento?: number;
  Itbis?: number;
  Abono?: number;
  Tiempo_Credito?: string;
  Total: number;
  Cantidad_Articulos: number;
  Nota?: string;
  Estado?: string;
  Usuario?: string;
  NFCTipoNumero?: string;
  NFCFISCAL?: string;
  NCF_NUMERO?: string;
  RNC?: string;
  Cotizacion_Numero?: number;
  Fecha_Registro?: string;
  Fecha_Procesamiento?: string | null;
  Usuario_Procesamiento?: string | null;
  Literal?: string;
}

export interface PreDetalleFactura {
  Numero_PreFactura: number;
  ID_Equipo: string;
  Descripcion?: string;
  ID_Tipo: number;
  ID_Garantia: number;
  cantidad?: number;
  precio?: number;
  SubTotal: number;
  Descuento?: number;
  Itbis?: number;
  Total: number;
  Estado?: string;
  Usuario?: string;
  Fecha_registro?: string;
  Costo_Equipo?: number;
}

@Injectable({ providedIn: 'root' })
export class PreFacturasService {
  constructor(private http: HttpClient) {}

  // 1. Crear pre-factura
  crearPreFactura(prefactura: PreFactura): Observable<any> {
    return this.http.post(APIURL.PreFacturas.Crear, prefactura);
  }

  // 2. Agregar detalle a pre-factura
  agregarDetallePreFactura(detalle: PreDetalleFactura): Observable<any> {
    return this.http.post(APIURL.PreFacturas.AgregarDetalle, detalle);
  }

  // 3. Listar pre-facturas (con filtro)
  listarPreFacturas(filtros: { Estado?: string; ID_Sucursal?: number; ID_Cliente?: number }): Observable<PreFactura[]> {
    let params = new HttpParams();
    if (filtros.Estado) params = params.set('Estado', filtros.Estado);
    if (filtros.ID_Sucursal) params = params.set('ID_Sucursal', filtros.ID_Sucursal.toString());
    if (filtros.ID_Cliente) params = params.set('ID_Cliente', filtros.ID_Cliente.toString());
    return this.http.get<PreFactura[]>(APIURL.PreFacturas.Listar, { params });
  }

  // 4. Obtener detalles de una pre-factura
  obtenerDetallePreFactura(id: number): Observable<PreDetalleFactura[]> {
    return this.http.get<PreDetalleFactura[]>(`${APIURL.PreFacturas.Detalle}/${id}/detalle`);
  }

  // 5. Procesar pre-factura
  procesarPreFactura(id: number): Observable<any> {
    return this.http.post(`${APIURL.PreFacturas.Procesar}/${id}/procesar`, {});
  }

  // 6. Anular pre-factura
  anularPreFactura(id: number): Observable<any> {
    return this.http.post(`${APIURL.PreFacturas.Anular}/${id}/anular`, {});
  }
}
