export interface ClienteRegistro {

  nombres: string;
  apellidos: string;
  iD_Tipo_Cliente: number;
  iD_Canal?: number;
  limite_Credito: number;
  numero_Telefono: number;
  iD_Tipo_Telefono: number;
  extencion: number;
  email_Detalle: string;
  direccion_Detalle: string;
  criterio?: string;
  usuario: string;
  provincia?: string;
  sector?: string;
  calle?: string;
  casaNumero?: string;
}

export interface ClienteActualizacion {
  ID_Cliente: number;                    // int - REQUERIDO (ID del cliente a editar)
  Nombres: string;                       // string - REQUERIDO
  Apellidos: string;                     // string - REQUERIDO
  ID_Tipo_Cliente: number;               // int - REQUERIDO
  ID_Canal: number;                      // int - REQUERIDO
  Numero_Telefono: number;               // long - REQUERIDO
  Limite_Credito?: string;               // string - OPCIONAL
  Extencion?: number | null;             // int? - OPCIONAL (puede ser null)
  Email_Detalle?: string;                // string - OPCIONAL
  Direccion_Detalle: string;             // string - REQUERIDO
  ID_Tipo_Telefono: number;              // int - REQUERIDO
  Usuario: string;                       // string - REQUERIDO (usuario que hace la modificación)
}
export interface AbonoFacturaParam {

  Id_Cliente: number;
  NumeroFactura: number;
  MontoAbono: number;
  IdTipoPago: number;
  Nota: string;
  IdSucursal: number;
  Usuario: string;

}
export interface AbonoFacturaResponse {
  mensaje: string;  // La respuesta contiene una propiedad 'mensaje'
  idLoteAbono?: string;
}
export interface Cliente {
  // Campos principales del API actualizado (formato nuevo)
  id_Cliente?: number;
  iD_Tipo_Cliente?: number;
  tipo_de_Cliente?: string;
  nombres?: string;
  apellidos?: string;
  iD_Canal: number;
  canal_Nombre?: string;
  numero_de_telefono?: number;
  limite_Credito?: string;
  extencion?: number | null;
  email?: string;
  direccion?: string;
  mensaje?: string;
}

export interface TipoCliente {
  iD_Tipo_Cliente: number;
  tipo_Cliente_Descripcion: string;
}


export interface ClienteConsultaCriterio {
  nombres:         string;
  apellidos:       string;
  numero_Telefono:  number;
  id_Cliente:         string;
}
export interface ClientesConFacturasPendientesFiltros {
  FechaInicio:    string;
  FechaFin:       string;
  NombreCliente:  string;
  NumeroTelefono: string;
}
export interface ClientesConFacturasPendientesRetorn {
  id_Cliente:        number;
  cliente:           string;
  montoPendiente:    string;
  montoAbonoGeneral: number;
  idTipoPago?:       number;
  notaAbono?:        string;
  showInput:         number;
}
export interface FacturasPorClienteRetorn {
  numeroFactura:  number;
  totalFactura:   string;
  montoPendiente: string;
  fechaFactura:   string;
  editMode:       boolean;// Agregar la propiedad editMode aquí
  montoAbono:     number;
  idTipoPago?:    number;
  notaAbono?:     string;
  showInput:      number;
  fechaLimitePagoFactura: string;
}

export interface HistorialAbonoDTO {
  id: number;
  idCliente: number;
  numeroFactura: number;
  totalFactura: number;
  totalAbono: number;
  montoPendiente: number;
  idTipoFactura: number;
  tipoFactura?: string;
  fechaVencimiento: string;
  estado: string;
  usuario: string;
  fechaRegistro: string;
  idTipoPago: number;
  tipoPago?: string;
  nota?: string;
  idLoteAbono?: string;
  tieneActualmentePendiente: number;
}
