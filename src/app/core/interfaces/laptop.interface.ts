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
  /** Memorias y discos de la laptop. Si viene, el API los usa en vez de ram_GB / almacenamiento_GB. */
  modulos?: EquipoModuloRequest[];
}

/** Una memoria o un disco al registrar la laptop. */
export interface EquipoModuloRequest {
  tipoPieza: TipoPieza;
  capacidadGB: number;
  idModeloComponente: number;
}

/** Módulo instalado en una laptop (respuesta del API). */
export interface LaptopModulo {
  iD_Modulo: number;
  imei: string;
  tipo_Pieza: TipoPieza;
  capacidad_GB: number;
  iD_Modelo_Componente: number;
  modelo_Componente: string;
  tipo: string;
  iD_Accesorio: number | null;
  estado: string;
  usuario: string;
  fecha_Registro: string;
}

/** Modelo de componente (RAM / disco) con su tipo. */
export interface ModeloComponente {
  iD_Modelo: number;
  descripcion: string;
  tipo_Pieza: TipoPieza;
  tipo: string;
}

export interface LaptopCorreccion {
  iD_Correccion: number;
  imei: string;
  iD_Modulo: number;
  antes: string;
  despues: string;
  motivo: string;
  usuario: string;
  fecha: string;
}

export interface LaptopModuloCorreccionRequest {
  iD_Modulo: number;
  iD_Modelo_Componente: number;
  capacidad_GB: number;
  motivo: string;
  usuario: string;
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
  /** Número de la prefactura pendiente que incluye la laptop (null si no está en ninguna). */
  preFactura_Pendiente?: number | null;
}

export interface LaptopAccesorio {
  iD_Accesorio: number;
  descripcion_Accesorio: string;
  modelo: string;
  cantidad: number;
  costo_Equipo: number;
  etiqueta?: string;
  /** Encabezado de grupo en la lista (Memorias / Discos). */
  grupo?: string;
}

export type TipoPieza = 'RAM' | 'ALMACENAMIENTO';
export type DestinoRetirada = 'CUSTODIA' | 'CLIENTE';

export interface LaptopCambioPiezaRequest {
  imei: string;
  tipo_Pieza: TipoPieza;
  iD_Accesorio_Instalado: number;
  /** Modulo de la laptop que sale; null = slot libre. El SP resuelve el accesorio de la pieza retirada. */
  iD_Modulo_Retirado: number | null;
  /** Opcionales: el SP los calcula de la pieza instalada. */
  nueva_Capacidad_GB?: number | null;
  nuevo_Tipo?: string | null;
  iD_Accesorio_Retirado?: number | null;
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
  /** El accesorio retirado no tiene costo y precios: la recepcion debe pedirlos. */
  requiere_Precios: boolean;
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
  /** Solo al recibir una pieza cuyo accesorio no tiene costo y precios registrados. */
  accesorio_Costo?: number | null;
  accesorio_Precio_Por_Mayor?: number | null;
  accesorio_Precio_Detalle?: number | null;
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
  /** Es el último cambio vigente de la laptop. */
  es_Ultimo?: boolean;
  laptop_Disponible?: string;
  /** Último cambio, pieza sin recibir, laptop disponible: se puede anular. */
  puede_Anular?: boolean;
  usuario_Anula?: string | null;
  fecha_Anula?: string | null;
  motivo_Anula?: string | null;
}

export interface LaptopAnularCambioRequest {
  iD_Cambio: number;
  motivo: string;
  usuario: string;
}
