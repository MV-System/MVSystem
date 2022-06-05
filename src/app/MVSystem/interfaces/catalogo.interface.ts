export interface TipoTelefono {
    iD_Tipo_Telefono: number;
    tipo_Telefono_Descripcion: string;
  }

export interface MarcaEquipo {
  iD_Marca:    number;
  descripcion: string;
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
  codigo?:                Codigo;
  id:                    number;
  accesorio_Descripcion: string;
  modelo:                string;
  codigo_Barra:          number;
}

export enum Codigo {
  Empty = "",
  W323 = "w323",
}




