import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexGrid
} from 'ng-apexcharts';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { UtilidadAbonoDetalle, Utilidades, utilidadesFiltros } from 'src/app/core/interfaces/utilidades.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { UtilidadesService } from 'src/app/core/services/utilidades.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { formatearMonto } from 'src/app/core/utils/formato';

interface FilaUtilidad {
  nombre: string;
  venta: number;
  itbis: number;
  costo: number;
  retencion: number | null;
  ganancia: number;
  margen: number | null;
  // % de la mayor ganancia positiva (para la barrita de fondo)
  pct?: number;
}

@Component({
  selector: 'app-utilidades',
  templateUrl: './utilidades.component.html',
  styleUrls: ['./utilidades.component.css'],
})
export class UtilidadesComponent implements OnInit, OnDestroy {

  get rangoFechas(): string {
  return `${this.formatearFechaVisible(this.filter?.FI)} - ${this.formatearFechaVisible(this.filter?.FF)}`;
}

  private formatearFechaVisible(valor: string): string {
    if (!valor) return '';
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    const fecha = iso
      ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
      : new Date(valor);
    return isNaN(fecha.getTime()) ? valor : fecha.toLocaleDateString('es-DO');
  }

  almacenes!: Almacen[];
  subs: Subscription[] = [];
  data: Utilidades = {
    costo_Equipos: 0,
    venta_Equipos: 0,
    itbis_Equipos: 0,
    ganancia_Equipos: 0,
    costo_Accesorios: 0,
    venta_Accesorios: 0,
    itbis_Accesorios: 0,
    ganancia_Accesorios: 0,
    costo_Reparaciones: 0,
    venta_Reparaciones: 0,
    itbis_Reparaciones: 0,
    ganancia_Reparaciones: 0,
    costo_Desbloqueos: 0,
    venta_Desbloqueos: 0,
    itbis_Desbloqueos: 0,
    ganancia_Desbloqueos: 0,
    abonos_Credito: 0,
    valida: 0
  }; // Inicializa data

  mostrarDetalleAbonos = false;
  mostrarSoloFacturasSaldadas = false;
  periodoRapido: 'hoy' | 'semana' | 'mes' | 'personalizado' = 'mes';
  cargandoDetalleAbonos = false;
  errorDetalleAbonos: string | null = null;
  detalleAbonos: UtilidadAbonoDetalle[] = [];
  // Abonos del período para el resumen (aparte de la lista del modal)
  abonosResumen: UtilidadAbonoDetalle[] = [];
  // Tarjetas de crédito: cantidad de abonos y de facturas saldadas en el período
  credito = { abonos: 0, facturasSaldadas: 0, gananciaSaldadas: 0 };
  resumen = {
    ventas: 0,
    ventasSinItbis: 0,
    // Desglose de Ventas: contado del período + facturas a crédito saldadas en el período
    ventasContado: 0,
    ventasCredito: 0,
    costoContado: 0,
    costoCredito: 0,
    itbisContado: 0,
    itbisCredito: 0,
    retencionContado: 0,
    retencionCredito: 0,
    costo: 0,
    itbis: 0,
    retencionTarjeta: 0,
    gananciaContado: 0,
    gananciaCredito: 0,
    gananciaReal: 0,
    margen: 0
  };
  // Valores que se muestran en el resumen (cuentan de 0 al valor real)
  resumenAnimado = {
    ventas: 0,
    ventasSinItbis: 0,
    costo: 0,
    itbis: 0,
    retencionTarjeta: 0,
    gananciaReal: 0
  };
  private animacionId: number | null = null;

  // Gráficos (se arman en recalcularResumen)
  perdidaTexto = '';
  donutSeries: ApexNonAxisChartSeries = [];
  donutLabels: string[] = ['Costo', 'ITBIS', 'Retención', 'Ganancia real'];
  donutColors: string[] = ['#64748b', '#f59e0b', '#ef4444', '#22c55e'];
  donutChart!: ApexChart;
  donutPlotOptions!: ApexPlotOptions;
  donutDataLabels!: ApexDataLabels;
  donutLegend!: ApexLegend;
  donutTooltip!: ApexTooltip;
  barSeries: ApexAxisChartSeries = [];
  barChart!: ApexChart;
  barPlotOptions!: ApexPlotOptions;
  barDataLabels!: ApexDataLabels;
  barColors: string[] = [];
  barXaxis!: ApexXAxis;
  barYaxis!: ApexYAxis;
  barLegend!: ApexLegend;
  barTooltip!: ApexTooltip;
  barGrid!: ApexGrid;
  barAlto = 240;

