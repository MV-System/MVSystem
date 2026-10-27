export interface utilidadesFiltros{
    sucursal:number;
    FI:      string;
    FF:      string;
}
export interface Utilidades {
  costo_Equipos: number;
  venta_Equipos: number;
  itbis_Equipos: number;
  ganancia_Equipos: number;
  costo_Accesorios: number;
  venta_Accesorios: number;
  itbis_Accesorios: number;
  ganancia_Accesorios: number;
  costo_Reparaciones: number;
  venta_Reparaciones: number;
  itbis_Reparaciones: number;
  ganancia_Reparaciones: number;
  costo_Desbloqueos: number;
  venta_Desbloqueos: number;
  itbis_Desbloqueos: number;
  ganancia_Desbloqueos: number;
  abonos_Credito: number;
  valida: number;
}

export interface UtilidadAbonoDetalle {
  id: number;
  idCliente: number;
  cliente: string;
  numeroFactura: number;
  fechaAbono: string;
  montoAbono: number;
  facturaSaldada: boolean;
  esAbonoQueSaldaFactura: boolean;
  costoFactura: number;
  totalFactura: number;
  gananciaAbono: number;
  usuario: string;
  nota: string;
}
