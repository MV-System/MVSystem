export interface CotizacionAmount{
    abono:number,
    cliente: string,
    descuento:number,
    itbis:number
    numero_Factura:number,
    subTotal:number,
    total:number,
}

export interface CotizacionConsultaFiltro {
    pageIndex: number;
    pageSize: number;
    criterio: string;
    sucursal: number;
    vendedor: number;
    idTipoPago: number;
    estado: string;
    fechaInicio: string;
    fechaFinal: string;
}

export interface CotizacionConsulta {
    codigo: number;
    numeroFactura: number;
    idSucursal: number;
    literal: string;
    clienteId: number;
    nombres: string;
    apellidos: string;
    telefono: string;
    tipoFactura: string;
    vendedor: string;
    tipoPago: string;
    subTotal: number;
    descuento: number;
    itbis: number;
    abono: number;
    total: number;
    totalCotizado: number;
    nota: string;
    fechaFacturacion: string;
    estado: string;
    facturado: string;
    line: number;
    totalRecord: number;
    lastLine: number;
}

export interface CotizacionDetalle {
    numeroFactura: number;
    idEquipo: string;
    descripcion: string;
    idTipo: number;
    idGarantia: number;
    cantidad: number;
    precio: number;
    subTotal: number;
    descuento: number;
    itbis: number;
    total: number;
}
