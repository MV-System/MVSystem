export interface EquipoConfiguracion {
  imei: string;
  ram_GB: number | null;
  ram_Tipo: string | null;
  almacenamiento_GB: number | null;
  almacenamiento_Tipo: string | null;
  notas?: string | null;
  usuario: string;
  configuracion?: string;
  mensaje?: string;
}

export interface LaptopEquipo {
  imei: string;
  modelo: string;
  marca: string;
  costo_Equipo: number;
  precio_Detalle: number;
  precio_Por_Mayor: number;
  configuracion: string | null;
  iD_Almacen: number;
  descripcion_Almacen: string;
  disponible: string;
  es_Laptop: boolean;
}

export interface LaptopAccesorio {
  iD_Accesorio: number;
  descripcion_Accesorio: string;
  modelo: string;
  cantidad: number;
  costo_Equipo: number;
  etiqueta?: string;
}

export type TipoPieza = 'RAM' | 'ALMACENAMIENTO';
export type DestinoRetirada = 'CUSTODIA' | 'CLIENTE';

export interface LaptopCambioPiezaRequest {
  imei: string;
  tipo_Pieza: TipoPieza;
  iD_Accesorio_Instalado: number;
  nueva_Capacidad_GB: number;
  nuevo_Tipo: string;
  iD_Accesorio_Retirado: number | null;
  destino_Retirada: DestinoRetirada | null;
  tecnico: string;
  iD_Almacen: number;
  iD_PreFactura?: number | null;
  iD_Reparacion?: number | null;
  nuevo_Precio_Detalle?: number | null;
  nuevo_Precio_Por_Mayor?: number | null;
  usuario: string;
}

export interface LaptopCustodiaPendiente {
  iD_Cambio: number;
  imei: string;
  modelo: string;
  marca: string;
  laptop_Disponible: string;
  tipo_Pieza: string;
  pieza_Retirada: string | null;
  costo_Retirado: number;
  tecnico: string;
  iD_Almacen: number;
  descripcion_Almacen: string;
  usuario_Registro: string;
  fecha_Registro: string;
  horas_Transcurridas: number;
  vencido: boolean;
}

export interface LaptopCustodiaConfig {
  horasMax: number;
  bloquearVencidos: boolean;
}

export interface LaptopCustodiaAccion {
  iD_Cambio: number;
  usuario: string;
  nota?: string | null;
  nuevo_Precio_Detalle?: number | null;
  nuevo_Precio_Por_Mayor?: number | null;
}

export interface LaptopCambioHistorial {
  iD_Cambio: number;
  imei: string;
  tipo_Pieza: string;
  pieza_Instalada: string | null;
  costo_Instalado: number;
  pieza_Retirada: string | null;
  costo_Retirado: number;
  config_Anterior: string | null;
  config_Nueva: string | null;
  costo_Equipo_Anterior: number;
  costo_Equipo_Nuevo: number;
  tecnico: string;
  estado_Custodia: string;
  usuario_Registro: string;
  fecha_Registro: string;
  usuario_Recepcion: string | null;
  fecha_Recepcion: string | null;
}
