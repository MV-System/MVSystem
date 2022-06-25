
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
    idTipo: number ;
    idVendedor: number ;
    idTipoFactura: number ;
    idGarantia: number ;
    cantidad:  number;
    precio:  number;
    subTotal:  number;
    descuento:  number;
    itbis:  number;
    total:  number;
    fechaRegistro: string;
    // Estado: ;
    // Usuario: ;
    // Descripcion: ;
}

export interface Equipo {
    Imei:               string;
    ID_Modelo:          number;
    ID_Tecnologia:      number;
    ID_Garantia:        number;
    ID_Condicion?:       number;
    ID_Estado_Bloqueo?:  number;
    ID_Almacen:         number;
    ID_Suplidor:        number;
    Numero_de_Factura:  string;
    Precio_Por_Mayor:   number;
    Precio_Detalle:     number;
    Costo_Equipo:       number;
    Desbloqueado:       string;
    Disponible:         string;
    Nota_Adicional?: string;
    Usuario:            string;
    Numero_Registro?:    number;
    Comision_Por_Mayor: number;
    Comision_Detalle:   number;
}



export interface EquipoObjRetorno {
    imei:               string;
    modelo:             string;
    marca:              string;
    precioPorMayor:     number;
    precioDetalle:      number;
    disponible_Detalle: null;
    mensaje:            string;
}
