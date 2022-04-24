export interface ProveedorRegistro {
    nombres:           string;
    apellidos:         string;
    numero_Telefono:   number;
    iD_Tipo_Telefono?:  number;
    iD_Tipo_Suplidor?:  number;
    extencion?:         null;
    email_Detalle?:     string;
    direccion_Detalle?: string;
    usuario?:           string;
  }

  export interface Proveedor{
    nombres:           string;
    apellidos:         string;
    numero_Telefono:   number;
    iD_Tipo_Telefono:  number;
    iD_Tipo_Suplidor:  number;
    extencion:         null;
    email_Detalle:     string;
    direccion_Detalle: string;
    usuario:           string;
  }

  export interface TipoProveedor{
    iD_Tipo_Proveedor: number;
    tipo_Proveedor_Descripcion: string;
  }