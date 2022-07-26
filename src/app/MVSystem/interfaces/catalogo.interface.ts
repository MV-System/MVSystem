export interface TipoTelefono {
    iD_Tipo_Telefono: number;
    tipo_Telefono_Descripcion: string;
  }

export interface MarcaEquipo {
  iD_Marca:    number;
  descripcion: string;
  mensaje?: string;
}

export interface Almacen {
  iD_Almacen:  number;
  descripcion: string;
}

export interface ModeloEquipo {
  iD_Modelo:   number;
  descripcion: string;
}


export interface TipoFactura {
  iD_Tipo_Factura:          number;
  descripcion_Factura_Tipo: string;
}

export interface TipoPago {
  iD_Tipo_Pagos:          number;
  descripcion_Tipo_Pagos: string;
}

export interface TipoComprobante {
  nfcTipoNumero:      number;
  nfcTipoDescripcion: string;
}

export interface AccesorioLista {
  accesorio_Descripcion: string;
  codigo?:         Codigo;
  id:              number;
  modelo:          string;
  codigo_Barra:    number;
  precio_Detalle:  number;
  precio_Por_Mayor:number;
  cantidad:        number;
}

export enum Codigo {
  Empty = "",
  W323 = "w323",
}
export interface Garantia {
  iD_Garantia: number;
  descripcion: string;
}
export interface Desbloqueo {
  iD_Bloqueo:  number;
  descripcion: string;
}
export interface CondicionEquipo {
  iD_Condicion: number;
  descripcion:  string;
}
export interface Tecnologia {
  iD_Tecnologia: number;
  descripcion:   string;
}
export interface Suplidor {
  iD_Suplidor: number;
  descripcion: string;
}





