
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
export interface FacturaRegistro{
    idCliente:  number;
    nombre:     string;
    apellido:   string;
    telefono:   number;
    vendedor:   number;
    tipoFactura: number;
    tipoPago: number;
    fechaFacturacion: Date
    comprobante:number;
    fechaLimitePago: Date
    accesorio: AccesorioFactura[];
    garantia:string;
    // persona: number;
    empresa: string;
    monto: number;
    RNC: string;
}
export interface AccesorioFactura{
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio: number;
}
