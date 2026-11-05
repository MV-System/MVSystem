import { EquipoConfiguracion, EquipoModuloRequest, ModeloComponente } from 'src/app/core/interfaces/laptop.interface';

/** Memorias y discos tal como los llena el usuario (registro de equipos y Modificar estatus). */
export interface DatosConfigLaptop {
  ramTipo: string | null;
  memorias: (number | null)[];
  discos: { capacidad: number | null; idModelo: number | null }[];
  notas?: string | null;
}

const vacio = (v: any): boolean => v === null || v === undefined || v === '';

/** La sección de RAM está vacía si no hay tipo y todas las capacidades están vacías. */
export function ramVacia(d: DatosConfigLaptop): boolean {
  return vacio(d.ramTipo) && d.memorias.every(vacio);
}

/** La sección de discos está vacía si ninguna fila tiene capacidad ni modelo. */
export function discosVacios(d: DatosConfigLaptop): boolean {
  return d.discos.every(x => vacio(x.capacidad) && vacio(x.idModelo));
}

/**
 * Mensaje del primer problema, o '' si está bien. RAM y discos son opcionales, pero si se llenó algo de una sección
 * se valida completa (para no guardar datos a medias). Las notas solas no se pueden guardar.
 */
export function errorConfigLaptop(d: DatosConfigLaptop): string {
  const sinRam = ramVacia(d);
  const sinDiscos = discosVacios(d);

  if (!sinRam) {
    if (!d.ramTipo) { return 'Seleccione el tipo de RAM.'; }
    if (d.memorias.some(m => !m || Number(m) < 1 || Number(m) > 512)) { return 'Cada memoria debe tener entre 1 y 512 GB.'; }
  }
  if (!sinDiscos) {
    if (d.discos.some(x => !x.capacidad || Number(x.capacidad) < 1 || Number(x.capacidad) > 16000)) { return 'Cada disco debe tener entre 1 y 16000 GB.'; }
    if (d.discos.some(x => !x.idModelo)) { return 'Seleccione el modelo de cada disco.'; }
  }
  if (sinRam && sinDiscos && (d.notas || '').trim()) {
    return 'Para guardar notas de configuración indique al menos una memoria o un disco, o borre las notas.';
  }
  return '';
}

/**
 * Arma la configuración con lo que se llenó. Devuelve null si las dos secciones están vacías
 * (no hay nada que guardar). Se asume que errorConfigLaptop ya devolvió ''.
 */
export function armarConfiguracionLaptop(
  d: DatosConfigLaptop, modelosComponente: ModeloComponente[], imei: string, usuario: string
): EquipoConfiguracion | null {
  const conRam = !ramVacia(d);
  const conDiscos = !discosVacios(d);
  if (!conRam && !conDiscos) { return null; }

  const idModeloRam = conRam
    ? (modelosComponente.find(m => m.tipo_Pieza === 'RAM' && m.tipo === d.ramTipo)?.iD_Modelo ?? 0)
    : 0;
  const modulos: EquipoModuloRequest[] = [
    ...(conRam ? d.memorias.map(m => ({ tipoPieza: 'RAM' as const, capacidadGB: Number(m), idModeloComponente: idModeloRam })) : []),
    ...(conDiscos ? d.discos.map(x => ({ tipoPieza: 'ALMACENAMIENTO' as const, capacidadGB: Number(x.capacidad), idModeloComponente: Number(x.idModelo) })) : [])
  ];
  const gb = (pieza: string) => modulos.filter(x => x.tipoPieza === pieza).reduce((t, x) => t + x.capacidadGB, 0);

  return {
    imei,
    // Resumen (el API usa la lista de módulos); lo que no se llenó va como null
    ram_GB: conRam ? gb('RAM') : null,
    ram_Tipo: conRam ? d.ramTipo : null,
    almacenamiento_GB: conDiscos ? gb('ALMACENAMIENTO') : null,
    almacenamiento_Tipo: conDiscos
      ? (modelosComponente.find(m => m.iD_Modelo === Number(d.discos[0]?.idModelo))?.tipo ?? null)
      : null,
    modulos,
    notas: (d.notas || '').trim() || null,
    usuario
  };
}
