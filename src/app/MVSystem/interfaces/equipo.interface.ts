
export interface Equipo {
    Imei: string;
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

}
export interface EquipoDisponibleQuery {
    almacen: number;
    suplidor: string;
    imei: string;
    modelo: string;
    pageIndex: number;
    pageSize: number;
}