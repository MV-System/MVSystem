export interface ClienteRegistro {

  nombres: string;
  apellidos: string;
  iD_Tipo_Cliente: number;
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
  id_Cliente: number;
  idContacto: number;
  nombres: string;
  apellidos: string;
  iD_Tipo_Cliente: number;
  tipo_Cliente_Descripcion: string;
  limite_Credito: string;
  numero_Telefono: number;
  iD_Tipo_Telefono: number;
  extencion: null;
  email_Detalle: string;
  direccion_Detalle: string;
  criterio: null;
  usuario: null;
  mensaje: string;
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