  // Tabla por categoría (se calcula en recalcularResumen)
  filasCategoria: FilaUtilidad[] = [];
  filaSubtotalContado: FilaUtilidad | null = null;
  filaCreditoSaldado: FilaUtilidad | null = null;
  filaTotal: FilaUtilidad | null = null;

  trackByCategoria(_: number, fila: FilaUtilidad): string {
    return fila.nombre;
  }

  isLoading: boolean = false; // Variable para controlar el estado de carga

  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd/mm/yyyy',
    showClearBtn: true,
    showClearDateRangeBtn: true,
    showApplyBtn: true,
    showSelectDateText: true,
    selectBeginDateTxt: 'Inicio',
    selectEndDateTxt: 'Fin',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '34px',
    width: '100%',
    selectionTxtFontSize: '14px',
    inline: false,
    showWeekNumbers: false,
    editableDateRangeField: false,
    openSelectorOnInputClick: true,
    monthLabels: {
      1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'
    },
    dayLabels: {
      su: 'Dom', mo: 'Lun', tu: 'Mar', we: 'Mié', th: 'Jue', fr: 'Vie', sa: 'Sáb'
    }
  };
  abrirDetalleAbonos(soloFacturasSaldadas: boolean = false): void {
    this.mostrarDetalleAbonos = true;
    this.mostrarSoloFacturasSaldadas = soloFacturasSaldadas;
    this.cargandoDetalleAbonos = true;
    this.errorDetalleAbonos = null;
    this.detalleAbonos = [];

    this.UtilidadesServices.GetDetalleAbonos(this.filter).subscribe({
      next: detalle => {
        this.detalleAbonos = detalle || [];
        this.cargandoDetalleAbonos = false;
      },
      error: error => {
        console.error('Error al cargar el detalle de abonos:', error);
        const mensajeError = typeof error?.error === 'string'
          ? error.error
          : 'No se pudo cargar el detalle de abonos.';
        this.errorDetalleAbonos = mensajeError;
        this.cargandoDetalleAbonos = false;
        this.toastr.error(mensajeError);
      }
    });
  }

  cerrarDetalleAbonos(): void {
    this.mostrarDetalleAbonos = false;
    this.mostrarSoloFacturasSaldadas = false;
  }

  getDetalleAbonosVisible(): UtilidadAbonoDetalle[] {
    return this.mostrarSoloFacturasSaldadas
      ? this.detalleAbonos.filter(abono => this.esAbonoQueSaldaFactura(abono))
      : this.detalleAbonos;
  }

  formatearFechaAbono(fecha: string): string {
    if (!fecha) return '—';
    const valorFecha = new Date(fecha);
    return isNaN(valorFecha.getTime())
      ? fecha
      : new Intl.DateTimeFormat('es-DO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(valorFecha);
  }

  formatearMontoAbono(monto: number | string | null | undefined): string {
    const valor = Number(monto);
    return formatearMonto(Number.isFinite(valor) ? valor : 0, 2);
  }

  getTotalCostoDetalleAbonos(): number {
    return this.getDetalleAbonosVisible().reduce((total, abono) => total + (Number(abono.costoFactura) || 0), 0);
  }

  getTotalFacturaDetalleAbonos(): number {
    return this.getDetalleAbonosVisible().reduce((total, abono) => total + (Number(abono.totalFactura) || 0), 0);
  }

  esAbonoQueSaldaFactura(abono: any): boolean {
    return abono?.esAbonoQueSaldaFactura === true;
  }

  getGananciaVisible(abono: any): number {
    // Ganancia de la factura saldada, menos la retención de todos sus abonos con tarjeta
    return this.esAbonoQueSaldaFactura(abono)
      ? (Number(abono?.gananciaAbono) || 0) - this.getRetencionFactura(abono)
      : 0;
  }

  getRetencionFactura(abono: any): number {
    return this.esAbonoQueSaldaFactura(abono) ? (Number(abono?.retencionFactura) || 0) : 0;
  }

  getTotalDetalleAbonos(): number {
    return this.getDetalleAbonosVisible().reduce((total, abono) => total + (Number(abono.montoAbono) || 0), 0);
  }

  getTotalRetencionDetalleAbonos(): number {
    return this.getDetalleAbonosVisible().reduce((total, abono) => total + (Number(abono.retencionAbono) || 0), 0);
  }

  getTotalGananciaDetalleAbonos(): number {
    return this.getDetalleAbonosVisible()
      .filter(abono => this.esAbonoQueSaldaFactura(abono))
      .reduce((total, abono) => total + this.getGananciaVisible(abono), 0);
  }

  cargarGananciaAbonos(): void {
    this.UtilidadesServices.GetDetalleAbonos(this.filter).subscribe({
      next: detalle => {
        this.abonosResumen = detalle || [];
        this.recalcularResumen();
      },
      error: error => {
        console.error('Error al cargar la ganancia de abonos:', error);
        this.abonosResumen = [];
        this.recalcularResumen();
      }
    });
  }

  /**
   * Calcula los 5 números del resumen cuando llegan los datos del período o los abonos.
   */
  recalcularResumen(): void {
    const abonos = this.abonosResumen;
    const saldados = abonos.filter(a => this.esAbonoQueSaldaFactura(a));
    const gananciaSaldados = saldados.reduce((t, a) => t + (Number(a.gananciaAbono) || 0), 0);
    const retencionSaldados = saldados.reduce((t, a) => t + this.getRetencionFactura(a), 0);

    this.credito = {
      abonos: abonos.length,
      facturasSaldadas: new Set(saldados.map(a => a.numeroFactura)).size,
      gananciaSaldadas: gananciaSaldados - retencionSaldados
    };

    const retencionContado = this.data.retencion_Tarjeta || 0;
    const ventas = this.getTotalVentas();

    const gananciaContado = this.getTotalGanancias() - retencionContado;
    const gananciaCredito = gananciaSaldados - retencionSaldados;
    const gananciaReal = gananciaContado + gananciaCredito;

    // Tabla por categoría
    const d = this.data;
    const fila = (nombre: string, venta: number, itbis: number, costo: number, retencion: number | null, ganancia: number): FilaUtilidad => {
      const base = venta - itbis;
      return { nombre, venta, itbis, costo, retencion, ganancia, margen: base === 0 ? null : Math.round((ganancia / base) * 1000) / 10 };
    };
    this.filasCategoria = [
      fila('Equipos', d.venta_Equipos || 0, d.itbis_Equipos || 0, d.costo_Equipos || 0, null, d.ganancia_Equipos || 0),
      fila('Accesorios', d.venta_Accesorios || 0, d.itbis_Accesorios || 0, d.costo_Accesorios || 0, null, d.ganancia_Accesorios || 0),
      fila('Reparaciones', d.venta_Reparaciones || 0, d.itbis_Reparaciones || 0, d.costo_Reparaciones || 0, null, d.ganancia_Reparaciones || 0),
      fila('Desbloqueos', d.venta_Desbloqueos || 0, d.itbis_Desbloqueos || 0, d.costo_Desbloqueos || 0, null, d.ganancia_Desbloqueos || 0)
    ].filter(f => f.venta !== 0 || f.ganancia !== 0);

    const costoContado = this.getTotalCostos();
    this.filaSubtotalContado = fila('Subtotal contado', ventas, this.getTotalItbis(), costoContado, -retencionContado, gananciaContado);

    if (saldados.length > 0) {
      const ventaCredito = saldados.reduce((t, a) => t + (Number(a.totalFactura) || 0), 0);
      const costoCredito = saldados.reduce((t, a) => t + (Number(a.costoFactura) || 0), 0);
      // ITBIS derivado: venta - costo - ganancia (antes de retención)
      const itbisCredito = ventaCredito - costoCredito - gananciaSaldados;
      this.filaCreditoSaldado = fila('Crédito saldado en el período', ventaCredito, itbisCredito, costoCredito, -retencionSaldados, gananciaCredito);
      this.filaTotal = fila('Total', ventas + ventaCredito, this.getTotalItbis() + itbisCredito, costoContado + costoCredito,
        -(retencionContado + retencionSaldados), gananciaReal);
    } else {
      this.filaCreditoSaldado = null;
      this.filaTotal = fila('Total', ventas, this.getTotalItbis(), costoContado, -retencionContado, gananciaReal);
    }

    // El resumen sale de la fila Total, para que los dos cuadren siempre
    const t = this.filaTotal as FilaUtilidad;
    const c = this.filaCreditoSaldado;
    this.resumen = {
      ventas: t.venta,
      ventasSinItbis: t.venta - t.itbis,
      ventasContado: ventas,
      ventasCredito: c ? c.venta : 0,
      costoContado: costoContado,
      costoCredito: c ? c.costo : 0,
      itbisContado: this.getTotalItbis(),
      itbisCredito: c ? c.itbis : 0,
      retencionContado: retencionContado,
      retencionCredito: c ? -(c.retencion || 0) : 0,
      costo: t.costo,
      itbis: t.itbis,
      retencionTarjeta: -(t.retencion || 0),
      gananciaContado,
      gananciaCredito,
      gananciaReal,
      margen: t.margen || 0
    };

    // Barrita de la columna Ganancia: % de la mayor ganancia positiva
    const filasBarra = this.filaCreditoSaldado ? [...this.filasCategoria, this.filaCreditoSaldado] : this.filasCategoria;
    const maxGanancia = Math.max(0, ...filasBarra.map(f => f.ganancia));
    filasBarra.forEach(f => {
      f.pct = maxGanancia > 0 && f.ganancia > 0 ? Math.round((f.ganancia / maxGanancia) * 100) : 0;
    });

    this.armarGraficos(filasBarra);
    this.animarResumen();
  }

  private armarGraficos(filasBarra: FilaUtilidad[]): void {
    const moneda = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 });
    const fmt = (v: number) => moneda.format(Number(v) || 0);
    const r = this.resumen;
    const sinMovimiento = this.reducirMovimiento();
    const animations = { enabled: !sinMovimiento, easing: 'easeinout' as const, speed: 800 };
    const positivo = (v: number) => (v > 0 ? v : 0);
    // En celular los textos son más pequeños para que no se monten (los montos van completos)
    const esMovil = typeof window !== 'undefined' && window.matchMedia('(max-width: 576px)').matches;

    // Dona
    this.perdidaTexto = r.gananciaReal < 0 ? `Pérdida: ${fmt(Math.abs(r.gananciaReal))}` : '';
    this.donutSeries = [positivo(r.costo), positivo(r.itbis), positivo(r.retencionTarjeta), positivo(r.gananciaReal)];
    const margenTexto = `${r.margen.toLocaleString('es-DO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
    this.donutChart = {
      type: 'donut',
      height: esMovil ? 320 : 300,
      fontFamily: 'inherit',
      toolbar: { show: false },
      animations
    };
    this.donutPlotOptions = {
      pie: {
        donut: {
          size: esMovil ? '74%' : '68%',
          labels: {
            show: true,
            name: { show: true, fontSize: esMovil ? '12px' : '14px', offsetY: esMovil ? -4 : 0 },
            value: { show: true, fontSize: esMovil ? '16px' : '22px', offsetY: esMovil ? 2 : 0, formatter: (v: string) => fmt(Number(v)) },
            total: {
              show: true,
              showAlways: true,
              label: 'Margen',
              formatter: () => margenTexto
            }
          }
        }
      }
    };
    this.donutDataLabels = { enabled: false };
    this.donutLegend = { show: true, position: 'bottom', fontSize: esMovil ? '12px' : '13px', itemMargin: { horizontal: 6, vertical: 2 } };
    this.donutTooltip = { y: { formatter: (v: number) => fmt(v) } };

    // Barras por categoría
    this.barSeries = [{ name: 'Ganancia', data: filasBarra.map(f => f.ganancia) }];
    this.barColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6', '#22c55e'];
    this.barAlto = Math.max(220, filasBarra.length * 56 + 40);
    this.barChart = {
      type: 'bar',
      height: this.barAlto,
      fontFamily: 'inherit',
      toolbar: { show: false },
      animations
    };
    // El monto va FUERA de la barra, al final, en texto oscuro: así no lo tapa el color ni se corta en barras cortas
    this.barPlotOptions = {
      bar: { horizontal: true, distributed: true, borderRadius: 6, barHeight: '60%', dataLabels: { position: 'top' } }
    };
    this.barDataLabels = {
      enabled: true,
      formatter: (v: number) => fmt(v),
      textAnchor: 'start',
      offsetX: 8,
      style: { fontSize: esMovil ? '11px' : '12px', fontWeight: 700, colors: ['#334155'] },
      dropShadow: { enabled: false }
    };
    // Espacio a la derecha para el monto completo de la barra más larga: la barra nunca llena todo el ancho,
    // así el monto siempre cabe al lado. Se calcula con el ancho disponible y el largo del texto.
    const valores = filasBarra.map(f => f.ganancia);
    const maxValor = Math.max(0, ...valores);
    const minValor = Math.min(0, ...valores);
    const anchoEjeY = esMovil ? 90 : 140;
    const anchoGrafico = esMovil ? Math.max(240, window.innerWidth - 64) : 480;
    const anchoBarras = Math.max(120, anchoGrafico - anchoEjeY - 24);
    const anchoTexto = Math.max(...valores.map(v => fmt(v).length), 1) * (esMovil ? 7 : 7.5) + 16;
    const factorMax = anchoBarras / Math.max(40, anchoBarras - anchoTexto);
    this.barXaxis = {
      categories: filasBarra.map(f => f.nombre === 'Crédito saldado en el período' ? 'Crédito saldado' : f.nombre),
      min: minValor < 0 ? minValor * 1.15 : 0,
      max: maxValor > 0 ? maxValor * Math.min(3, Math.max(1.15, factorMax)) : undefined,
      // El monto ya está en cada barra: el eje de abajo no muestra montos (se montaban unos sobre otros)
      labels: { show: false },
      axisTicks: { show: false }
    };
    this.barGrid = { xaxis: { lines: { show: false } }, yaxis: { lines: { show: false } }, padding: { right: esMovil ? 8 : 16 } };
    this.barYaxis = { labels: { maxWidth: anchoEjeY, style: { fontSize: esMovil ? '11px' : '12px' } } };
    this.barLegend = { show: false };
    this.barTooltip = { y: { formatter: (v: number) => fmt(v) } };
  }

  private reducirMovimiento(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Hace que los números del resumen cuenten de 0 a su valor (~800 ms).
   */
  private animarResumen(): void {
    this.cancelarAnimacion();
    const r = this.resumen;
    const destino = {
      ventas: r.ventas,
      ventasSinItbis: r.ventasSinItbis,
      costo: r.costo,
      itbis: r.itbis,
      retencionTarjeta: r.retencionTarjeta,
      gananciaReal: r.gananciaReal
    };
    if (this.reducirMovimiento()) {
      this.resumenAnimado = { ...destino };
      return;
    }
    const duracion = 800;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const f = 1 - Math.pow(1 - t, 3); // easeOutCubic
      this.resumenAnimado = {
        ventas: destino.ventas * f,
        ventasSinItbis: destino.ventasSinItbis * f,
        costo: destino.costo * f,
        itbis: destino.itbis * f,
        retencionTarjeta: destino.retencionTarjeta * f,
        gananciaReal: destino.gananciaReal * f
      };
      if (t < 1) {
        this.animacionId = requestAnimationFrame(paso);
      } else {
        this.animacionId = null;
        this.resumenAnimado = { ...destino };
      }
    };
    this.animacionId = requestAnimationFrame(paso);
  }

  private cancelarAnimacion(): void {
    if (this.animacionId !== null) {
      cancelAnimationFrame(this.animacionId);
      this.animacionId = null;
    }
  }

  ngOnDestroy(): void {
    this.cancelarAnimacion();
  }

  constructor(
    private loading: LoadingService,
    private catalogosService: CatalogosService,
    private UtilidadesServices: UtilidadesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService:ValidatorPermissionService,
    private tracking: UserTrackingService
  ) { }

  // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);
SelectSucursal(): boolean {
  return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
}

getSucursales() {
  this.loading.showLoading();
  const sub = this.catalogosService.getSucursales().subscribe((almacen) => {
    this.almacenes = almacen;
  });
  this.loading.hideLoading();
}


form!: FormGroup;
createForm(){
  this.form = this.fb.group({
    rangeDate: [null], // Control para el datepicker
    fechainicio: [this.FechaInicio.toISOString().split('T')[0], Validators.required],
    fechafin: [this.fechaHoy.toISOString().split('T')[0], Validators.required],
    almacen: [Number(this.loginService.getUserIdSucursal), Validators.required]
  });
}

  ngOnInit(): void {
    this.createForm(); // Crear el formulario PRIMERO
    this.getSucursales();
    this.sucursalOnChange(); // Configurar listeners ANTES de cargar datos

    // Cargar datos iniciales SIN tracking (solo PageView)
    this.cargarDatosIniciales();
    this.cargarGananciaAbonos();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('verUtilidadesToolStripMenuItem', 'PageView').subscribe();
  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.periodoRapido = 'mes';
      this.filter.FI = this.formatearFechaFiltro(this.FechaInicio);
      this.filter.FF = this.formatearFechaFiltro(this.fechaHoy);
      this.filter.sucursal = this.form.get('almacen')?.value

    } else {
      this.periodoRapido = 'personalizado';
      this.filter.FI = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.FF = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
      this.filter.sucursal = this.form.get('almacen')?.value
    }

    // Llama a GetUtilidades después de actualizar los filtros
    this.GetUtilidades();
    this.cargarGananciaAbonos();
  }

  seleccionarPeriodoRapido(periodo: 'hoy' | 'semana' | 'mes'): void {
    const hoy = new Date();
    let inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    if (periodo === 'semana') {
      const diasDesdeLunes = (hoy.getDay() + 6) % 7;
      inicio.setDate(inicio.getDate() - diasDesdeLunes);
    } else if (periodo === 'mes') {
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    this.periodoRapido = periodo;
    this.filter.FI = this.formatearFechaFiltro(inicio);
    this.filter.FF = this.formatearFechaFiltro(hoy);
    this.filter.sucursal = Number(this.form.get('almacen')?.value ?? this.loginService.getUserIdSucursal);
    this.form.get('fechainicio')?.setValue(this.filter.FI);
    this.form.get('fechafin')?.setValue(this.filter.FF);
    this.GetUtilidades();
    this.cargarGananciaAbonos();
  }

  private formatearFechaFiltro(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
  sucursalOnChange() {
    this.form.get('almacen')?.valueChanges.subscribe((value) => {
      if (value) { // Verificar que 'value' tiene un valor válido
        this.filter.sucursal = value;
        this.GetUtilidades(); // Llama a la función de consulta al cambiar la sucursal
        this.cargarGananciaAbonos();
      }
    });
  }

  /**
   * Carga los datos iniciales sin tracking (se usa en ngOnInit)
   */
  private cargarDatosIniciales() {
    this.loading.showLoading();

    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe({
        next: (equipos: Utilidades) => {
          if (equipos && equipos !== null) {
            this.data = equipos; // Asigna datos actuales
            this.recalcularResumen();
          } else {
            this.toastr.warning('No se encontraron utilidades.');
          }
          this.loading.hideLoading();
        },
        error: (error) => {
          console.error('Error al cargar datos de utilidades:', error);
          this.toastr.error('Error al cargar datos de utilidades');
          this.loading.hideLoading();
        }
      });
  }

  GetUtilidades() {
    this.loading.showLoading();

    // 📊 Tracking: Registro de consulta de utilidades
    this.tracking.trackAction('verUtilidadesToolStripMenuItem', 'Consulta').subscribe();

    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe({
        next: (equipos: Utilidades) => {
          if (equipos && equipos !== null) {
            this.data = equipos; // Asigna datos actuales
            this.recalcularResumen();
          } else {
            this.toastr.warning('No se encontraron utilidades.');
          }
          this.loading.hideLoading();
        },
        error: (error) => {
          console.error('Error al cargar datos de utilidades:', error);
          this.toastr.error('Error al cargar datos de utilidades');
          this.loading.hideLoading();
        }
      });
  }

  filter: utilidadesFiltros = {
    FI: this.FechaInicio.toISOString().split('T')[0],
    FF: this.fechaHoy.toISOString().split('T')[0],
    sucursal:+this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto
  };
  // ========== Métodos Helper para la UI ==========

  /**
   * Calcula el total de ventas sumando todas las categorías
   */
  getTotalVentas(): number {
    return this.data.venta_Equipos +
           this.data.venta_Accesorios +
           this.data.venta_Desbloqueos +
           this.data.venta_Reparaciones;
  }

  getTotalItbis(): number {
    return this.data.itbis_Equipos +
           this.data.itbis_Accesorios +
           this.data.itbis_Desbloqueos +
           this.data.itbis_Reparaciones;
  }

  /**
   * Calcula el total de ganancias sumando todas las categorías
   */
  getTotalGanancias(): number {
    return this.data.ganancia_Equipos +
           this.data.ganancia_Accesorios +
           this.data.ganancia_Desbloqueos +
           this.data.ganancia_Reparaciones;
  }

  /**
   * Calcula el total de costos sumando todas las categorías
   */
  getTotalCostos(): number {
    return this.data.costo_Equipos +
           this.data.costo_Accesorios +
           this.data.costo_Desbloqueos +
           this.data.costo_Reparaciones;
  }
}
