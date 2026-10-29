import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsoConectado, UsoDetalleUsuario, UsoResumen, UsoSistemaService } from 'src/app/core/services/uso-sistema.service';
import { buscarPantalla, PANTALLAS, PantallaCatalogo } from './pantallas.catalogo';

type Vista = 'conectados' | 'masUsadas' | 'sinUso';

interface FilaUso {
  nombre: string;
  ruta: string;
  detalle: string;
  catalogada: boolean;
  visitas: number;
  usuarios: number;
  ultima: string;
  porcentaje: number;
}

@Component({
  selector: 'app-uso-sistema',
  templateUrl: './uso-sistema.component.html',
  styleUrls: ['./uso-sistema.component.css']
})
export class UsoSistemaComponent implements OnInit, OnDestroy {

  vista: Vista = 'conectados';

  // Filtros
  dias = 30;
  empresa = '';
  empresas: string[] = [];
  desdeDatos: Date | null = null;

  // Datos
  conectados: UsoConectado[] = [];
  cargando = false;
  error = '';
  verBotones = false;
  filasPantallas: FilaUso[] = [];
  filasBotones: FilaUso[] = [];
  sinUso: PantallaCatalogo[] = [];
  seleccion: FilaUso | null = null;
  detalleUsuarios: UsoDetalleUsuario[] = [];
  cargandoDetalle = false;

  private refresco: any;
  private consultando = false;
  private readonly refrescoMs = 2000;

  constructor(private uso: UsoSistemaService) { }

  ngOnInit(): void {
    this.uso.empresas().subscribe({ next: e => this.empresas = e, error: () => { } });
    this.uso.primerRegistro().subscribe({
      next: r => this.desdeDatos = r.fecha ? new Date(r.fecha) : null,
      error: () => { }
    });
    this.cambiarVista('conectados');
  }

  ngOnDestroy(): void {
    clearInterval(this.refresco);
  }

  cambiarVista(vista: Vista): void {
    this.vista = vista;
    this.error = '';
    this.seleccion = null;
    this.detalleUsuarios = [];
    clearInterval(this.refresco);
    this.consultar(true);
    // Mientras se este en esta pantalla los datos se actualizan solos
    this.refresco = setInterval(() => this.consultar(false), this.refrescoMs);
  }

  /** Consulta la vista actual; en los refrescos automaticos no muestra el "Cargando" ni se encima con una consulta en curso */
  consultar(mostrarCarga: boolean): void {
    if (this.consultando) return;
    if (this.vista === 'conectados') this.cargarConectados(mostrarCarga);
    else {
      this.cargarResumen(mostrarCarga);
      if (this.seleccion) this.cargarDetalle();
    }
  }

  /** Abre o cierra el detalle de quien uso una pantalla o boton */
  seleccionar(fila: FilaUso): void {
    if (this.esSeleccionada(fila)) {
      this.seleccion = null;
      this.detalleUsuarios = [];
      return;
    }
    this.seleccion = fila;
    this.detalleUsuarios = [];
    this.cargandoDetalle = true;
    this.cargarDetalle();
  }

  esSeleccionada(fila: FilaUso): boolean {
    return !!this.seleccion && this.seleccion.ruta === fila.ruta && this.seleccion.detalle === fila.detalle;
  }

  private cargarDetalle(): void {
    const fila = this.seleccion;
    if (!fila) return;
    const hasta = this.ahoraRD();
    const desde = this.ahoraRD();
    desde.setDate(desde.getDate() - (this.dias - 1));

    this.uso.detalle(this.verBotones ? 'B' : 'P', fila.ruta, fila.detalle, this.formatoFecha(desde), this.formatoFecha(hasta), this.empresa).subscribe({
      next: lista => {
        // Si mientras tanto se cerro o cambio la seleccion, se ignora la respuesta
        if (this.seleccion === fila) this.detalleUsuarios = lista;
        this.cargandoDetalle = false;
      },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  cargarConectados(mostrarCarga = true): void {
    if (mostrarCarga) this.cargando = true;
    this.consultando = true;
    this.uso.conectados(5).subscribe({
      next: lista => { this.conectados = lista; this.error = ''; this.cargando = false; this.consultando = false; },
      error: () => { this.error = 'No se pudo consultar los usuarios conectados.'; this.cargando = false; this.consultando = false; }
    });
  }

  cargarResumen(mostrarCarga = true): void {
    if (mostrarCarga) this.cargando = true;
    this.consultando = true;
    const hasta = this.ahoraRD();
    const desde = this.ahoraRD();
    desde.setDate(desde.getDate() - (this.dias - 1));

    this.uso.resumen(this.formatoFecha(desde), this.formatoFecha(hasta), this.empresa).subscribe({
      next: datos => { this.armarTablas(datos); this.error = ''; this.cargando = false; this.consultando = false; },
      error: () => { this.error = 'No se pudo consultar el uso del sistema.'; this.cargando = false; this.consultando = false; }
    });
  }

  nombreDePantalla(ruta: string): string {
    const p = buscarPantalla(ruta);
    return p ? p.nombre : ruta;
  }

  /** Hace cuanto fue la fecha dada (las fechas del servidor ya estan en hora de Republica Dominicana) */
  hace(fecha: string): string {
    const minutos = Math.round((this.ahoraRD().getTime() - new Date(fecha).getTime()) / 60000);
    if (minutos < 1) return 'ahora';
    if (minutos < 60) return `hace ${minutos} min`;
    return `hace ${Math.floor(minutos / 60)} h`;
  }

  get filas(): FilaUso[] {
    return this.verBotones ? this.filasBotones : this.filasPantallas;
  }

  get diasDeDatos(): number {
    return this.desdeDatos ? Math.floor((this.ahoraRD().getTime() - this.desdeDatos.getTime()) / 86400000) : 0;
  }

  /** Aviso cuando el periodo pedido es mas largo que el tiempo que lleva registrandose el uso */
  get periodoMayorQueDatos(): boolean {
    return this.desdeDatos !== null && this.dias > this.diasDeDatos;
  }

  private armarTablas(datos: UsoResumen[]): void {
    const construir = (tipo: 'P' | 'B'): FilaUso[] => {
      const lista = datos.filter(d => d.tipo === tipo);
      const max = Math.max(1, ...lista.map(d => d.visitas));
      return lista.map(d => {
        const p = tipo === 'P' ? buscarPantalla(d.ruta) : undefined;
        return {
          nombre: tipo === 'P' ? (p ? p.nombre : d.ruta) : d.detalle,
          ruta: d.ruta,
          detalle: d.detalle,
          catalogada: tipo === 'B' || !!p,
          visitas: d.visitas,
          usuarios: d.usuarios,
          ultima: d.ultima,
          porcentaje: Math.round(d.visitas * 100 / max)
        };
      });
    };
    this.filasPantallas = construir('P');
    this.filasBotones = construir('B');

    const usadas = new Set(datos.filter(d => d.tipo === 'P').map(d => d.ruta.toLowerCase()));
    this.sinUso = PANTALLAS.filter(p => !usadas.has(p.ruta.toLowerCase()));
  }

  private ahoraRD(): Date {
    // Fecha y hora de Republica Dominicana (UTC-4) expresada como si fuera la hora local del navegador
    const ahora = new Date();
    return new Date(ahora.getTime() + ahora.getTimezoneOffset() * 60000 - 4 * 3600000);
  }

  private formatoFecha(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
