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
  IdSucursal: number;
  Usuario: string;

}
export interface AbonoFacturaResponse {
  mensaje: string;  // La respuesta contiene una propiedad 'mensaje'
}
export interface Cliente {
  // Campos principales del API actualizado (formato nuevo)
  Id_Cliente?: number;
  Tipo_de_Cliente?: string;
  Nombres?: string;
  Apellidos?: string;
  Numero_de_telefono?: number;
  Limite_Credito?: string;
  canal_Nombre?: string;
  iD_Canal: number;
  Extencion?: number | null;
  Email?: string;
  Direccion?: string;
  Mensaje?: string;

  // Campos del API actual (formato minúscula con guiones bajos)
  id_Cliente?: number;
  tipo_de_Cliente?: string;
  nombres?: string;
  apellidos?: string;
  numero_de_telefono?: number;
  limite_Credito?: string;
  extencion?: number | null;
  email?: string;
  direccion?: string;
  mensaje?: string;

  // Campos legacy (mantener para compatibilidad si es necesario)
  idContacto?: number;
  iD_Tipo_Cliente?: number;
  tipo_Cliente_Descripcion?: string;
  numero_Telefono?: number;
  iD_Tipo_Telefono?: number;
  email_Detalle?: string;
  direccion_Detalle?: string;
  criterio?: null;
  usuario?: null;
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
  showInput:         number;
}
export interface FacturasPorClienteRetorn {
  numeroFactura:  number;
  totalFactura:   string;
  montoPendiente: string;
  fechaFactura:   string;
  editMode:       boolean;// Agregar la propiedad editMode aquí
  montoAbono:     number;
  showInput:      number;
  fechaLimitePagoFactura: string;
}
