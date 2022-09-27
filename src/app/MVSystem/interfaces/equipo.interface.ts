
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
    Costo_Equipo: number;
    Desbloqueado: string;
    Disponible: string;
    Nota_Adicional?: string;
    Usuario: string;
    Numero_Registro?: number;
    Comision_Por_Mayor: number;
    Comision_Detalle: number;
    marca: string;
    modelo: string;
    precioPorMayor: number;
    precioDetalle: number;
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
export interface EquipoDisponibleReporte{
    equipoFilter: filterEquipos;
    equipoDisponibles: EquipoDisponible[];
    fechaImpresion: string;
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
export interface EquipoDisponibleQuery {
    almacen: number;
    suplidor: string;
    imei: string;
    modelo: string;
    pageIndex: number;
    pageSize: number;
    fechaInicio: string;
    fechaFinal: string;
}
export interface EquipoVendidoFilter {
    almacen:  number;
    suplidor: string;
    vendedor: string;
    imei: string;
    telefono: number;
    fechaRegistro: string;
    modelo: string;
    pageIndex: number;
    pageSize: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaInicioFactura: string;
    fechaFinalFactura: string;
}
export interface filterEquipos{
    almacen: number,
    modelo: string,
    suplidor: string,
    vendedor: string,
    fechaRegistro: string,
    pageIndex: number,
    pageSize: number,
    fechaInicio: string,
    fechaFinal: string,
}
export interface EquipoVendidoReporte{
    equipoFilter: filterEquipos;
    equipoVendidos: EquipoVendido[];
    fechaImpresion: string;
}
export interface EquipoTransferenciaReporte{
    idTransferencia: number;
    equipoTransferencias: EquipoTransferencia[]
    fechaTransferencia: string;
    usuario: string;
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
    imei:string;
    modelo:string;
    almacenSalida:number;
    almacenSalidaId?:number;
    almacenDestino:string;
    mensaje:string;
}

export interface EquipoAlmacenTransferir {
    id:              number;
    imei:            string;
    // almacenSalida:   number;
    // almacenDestino:  number;
    cantidadEquipos: number;
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
}