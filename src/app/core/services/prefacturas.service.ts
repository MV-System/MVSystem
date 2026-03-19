import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIURL } from 'src/app/config/url';

export interface PreFactura {
  numero_PreFactura: number;
  iD_Cliente: number;
  nombres: string;
  apellidos: string;
  numero_Telefono: string | number;
  iD_Tipo_Factura: number;
  tipo_Factura: string;
  iD_Vendedor: number;
  vendedor_Nombres: string;
  iD_Tipo_Pagos: number;
  tipo_Pago: string;
  iD_Sucursal: number;
  sucursal: string;
  subTotal: number;
  descuento: number;
  itbis: number;
  abono: number | null;
  tiempo_Credito: string | null;
  total: number;
  cantidad_Articulos: number;
  nota: string;
  estado: string;
  usuario: string;
  fecha_Registro: string;
  fecha_Procesamiento: string | null;
  usuario_Procesamiento: string | null;
  nfcTipoNumero: string;
  nfcfiscal: string;
  ncF_NUMERO: string;
  rnc: string;
  literal: string | null;
  cotizacion_Numero: number;
  detalleFacturaList: any;
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
  // Rebajar item del detalle de una pre-factura
  rebajarItemDetallePrefactura(NumeroPreFactura: number, IdEquipo: number | string): Observable<any> {
    return this.http.post(`${APIURL.PreFacturas.Detalle}/rebajar-item`, {
      NumeroPreFactura,
      IdEquipo
    });
  }
  constructor(private http: HttpClient) {}

  // 1. Crear pre-factura
  crearPreFactura(prefactura: PreFactura): Observable<any> {
    return this.http.post(APIURL.PreFacturas.Crear, prefactura);
  }

  // 2. Agregar detalle a pre-factura
  agregarDetallePreFactura(detalle: PreDetalleFactura): Observable<any> {
    return this.http.post(APIURL.PreFacturas.AgregarDetalle, detalle);
  }

  // 2.5 Guardar detalles de pago mixto en pre-factura
  guardarDetallesPagoPreFactura(numeroPreFactura: number, detallesPagos: any[]): Observable<any> {
    return this.http.post(`${APIURL.PreFacturas.Detalle}/${numeroPreFactura}/detalles-pago`, detallesPagos);
  }

  // 3. Listar pre-facturas (con filtro)
  listarPreFacturas(filtros: { Estado?: string; ID_Sucursal?: number; ID_Cliente?: number; criterio?: string }): Observable<PreFactura[]> {
    let params = new HttpParams();
    if (filtros.Estado) params = params.set('Estado', filtros.Estado);
    if (filtros.ID_Sucursal) params = params.set('ID_Sucursal', filtros.ID_Sucursal.toString());
    if (filtros.ID_Cliente) params = params.set('ID_Cliente', filtros.ID_Cliente.toString());
    params = params.set('Criterio', filtros.criterio ? filtros.criterio : '');
    return this.http.get<PreFactura[]>(APIURL.PreFacturas.Listar, { params });
  }

  // 4. Obtener detalles de una pre-factura
  obtenerDetallePreFactura(id: number): Observable<PreDetalleFactura[]> {
    return this.http.get<PreDetalleFactura[]>(`${APIURL.PreFacturas.Detalle}/${id}/detalle`);
  }

  // 5. Procesar pre-factura
  procesarPreFactura(id: number, usuarioProcesamiento: string): Observable<any> {
    return this.http.post(`${APIURL.PreFacturas.Procesar}/${id}/procesar`, { UsuarioProcesamiento: usuarioProcesamiento });
  }

  // 6. Anular pre-factura
  anularPreFactura(id: number): Observable<any> {
    return this.http.post(`${APIURL.PreFacturas.Anular}/${id}/anular`, {});
  }
}
