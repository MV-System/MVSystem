
export interface Accesorio {
    imei_Equipo?:           null;
    id_Modelo:             number;
    codigo?:               string;
    descripcion_Accesorio: string;
    id_Almacen:            number;
    cantidad:              number;
    can_Max:               number;
    can_Min:               number;
    precio_Por_Mayor:      number;
    precio_Detalle:        number;
    costo_Equipo:          number;
    cod_Barra?:            number;
    disponible?:           string;
    disponible_Detalle?:   string;
    usuario:               string;
}


export interface AccesorioLista {
    descripcion_Accesorio: string;
    precio_Por_Mayor:      number;
    precio_Detalle:        number;
    cantidad:              number;
}
export interface AccesorioFactura{
    codigo?: string;
    descripcion: string;
    cantidad: number;
    precio?: number;
    precio_Detalle?:        number;
    precio_Por_Mayor?:      number;
}
export interface FacturaRegistro{
    numeroFactura: number;
    idCliente:  number;
    // nombre:     string;
    // apellido:   string;
    // telefono:   number;
    idVendedor:   number;
    idTipoFactura: number;
    idTipoPago: number;
    ncfTipoNumero: number;
    // ncfFiscal:number;
    fechaRegistro: string;
    fechaLimitePago: string;
    // accesorio: AccesorioFactura[];
    garantia:string;
    idAlmacen: number;
    nota: string;
    // persona: number;
    // empresa: string;
    RNC: string;

    descripcion: string;
    itbis: number;
    subTotal: number;
    total: number;
    abono: number;
    descuento: number;

    cantidadArticulos: number;
    detalleFacturaList: DetalleFacturaList[];
}
export interface DetalleFacturaList{
    numeroFactura:  number;
    idEquipo: number ;
    descripcion: string;
    idTipo: number ;
    idGarantia: number ;
    subTotal:  number;
    cantidad:  number;
    precio:  number;
    descuento:  number;
    idVendedor:   number;
    idTipoFactura: number;

    itbis:  number;
    total:  number;
    fechaRegistro: string;
    // Estado: ;
    Usuario: string;
}


export interface MarcaObjRetorno{
    iD_Marca:             number;
    descripcion:          string;
    mensaje:              string;
  }


