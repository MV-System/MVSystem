import { DatePaging, Pagination } from "./pagination.interfaces";
import { ReparacionesComponent } from '../../MVSystem/pages/Equipo/taller/reparaciones/reparaciones.component';

export interface Equipo {
    imei: string;
    ID_Modelo: number;
    ID_Tecnologia: number;
    ID_Garantia: number;
    ID_Condicion?: number;
    ID_Estado_Bloqueo?: number;
    ID_Almacen: number;
    ID_Suplidor: number;
    Numero_de_Factura: string;
    Precio_Por_Mayor: number;
    Precio_Detalle: number;
    costo_Equipo: number;
    Desbloqueado: string;
    disponible: string;
    Nota_Adicional?: string;
    Usuario: string;
    Numero_Registro?: number;
    Comision_Por_Mayor: number;
    Comision_Detalle: number;
    marca: string;
    modelo: string;
    precioPorMayor: number;
    precioDetalle: number;
    mensaje: string;
    idEquipo?: number;
}
export interface RegistroReparaciones{
    IMEI:string;
    ID_Cliente:number;
    Detalle_Reparacion:string;
    Observaciones:string;
    Costo:number;
    Precio: number;
    Fecha_Entrega: string;
    ID_Modelo:number;
    Usuario:string;
    mensajeSalida: string;
    idReparacion: number;
}

export interface ReparacionConsulta {
    idReparacion: number;
    fechaRegistro: string;
    nombreCliente: string;
    telefonoCliente: number;
    imei: string;
    estatus: string;
    precio: number;
    costo: number;
    fechaEntrega: string;
    detalle_Reparacion: string;
    observaciones: string;
    usuario: string;
    totalRecords: number;
    line: number;
    lastLine: number;
}

export interface ReparacionDetalle {
    idReparacion: number;
    fechaRegistro: string;
    nombreCliente: string;
    telefonoCliente: number;
    imei: string;
    marca: string;
    modelo: string;
    detalleReparacion: string;
    observaciones: string;
    estatus: string;
    precio: number;
    costo: number;
    fechaEntrega: string;
    usuario: string;
}

export interface ReparacionFiltros {
    criterio: string;
    estatus: string;
    fechaInicio: string;
    fechaFinal: string;
    pageIndex: number;
    pageSize: number;
}
export interface EquipoObjRetorno {
    imei: string;
    modelo: string;
    marca: string;
    costo_Equipo: number;
    precioPorMayor: number;
    precioDetalle: number;
    disponible: string;
    disponible_Detalle: null;
    mensaje: string;
    existe: string;
    costo?: number;
}

export interface EquipoDisponible {
    imei: string;
    descripcion: string;
    tecnologia: string;
    garantia: string;
    estadoBloqueo: string;
    precioPorMayor: number;
    precioDetalle: number;
    costoEquipo: number;
    comisionDetalle: number;
    comisionPorMayor: number;
    isDesbloqueado: string;
    isDisponible: string;
    notaAdicional: string;
    descripcionAlmacen: string;
    suplidor: string;
    idModelo: number;
    idSuplidor: number;
    idAlmacen: number;
    fecharegistro: string;
    lastLine: number;
    line: number;
    totalRecord: number;
    totalInventario: number;
}
export interface EquipoDisponibleParam extends DatePaging ,Pagination{
    almacen: number;
    suplidor: string;
    imei: string;
    modelo: string;
}
export interface EquipoVendidoFilter extends DatePaging,Pagination{
    almacen:  number;
    suplidor: string;
    vendedor: string;
    imei: string;
    telefono: number;
    fechaRegistro: string;
    ID_Modelo: number;  // CAMBIADO: De modelo: string a ID_Modelo: number
    fechaInicioFactura: string;
    fechaFinalFactura: string;
}
export interface filterEquipos extends DatePaging,Pagination{
    almacen: number,
    modelo: string,
    suplidor: string,
    vendedor: string,
    fechaRegistro: string,
}

export interface EquipoTransferenciaReporte{
    idTransferencia: number;
    equipoTransferencias: EquipoTransferencia[]
    fechaTransferencia: string;
    usuario: string;
    Empresa: string;
    IdEmpresa: string;
    IdSucursal: string;
    total: number;
}
export interface EquipoVendido {
    imei: string;
    descripcion: string;
    precioPorMayor: number;
    precioVendido: number;
    precioDetalle: number;
    costoEquipo: number;
    itbis:number;
    comisionDetalle: number;
    comisionPorMayor: number;
    tipoFactura: string;
    isDesbloqueado: string;
    notaAdicional: string;
    descripcionAlmacen: string;
    suplidor: string;
    cliente: string;
    vendedor: string;
    fechaRegistro: string;
    fechaFacturado: string;
    line: number;
    lastLine: number;
    totalRecord: number;
    totalInventario: number;
    totalGanancia: number;
    totalFacturado: number;
    totalItbis: number;
}

export interface EquipoTransferencia{
    Id_Transferencia:number;
    imei:string;
    modelo:string;
    almacenSalida:string;  // Cambiado a string para mostrar el nombre del almacén
    almacenSalidaId?:number;
    almacenDestino:string;
    mensaje:string;
    usuario: string;

}

export interface EquipoAlmacenTransferir {
    id:              number;
    imei:            string;
    modelo:          string;
    mensaje:         string;
    almacenSalida:   number;
    almacenDestino:  number;
    cantidadEquipos: number;
    usuario:         string;
}

export interface EquipoAlmacenTransferirArrayRetorno {
  idTransferencia:   number;
  imei:               string;
  modelo:             string;
  mensaje:            string;
  almacenSalida:      number;
  almacenDestino:     string;
  cantidadEquipos:    number;
  fechaTransferencia: string;
  usuario:            string;
  // lastLine:           number;
  // line:               number;
  // totalRecord:        number;

}
export interface EquipoEliminadoResponse {
  mensaje: string;  // La respuesta contiene una propiedad 'mensaje'
}

export interface EquipoModificarEstatus{
    imei: string;
    condicionId: number;
    condicionDescripcion?: string;
    costoEquipo: number;
    comisionDetalle: number;
    comisionMayor: number;
    precioPorMayor: number;
    precioDetalle: number;
    estadoBloqueoId: number;
    estadoBloqueoDescripcion?: string;
}

export interface EquipoModificarEstatusSet{
    imei: string;
    condicionId: number;
    costoEquipo: number;
    comisionDetalle: number;
    comisionMayor: number;
    precioPorMayor: number;
    precioDetalle: number;
    estadoBloqueoId: number;
    Usuario: string;
}

export interface EquipoRecepcion {
        Nombres:  string,
        Apellidos:  string,
        Cedula: string,
        Telefono: string,
        ImeiEntrada:string,
        PrecioImeiEntra: number,
        IDModelo: number,
        IDCondicion:number ,
        ImeiSale: string,
        Nota:  string
        Usuario:  string
}

export interface EquipoRecepcionConsulta {
    recepcionNumero: number ,
    cliente: string ,
    cedula: string ,
    telefono: string ,
    imeiEntrada: string ,
    precioImeiEntra: number ,
    modelo: string ,
    imeiSale: string ,
    nota: string ,
    usuario: string ,
    fechaRegistro: Date
    lastLine: number;
    line: number;
    totalRecord: number;
}

export interface EquipoEstadoUpdate{
        Imei: string ,
        Disponible: string ,
        NotaAdicional: string ,
        Usuario: string ,
}

export  interface DefaultFilter{
    pageIndex: number,
    pageSize: number,
    fechaInicio : string,
    fechaFinal : string
}
