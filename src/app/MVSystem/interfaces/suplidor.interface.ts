export interface SuplidorRegistro {
    nombres:           string;
    apellidos:         string;
    numero_Telefono:   number;
    iD_Tipo_Telefono?:  number;
    iD_Tipo_Suplidor:  number;
    extencion?:         null;
    email_Detalle?:     string;
    direccion_Detalle?: string;
    usuario?:           string;
  }

  export interface Suplidor{
    iD_Suplidor: number
    nombres:           string;
    apellidos:         string;
    numero_Telefono:   number;
    iD_Tipo_Telefono:  number;
    iD_Tipo_Suplidor:  number;
    extencion:         null;
    email_Detalle:     string;
    direccion_Detalle: string;
    usuario:           string;
    mensaje: string;

  }

  export interface TipoSuplidor{
    iD_Tipo_Suplidor:          number;
    tipo_Suplidor_Descripcion: string;
  }

