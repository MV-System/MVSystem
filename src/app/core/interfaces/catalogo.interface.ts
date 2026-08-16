export interface TipoTelefono {
  iD_Tipo_Telefono: number;
  tipo_Telefono_Descripcion: string;
}

export interface MarcaEquipo {
  iD_Marca?: number;
  descripcion: string;
  usuario?: string;
  mensaje?: string;

}

export interface Almacen {
  iD_Almacen: number;
  descripcion: string;
}

export interface CanalesLista {
  iD_Canal: number;
  canal_Nombre: string;
}

export interface ModeloEquipo {
  iD_Marca?: number;
  iD_Modelo: number;
  iD_Grupo?: number;
  descripcion: string;
  usuario?: string;
}


export interface TipoFactura {
  iD_Tipo_Factura: number;
  descripcion_Factura_Tipo: string;
}

export interface TipoPago {
  iD_Tipo_Pagos: number;
  descripcion_Tipo_Pagos: string;
}

export interface TipoComprobante {
  nfcTipoNumero: number;
  nfcTipoDescripcion: string;
  visible_Venta: boolean;
  nfcTipoCantidad?: number;
  nfcTipoSecuencia?: number;
}

export interface AccesorioLista {
  accesorio_Descripcion: string;
  codigo?: string;
  id: string;
  modelo: string;
  codigo_Barra: number;
  precio_Detalle: number;
  precio_Por_Mayor: number;
  costo_Equipo: number;
  cantidad: number;
  idTipo: number;
  disponible: string;
  mensaje: string;
  idEquipo?: number;
}
export interface Garantia {
  iD_Garantia: number;
  descripcion: string;
}
export interface AsumeITBIS {
  asumeITBIS: string;
  itbiS_Valor: number;
}
export interface Desbloqueo {
  iD_Bloqueo: number;
  descripcion: string;
}
export interface CondicionEquipo {
  iD_Condicion: number;
  descripcion: string;
}
export interface Tecnologia {
  iD_Tecnologia: number;
  descripcion: string;
}
export interface Suplidor {
  iD_Suplidor: number;
  descripcion: string;
}

export interface Grupo {
  iD_Grupo: number;
  descripcion: string;
}

export interface StatusTaller {
  iD_Estado_Taller: number;
  descripcion_Estado_Taller: string;
}

export interface CierreCajaDetalleReporte {
  tipoPago: string;
  cantidadFacturas: number;
  cantidadAbonosRecibidos: number;
  montoAbonos: number;
  subTotal: number;
  descuento: number;
  itbis: number;
  totalFacturado: number;
  efectivoReal: number;
  saldoPendiente: number;
  porcentajeDelTotal: number;
  montoDesdeDesgloseMixto?: number;
  cantidadFacturasDesdeMixto?: number;
  isAbono?: boolean;
}

export interface CierreCajaReporteResumen {
  fechaInicio: Date;
  fechaFinal: Date;
  almacen: string;
  vendedor: string;
  empresa: string;
  cantidadTotalFacturas: number;
  totalFacturado: number;
  totalEfectivoReal: number;
  totalAbonos: number;
  totalSaldoPendiente: number;
  detallesPorTipoPago: CierreCajaDetalleReporte[];
  datosEmpresaFactura: any;
}




