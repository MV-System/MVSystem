export interface VendedorRegistro{
    nombres:           string;
    apellidos:         string;
    numero_Telefono:   number;
    iD_Tipo_Telefono?: number;
    extencion?:        null;
    email_Detalle?:    string;
    direccion_Detalle?:string;
    usuario?:          string;
}


export interface Vendedor {
    iD_Vendedor?:       number;
    nombres:           string;
    apellidos:         string;
    numero_Telefono:   number;
    iD_Tipo_Telefono:  number;
    extencion:         null;
    email_Detalle:     string;
    direccion_Detalle: string;
    idContacto?:        number;
    usuario:           null;

}

export interface VendedorLista {
    iD_Vendedor: number;
    nombres:     string;
    apellidos:     string;
  }


