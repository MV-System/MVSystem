export interface InventarioSesion {
    iD_Sesion: number;
    iD_Almacen: number;
    iD_Empresa: number;
    iD_Sucursal: number;
    estado: string; // 'EN_PROCESO', 'PAUSADO', 'FINALIZADO', 'CANCELADO'
    total_Esperados: number;
    total_Escaneados: number;
    total_Faltantes: number;
    total_Sobrantes: number;
    porcentaje_Completado: number | null;
    fecha_Inicio: string;
    fecha_Pausa?: string | null;
    fecha_Reanudacion?: string | null;
    fecha_Finalizacion?: string | null;
    minutos_Transcurridos?: number | null;
    usuario_Responsable: string;
    usuario_Finalizo?: string | null;
    observaciones?: string | null;
    motivo_Cancelacion?: string | null;
    nombre_Almacen?: string;
}

export interface InventarioEquipo {
    iD_Registro: number;
    iD_Sesion: number;
    iD_Equipo: number;
    imei: string;
    fue_Escaneado: boolean;
    fecha_Escaneo?: string | null;
    usuario_Escaneo?: string | null;
    orden_Escaneo?: number | null;
    tipo_Hallazgo: string; // 'ESPERADO', 'ENCONTRADO', 'FALTANTE', 'SOBRANTE'
    estado_Anterior_Equipo?: string | null;
    iD_Almacen_Anterior?: number | null;
    modelo?: string;
    marca?: string;
}

export interface IniciarInventarioDTO {
    iD_Almacen: number;
    iD_Empresa: number;
    iD_Sucursal: number;
    usuario: string;
}

export interface RegistrarEscaneoDTO {
    iD_Sesion: number;
    imei: string;
    usuario: string;
}

export interface FinalizarInventarioDTO {
    iD_Sesion: number;
    usuario: string;
    observaciones?: string;
}

export interface GestionarInventarioDTO {
    iD_Sesion: number;
    usuario: string;
}

export interface EscaneoResponse {
    resultado: string; // 'ENCONTRADO', 'SOBRANTE', 'ERROR'
    mensaje: string;
    equipo?: InventarioEquipo;
}

export interface IniciarInventarioResponse {
    iD_Sesion: number;
    total_Esperados: number;
}

export interface FinalizarInventarioResponse {
    resultado: string;
    mensaje: string;
    total_Faltantes: number;
}
