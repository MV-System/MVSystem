import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { DashboardAnalyticsService } from 'src/app/core/services/dashboard-analytics.service';
import { LoginService } from 'src/app/auth/login.service';
import { Anomalia, DeteccionAnomalias } from 'src/app/core/interfaces/dashboard-ia.interface';
import { EquipoVendidoFilter } from 'src/app/core/interfaces/equipo.interface';

@Component({
  selector: 'app-anomalias-widget',
  templateUrl: './anomalias-widget.component.html',
  styleUrls: ['./anomalias-widget.component.css']
})
export class AnomaliasWidgetComponent implements OnInit, OnDestroy {
  @Input() fechaInicio!: string;
  @Input() fechaFinal!: string;
  @Input() limite: number = 10; // Mostrar top 10 anomalías más críticas
  @Input() titulo: string = 'Detección de Anomalías';

  anomalias: Anomalia[] = [];
  deteccion: DeteccionAnomalias | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  
  // Filtros
  filtroSeveridad: string = 'todas'; // todas, critica, alta, media, baja
  filtroTipo: string = 'todos'; // todos, precio_alto, precio_bajo, etc.

  private destroy$ = new Subject<void>();

  constructor(
    private equipoService: EquipoService,
    private analyticsService: DashboardAnalyticsService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.cargarAnomalias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarAnomalias(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    // Si no hay fechas, usar el mes actual
    if (!this.fechaInicio || !this.fechaFinal) {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaInicio = this.formatearFecha(inicioMes);
      this.fechaFinal = this.formatearFecha(hoy);
    }

    const filtro: EquipoVendidoFilter = {
      almacen: parseInt(this.loginService.getUserIdSucursal, 10),
      fechaInicioFactura: this.fechaInicio,
      fechaFinalFactura: this.fechaFinal,
      suplidor: '',
      vendedor: '',
      imei: '',
      telefono: 0,
      fechaRegistro: '',
      ID_Modelo: 0,
      fechaInicio: '',
      fechaFinal: '',
      pageIndex: 1,
      pageSize: 999999
    };

    this.equipoService.getEquipoVendidoParaInsights(filtro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipos) => {
          if (equipos && equipos.length > 0) {
            this.deteccion = this.analyticsService.detectarAnomalias(equipos);
            this.aplicarFiltros();
          } else {
            this.deteccion = {
              totalAnomalias: 0,
              anomaliasCriticas: 0,
              anomalias: [],
              resumenPorTipo: []
            };
            this.anomalias = [];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar anomalías:', error);
          this.hasError = true;
          this.errorMessage = 'No se pudo cargar la información. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  aplicarFiltros(): void {
    if (!this.deteccion) return;

    let anomaliasFiltradas = [...this.deteccion.anomalias];

    // Filtrar por severidad
    if (this.filtroSeveridad !== 'todas') {
      anomaliasFiltradas = anomaliasFiltradas.filter(a => a.severidad === this.filtroSeveridad);
    }

    // Filtrar por tipo
    if (this.filtroTipo !== 'todos') {
      anomaliasFiltradas = anomaliasFiltradas.filter(a => a.tipo === this.filtroTipo);
    }

    // Limitar a las N más críticas
    this.anomalias = anomaliasFiltradas.slice(0, this.limite);
  }

  refrescar(): void {
    this.cargarAnomalias();
  }

  cambiarFiltroSeveridad(severidad: string): void {
    this.filtroSeveridad = severidad;
    this.aplicarFiltros();
  }

  cambiarFiltroTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'precio_alto': 'bi-arrow-up-circle-fill',
      'precio_bajo': 'bi-arrow-down-circle-fill',
      'costo_alto': 'bi-cash-stack',
      'costo_bajo': 'bi-cash-coin',
      'margen_negativo': 'bi-exclamation-triangle-fill',
      'margen_bajo': 'bi-exclamation-circle-fill',
      'venta_rapida': 'bi-lightning-charge-fill',
      'descuento_alto': 'bi-percent',
      'rotacion_anormal': 'bi-clock-history'
    };
    return iconos[tipo] || 'bi-question-circle';
  }

  getColorSeveridad(severidad: string): string {
    const colores: { [key: string]: string } = {
      'critica': '#dc3545',
      'alta': '#fd7e14',
      'media': '#ffc107',
      'baja': '#28a745'
    };
    return colores[severidad] || '#6c757d';
  }

  getBadgeSeveridad(severidad: string): string {
    const badges: { [key: string]: string } = {
      'critica': 'badge bg-danger',
      'alta': 'badge bg-warning text-dark',
      'media': 'badge bg-info text-dark',
      'baja': 'badge bg-success'
    };
    return badges[severidad] || 'badge bg-secondary';
  }

  formatNumber(value: number): string {
    return value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 });
  }

  formatPorcentaje(value: number): string {
    return value.toFixed(1) + '%';
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  // Getters para el footer
  getTotalCriticas(): number {
    return this.deteccion?.anomaliasCriticas || 0;
  }

  getTotalAltas(): number {
    return this.deteccion?.anomalias.filter(a => a.severidad === 'alta').length || 0;
  }

  getPorcentajeCriticas(): number {
    if (!this.deteccion || this.deteccion.totalAnomalias === 0) return 0;
    return (this.deteccion.anomaliasCriticas / this.deteccion.totalAnomalias) * 100;
  }
}
