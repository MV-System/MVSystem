export interface PantallaCatalogo {
  /** Ruta tal como la registra el sistema (sin parametros) */
  ruta: string;
  nombre: string;
  grupo: string;
}

/**
 * Pantallas del menu. De aqui sale la lista de "sin uso": una pantalla que esta aqui y no tiene
 * visitas en el periodo. Al agregar una pantalla nueva al menu, se agrega tambien aqui.
 */
export const PANTALLAS: PantallaCatalogo[] = [
  { ruta: '/home/dashboard', nombre: 'Dashboard', grupo: 'Inicio' },

  { ruta: '/home/facturacion', nombre: 'Crear Factura', grupo: 'Facturacion' },
  { ruta: '/home/facturacion/consulta', nombre: 'Consultar Facturas', grupo: 'Facturacion' },
  { ruta: '/home/facturacion/caja', nombre: 'Pre-Facturas (Caja)', grupo: 'Facturacion' },
  { ruta: '/home/utilidades/consulta', nombre: 'Ver Utilidades', grupo: 'Facturacion' },

  { ruta: '/home/accesorios/registro', nombre: 'Registro de Accesorios', grupo: 'Mantenimiento' },
  { ruta: '/home/equipo/registro', nombre: 'Registro de Equipos', grupo: 'Mantenimiento' },
  { ruta: '/home/equipo/transferencia', nombre: 'Transferir equipo', grupo: 'Mantenimiento' },
  { ruta: '/home/equipo/cambiar-estatus', nombre: 'Cambiar estatus de equipo', grupo: 'Mantenimiento' },
  { ruta: '/home/equipo/RegistraReparacion', nombre: 'Reparacion de equipo', grupo: 'Mantenimiento' },
  { ruta: '/home/equipo/inventario', nombre: 'Pasar inventario de equipos', grupo: 'Mantenimiento' },
  { ruta: '/home/clientes/registro', nombre: 'Registro de Clientes', grupo: 'Mantenimiento' },
  { ruta: '/home/equipo/recepcion', nombre: 'Recepcion de equipo', grupo: 'Mantenimiento' },
  { ruta: '/home/marcas/registro', nombre: 'Marcas', grupo: 'Mantenimiento' },
  { ruta: '/home/modelos/registro', nombre: 'Modelos', grupo: 'Mantenimiento' },
  { ruta: '/home/suplidores/registro', nombre: 'Suplidores', grupo: 'Mantenimiento' },
  { ruta: '/home/vendedores/registro', nombre: 'Vendedores', grupo: 'Mantenimiento' },
  { ruta: '/home/cotizacion', nombre: 'Crear Cotizacion', grupo: 'Mantenimiento' },

  { ruta: '/home/equipo/Disponible', nombre: 'Equipos disponibles', grupo: 'Consultas y reportes' },
  { ruta: '/home/equipo/Vendidos', nombre: 'Equipos vendidos', grupo: 'Consultas y reportes' },
  { ruta: '/home/equipo/Recibidos', nombre: 'Equipos recibidos', grupo: 'Consultas y reportes' },
  { ruta: '/home/accesorios/consulta', nombre: 'Consulta de Accesorios', grupo: 'Consultas y reportes' },
  { ruta: '/home/equipo/ConsultaTransferencia', nombre: 'Transferencias de equipos', grupo: 'Consultas y reportes' },
  { ruta: '/home/equipo/ConsultaReparaciones', nombre: 'Consulta de Reparaciones', grupo: 'Consultas y reportes' },
  { ruta: '/home/clientes/cuentasPorCobrar', nombre: 'Cuentas por cobrar', grupo: 'Consultas y reportes' },
  { ruta: '/home/clientes/consulta', nombre: 'Consulta de Clientes', grupo: 'Consultas y reportes' },
  { ruta: '/home/cotizacion/consulta', nombre: 'Consulta de Cotizaciones', grupo: 'Consultas y reportes' },

  { ruta: '/home/seguridad/usuarios', nombre: 'Usuarios', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/roles', nombre: 'Roles', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/permisos', nombre: 'Permisos', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/departamentos', nombre: 'Departamentos', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/modulos', nombre: 'Modulos', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/sistemas', nombre: 'Sistemas', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/asignaciones', nombre: 'Asignar Permisos', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/cambiar-clave', nombre: 'Cambiar Clave', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/gestionar-equipo', nombre: 'Gestionar Equipo', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/modo-desarrollador', nombre: 'Modo Desarrollador', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/uso-sistema', nombre: 'Uso del sistema', grupo: 'Seguridad' },
  { ruta: '/home/seguridad/avisos', nombre: 'Avisos', grupo: 'Seguridad' },
];

/** Busca una pantalla por ruta sin distinguir mayusculas */
export function buscarPantalla(ruta: string): PantallaCatalogo | undefined {
  const r = (ruta || '').toLowerCase();
  return PANTALLAS.find(p => p.ruta.toLowerCase() === r);
}
