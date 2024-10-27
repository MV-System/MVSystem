import { NumberValueAccessor } from "@angular/forms";
import { ClienteRegistro } from "./cliente.interface";
import { DatePaging, Pagination } from "./pagination.interfaces";

export interface Accesorio {
    imei_Equipo?: null;
    id_Modelo: number;
    codigo?: string;
    descripcion_Accesorio: string;
    id_Almacen: number;
    cantidad: number;
    can_Max: number;
    can_Min: number;
    precio_Por_Mayor: number;
    precio_Detalle: number;
    costo_Equipo: number;
    cod_Barra?: number;
    disponible?: string;
    disponible_Detalle?: string;
    usuario: string;
}


export interface AccesorioLista {
    descripcion_Accesorio: string;
    precio_Por_Mayor: number;
    precio_Detalle: number;
    cantidad: number;
}
export interface AccesorioFactura {
    codigo?: string;
    descripcion: string;
    cantidad: number;
    precio?: number;
    precio_Detalle?: number;
    precio_Por_Mayor?: number;
}
export interface FacturaRegistro {
    numeroFactura: number;
    idCliente: number;
    IdEmpresa:     string;
    IdSucursal:   string;
    // telefono:   number;
    idVendedor: number;
    idTipoFactura: number;
    idTipoPago: number;
    ncfTipoNumero: number;
    // ncfFiscal:number;
    fechaRegistro: string;
    fechaLimitePago: string;
    // accesorio: AccesorioFactura[];
    garantia: string;
    idAlmacen: number;
    nota?: string;
    // persona: number;
    empresa: string;
    RNC: string;

    descripcion: string;
    itbis: number;
    subTotal: number;
    total: number;
    abono: number;
    descuento: number;

    cantidadArticulos: number;
    detalleFacturaList: DetalleFacturaList[];
    usuario: string;

    Cliente?: ClienteRegistro
}
export interface FacturaRegistroRespuesta {
  numeroFactura: number;
  idEmpresa:     string;
  idSucursal:   string;
}
export interface DetalleFacturaList {
  cantidad: number;
  descripcion: string;
  numeroFactura: number;
  idEquipo: number;
  idTipo: number;
  idGarantia: number;
  subTotal: number;
  precio: number;
  descuento: number;
  total: number;
  fechaRegistro: string;
  //usuario: string;
  idVendedor: number; // Propiedad faltante
  idTipoFactura: number; // Propiedad faltante
  itbis: number; // Propiedad faltante
  Usuario: string; // Propiedad faltante
}


export interface MarcaObjRetorno {
    iD_Marca: number;
    descripcion: string;
    mensaje: string;
}

export interface ModeloObjRetorno {
    iD_Modelo: number;
    descripcion: string;
    mensaje: string;
}

export interface EquipoObjRetorno {
    imei: string;
    modelo: string;
    marca: string;
    precioPorMayor: number;
    precioDetalle: number;
    disponible_Detalle: null;
    mensaje: string;
}

export interface FacturaConsulta {
    numeroFactura: number;
    nombres: string;
    apellidos: string;
    vendedor: string;
    tipoFactura: string;
    tipoPago: string;
    subTotal: number;
    descuento: number;
    itbis: number;
    total: number;
    totalFacturado: number;
    nota: string;
    fechaFacturacion: string;
    line: number;
    lastLine: number;
    totalRecord: number;
    telefono: number;
    rnc: number;
    ncf: number;
    almacen: string;
}
export interface FacturaFilter extends DatePaging, Pagination {
    almacen: number;
    numeroFactura?: number;
    criterio: string;
    empresa: string;
    IdEmpresa: string;
    IdSucursal: string;
}

export interface Articulo {
    cantidad: number;
    descripcion: string
    descuento: number;
    iD_Equipo: string;
    iD_Tipo: number;
    numero_Factura: number;
    precio: number;
    subTotal: number;
    total: number;
}


